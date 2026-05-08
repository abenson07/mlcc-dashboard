import { redirect } from "next/navigation";

/** Calendar lives under Events; keep this URL as a shortcut. */
export default function CalendarRedirectPage() {
  redirect("/events?view=calendar");
}
