/** Safe internal redirect after login (blocks open redirects). */
export const getSafeReturnPath = (search = "") => {
  const query = String(search || "").replace(/^\?/, "");
  const ret = new URLSearchParams(query).get("return");
  if (!ret) return null;
  try {
    const decoded = decodeURIComponent(ret.trim());
    if (decoded.startsWith("/") && !decoded.startsWith("//")) {
      return decoded;
    }
  } catch {
    /* ignore malformed return URLs */
  }
  return null;
};

export const loginPathWithReturn = (returnPath) => {
  if (!returnPath) return "/login";
  return `/login?return=${encodeURIComponent(returnPath)}`;
};

export const authSwitchPath = (targetPath, currentSearch = "") => {
  const returnPath = getSafeReturnPath(currentSearch);
  if (!returnPath) return targetPath;
  return `${targetPath}?return=${encodeURIComponent(returnPath)}`;
};
