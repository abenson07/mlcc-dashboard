import { Outfit } from "next/font/google";
import "./globals.css";
import "flatpickr/dist/flatpickr.css";
import { Toaster } from "sonner";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { QueryProvider } from "@/providers/QueryProvider";
import { DevLinkProvider } from "@/devlink/DevLinkProvider";
import FeedbackFab from "@/components/feedback/FeedbackFab";

/**
 * Interim stacks: Arcadia Display / Arcadia Text are not on Google Fonts.
 * When licensed WOFF2 files are available, load via `next/font/local` with
 * the same CSS variable names: `--font-mercury-body-stack`, `--font-mercury-heading-stack`.
 */
const mercuryBody = Outfit({
  subsets: ["latin"],
  variable: "--font-mercury-body-stack",
  display: "swap",
});

const mercuryHeading = Outfit({
  subsets: ["latin"],
  variable: "--font-mercury-heading-stack",
  weight: ["400", "500", "600", "700"],
  display: "swap",
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
      className={`${mercuryBody.variable} ${mercuryHeading.variable}`}
    >
      <body
        className={`${mercuryBody.className} dark:bg-mercury-surface-inverse`}
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
      </body>
    </html>
  );
}
