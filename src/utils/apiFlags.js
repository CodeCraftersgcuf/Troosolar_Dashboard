/**
 * Normalize API truthy/falsey values (1, "1", "true", true, etc.) to boolean.
 */
export function apiFlagTrue(v) {
  if (v === true || v === 1) return true;
  if (v === false || v === 0 || v == null) return false;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    return s === "1" || s === "true" || s === "yes" || s === "on";
  }
  return Boolean(v);
}
