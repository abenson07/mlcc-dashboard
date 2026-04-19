import { describe, expect, it } from "vitest";
import { mergeSiteLocaleIds } from "./siteLocales";

describe("mergeSiteLocaleIds", () => {
  it("orders primary then secondaries without duplicates", () => {
    expect(
      mergeSiteLocaleIds({
        locales: {
          primary: { cmsLocaleId: "a" },
          secondary: [
            { cmsLocaleId: "b" },
            { cmsLocaleId: "a" },
            { cmsLocaleId: "c" },
          ],
        },
      })
    ).toEqual(["a", "b", "c"]);
  });

  it("returns empty when missing", () => {
    expect(mergeSiteLocaleIds({})).toEqual([]);
  });
});
