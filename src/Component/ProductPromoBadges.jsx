import React from "react";

function StarIcon({ className = "h-3 w-3 shrink-0" }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M10 15.27L4.82 18.32l1-5.38L1 7.97l5.45-.47L10 2.5l2.55 5 5.45.47-3.82 3.97 1 5.38z" />
    </svg>
  );
}

/**
 * Compact pills for “Highly recommended” and “Top deal” on cards and detail headers.
 */
export default function ProductPromoBadges({
  isRecommended,
  isHotDeal,
  className = "",
  layout = "column",
  size,
}) {
  if (!isRecommended && !isHotDeal) return null;

  const isLarge = size === "large";
  const textSize = isLarge ? "text-[11px]" : "text-[10px]";
  const pad = isLarge ? "px-2.5 py-1" : "px-2 py-0.5";
  const starClass = isLarge ? "h-3.5 w-3.5 shrink-0" : "h-3 w-3 shrink-0";

  const pillBase = `inline-flex items-center gap-1 rounded-full font-semibold uppercase tracking-wide ${textSize} ${pad} shadow-lg ring-2 ring-white/90`;

  const dir =
    layout === "row"
      ? "flex flex-row flex-wrap gap-1.5 items-center"
      : "flex flex-col gap-1.5 items-start";

  return (
    <div
      className={`${dir} ${className}`.trim()}
      role="status"
      aria-label="Product highlights"
    >
      {isRecommended ? (
        <span
          className={`${pillBase} bg-gradient-to-r from-emerald-600 to-teal-500 text-white`}
        >
          <StarIcon className={starClass} />
          Highly recommended
        </span>
      ) : null}
      {isHotDeal ? (
        <span
          className={`${pillBase} bg-gradient-to-r from-amber-500 to-orange-500 text-white`}
        >
          Top deal
        </span>
      ) : null}
    </div>
  );
}
