import { redirect } from "next/navigation";

export default function DeliverersPage() {
  redirect("/old-admin/routes?view=deliverers");
}
