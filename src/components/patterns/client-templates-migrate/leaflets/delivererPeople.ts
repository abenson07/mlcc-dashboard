import type { People, PeopleInsert, PeopleUpdate } from "@/types/database";
import { sampleDeliverers, type LeafletDelivererRow } from "@/data/mocks/leaflets";
import {
  applyDemoPatch,
  mergeDemoCollection,
  newDemoId,
  patchDemoEntity,
  upsertDemoEntity,
} from "@/lib/demo/demoStore";
import { DUPLICATE_PERSON_EMAIL } from "@/lib/saveErrorMessage";
import { validateEmail, validatePhone } from "@/lib/validation";

export type DelivererContactField = "email" | "address" | "phone";
export type DelivererPerson = Pick<People, "id" | "full_name" | "email" | "address" | "phone">;
export type NewDelivererInput = {
  name: string;
  email: string;
  address: string;
  phone: string;
};

export function normalizeContact(field: DelivererContactField, value: string): string | null {
  const next = value.trim();
  const error = field === "email" ? validateEmail(next) : field === "phone" ? validatePhone(next) : null;
  if (error) throw new Error(error);
  return next || null;
}

export function newDelivererData(input: NewDelivererInput): PeopleInsert {
  const fullName = input.name.trim();
  if (!fullName || !input.email.trim()) throw new Error("Enter a name and email.");
  return {
    full_name: fullName,
    email: normalizeContact("email", input.email),
    address: normalizeContact("address", input.address),
    phone: normalizeContact("phone", input.phone),
  };
}

export function personContact(person: DelivererPerson) {
  return {
    name: person.full_name,
    email: person.email ?? "",
    address: person.address ?? "",
    phone: person.phone ?? "",
  };
}

function demoPerson(row: LeafletDelivererRow): DelivererPerson {
  return {
    id: row.id,
    full_name: row.name,
    email: row.email || null,
    address: row.address === "Address not on file" ? null : row.address || null,
    phone: row.phone || null,
  };
}

export function demoDelivererPeople(): DelivererPerson[] {
  return mergeDemoCollection("people", sampleDeliverers.map(demoPerson));
}

export function withDemoContacts(rows: LeafletDelivererRow[]): LeafletDelivererRow[] {
  return rows.map((row) => ({
    ...row,
    ...personContact(applyDemoPatch("people", demoPerson(row))),
  }));
}

function assertUniqueDemoEmail(email: string | null, excludeId?: string) {
  if (!email) return;
  if (demoDelivererPeople().some((p) => p.id !== excludeId && p.email?.trim().toLowerCase() === email.toLowerCase())) {
    throw new Error(DUPLICATE_PERSON_EMAIL);
  }
}

export async function createDelivererPerson(
  input: NewDelivererInput,
  options: { demo: boolean; create: (data: PeopleInsert) => Promise<People> },
): Promise<DelivererPerson> {
  const data = newDelivererData(input);
  if (!options.demo) return options.create(data);
  assertUniqueDemoEmail(data.email ?? null);
  const person: People = {
    id: newDemoId("person"),
    full_name: data.full_name,
    email: data.email ?? null,
    address: data.address ?? null,
    phone: data.phone ?? null,
    roles: [],
    tags: [],
    source: null,
    created_at: new Date().toISOString(),
    membership_id: null,
    is_executive_board: false,
  };
  upsertDemoEntity("people", { ...person });
  return person;
}

export async function updateDelivererContact(
  id: string,
  field: DelivererContactField,
  value: string,
  options: { demo: boolean; update: (id: string, patch: PeopleUpdate) => Promise<People> },
): Promise<void> {
  const next = normalizeContact(field, value);
  if (options.demo) {
    if (field === "email") assertUniqueDemoEmail(next, id);
    patchDemoEntity("people", id, { [field]: next });
    return;
  }
  await options.update(id, { [field]: next });
}
