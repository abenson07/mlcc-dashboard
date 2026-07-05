import { redirect } from "next/navigation";

export default function OpenRoutesPage() {
  redirect("/old-admin/routes?view=open");
}
