import { redirect } from "next/navigation";

export default function BusinessesSponsorsPage() {
  redirect("/old-admin/businesses?view=sponsors");
}
