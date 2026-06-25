import { redirect } from "next/navigation";

export default function BusinessesMembersPage() {
  redirect("/admin/businesses?view=members");
}
