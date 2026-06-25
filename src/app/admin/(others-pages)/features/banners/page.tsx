import { redirect } from "next/navigation";

export default function WebsiteBannersRedirectPage() {
  redirect("/admin/communications?view=banners");
}
