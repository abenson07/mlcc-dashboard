import { redirect } from "next/navigation";

export default function BizPage() {
  redirect("/people?filter=businesses");
}
