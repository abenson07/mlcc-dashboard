import { Noto_Sans } from "next/font/google";
import "./globals.css";
import "flatpickr/dist/flatpickr.css";
import { Toaster } from "sonner";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { QueryProvider } from "@/providers/QueryProvider";
import { DevLinkProvider } from "@/devlink/DevLinkProvider";
import AgentationDev from "@/components/dev/AgentationDev";
import FeedbackFab from "@/components/feedback/FeedbackFab";

/**
 * Display/body stacks both use Noto Sans until Arcadia fonts ship; then load
 * via `next/font/local` with `--font-mercury-body-stack` and
 * `--font-mercury-heading-stack` again if body and headings diverge.
 */
const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-mercury-body-stack",
  display: "swap",
  style: ["normal", "italic"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={notoSans.variable}
    >
      <body
        className={`${notoSans.className} dark:bg-mercury-surface-inverse`}
        suppressHydrationWarning
      >
        <QueryProvider>
          <ThemeProvider>
            <DevLinkProvider>
              <SidebarProvider>{children}</SidebarProvider>
            </DevLinkProvider>
          </ThemeProvider>
        </QueryProvider>
        <Toaster richColors position="bottom-right" />
        <FeedbackFab />
        <AgentationDev />
      </body>
    </html>
  );
}
