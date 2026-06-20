import React from "react";
import { Link } from "react-router-dom";

const Items = ({
  categories = [],
  loading = false,
  onCategorySelect,
  activeCategoryId = null,
}) => {
  const baseUrl = "https://troosolar.hmstech.org";
  const useInlineFilter = typeof onCategorySelect === "function";

  const renderCategoryTile = (cat, variant) => {
    const name = cat.title || cat.name;
    const isActive =
      useInlineFilter && String(activeCategoryId) === String(cat.id);
    const tileClass =
      variant === "desktop"
        ? `flex flex-col items-center justify-center w-[160px] h-[120px] bg-white rounded-2xl shadow-sm shrink-0 cursor-pointer transition-all ${
            isActive ? "ring-2 ring-[#E8A91D] shadow-md" : "hover:shadow-md"
          }`
        : `flex flex-col items-center justify-center w-full h-[89px] max-sm:w-[89px] bg-white rounded-2xl shadow-sm cursor-pointer transition-all ${
            isActive ? "ring-2 ring-[#E8A91D] shadow-md" : "hover:shadow-md"
          }`;

    const content = (
      <div className={tileClass}>
        <div className="flex items-center justify-center w-[70px] h-[70px] max-sm:w-[47px] max-sm:h-[47px] rounded-full bg-[#0000ff]/10 overflow-hidden">
          {cat.icon ? (
            <img
              src={`${baseUrl}${cat.icon}`}
              alt={name}
              className={
                variant === "desktop"
                  ? "h-[48] w-[48] object-contain"
                  : "h-10 w-10 object-contain"
              }
              loading="lazy"
            />
          ) : (
            <span className="text-xs text-blue-700">{(name || "?")[0]}</span>
          )}
        </div>
        <h1
          className={
            variant === "desktop"
              ? "mt-2 text-center text-blue-700 text-sm whitespace-nowrap"
              : "mt-2 text-center text-blue-700 text-[9px] font-medium"
          }
        >
          {name}
        </h1>
      </div>
    );

    if (useInlineFilter) {
      return (
        <button
          key={cat.id}
          type="button"
          onClick={() => onCategorySelect(cat.id)}
          className="border-0 bg-transparent p-0 text-left"
          aria-pressed={isActive}
        >
          {content}
        </button>
      );
    }

    return (
      <Link key={cat.id} to={`/product/${cat.id}`}>
        {content}
      </Link>
    );
  };

  if (loading) {
    return (
      <>
        <div className="w-full sm:block hidden mt-4 overflow-x-auto">
          <div className="flex gap-4 px-4 py-4 min-w-fit">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center w-[160px] h-[120px] bg-white rounded-2xl shadow-sm shrink-0 animate-pulse"
              >
                <div className="w-[70px] h-[70px] rounded-full bg-gray-200" />
                <div className="mt-2 h-3 w-16 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>

        <div className="w-full sm:hidden block mt-4 px-4 ">
          <div className="grid grid-cols-2 min-[390px]:grid-cols-3 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center w-full h-[116px] bg-white rounded-2xl shadow-sm animate-pulse"
              >
                <div className="w-[56px] h-[56px] rounded-full bg-gray-200" />
                <div className="mt-2 h-3 w-16 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (!categories.length) {
    return (
      <div className="text-white/90 text-sm px-4">No categories found.</div>
    );
  }

  return (
    <>
      <div className="w-full sm:block hidden mt-4 overflow-x-auto">
        <div className="flex gap-4 px-4 py-4 min-w-fit">
          {categories.map((cat) => renderCategoryTile(cat, "desktop"))}
        </div>
      </div>

      <div className="w-full sm:hidden block mt-4 px-2 ">
        <div className="grid grid-cols-3 max-[320px]:grid-cols-2 min-[390px]:grid-cols-4 gap-3">
          {categories.map((cat) => renderCategoryTile(cat, "mobile"))}
        </div>
      </div>
    </>
  );
};

export default Items;
