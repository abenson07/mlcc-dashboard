import SignInForm from "@/components/auth/SignInForm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Sign In | Maple Leaf Community",
  description: "Sign in to Maple Leaf Community Dashboard",
};

export default async function SignIn() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/neighbors");
  }

  return <SignInForm />;
}
