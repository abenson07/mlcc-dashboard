import { redirect } from "next/navigation";

export default function WebsiteBannersRedirectPage() {
  redirect("/communications?view=banners");
}
