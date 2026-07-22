import type { Metadata } from "next";
import { SkeletonPageShell } from "@marketing/components/byq/SkeletonPageShell";

export const metadata: Metadata = {
  title: "Maple Leaf | Maple Leaf Community Council",
  robots: { index: false, follow: true },
};

export default function AboutMapleLeafPage() {
  return <SkeletonPageShell title="Maple Leaf" />;
}
