import { redirect } from "next/navigation";

export default function NeighborsMembersPage() {
  redirect("/neighbors?view=members");
}
