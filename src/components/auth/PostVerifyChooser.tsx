import Link from "next/link";
import Button from "@/components/ui/button/Button";

/** Shown after a successful code verification, for admins who also want their personal account. */
export default function PostVerifyChooser() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        You&apos;re signed in. Where would you like to go?
      </p>
      <div className="flex flex-col gap-3">
        <Link href="/admin">
          <Button className="w-full" size="sm">
            Go to Admin Dashboard
          </Button>
        </Link>
        <Link href="/account">
          <Button className="w-full" size="sm" variant="outline">
            Go to My Personal Account
          </Button>
        </Link>
      </div>
    </div>
  );
}
