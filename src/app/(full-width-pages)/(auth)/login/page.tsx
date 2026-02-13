import SignInForm from "@/components/auth/SignInForm";

export const metadata = {
  title: "Sign In | Maple Leaf Community",
  description: "Sign in to Maple Leaf Community Dashboard",
};

// Don't do any server-side auth checks - let the form handle it
export default function SignIn() {
  return <SignInForm />;
}
