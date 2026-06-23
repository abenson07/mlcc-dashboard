import { redirect } from "next/navigation";

export default function OpenRoutesPage() {
  redirect("/routes?view=open");
}
