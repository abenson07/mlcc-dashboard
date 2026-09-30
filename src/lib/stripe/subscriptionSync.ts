import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import { BUSINESS_MEMBERSHIP_TIER } from "../../../schemas/business_memberships";
import type { MembershipStatusEnum, MembershipTierEnum } from "../../../schemas/memberships";

/**
 * One place that turns Stripe subscriptions into rows in `memberships`
 * (individual / household / senior / student) and `business_memberships`
 * (linked to `businesses`). The webhook calls it for a single subscription, the
 * nightly cron and the CLI call it for every subscription. Same code, so the
 * database can't drift depending on which path noticed the change.
 *
 * Deliberately takes the Stripe and Supabase clients as arguments and imports no
 * app aliases, so `scripts/stripe-reconcile.ts` can run it too.
 *
 * It never deletes anything. Businesses or members that have no Stripe
 * subscription (manual / legacy members) are left exactly as they are.
 */

// ---------------------------------------------------------------- classification

const DEFAULT_BUSINESS_PRODUCT_IDS = ["prod_NtJNKoSC5qAtfq"];

function businessProductIds(): string[] {
  const fromEnv = (process.env.STRIPE_BUSINESS_PRODUCT_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  return fromEnv.length > 0 ? fromEnv : DEFAULT_BUSINESS_PRODUCT_IDS;
}

export type SubscriptionKind =
  | { kind: "business" }
  | { kind: "individual"; tier: MembershipTierEnum }
  | { kind: "other" };

/**
 * Decide what a Stripe product is. Product ids are the reliable signal for
 * business; the individual tiers have several legacy product ids (Square-style
 * ids, re-created products), so those are read from the product name.
 */
export function classifyProduct(productId: string | null, productName: string | null): SubscriptionKind {
  if (productId && businessProductIds().includes(productId)) return { kind: "business" };
  const name = (productName ?? "").toLowerCase();
  if (!name.includes("membership")) return { kind: "other" };
  if (name.includes("business")) return { kind: "business" };
  if (name.includes("student")) return { kind: "individual", tier: "Student" };
  if (name.includes("senior")) return { kind: "individual", tier: "Senior" };
  if (name.includes("household")) return { kind: "individual", tier: "Household" };
  if (name.includes("individual")) return { kind: "individual", tier: "Individual" };
  return { kind: "other" };
}

/**
 * Stripe is the source of truth for whether it is still billing. `past_due`
 * reads as Expired to match the existing `invoice.payment_failed` handler (the
 * status enum has no "past due" label); the next paid invoice flips it back.
 * `incomplete` (checkout never finished) is not a membership at all.
 */
export function membershipStatusFor(status: Stripe.Subscription.Status): MembershipStatusEnum | null {
  switch (status) {
    case "active":
    case "trialing":
      return "Active";
    case "past_due":
    case "unpaid":
    case "paused":
      return "Expired";
    case "canceled":
    case "incomplete_expired":
      return "Cancelled";
    default:
      return null;
  }
}

// ------------------------------------------------------------------- stripe data

export type SubscriptionInfo = {
  subscription: Stripe.Subscription;
  kind: SubscriptionKind;
  status: MembershipStatusEnum | null;
  productId: string | null;
  productName: string | null;
  customerId: string | null;
  email: string | null;
  customerName: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  canceledAt: string | null;
  annualDues: number | null;
};

function unixToDate(seconds: number | null | undefined): string | null {
  return seconds ? new Date(seconds * 1000).toISOString().slice(0, 10) : null;
}

function describeSubscription(
  subscription: Stripe.Subscription,
  productNames: Map<string, string | null>,
): SubscriptionInfo {
  const item = subscription.items.data[0];
  const product = item?.price?.product;
  const productId = typeof product === "string" ? product : product?.id ?? null;
  const productName =
    (productId ? productNames.get(productId) : null) ??
    (typeof product === "object" && product && "name" in product ? (product.name as string) : null);
  const customer = subscription.customer;
  const customerObject = typeof customer === "object" && customer && !("deleted" in customer) ? customer : null;

  const unitAmount = item?.price?.unit_amount;
  return {
    subscription,
    kind: classifyProduct(productId, productName),
    status: membershipStatusFor(subscription.status),
    productId,
    productName,
    customerId: typeof customer === "string" ? customer : customer?.id ?? null,
    email: customerObject?.email?.trim().toLowerCase() || null,
    customerName: customerObject?.name?.trim() || null,
    periodStart: unixToDate(item?.current_period_start),
    periodEnd: unixToDate(subscription.cancel_at) ?? unixToDate(item?.current_period_end),
    canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
    annualDues: unitAmount != null ? (unitAmount * (item?.quantity ?? 1)) / 100 : null,
  };
}

async function resolveProductNames(stripe: Stripe, subscriptions: Stripe.Subscription[]) {
  const names = new Map<string, string | null>();
  for await (const product of stripe.products.list({ limit: 100 })) names.set(product.id, product.name);
  // Archived or deleted products can be missing from the list; fetch those by id.
  for (const subscription of subscriptions) {
    const product = subscription.items.data[0]?.price?.product;
    const id = typeof product === "string" ? product : product?.id;
    if (!id || names.has(id)) continue;
    try {
      const fetched = await stripe.products.retrieve(id);
      names.set(id, "deleted" in fetched && fetched.deleted ? null : (fetched as Stripe.Product).name);
    } catch {
      names.set(id, null);
    }
  }
  return names;
}

/** Every subscription in the account (all statuses), with customer email/name. */
export async function loadAllSubscriptions(stripe: Stripe): Promise<SubscriptionInfo[]> {
  const subscriptions: Stripe.Subscription[] = [];
  for await (const subscription of stripe.subscriptions.list({
    status: "all",
    limit: 100,
    expand: ["data.customer"],
  })) {
    subscriptions.push(subscription);
  }
  const names = await resolveProductNames(stripe, subscriptions);
  return subscriptions.map((subscription) => describeSubscription(subscription, names));
}

export async function loadSubscription(stripe: Stripe, subscriptionId: string): Promise<SubscriptionInfo> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, { expand: ["customer"] });
  const names = await resolveProductNames(stripe, [subscription]);
  return describeSubscription(subscription, names);
}

// ------------------------------------------------------------------------ report

export type SyncAction = {
  area: "individual" | "business";
  type: "create" | "update" | "link";
  subscriptionId: string;
  label: string;
  detail: string;
};

export type SyncIssue = {
  area: "individual" | "business";
  type:
    | "duplicate_subscription"
    | "missing_email"
    | "already_has_active_membership"
    | "orphan_business_membership"
    | "created_needs_review";
  label: string;
  detail: string;
};

export type SyncReport = {
  applied: boolean;
  individuals: { checked: number; unchanged: number };
  businesses: { checked: number; unchanged: number };
  actions: SyncAction[];
  issues: SyncIssue[];
  /** Existing businesses that matched a Stripe subscription (used by the one-time review flagging). */
  stripeBusinessIds: string[];
};

// ------------------------------------------------------------------- db helpers

type Db = SupabaseClient;

async function fetchAll<T>(db: Db, table: string, columns: string): Promise<T[]> {
  const rows: T[] = [];
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await db.from(table).select(columns).range(from, from + pageSize - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...((data ?? []) as T[]));
    if (!data || data.length < pageSize) break;
  }
  return rows;
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

function changedFields<T extends Record<string, unknown>>(current: Record<string, unknown>, next: T): Partial<T> {
  const patch: Partial<T> = {};
  for (const [key, value] of Object.entries(next)) {
    if (value !== undefined && current[key] !== value) (patch as Record<string, unknown>)[key] = value;
  }
  return patch;
}

type MembershipRow = {
  id: string;
  status: string | null;
  tier: string | null;
  last_renewal: string | null;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  customer_email: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  canceled_at: string | null;
};

type PersonRow = { id: string; email: string | null; membership_id: string | null };

type BusinessMembershipRow = {
  id: string;
  status: string | null;
  last_renewal: string | null;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  customer_email: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  canceled_at: string | null;
  tier: string | null;
  annual_dues: number | null;
  payment_method: string | null;
  is_subscription: boolean | null;
};

type BusinessRow = {
  id: string;
  business_name: string | null;
  contact_name: string | null;
  email: string | null;
  membership_id: string | null;
  is_member: boolean | null;
};

export type SyncOptions = {
  stripe: Stripe;
  supabase: Db;
  /** false = report what would change and write nothing. */
  apply: boolean;
  /** Sync just these (webhook path). Omit to sync every subscription in Stripe. */
  subscriptions?: SubscriptionInfo[];
  /**
   * One-time seed for the first backfill: Stripe customer email → the existing
   * business's exact `business_name`, for members whose dashboard record has no
   * email to match on. After that first run matching is by Stripe id.
   */
  emailToBusinessName?: Record<string, string>;
  /** Name to use when a paying customer has to be created as a new business. */
  newBusinessNames?: Record<string, string>;
};

async function assertBusinessColumns(db: Db) {
  const { error } = await db.from("business_memberships").select("stripe_subscription_id").limit(1);
  if (error) {
    throw new Error(
      "business_memberships has no Stripe columns yet — run supabase/migrations/20260930120000_business_membership_stripe_sync.sql first.",
    );
  }
}

// ------------------------------------------------------------------- main entry

export async function reconcileSubscriptions(options: SyncOptions): Promise<SyncReport> {
  const { stripe, supabase, apply } = options;
  await assertBusinessColumns(supabase);

  const infos = options.subscriptions ?? (await loadAllSubscriptions(stripe));
  const report: SyncReport = {
    applied: apply,
    individuals: { checked: 0, unchanged: 0 },
    businesses: { checked: 0, unchanged: 0 },
    actions: [],
    issues: [],
    stripeBusinessIds: [],
  };

  await reconcileIndividuals(options, infos, report);
  await reconcileBusinesses(options, infos, report);
  return report;
}

// ------------------------------------------------------------------ individuals

async function reconcileIndividuals(options: SyncOptions, infos: SubscriptionInfo[], report: SyncReport) {
  const { supabase, apply } = options;
  const individual = infos.filter((info) => info.kind.kind === "individual" && info.status);
  if (individual.length === 0) return;

  const memberships = await fetchAll<MembershipRow>(
    supabase,
    "memberships",
    "id,status,tier,last_renewal,stripe_subscription_id,stripe_customer_id,customer_email,current_period_end,cancel_at_period_end,canceled_at",
  );
  const bySubscription = new Map(
    memberships.filter((m) => m.stripe_subscription_id).map((m) => [m.stripe_subscription_id as string, m]),
  );
  const byId = new Map(memberships.map((m) => [m.id, m]));

  for (const info of individual) {
    report.individuals.checked += 1;
    const tier = (info.kind as { tier: MembershipTierEnum }).tier;
    const label = info.email ?? info.customerName ?? info.subscription.id;
    const existing = bySubscription.get(info.subscription.id);

    if (existing) {
      const patch = changedFields(existing, {
        status: info.status,
        current_period_end: info.periodEnd,
        cancel_at_period_end: info.subscription.cancel_at_period_end,
        canceled_at: info.status === "Cancelled" ? existing.canceled_at ?? info.canceledAt ?? new Date().toISOString() : undefined,
        tier: existing.tier ? undefined : tier,
        stripe_customer_id: existing.stripe_customer_id ? undefined : info.customerId,
        customer_email: existing.customer_email ? undefined : info.email,
        last_renewal:
          info.status === "Active" && info.periodStart && (!existing.last_renewal || existing.last_renewal < info.periodStart)
            ? info.periodStart
            : undefined,
      });
      if (Object.keys(patch).length === 0) {
        report.individuals.unchanged += 1;
        continue;
      }
      if (apply) {
        const { error } = await supabase.from("memberships").update(patch).eq("id", existing.id);
        if (error) throw new Error(`memberships update ${existing.id}: ${error.message}`);
      }
      report.actions.push({
        area: "individual",
        type: "update",
        subscriptionId: info.subscription.id,
        label,
        detail: Object.entries(patch)
          .map(([key, value]) => `${key}: ${String((existing as Record<string, unknown>)[key] ?? "—")} → ${String(value)}`)
          .join(", "),
      });
      continue;
    }

    // Not in the database. Only live subscriptions become members; a cancelled
    // subscription we never recorded is history, not a membership.
    if (info.status === "Cancelled") {
      report.individuals.unchanged += 1;
      continue;
    }
    if (!info.email) {
      report.issues.push({
        area: "individual",
        type: "missing_email",
        label: info.customerName ?? info.customerId ?? info.subscription.id,
        detail: `Stripe subscription ${info.subscription.id} has no customer email, so it can't be matched to a person.`,
      });
      continue;
    }

    const { data: personData, error: personError } = await supabase
      .from("people")
      .select("id,email,membership_id")
      .ilike("email", escapeLike(info.email))
      .limit(1);
    if (personError) throw new Error(`people lookup: ${personError.message}`);
    const person = (personData?.[0] ?? null) as PersonRow | null;

    const currentMembership = person?.membership_id ? byId.get(person.membership_id) : undefined;
    if (currentMembership && currentMembership.status === "Active" && currentMembership.stripe_subscription_id !== info.subscription.id) {
      report.issues.push({
        area: "individual",
        type: "already_has_active_membership",
        label,
        detail: `Stripe subscription ${info.subscription.id} (${tier}) skipped: this person already has an active membership from subscription ${currentMembership.stripe_subscription_id ?? "none"}. Two live subscriptions may mean a double charge.`,
      });
      continue;
    }

    report.actions.push({
      area: "individual",
      type: "create",
      subscriptionId: info.subscription.id,
      label,
      detail: `${tier} ${info.status}${person ? " (linked to existing person)" : " (new person)"}`,
    });
    if (!apply) continue;

    const { data: created, error: createError } = await supabase
      .from("memberships")
      .insert({
        tier,
        status: info.status,
        last_renewal: info.periodStart,
        payment_method: "stripe",
        is_subscription: true,
        start_date: unixToDate(info.subscription.start_date),
        stripe_customer_id: info.customerId,
        stripe_subscription_id: info.subscription.id,
        customer_email: info.email,
        cancel_at_period_end: info.subscription.cancel_at_period_end,
        current_period_end: info.periodEnd,
      })
      .select("id")
      .single();
    if (createError || !created) throw new Error(`memberships insert: ${createError?.message}`);

    let personId = person?.id;
    if (!personId) {
      const { data: newPerson, error: newPersonError } = await supabase
        .from("people")
        .insert({ full_name: info.customerName ?? info.email, email: info.email, source: "stripe_sync" })
        .select("id")
        .single();
      if (newPersonError || !newPerson) throw new Error(`people insert: ${newPersonError?.message}`);
      personId = newPerson.id as string;
    }
    const { error: linkError } = await supabase.from("people").update({ membership_id: created.id }).eq("id", personId);
    if (linkError) throw new Error(`people link: ${linkError.message}`);

    // Keep the in-memory view current so a second subscription for the same
    // person in this run sees the membership we just made.
    const row: MembershipRow = {
      id: created.id as string,
      status: info.status,
      tier,
      last_renewal: info.periodStart,
      stripe_subscription_id: info.subscription.id,
      stripe_customer_id: info.customerId,
      customer_email: info.email,
      current_period_end: info.periodEnd,
      cancel_at_period_end: info.subscription.cancel_at_period_end,
      canceled_at: null,
    };
    bySubscription.set(info.subscription.id, row);
    byId.set(row.id, row);
  }
}

// ------------------------------------------------------------------- businesses

const STATUS_RANK: Record<string, number> = { Active: 0, Expired: 1, Cancelled: 2 };

function pickPrimary(group: SubscriptionInfo[]): SubscriptionInfo {
  return [...group].sort((a, b) => {
    const rank = (STATUS_RANK[a.status ?? "Cancelled"] ?? 3) - (STATUS_RANK[b.status ?? "Cancelled"] ?? 3);
    if (rank !== 0) return rank;
    return (b.periodEnd ?? "").localeCompare(a.periodEnd ?? "");
  })[0];
}

async function reconcileBusinesses(options: SyncOptions, infos: SubscriptionInfo[], report: SyncReport) {
  const { supabase, apply } = options;
  const businessInfos = infos.filter((info) => info.kind.kind === "business" && info.status);
  if (businessInfos.length === 0) return;

  const memberships = await fetchAll<BusinessMembershipRow>(
    supabase,
    "business_memberships",
    "id,status,last_renewal,stripe_subscription_id,stripe_customer_id,customer_email,current_period_end,cancel_at_period_end,canceled_at,tier,annual_dues,payment_method,is_subscription",
  );
  const businesses = await fetchAll<BusinessRow>(
    supabase,
    "businesses",
    "id,business_name,contact_name,email,membership_id,is_member",
  );
  const membershipBySubscription = new Map(
    memberships.filter((m) => m.stripe_subscription_id).map((m) => [m.stripe_subscription_id as string, m]),
  );
  const membershipByCustomer = new Map(
    memberships.filter((m) => m.stripe_customer_id).map((m) => [m.stripe_customer_id as string, m]),
  );
  const membershipById = new Map(memberships.map((m) => [m.id, m]));
  const businessByMembership = new Map(
    businesses.filter((b) => b.membership_id).map((b) => [b.membership_id as string, b]),
  );
  const businessByEmail = new Map(
    businesses.filter((b) => b.email).map((b) => [(b.email as string).trim().toLowerCase(), b]),
  );
  const businessByName = new Map(
    businesses.filter((b) => b.business_name).map((b) => [(b.business_name as string).trim().toLowerCase(), b]),
  );

  // The same business often shows up as several Stripe customers (one per
  // checkout, same email) or several subscriptions on one customer. They are one
  // business, so group by email, sync the best subscription and flag the rest.
  const groups = new Map<string, SubscriptionInfo[]>();
  for (const info of businessInfos) {
    const key = info.email ?? info.customerId ?? info.subscription.id;
    groups.set(key, [...(groups.get(key) ?? []), info]);
  }

  for (const group of groups.values()) {
    report.businesses.checked += 1;
    const primary = pickPrimary(group);
    const label = primary.email ?? primary.customerName ?? primary.subscription.id;

    const live = group.filter((info) => info.status !== "Cancelled");
    if (live.length > 1) {
      report.issues.push({
        area: "business",
        type: "duplicate_subscription",
        label,
        detail: `${live.length} live business subscriptions for ${primary.email ?? primary.customerId}: ${live
          .map((info) => info.subscription.id)
          .join(", ")}. Synced ${primary.subscription.id}; the others may be double charges — check Stripe and cancel/refund extras.`,
      });
    }

    let membership =
      membershipBySubscription.get(primary.subscription.id) ??
      group.map((info) => membershipBySubscription.get(info.subscription.id)).find(Boolean) ??
      (primary.customerId ? membershipByCustomer.get(primary.customerId) : undefined);
    let business = membership ? businessByMembership.get(membership.id) : undefined;

    if (!membership) {
      const aliasName = primary.email ? options.emailToBusinessName?.[primary.email]?.trim().toLowerCase() : undefined;
      business =
        (aliasName ? businessByName.get(aliasName) : undefined) ??
        (primary.email ? businessByEmail.get(primary.email) : undefined);
      if (aliasName && !business) {
        report.issues.push({
          area: "business",
          type: "created_needs_review",
          label,
          detail: `Expected an existing business named "${options.emailToBusinessName?.[primary.email as string]}" but none exists.`,
        });
      }
      if (business?.membership_id) membership = membershipById.get(business.membership_id);
    }

    if (business) report.stripeBusinessIds.push(business.id);

    const wasLinked = Boolean(membership?.stripe_subscription_id || membership?.stripe_customer_id);
    const fields = {
      status: primary.status as MembershipStatusEnum,
      payment_method: "stripe",
      is_subscription: true,
      tier: BUSINESS_MEMBERSHIP_TIER,
      annual_dues: primary.annualDues,
      stripe_customer_id: primary.customerId,
      stripe_subscription_id: primary.subscription.id,
      customer_email: primary.email,
      cancel_at_period_end: primary.subscription.cancel_at_period_end,
      current_period_end: primary.periodEnd,
      canceled_at: primary.status === "Cancelled" ? primary.canceledAt ?? membership?.canceled_at ?? new Date().toISOString() : null,
      // Stripe's period start is the real renewal date. Overwrite the hand-entered
      // date when first linking; afterwards only ever move it forward.
      last_renewal:
        primary.periodStart && (!wasLinked || !membership?.last_renewal || membership.last_renewal < primary.periodStart)
          ? primary.periodStart
          : undefined,
    };

    if (membership) {
      const patch = changedFields(membership, fields);
      const businessPatch = businessFlagsPatch(business, primary);
      if (Object.keys(patch).length === 0 && !businessPatch) {
        report.businesses.unchanged += 1;
        continue;
      }
      if (Object.keys(patch).length > 0) {
        if (apply) {
          const { error } = await supabase.from("business_memberships").update(patch).eq("id", membership.id);
          if (error) throw new Error(`business_memberships update ${membership.id}: ${error.message}`);
        }
        report.actions.push({
          area: "business",
          type: wasLinked ? "update" : "link",
          subscriptionId: primary.subscription.id,
          label: business?.business_name ?? label,
          detail: Object.entries(patch)
            .map(([key, value]) => `${key}: ${String((membership as Record<string, unknown>)[key] ?? "—")} → ${String(value)}`)
            .join(", "),
        });
      }
      if (business && businessPatch) {
        if (apply) {
          const { error } = await supabase.from("businesses").update(businessPatch).eq("id", business.id);
          if (error) throw new Error(`businesses update ${business.id}: ${error.message}`);
        }
      }
      if (!business) {
        report.issues.push({
          area: "business",
          type: "orphan_business_membership",
          label,
          detail: `business_memberships ${membership.id} is tied to Stripe subscription ${primary.subscription.id} but no business points at it.`,
        });
      }
      continue;
    }

    // No membership row yet: attach to the matched business, or create one.
    if (primary.status === "Cancelled") {
      report.businesses.unchanged += 1; // a cancelled customer we never tracked
      continue;
    }

    const newName =
      (primary.email ? options.newBusinessNames?.[primary.email] : undefined) ??
      primary.customerName ??
      primary.email ??
      "Unnamed business";
    report.actions.push({
      area: "business",
      type: business ? "link" : "create",
      subscriptionId: primary.subscription.id,
      label: business?.business_name ?? newName,
      detail: business
        ? "new business_memberships row linked to existing business"
        : "new business + business_memberships row created from Stripe",
    });
    if (!business) {
      report.issues.push({
        area: "business",
        type: "created_needs_review",
        label: newName,
        detail: `Created from Stripe customer ${primary.customerId} (${primary.customerName ?? "no name"}, ${primary.email ?? "no email"}). Check the business name and whether it duplicates an existing record.`,
      });
    }
    if (!apply) continue;

    const { data: createdMembership, error: membershipError } = await supabase
      .from("business_memberships")
      .insert({ ...fields, last_renewal: primary.periodStart ?? new Date().toISOString().slice(0, 10) })
      .select("id")
      .single();
    if (membershipError || !createdMembership) throw new Error(`business_memberships insert: ${membershipError?.message}`);

    if (business) {
      const { error } = await supabase
        .from("businesses")
        .update({ membership_id: createdMembership.id, is_member: primary.status === "Active", ...(business.email ? {} : { email: primary.email }) })
        .eq("id", business.id);
      if (error) throw new Error(`businesses link ${business.id}: ${error.message}`);
    } else {
      const { error } = await supabase.from("businesses").insert({
        business_name: newName,
        contact_name: primary.customerName,
        email: primary.email,
        membership_id: createdMembership.id,
        is_member: primary.status === "Active",
        notes: "Created automatically from a Stripe business subscription. Verify the business name and merge with any existing record.",
      });
      if (error) throw new Error(`businesses insert: ${error.message}`);
    }
  }
}

/**
 * Keep the business row's flags in step. `Expired` (a failed payment Stripe is
 * still retrying) leaves `is_member` alone so one declined card doesn't flap a
 * business off the member list and back on.
 */
function businessFlagsPatch(business: BusinessRow | undefined, info: SubscriptionInfo) {
  if (!business) return null;
  const patch: Record<string, unknown> = {};
  if (info.status === "Active" && !business.is_member) patch.is_member = true;
  if (info.status === "Cancelled" && business.is_member) patch.is_member = false;
  if (!business.email && info.email) patch.email = info.email;
  return Object.keys(patch).length > 0 ? patch : null;
}

/** Webhook path: sync one subscription (and report what changed). */
export async function syncSingleSubscription(stripe: Stripe, supabase: Db, subscriptionId: string) {
  const info = await loadSubscription(stripe, subscriptionId);
  const report = await reconcileSubscriptions({ stripe, supabase, apply: true, subscriptions: [info] });
  return { info, report };
}

/**
 * One-time backfill step, not part of the nightly job: business members that
 * exist in the dashboard but have no Stripe subscription are set to "Review" so
 * a person can confirm them (paid by check? lapsed? someone else's record?).
 * Nothing is removed and `is_member` is untouched. Requires the `Review` enum
 * label (supabase/migrations/20260930120100_membership_status_review.sql).
 */
export async function flagUnmatchedBusinessMembers(options: {
  supabase: SupabaseClient;
  apply: boolean;
  /** Businesses that matched Stripe (report.stripeBusinessIds). */
  excludeBusinessIds: string[];
}): Promise<{ businessName: string; membershipId: string }[]> {
  const { supabase, apply } = options;
  const exclude = new Set(options.excludeBusinessIds);
  const businesses = await fetchAll<BusinessRow>(supabase, "businesses", "id,business_name,contact_name,email,membership_id,is_member");
  const memberships = await fetchAll<BusinessMembershipRow>(
    supabase,
    "business_memberships",
    "id,status,last_renewal,stripe_subscription_id,stripe_customer_id,customer_email,current_period_end,cancel_at_period_end,canceled_at,tier,annual_dues,payment_method,is_subscription",
  );
  const membershipById = new Map(memberships.map((m) => [m.id, m]));

  const flagged: { businessName: string; membershipId: string }[] = [];
  for (const business of businesses) {
    if (!business.is_member || !business.membership_id || exclude.has(business.id)) continue;
    const membership = membershipById.get(business.membership_id);
    if (!membership || membership.stripe_subscription_id || membership.stripe_customer_id) continue;
    if (membership.status !== "Active") continue;
    flagged.push({ businessName: business.business_name ?? "(unnamed)", membershipId: membership.id });
  }

  if (apply && flagged.length > 0) {
    const { error } = await supabase
      .from("business_memberships")
      .update({ status: "Review" })
      .in("id", flagged.map((f) => f.membershipId));
    if (error) throw new Error(`flag review: ${error.message}`);
  }
  return flagged;
}
