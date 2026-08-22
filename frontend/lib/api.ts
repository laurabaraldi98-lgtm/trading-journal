const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

if (!apiUrl) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not configured"
  );
}

if (!siteUrl) {
  throw new Error(
    "NEXT_PUBLIC_SITE_URL is not configured"
  );
}

export const API_URL =
  apiUrl.replace(/\/$/, "");

export const SITE_URL =
  siteUrl.replace(/\/$/, "");