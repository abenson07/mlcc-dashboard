import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AccountSignOutButton from "@/components/auth/AccountSignOutButton";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-display text-2xl font-bold text-sparkles-navy mb-2">
        My Account
      </h1>
      <p className="text-sparkles-navy/80 mb-8">
        Signed in as <span className="font-medium">{user.email}</span>.
      </p>
      <p className="text-sparkles-navy/70 mb-8">
        Membership status, payment history, and volunteer opportunities are
        coming soon.
      </p>
      <AccountSignOutButton />
    </main>
  );
}
