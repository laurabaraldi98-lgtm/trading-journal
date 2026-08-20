import {
  afterEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";

describe("API_URL and SITE_URL", () => {
  const originalApiUrl =
    process.env.NEXT_PUBLIC_API_URL;

  const originalSiteUrl =
    process.env.NEXT_PUBLIC_SITE_URL;

  afterEach(() => {
    vi.resetModules();

    if (originalApiUrl === undefined) {
      delete process.env.NEXT_PUBLIC_API_URL;
    } else {
      process.env.NEXT_PUBLIC_API_URL =
        originalApiUrl;
    }

    if (originalSiteUrl === undefined) {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    } else {
      process.env.NEXT_PUBLIC_SITE_URL =
        originalSiteUrl;
    }
  });

  test("returns configured URLs without trailing slash", async () => {
    process.env.NEXT_PUBLIC_API_URL =
      "https://api.example.com/";

    process.env.NEXT_PUBLIC_SITE_URL =
      "https://example.com/";

    vi.resetModules();

    const {
      API_URL,
      SITE_URL,
    } = await import("./api");

    expect(API_URL).toBe(
      "https://api.example.com"
    );

    expect(SITE_URL).toBe(
      "https://example.com"
    );
  });

  test("throws when API URL is missing", async () => {
    delete process.env.NEXT_PUBLIC_API_URL;

    process.env.NEXT_PUBLIC_SITE_URL =
      "https://example.com";

    vi.resetModules();

    await expect(
      import("./api")
    ).rejects.toThrow(
      "NEXT_PUBLIC_API_URL is not configured"
    );
  });

  test("throws when site URL is missing", async () => {
    process.env.NEXT_PUBLIC_API_URL =
      "https://api.example.com";

    delete process.env.NEXT_PUBLIC_SITE_URL;

    vi.resetModules();

    await expect(
      import("./api")
    ).rejects.toThrow(
      "NEXT_PUBLIC_SITE_URL is not configured"
    );
  });
});