import { redirect } from "next/navigation";

/** Legacy calendar URL — events list is the home for Events. */
export default function CalendarRedirectPage() {
  redirect("/admin/events");
}
