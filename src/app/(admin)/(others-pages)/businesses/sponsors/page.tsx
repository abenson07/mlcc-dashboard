import { redirect } from "next/navigation";

export default function BusinessesSponsorsPage() {
  redirect("/businesses?view=sponsors");
}
