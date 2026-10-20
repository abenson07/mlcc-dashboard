import AccountSection from "@/components/sections/AccountSection";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Sign In | Maple Leaf Community",
  description: "Sign in to Maple Leaf Community Dashboard",
};

export const dynamic = "force-dynamic";

export default async function SignIn({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next: rawNext } = await searchParams;
  const nextParam = Array.isArray(rawNext) ? rawNext[0] : rawNext;
  const next =
    nextParam &&
    /^\/admin(\/|\?|$)/.test(nextParam) &&
    !nextParam.startsWith("//") &&
    !nextParam.includes("\\")
      ? nextParam
      : "/admin";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(next);
  }

  return <AccountSection next={next} />;
}
