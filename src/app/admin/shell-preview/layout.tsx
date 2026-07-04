import "@/components/shell/shell.css";
import "@/components/leaflet/leaflet.css";
import "@/components/integrated/integrated.css";
import { Suspense } from "react";
import ShellPreviewContent from "./ShellPreviewContent";

function ShellPreviewFallback() {
  return <div className="shell-preview-root shell-app" />;
}

export default function ShellPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<ShellPreviewFallback />}>
      <ShellPreviewContent>{children}</ShellPreviewContent>
    </Suspense>
  );
}
