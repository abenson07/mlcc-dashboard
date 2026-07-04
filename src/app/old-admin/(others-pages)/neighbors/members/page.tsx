import { redirect } from "next/navigation";

export default function NeighborsMembersPage() {
  redirect("/old-admin/neighbors?view=members");
}
