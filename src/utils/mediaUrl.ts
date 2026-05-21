import { config } from "@/constants/config";

/**
 * Resolves API-relative media paths for expo-av (appends JWT query when needed).
 */
export function resolveMediaUrl(pathOrUrl: string, token?: string | null): string {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://") || pathOrUrl.startsWith("data:")) {
    return pathOrUrl;
  }
  const base = config.apiUrl.replace(/\/$/, "");
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  const url = `${base}${path}`;
  if (!token) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}token=${encodeURIComponent(token)}`;
}
