import { afterEach, describe, expect, test, vi } from "vitest";

describe("API_URL", () => {
  const originalApiUrl =
    process.env.NEXT_PUBLIC_API_URL;

  afterEach(() => {
    vi.resetModules();

    if (originalApiUrl === undefined) {
      delete process.env.NEXT_PUBLIC_API_URL;
    } else {
      process.env.NEXT_PUBLIC_API_URL =
        originalApiUrl;
    }
  });

  test("returns configured API URL without trailing slash", async () => {
    process.env.NEXT_PUBLIC_API_URL =
      "https://example.com/";

    vi.resetModules();

    const { API_URL } = await import("./api");

    expect(API_URL).toBe(
      "https://example.com"
    );
  });

  test("throws when API URL is missing", async () => {
    delete process.env.NEXT_PUBLIC_API_URL;

    vi.resetModules();

    await expect(
      import("./api")
    ).rejects.toThrow(
      "NEXT_PUBLIC_API_URL is not configured"
    );
  });
});
