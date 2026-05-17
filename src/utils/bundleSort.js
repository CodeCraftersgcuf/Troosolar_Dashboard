import { apiFlagTrue } from "./apiFlags";

/** Top deal / hot — tolerate snake_case, camelCase, alternate keys from APIs. */
export const entityTopDeal = (x) =>
  apiFlagTrue(
    x?.top_deal ?? x?.topDeal ?? x?.is_top_deal ?? x?.isTopDeal ?? x?.hot_deal
  );

/** Highly recommended / popular — tolerate naming variants. */
export const entityHighlyRecommended = (x) =>
  apiFlagTrue(
    x?.is_most_popular ??
      x?.isMostPopular ??
      x?.is_recommended ??
      x?.isRecommended ??
      x?.highly_recommended ??
      x?.highlyRecommended
  );

/** Parse kVA from explicit rating fields (digits only). */
const parseKvaFromFields = (value) => {
  const n = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

/**
 * Stable inverter kVA for ordering (smallest → largest).
 * Falls back to title / product_model / specifications when API rating is missing.
 */
export const extractKvaFromBundle = (b) => {
  if (!b || typeof b !== "object") return 0;
  let k = parseKvaFromFields(
    b.inver_rating ?? b.inverter_rating ?? b.inverterRating ?? ""
  );
  if (k > 0) return k;

  const tryText = (text) => {
    const s = String(text ?? "");
    if (!s) return 0;
    let m = s.match(/(\d+(?:\.\d+)?)\s*kVA/i);
    if (m) return Number(m[1]) || 0;
    m = s.match(/\+\s*(\d+(?:\.\d+)?)\s*kVA/i);
    if (m) return Number(m[1]) || 0;
    return 0;
  };

  k = tryText(b.title);
  if (k > 0) return k;
  k = tryText(b.product_model);
  if (k > 0) return k;

  try {
    const specs =
      typeof b.specifications === "string"
        ? JSON.parse(b.specifications)
        : b.specifications;
    if (specs && typeof specs === "object") {
      k = parseKvaFromFields(
        specs.inverter_capacity_kva ?? specs.inverter_capacity
      );
      if (k > 0) return k;
    }
  } catch {
    /* ignore */
  }

  return 0;
};

export const bundleFeaturedRank = (b) =>
  entityTopDeal(b) || entityHighlyRecommended(b) ? 1 : 0;

/** Stronger promo ordering: both badges → top deal only → recommended only → rest. */
const bundlePromoRank = (b) => {
  const hot = entityTopDeal(b);
  const pop = entityHighlyRecommended(b);
  if (hot && pop) return 3;
  if (hot) return 2;
  if (pop) return 1;
  return 0;
};

/** BNPL / Buy Now bundle step: promos first, then ascending kVA, then id. */
export const sortBundlesFeaturedThenKvaAsc = (arr) => {
  if (!Array.isArray(arr)) return [];
  return [...arr].sort((a, b) => {
    const ra = bundlePromoRank(a);
    const rb = bundlePromoRank(b);
    if (rb !== ra) return rb - ra;
    const ak = extractKvaFromBundle(a);
    const bk = extractKvaFromBundle(b);
    if (ak !== bk) return ak - bk;
    return Number(a?.id ?? 0) - Number(b?.id ?? 0);
  });
};

/** Product grids in BNPL / Buy Now: same promo priority as bundles, then id. */
export const productPromoRank = (p) => {
  const hot = entityTopDeal(p);
  const pop = entityHighlyRecommended(p);
  if (hot && pop) return 3;
  if (hot) return 2;
  if (pop) return 1;
  return 0;
};

export const sortProductsByPromoFirst = (arr) => {
  if (!Array.isArray(arr)) return [];
  return [...arr].sort((a, b) => {
    const ra = productPromoRank(a);
    const rb = productPromoRank(b);
    if (rb !== ra) return rb - ra;
    return Number(a?.id ?? 0) - Number(b?.id ?? 0);
  });
};

/** Raw API bundles: ascending kVA, then featured, then id. */
export const sortBundlesByKvaAsc = (arr) => {
  if (!Array.isArray(arr)) return [];
  return [...arr].sort((a, b) => {
    const ak = extractKvaFromBundle(a);
    const bk = extractKvaFromBundle(b);
    if (ak !== bk) return ak - bk;
    const ah = bundleFeaturedRank(a);
    const bh = bundleFeaturedRank(b);
    if (bh !== ah) return bh - ah;
    return Number(a?.id ?? 0) - Number(b?.id ?? 0);
  });
};

/** SearchBar passes mapped cards `{ ...mapBundle(r), bundle: r }` — same order as main grid (promo first, then kVA). */
export const sortMappedBundleCards = (cards) => {
  return [...(cards || [])].sort((a, b) => {
    const rawA = a.bundle || a;
    const rawB = b.bundle || b;
    const ra = bundlePromoRank(rawA);
    const rb = bundlePromoRank(rawB);
    if (rb !== ra) return rb - ra;
    const ak = extractKvaFromBundle(rawA);
    const bk = extractKvaFromBundle(rawB);
    if (ak !== bk) return ak - bk;
    const idA = Number(a.id ?? rawA.id ?? 0);
    const idB = Number(b.id ?? rawB.id ?? 0);
    return idA - idB;
  });
};
