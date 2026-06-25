import "../marketing.css";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="marketing-root min-h-full flex flex-col bg-sparkles-cream text-sparkles-navy font-body antialiased">
      {children}
    </div>
  );
}
