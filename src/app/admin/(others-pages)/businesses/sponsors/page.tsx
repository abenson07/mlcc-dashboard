import { redirect } from "next/navigation";

export default function BusinessesSponsorsPage() {
  redirect("/admin/businesses?view=sponsors");
}
