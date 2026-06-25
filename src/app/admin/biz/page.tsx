import { redirect } from "next/navigation";

export default function BizPage() {
  redirect("/admin/people?filter=businesses");
}
