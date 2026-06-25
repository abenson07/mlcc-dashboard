import { redirect } from "next/navigation";

export default function OpenRoutesPage() {
  redirect("/admin/routes?view=open");
}
