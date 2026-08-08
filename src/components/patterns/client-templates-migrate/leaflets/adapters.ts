import type { Leaflets } from "@/types/database";
import type { LeafletSummary } from "@/data/mocks/leaflets";

export function toLeafletSummary(row: Leaflets): LeafletSummary {
  return {
    id: row.id,
    title: row.title,
    distributionDate: row.distribution_date,
    status: row.status,
  };
}
