#!/usr/bin/env npx tsx
/**
 * Read-only: who has more than one live Stripe membership subscription, how long,
 * and how much they've paid in overlap. Writes docs/duplicate-subscriptions.csv.
 *
 *   npx tsx scripts/stripe-duplicate-report.ts
 *
 * "Overlap $" = for each paid invoice on any subscription other than the original, the net
 * amount (after refunds) prorated by how many days of its period were already
 * covered by an earlier-started subscription's paid periods.
 */
import fs from "node:fs";

for (const line of fs.existsSync(".env.local") ? fs.readFileSync(".env.local", "utf8").split("\n") : []) {
  const eq = line.indexOf("=");
  if (eq > 0 && !line.trimStart().startsWith("#")) {
    process.env[line.slice(0, eq).trim()] ??= line.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
  }
}

import { getStripe } from "../src/lib/stripe/server";
import { loadAllSubscriptions, type SubscriptionInfo } from "../src/lib/stripe/subscriptionSync";

const DAY = 86400;
const LIVE = new Set(["active", "past_due", "trialing", "unpaid"]);
const d = (s: number) => new Date(s * 1000).toISOString().slice(0, 10);

type Paid = { invoiceId: string; start: number; end: number; net: number; gross: number };

async function paidInvoices(stripe: NonNullable<ReturnType<typeof getStripe>>, subscriptionId: string, customerId: string, refunds: Map<string, number>): Promise<Paid[]> {
  const out: Paid[] = [];
  const invoices = await stripe.invoices.list({ subscription: subscriptionId, limit: 100, expand: ["data.payments"] });
  for (const inv of invoices.data) {
    if (inv.status !== "paid" || !inv.amount_paid) continue;
    const period = inv.lines.data[0]?.period;
    if (!period) continue;
    const refunded = (inv.payments?.data ?? []).reduce((sum, p) => {
      const pi = typeof p.payment?.payment_intent === "string" ? p.payment.payment_intent : p.payment?.payment_intent?.id;
      return sum + (pi ? refunds.get(pi) ?? 0 : 0);
    }, 0);
    out.push({ invoiceId: inv.id as string, start: period.start, end: period.end, gross: inv.amount_paid / 100, net: (inv.amount_paid - refunded) / 100 });
  }
  void customerId;
  return out.sort((a, b) => a.start - b.start);
}

function overlapDays(a: { start: number; end: number }, covered: { start: number; end: number }[]): number {
  const clipped = covered
    .map((c) => ({ start: Math.max(a.start, c.start), end: Math.min(a.end, c.end) }))
    .filter((c) => c.end > c.start)
    .sort((x, y) => x.start - y.start);
  let total = 0;
  let cursor = -Infinity;
  for (const c of clipped) {
    const start = Math.max(c.start, cursor);
    if (c.end > start) total += c.end - start;
    cursor = Math.max(cursor, c.end);
  }
  return total / DAY;
}

async function main() {
  const stripe = getStripe();
  if (!stripe) throw new Error("STRIPE_SECRET_KEY missing");
  const infos = await loadAllSubscriptions(stripe);

  const groups = new Map<string, SubscriptionInfo[]>();
  for (const info of infos) {
    if (info.kind.kind === "other" || !info.email) continue;
    const key = `${info.kind.kind}|${info.email}`;
    groups.set(key, [...(groups.get(key) ?? []), info]);
  }
  const dupes = [...groups.entries()].filter(([, subs]) => subs.filter((s) => LIVE.has(s.subscription.status)).length > 1);
  console.log(`${dupes.length} people/businesses with 2+ live subscriptions\n`);

  const csv: string[][] = [["type", "email", "name", "sub_id", "role", "tier/product", "status", "started", "annual_price", "paid_invoices", "total_paid_net", "paid_periods", "overlap_dollars_on_this_sub", "stripe_customer"]];
  type SubDetail = { id: string; role: string; level: string; status: string; started: string; price: string; paid: Paid[]; net: number; gross: number; overlapProrated: number; overlapInvoices: number; invoicesInOverlap: number };
  const details = new Map<string, SubDetail[]>();
  const summary: { type: string; email: string; name: string; since: string; months: number; overlap: number; laterPaid: number; subs: string }[] = [];

  for (const [key, subs] of dupes) {
    const [type, email] = key.split("|");
    // The "original" is the oldest subscription still active (falling back to any live one).
    // Everything else, cancelled or not, is measured against it: payments on other
    // subscriptions for dates the original already covered are the overlap.
    const byStart = [...subs].sort((a, b) => a.subscription.start_date - b.subscription.start_date);
    const truth = byStart.find((x) => x.subscription.status === "active") ?? byStart.find((x) => LIVE.has(x.subscription.status)) ?? byStart[0];
    const ordered = [truth, ...byStart.filter((x) => x !== truth)];
    const customers = [...new Set(ordered.map((s) => s.customerId as string))];
    const refunds = new Map<string, number>();
    for (const customer of customers) {
      for await (const charge of stripe.charges.list({ customer, limit: 100 })) {
        const pi = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
        if (pi && charge.amount_refunded) refunds.set(pi, (refunds.get(pi) ?? 0) + charge.amount_refunded);
      }
    }

    const paidBySub = new Map<string, Paid[]>();
    for (const s of ordered) paidBySub.set(s.subscription.id, await paidInvoices(stripe, s.subscription.id, s.customerId as string, refunds));

    const subDetails: SubDetail[] = [];
    details.set(key, subDetails);
    let overlapTotal = 0;
    let laterPaid = 0;
    let firstOverlap = Infinity;
    let lastOverlap = -Infinity;
    const earlierCoverage: { start: number; end: number }[] = [];
    ordered.forEach((s, index) => {
      const paid = paidBySub.get(s.subscription.id) ?? [];
      let subOverlap = 0;
      let subInvoiceOverlap = 0;
      let invoicesInOverlap = 0;
      if (index > 0) {
        for (const p of paid) {
          const days = overlapDays(p, earlierCoverage);
          if (days > 0) {
            subInvoiceOverlap += p.net;
            invoicesInOverlap += 1;
            const share = days / ((p.end - p.start) / DAY);
            subOverlap += p.net * share;
            // the overlapping window itself
            const w = earlierCoverage.map((c) => ({ start: Math.max(p.start, c.start), end: Math.min(p.end, c.end) })).filter((c) => c.end > c.start);
            for (const c of w) { firstOverlap = Math.min(firstOverlap, c.start); lastOverlap = Math.max(lastOverlap, c.end); }
          }
        }
        laterPaid += paid.reduce((sum, p) => sum + p.net, 0);
      }
      for (const p of paid) earlierCoverage.push({ start: p.start, end: p.end });
      overlapTotal += subOverlap;
      const item = s.subscription.items.data[0];
      subDetails.push({
        id: s.subscription.id, role: index === 0 ? "Original" : "Later", level: s.kind.kind === "individual" ? s.kind.tier : "Business",
        status: s.subscription.status, started: d(s.subscription.start_date), price: item?.price?.unit_amount ? `$${item.price.unit_amount / 100}/yr` : "",
        paid, net: paid.reduce((a, p) => a + p.net, 0), gross: paid.reduce((a, p) => a + p.gross, 0),
        overlapProrated: subOverlap, overlapInvoices: subInvoiceOverlap, invoicesInOverlap,
      });
      csv.push([
        type, email, s.customerName ?? "", s.subscription.id, index === 0 ? "original" : "later", s.productName ?? "", s.subscription.status,
        d(s.subscription.start_date), item?.price?.unit_amount ? String(item.price.unit_amount / 100) : "", String(paid.length),
        paid.reduce((sum, p) => sum + p.net, 0).toFixed(2), paid.map((p) => `${d(p.start)}→${d(p.end)} $${p.net}`).join("; "), subOverlap.toFixed(2), s.customerId ?? "",
      ]);
    });

    const now = Date.now() / 1000;
    const months = firstOverlap === Infinity ? 0 : (Math.min(now, lastOverlap) - firstOverlap) / DAY / 30.4;
    summary.push({
      type, email, name: ordered[0].customerName ?? "", since: firstOverlap === Infinity ? "no paid overlap yet" : d(firstOverlap), months: Math.round(months * 10) / 10,
      overlap: Math.round(overlapTotal * 100) / 100, laterPaid: Math.round(laterPaid * 100) / 100,
      subs: ordered.map((s) => `${s.kind.kind === "individual" ? s.kind.tier : "Business"} ${d(s.subscription.start_date)} ${s.subscription.status}`).join(" | "),
    });
  }

  summary.sort((a, b) => b.overlap - a.overlap);
  for (const t of ["business", "individual"]) {
    console.log(`=== ${t.toUpperCase()} ===`);
    for (const s of summary.filter((x) => x.type === t)) {
      console.log(`${s.email} (${s.name})\n   ${s.subs}\n   overlap since ${s.since} (~${s.months} mo) · overlap $${s.overlap} · paid on later subs $${s.laterPaid}`);
    }
    const rows = summary.filter((x) => x.type === t);
    console.log(`   TOTAL ${t}: ${rows.length} people, overlap $${rows.reduce((a, r) => a + r.overlap, 0).toFixed(2)}, paid on later subs $${rows.reduce((a, r) => a + r.laterPaid, 0).toFixed(2)}\n`);
  }

  // Full per-person markdown report.
  const money = (n: number) => `$${n.toFixed(2).replace(/\.00$/, "")}`;
  const lines: string[] = ["# Duplicate Stripe subscriptions — full report", "", `Generated ${d(Date.now() / 1000)}. Contains personal emails — do not commit or share widely.`, "",
    "**How overlap is measured.** The original is the oldest subscription that is still active; every payment on a later subscription that covers dates the original (or an earlier one) already covered is overlap. *Prorated* counts only the days actually doubled; *full-invoice* counts the whole payment for any invoice that overlaps at all. All amounts are net of refunds.", ""];
  const totals = { people: 0, life: 0, pro: 0, full: 0 };
  for (const t of ["business", "individual"]) {
    const rows = summary.filter((x) => x.type === t);
    lines.push(`## ${t === "business" ? "Businesses" : "Individuals"} (${rows.length})`, "");
    for (const s of rows) {
      const subs = details.get(`${t}|${s.email}`) ?? [];
      const life = subs.reduce((a, x) => a + x.net, 0);
      const full = subs.reduce((a, x) => a + x.overlapInvoices, 0);
      totals.people += 1; totals.life += life; totals.pro += s.overlap; totals.full += full;
      lines.push(`### ${s.name || s.email} — ${s.email}`, "",
        "| # | Role | Level | Status | Started | Price | Payments | Lifetime paid | Overlap (prorated) | Overlap (full invoices) |", "|---|---|---|---|---|---|---|---|---|---|");
      subs.forEach((x, i) => lines.push(`| ${i + 1} | ${x.role} | ${x.level} | ${x.status} | ${x.started} | ${x.price} | ${x.paid.length} | ${money(x.net)} | ${money(x.overlapProrated)} | ${money(x.overlapInvoices)} |`));
      lines.push("", `**Lifetime from this ${t === "business" ? "business" : "person"}: ${money(life)}** · Overlap since ${s.since} (~${s.months} months) · **Prorated overlap ${money(s.overlap)}** · **Full-invoice overlap ${money(full)}**`, "");
      for (const x of subs) lines.push(`- ${x.level} (${x.started}, ${x.status}) payments: ${x.paid.length ? x.paid.map((p) => `${d(p.start)} ${money(p.net)}`).join(", ") : "none"}`);
      lines.push("");
    }
  }
  lines.splice(5, 0, `**Totals: ${totals.people} people/businesses · lifetime paid ${money(totals.life)} · prorated overlap ${money(totals.pro)} · full-invoice overlap ${money(totals.full)}**`, "");
  fs.writeFileSync("docs/duplicate-subscriptions-report.md", lines.join("\n"));
  fs.writeFileSync("docs/duplicate-subscriptions.csv", csv.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n"));
  console.log("Wrote docs/duplicate-subscriptions.csv");
}

main().catch((e) => { console.error(e); process.exit(1); });
