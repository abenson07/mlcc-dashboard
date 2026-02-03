import { redirect } from "next/navigation";

export default function ResetPasswordRedirect() {
  redirect("/dashboard/login");
}
