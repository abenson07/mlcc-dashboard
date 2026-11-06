import { describe, expect, it, vi } from "vitest";
import { DUPLICATE_PERSON_EMAIL, saveErrorMessage } from "@/lib/saveErrorMessage";
import { createWithMembership } from "./createWithMembership";

function steps() {
  return {
    createOwner: vi.fn(async () => ({ id: "owner" })),
    createMembership: vi.fn(async () => ({ id: "membership" })),
    link: vi.fn(async () => undefined),
    removeOwner: vi.fn(async () => undefined),
  };
}

describe("createWithMembership", () => {
  it("creates and links both records", async () => {
    const s = steps();
    await expect(createWithMembership(s)).resolves.toEqual({ id: "owner" });
    expect(s.link).toHaveBeenCalledWith("owner", "membership");
    expect(s.removeOwner).not.toHaveBeenCalled();
  });

  it("creates no membership when the owner is refused", async () => {
    const s = steps();
    const duplicate = { code: "23505", message: "duplicate key" };
    s.createOwner.mockRejectedValueOnce(duplicate);
    await expect(createWithMembership(s)).rejects.toBe(duplicate);
    expect(s.createMembership).not.toHaveBeenCalled();
  });

  it("removes the owner when a later step fails", async () => {
    for (const failing of ["createMembership", "link"] as const) {
      const s = steps();
      s[failing].mockRejectedValueOnce(new Error("nope"));
      await expect(createWithMembership(s)).rejects.toThrow("nope");
      expect(s.removeOwner).toHaveBeenCalledWith("owner");
    }
  });

  it("reports the original error even if the cleanup also fails", async () => {
    const s = steps();
    s.link.mockRejectedValueOnce(new Error("link failed"));
    s.removeOwner.mockRejectedValueOnce(new Error("cleanup failed"));
    await expect(createWithMembership(s)).rejects.toThrow("link failed");
  });
});

describe("saveErrorMessage", () => {
  const options = { fallback: "Fallback", duplicate: DUPLICATE_PERSON_EMAIL };

  it("explains duplicates and permission failures", () => {
    expect(saveErrorMessage({ code: "23505", message: "duplicate key" }, options)).toBe(DUPLICATE_PERSON_EMAIL);
    expect(saveErrorMessage({ code: "42501", message: "rls" }, options)).toContain("permission");
  });

  it("uses the message from errors and plain Supabase objects", () => {
    expect(saveErrorMessage(new Error("boom"), options)).toBe("boom");
    expect(saveErrorMessage({ code: "PGRST204", message: "no column" }, options)).toBe("no column");
  });

  it("falls back when there is nothing useful", () => {
    expect(saveErrorMessage(null, options)).toBe("Fallback");
    expect(saveErrorMessage({ message: "  " }, options)).toBe("Fallback");
  });
});
