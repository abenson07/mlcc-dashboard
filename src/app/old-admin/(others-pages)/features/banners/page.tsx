import { redirect } from "next/navigation";

export default function WebsiteBannersRedirectPage() {
  redirect("/old-admin/communications?view=banners");
}
