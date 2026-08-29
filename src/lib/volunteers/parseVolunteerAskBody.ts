import type {
  VolunteerCommitmentType,
  VolunteerCommitmentUnit,
} from "@/types/database";
import type { CommitteeSlug } from "schemas/committee_meetings";
import { isCommitteeSlug } from "@/lib/committees/committeeSlug";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type ParsedVolunteerAskBody = {
  title: string;
  description: string | null;
  commitment_type: VolunteerCommitmentType;
  commitment_unit: VolunteerCommitmentUnit;
  commitment_quantity: number;
  quantity: number;
  event_id: string | null;
  committee: CommitteeSlug | null;
  auto_accept: boolean;
  auto_response_body: string | null;
  /** True when the client explicitly sent auto_accept (so PATCH can leave it alone otherwise). */
  auto_accept_provided: boolean;
};

export function parseVolunteerAskBody(raw: unknown): ParsedVolunteerAskBody | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Record<string, unknown>;
  const title = typeof b.title === "string" ? b.title.trim() : "";
  if (!title) return null;

  const commitment_type = b.commitment_type as VolunteerCommitmentType;
  const commitment_unit = b.commitment_unit as VolunteerCommitmentUnit;
  if (commitment_type !== "one_off" && commitment_type !== "ongoing") return null;
  if (commitment_unit !== "hours" && commitment_unit !== "minutes") return null;

  const commitment_quantity = Number(b.commitment_quantity);
  const quantity = Number.parseInt(String(b.quantity), 10);
  if (!Number.isFinite(commitment_quantity) || commitment_quantity <= 0) return null;
  if (!Number.isFinite(quantity) || quantity < 1) return null;


  const eventIdRaw = typeof b.event_id === "string" ? b.event_id.trim() : "";
  const event_id = eventIdRaw && UUID_RE.test(eventIdRaw) ? eventIdRaw : null;

  const committeeRaw = typeof b.committee === "string" ? b.committee.trim() : "";
  const committee = isCommitteeSlug(committeeRaw) ? committeeRaw : null;

  const hasAutoAccept = "auto_accept" in b;
  const auto_accept = b.auto_accept === true;
  const autoBodyRaw =
    typeof b.auto_response_body === "string" ? b.auto_response_body.trim() : "";
  const auto_response_body = autoBodyRaw || null;

  if (hasAutoAccept && auto_accept && !auto_response_body) return null;

  return {
    title,
    description:
      typeof b.description === "string" && b.description.trim()
        ? b.description.trim()
        : null,
    commitment_type,
    commitment_unit,
    commitment_quantity,
    quantity,
    event_id,
    committee,
    auto_accept: hasAutoAccept ? auto_accept : false,
    auto_response_body: hasAutoAccept ? auto_response_body : null,
    auto_accept_provided: hasAutoAccept,
  };
}
