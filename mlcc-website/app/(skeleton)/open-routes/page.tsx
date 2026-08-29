import { CtaSection } from "@marketing/components/byq/CtaSection";
import { OpenRoutesSection } from "@marketing/components/byq/OpenRoutesSection";
import { openRoutes } from "@marketing/data/open-routes";

export default function OpenRoutesPage() {
  return (
    <main>
      <OpenRoutesSection title="Open Routes" routes={openRoutes} />
      <CtaSection />
    </main>
  );
}
