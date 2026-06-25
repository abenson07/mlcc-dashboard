import { Noto_Sans } from "next/font/google";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
