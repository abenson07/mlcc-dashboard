import { redirect } from "next/navigation";

export default function BusinessesMembersPage() {
  redirect("/old-admin/businesses?view=members");
}
