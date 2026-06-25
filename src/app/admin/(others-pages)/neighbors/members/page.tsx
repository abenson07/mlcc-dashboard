import { redirect } from "next/navigation";

export default function NeighborsMembersPage() {
  redirect("/admin/neighbors?view=members");
}
