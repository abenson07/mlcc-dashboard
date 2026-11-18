import { describe, expect, it, vi } from "vitest";
import { LeafletsDemo } from "@/components/patterns/client-templates-migrate/leaflets";
import LeafletsRoute from "./page";

vi.mock("@/components/patterns/client-templates-migrate/leaflets", () => ({
  LeafletsDemo: () => null,
}));
vi.mock("@/lib/leaflets/currentLeaflet", () => ({
  CURRENT_LEAFLET_ID: "current-edition",
}));
vi.mock("next/navigation", () => ({
  redirect: () => { throw new Error("Unexpected redirect to the current leaflet"); },
}));

describe("Leaflets landing page", () => {
  it.each([{}, { all: "1" }])("opens the full list for query %j", async (query) => {
    const props = { searchParams: Promise.resolve(query) };
    const renderPage: (routeProps: typeof props) => unknown = LeafletsRoute;
    expect(await renderPage(props)).toMatchObject({ type: LeafletsDemo });
  });
});
