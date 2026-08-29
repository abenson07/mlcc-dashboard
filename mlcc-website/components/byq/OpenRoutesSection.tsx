"use client";

import { SectionLabel } from "@marketing/components/SectionLabel";
import { OpenRouteSignupModal } from "@marketing/components/byq/OpenRouteSignupModal";
import { formatRouteMeta, type OpenRoute } from "@marketing/data/open-routes";
import * as React from "react";

export function OpenRoutesSection({
  title,
  routes,
}: {
  title: string;
  routes: OpenRoute[];
}) {
  const [selectedRoute, setSelectedRoute] = React.useState<OpenRoute | null>(null);
  const [claimedIds, setClaimedIds] = React.useState<Set<string>>(() => new Set());

  const availableRoutes = React.useMemo(
    () => routes.filter((route) => !route.deliveryId || !claimedIds.has(route.deliveryId)),
    [routes, claimedIds],
  );

  return (
    <section
      className="bg-sparkles-cream"
      data-editable="true"
      data-editable-type="section"
      data-editable-id="open-routes.structured-data"
      data-editable-label="Open Routes Structured Data"
    >
      <div className="px-8 max-[767px]:px-4">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="pt-8 pb-40 max-[767px]:pt-6 max-[767px]:pb-20">
            <div className="flex flex-col items-center justify-start gap-12 max-[767px]:gap-8">
              <div className="text-center">
                <h2 className="m-0 font-display text-[3rem] leading-[3.25rem] font-bold tracking-[-0.125rem] text-puget-night max-[767px]:text-[2rem] max-[767px]:leading-7 max-[767px]:tracking-[-0.031rem]">
                  {title}
                </h2>
              </div>

              <div className="flex w-full max-w-[49.75rem] flex-col items-center max-[767px]:max-w-none">
                <div className="relative w-full">
                  <div className="w-full border-t border-sparkles-navy/16">
                    {availableRoutes.length > 0 ? (
                      availableRoutes.map((route) => (
                        <div
                          key={route.deliveryId ?? route.slug}
                          className="flex items-start justify-between border-b border-sparkles-navy/16 py-8 max-[767px]:flex-wrap max-[767px]:gap-8 max-[479px]:flex-col"
                        >
                          <div className="flex flex-col items-start justify-start gap-4">
                            <div className="font-display text-[1.75rem] leading-8 font-bold tracking-[-0.0625rem] text-puget-night max-[767px]:text-[1.5rem] max-[767px]:leading-7">
                              {route.routeName}
                            </div>
                            <SectionLabel>{formatRouteMeta(route)}</SectionLabel>
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelectedRoute(route)}
                            className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-[2rem] border border-sparkles-navy bg-sparkles-navy px-4 py-3 font-display text-sm leading-5 font-bold text-sparkles-cream transition-all duration-300 hover:border-sparkles-navy/90 hover:bg-sparkles-navy/90"
                          >
                            Sign up
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="border-b border-sparkles-navy/16 py-12 text-center">
                        <p className="m-0 font-body text-base leading-6 text-sparkles-navy">
                          No open routes right now. Check back soon.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {selectedRoute ? (
        <OpenRouteSignupModal
          route={selectedRoute}
          onClose={() => setSelectedRoute(null)}
          onSignedUp={(deliveryId) => {
            setClaimedIds((current) => {
              const next = new Set(current);
              next.add(deliveryId);
              return next;
            });
          }}
        />
      ) : null}
    </section>
  );
}

export default OpenRoutesSection;
