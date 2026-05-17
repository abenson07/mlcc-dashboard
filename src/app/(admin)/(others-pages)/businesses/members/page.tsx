import { redirect } from "next/navigation";

export default function BusinessesMembersPage() {
  redirect("/businesses?view=members");
}
