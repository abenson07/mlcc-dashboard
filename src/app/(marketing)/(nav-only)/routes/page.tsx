import { SiteRoutesTable } from "@marketing/components/SiteRoutesTable";
import { SITE_ROUTES } from "@marketing/data/site-routes";

export default function RoutesPage() {
  return (
    <main className="bg-sparkles-cream">
      <div className="max-w-[1800px] mx-auto px-8 max-[767px]:px-4 py-12 max-[767px]:py-8">
        <div className="mb-10 max-w-3xl">
          <p className="font-body text-xs font-bold uppercase tracking-[0.12em] text-sparkles-muted">
            Site tracker
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-puget-night max-[767px]:text-3xl">
            Routes
          </h1>
          <p className="mt-4 font-body text-base leading-7 text-sparkles-muted">
            Click any status pill to cycle through not started, in progress, review, and complete.
          </p>
        </div>
        <SiteRoutesTable routes={SITE_ROUTES} />
      </div>
    </main>
  );
}
