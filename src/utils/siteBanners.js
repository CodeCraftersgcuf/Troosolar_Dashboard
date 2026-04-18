import axios from "axios";
import API, { BASE_URL } from "../config/api.config";

const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, "");

/** Dedupe concurrent requests only (no long-lived cache so admin updates show after navigation). */
let inflight = null;

function resolveBannerSrc(entry) {
  if (!entry || typeof entry !== "object") return null;
  const path = entry.path;
  const url = entry.url;
  if (path && /^https?:\/\//i.test(String(path))) return String(path);
  if (url && /^https?:\/\//i.test(String(url))) return String(url);
  if (path) {
    const p = String(path).replace(/^public\//, "");
    const seg = p.startsWith("/") ? p : `/${p}`;
    return `${API_ORIGIN}${seg}`;
  }
  return url ? String(url) : null;
}

/**
 * Fetches home + sidebar banner URLs (public). Dedupes concurrent calls in the same tick.
 */
export async function getSiteBanners() {
  if (inflight) return inflight;
  inflight = (async () => {
    let result = { homeUrl: null, sidebarUrl: null };
    try {
      const { data } = await axios.get(API.SITE_BANNER, {
        headers: { Accept: "application/json" },
      });
      const d = data?.data ?? data;
      const home = d?.home ?? { url: d?.url, path: d?.path };
      const sidebar = d?.sidebar ?? {};
      result = {
        homeUrl: resolveBannerSrc(home),
        sidebarUrl: resolveBannerSrc(sidebar),
      };
    } catch {
      result = { homeUrl: null, sidebarUrl: null };
    } finally {
      inflight = null;
    }
    return result;
  })();
  return inflight;
}
