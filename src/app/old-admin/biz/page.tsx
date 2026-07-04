import { redirect } from "next/navigation";

export default function BizPage() {
  redirect("/old-admin/people?filter=businesses");
}
