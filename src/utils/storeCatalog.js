/** Shared Solar Store catalog helpers (products + bundles). */

export const normalizeBundleTypeKey = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/\s+/g, "");

export const isSolarInverterBatteryBundle = (b) => {
  const key = normalizeBundleTypeKey(b?.bundle_type);
  return (
    key === "solar+inverter+battery" ||
    key === "solarinverterbattery" ||
    /solar.*inverter.*battery/i.test(String(b?.bundle_type || ""))
  );
};

export const isInverterBatteryBundle = (b) => {
  // Solar+Inverter+Battery also matches /inverter.*battery/ — exclude solar kits first.
  if (isSolarInverterBatteryBundle(b)) return false;
  const key = normalizeBundleTypeKey(b?.bundle_type);
  return (
    key === "inverter+battery" ||
    key === "inverterbattery" ||
    /inverter.*battery/i.test(String(b?.bundle_type || ""))
  );
};

export const getBundleStoreCategoryLabel = (b) => {
  if (isSolarInverterBatteryBundle(b)) return "Solar Bundles";
  if (isInverterBatteryBundle(b)) return "Inverter Bundles";
  return String(b?.bundle_type || "Bundles");
};

/** API category ids used for bundle storefront pages (see SpecificProduct). */
export const SOLAR_BUNDLES_CATEGORY_ID = "25";
export const INVERTER_BUNDLES_CATEGORY_ID = "26";

export const BUNDLE_STORE_CATEGORY_IDS = new Set([
  SOLAR_BUNDLES_CATEGORY_ID,
  INVERTER_BUNDLES_CATEGORY_ID,
]);

export const isSolarBundlesCategory = (categoryLabel, categoryId) => {
  const id = categoryId != null ? String(categoryId) : "";
  const label = String(categoryLabel || "").toLowerCase();
  return id === SOLAR_BUNDLES_CATEGORY_ID || /solar\s+bundle/i.test(label);
};

export const isInverterBundlesCategory = (categoryLabel, categoryId) => {
  const id = categoryId != null ? String(categoryId) : "";
  const label = String(categoryLabel || "").toLowerCase();
  return (
    id === INVERTER_BUNDLES_CATEGORY_ID || /inverter\s+bundle/i.test(label)
  );
};

export const isBundleStoreCategory = (categoryLabel, categoryId) =>
  isSolarBundlesCategory(categoryLabel, categoryId) ||
  isInverterBundlesCategory(categoryLabel, categoryId);

/** Product grids that sort by price after promos (panels, batteries, accessories, etc.). */
export const isProductPriceSortCategory = (categoryLabel) => {
  const l = String(categoryLabel || "").toLowerCase();
  return (
    l.includes("panel") ||
    l.includes("battery") ||
    l.includes("lithium") ||
    l.includes("accessor") ||
    l.includes("cable") ||
    l.includes("wiring") ||
    l.includes("mounting") ||
    l.includes("installation") ||
    l.includes("electrical")
  );
};

export const getItemSearchText = (item) => {
  const b = item?.bundle;
  return [
    item?.heading,
    item?.title,
    item?.name,
    item?.inver_rating,
    item?.inverterRating,
    item?.bundle_type,
    item?.bundleTitle,
    item?.categoryName,
    b?.title,
    b?.inver_rating,
    b?.inverter_rating,
    b?.bundle_type,
    b?.total_load,
    b?.total_output,
    b?.product_model,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};

export const productTitleMatchesCategory = (heading, categoryLabel) => {
  if (!heading || !categoryLabel) return false;
  const h = String(heading).toLowerCase();
  const c = String(categoryLabel).toLowerCase();
  if (c.includes("inverter bundle")) return false;
  if (c.includes("solar bundle")) return false;
  if (c.includes("inverter")) return /inverter|inv\b|kva|hybrid\s*inv/i.test(h);
  if (c.includes("panel") || c === "solar panels")
    return (
      /panel|monofacial|bifacial|solar\s*pv|jinko|longi|canadian|trina|watt\s*\d|^\d+w\b/i.test(
        h
      ) && !/inverter|battery|lithium/i.test(h)
    );
  if (c.includes("battery") || c.includes("lithium"))
    return /battery|batteries|lithium|li-ion|kwh\s*battery/i.test(h);
  if (c.includes("all in one") || c.includes("system"))
    return /all\s*in\s*one|system|hybrid\s*system/i.test(h);
  if (c.includes("accessor")) return /cable|wire|connector|meter|stick|wifi/i.test(h);
  if (c.includes("cable") || c.includes("wiring"))
    return /cable|wire|flexible|dc\s*cable|ac\s*cable/i.test(h);
  if (c.includes("mounting") || c.includes("installation"))
    return /mount|rack|structure|installation/i.test(h);
  if (c.includes("electrical"))
    return /breaker|combiner|surge|bypass|switch|busbar|earth/i.test(h);
  return false;
};

export const itemMatchesStoreCategory = (
  item,
  categoryLabel,
  categoryId,
  { strict = false } = {}
) => {
  if (!categoryLabel && categoryId == null) return false;
  const label = String(categoryLabel || "").toLowerCase();
  const isBundle = item?.itemType === "bundle" || Boolean(item?.bundle);

  if (isBundle) {
    const b = item.bundle || item;
    if (isSolarBundlesCategory(categoryLabel, categoryId)) {
      return isSolarInverterBatteryBundle(b);
    }
    if (isInverterBundlesCategory(categoryLabel, categoryId)) {
      return isInverterBatteryBundle(b);
    }
    return false;
  }

  // Dropdown / strip selection: match admin category_id only (no title guessing).
  if (strict && categoryId != null && !isBundleStoreCategory(categoryLabel, categoryId)) {
    return (
      item?.categoryId != null &&
      String(item.categoryId) === String(categoryId)
    );
  }

  if (
    categoryId != null &&
    item?.categoryId != null &&
    String(item.categoryId) === String(categoryId)
  ) {
    return true;
  }

  const heading = item?.heading || item?.title || item?.name || "";
  return productTitleMatchesCategory(heading, categoryLabel);
};

/** Normalize admin brand payload → { brandIds, categoryIds, brandName }. */
export const normalizeBrandFilterSelection = (brandOption) => {
  if (!brandOption) {
    return { brandIds: [], categoryIds: [], brandName: "" };
  }
  const brandIds = Array.isArray(brandOption.ids)
    ? brandOption.ids.map(String)
    : brandOption.id != null
    ? [String(brandOption.id)]
    : [];
  const categoryIds = Array.isArray(brandOption.categoryIds)
    ? brandOption.categoryIds.map(String)
    : brandOption.category_id != null
    ? [String(brandOption.category_id)]
    : [];
  return {
    brandIds,
    categoryIds,
    brandName: brandOption.name || brandOption.title || "",
  };
};

/** Bundles only when brand is assigned to a bundle category and title mentions the brand. */
export const bundleMatchesBrandFilter = (item, brandSelection) => {
  const { categoryIds, brandName } = brandSelection;
  const allowsBundles = (categoryIds || []).some((id) =>
    BUNDLE_STORE_CATEGORY_IDS.has(String(id))
  );
  if (!allowsBundles) return false;

  const title = String(
    item?.heading || item?.bundle?.title || item?.title || ""
  ).toLowerCase();
  const needle = String(brandName || "")
    .trim()
    .toLowerCase();
  return needle !== "" && title.includes(needle);
};

/** Product must match brand_id and sit in an admin-assigned category for that brand. */
export const productMatchesBrandFilter = (rawProduct, brandSelection) => {
  if (!rawProduct) return false;
  const { brandIds, categoryIds } = brandSelection;
  if (!brandIds.includes(String(rawProduct.brand_id ?? ""))) {
    return false;
  }
  if (!categoryIds.length) return true;
  return categoryIds.includes(String(rawProduct.category_id ?? ""));
};

export const catalogItemMatchesBrandFilter = (
  item,
  brandSelection,
  rawProduct
) => {
  if (!brandSelection?.brandIds?.length) return true;
  if (item?.itemType === "bundle" || item?.bundle) {
    return bundleMatchesBrandFilter(item, brandSelection);
  }
  return productMatchesBrandFilter(rawProduct, brandSelection);
};
