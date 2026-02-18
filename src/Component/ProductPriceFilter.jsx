import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown, X } from "lucide-react";

const Z_BACKDROP = 10000;
const Z_PANEL = 10001;

const PRICE_OPTIONS = [
  { label: "900,000 - 1,500,000", min: 900000, max: 1500000 },
  { label: "1,500,000 - 2,500,000", min: 1500000, max: 2500000 },
  { label: "2,500,000 - 5,000,000", min: 2500000, max: 5000000 },
  { label: "5,000,000+", min: 5000000, max: null },
].sort((a, b) => (a.min || 0) - (b.min || 0));

/**
 * Product page price filter – inline modal (no portal) so open/close/select work.
 * Same design as PriceDropDown. Props: onFilter(min, max).
 */
const ProductPriceFilter = ({ onFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("Price");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0 });
  const desktopTriggerRef = useRef(null);
  const mobileTriggerRef = useRef(null);
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" && window.innerWidth >= 640
  );

  useEffect(() => {
    if (!isOpen) return;
    const desktop = typeof window !== "undefined" && window.innerWidth >= 640;
    setIsDesktop(desktop);
    const el = desktop ? desktopTriggerRef.current : mobileTriggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPanelPosition({ top: rect.bottom + 8, left: rect.left });
  }, [isOpen]);

  const handleSelect = useCallback(
    (option) => {
      setSelectedLabel(option.label);
      setMinPrice(option.min != null ? String(option.min) : "");
      setMaxPrice(option.max != null ? String(option.max) : "");
      setIsOpen(false);
      onFilter?.(option.min, option.max);
    },
    [onFilter]
  );

  const handleSaveCustom = useCallback(() => {
    const min = parseInt(minPrice, 10) || 0;
    const max = parseInt(maxPrice, 10) || 0;
    if (min < 0 || max < 0 || min > max) {
      alert("Please enter a valid price range (min must be less than or equal to max).");
      return;
    }
    setSelectedLabel(`${min.toLocaleString()} - ${max.toLocaleString()}`);
    setIsOpen(false);
    onFilter?.(min, max);
  }, [minPrice, maxPrice, onFilter]);

  const handleClear = useCallback(() => {
    setSelectedLabel("Price");
    setMinPrice("");
    setMaxPrice("");
    onFilter?.(null, null);
  }, [onFilter]);

  const close = () => setIsOpen(false);

  return (
    <>
      {/* Desktop trigger */}
      <div className="relative sm:block hidden w-full max-w-[200px]">
        <div
          ref={desktopTriggerRef}
          role="button"
          tabIndex={0}
          style={{ touchAction: "manipulation" }}
          className="px-4 py-4 bg-white border border-black/50 rounded-2xl shadow-sm hover:border-black/70 transition-colors cursor-pointer"
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          onClick={() => setIsOpen((prev) => !prev)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsOpen((prev) => !prev);
            }
          }}
        >
          <div className="flex items-center justify-between w-full font-medium">
            <span className={`text-lg ${selectedLabel === "Price" ? "text-gray-500" : "text-gray-900"}`}>
              {selectedLabel}
            </span>
            <ChevronDown
              size={26}
              className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </div>
        </div>
      </div>
      {/* Mobile trigger */}
      <div className="relative block sm:hidden w-full max-w-[150px]">
        <div
          ref={mobileTriggerRef}
          role="button"
          tabIndex={0}
          style={{ touchAction: "manipulation" }}
          className="px-2 py-3 sm:px-5 sm:py-5 bg-white border border-black/50 rounded-tr-2xl border-l-0 rounded-br-2xl sm:rounded-2xl shadow-sm hover:border-black/70 transition-colors cursor-pointer"
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          onClick={() => setIsOpen((prev) => !prev)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsOpen((prev) => !prev);
            }
          }}
        >
          <div className="flex items-center justify-between w-full font-medium">
            <span className={`text-lg ${selectedLabel === "Price" ? "text-gray-500" : "text-gray-900"}`}>
              {selectedLabel}
            </span>
            <ChevronDown
              size={26}
              className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </div>
        </div>
      </div>

      {/* Inline overlay + panel (no portal) – events stay in React tree */}
      {isOpen && (
        <div
          className="fixed inset-0"
          style={{ zIndex: Z_BACKDROP }}
          aria-hidden="true"
          onClick={(e) => {
            if (!e.target.closest("[data-product-price-panel]")) close();
          }}
          onKeyDown={(e) => e.key === "Escape" && close()}
        >
          <div
            className={isDesktop ? "bg-black/20" : "bg-black/30"}
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          />
          <div
            data-product-price-panel
            className="w-[400px] max-h-[85vh] flex flex-col bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
            style={{
              position: "fixed",
              zIndex: Z_PANEL,
              top: isDesktop ? panelPosition.top : "50%",
              left: isDesktop ? panelPosition.left : "50%",
              transform: isDesktop ? undefined : "translate(-50%, -50%)",
              pointerEvents: "auto",
            }}
            role="dialog"
            aria-label="Price range"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative px-4 py-3 border-b border-gray-200 shrink-0">
              <p className="text-center text-gray-900 py-1 font-medium">
                {isDesktop ? "Price" : "Select Price Range"}
              </p>
              <button
                type="button"
                onClick={close}
                className="absolute top-3 right-2 text-gray-500 hover:text-gray-700 cursor-pointer p-1"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto min-h-0 flex-1" style={{ maxHeight: "320px" }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedLabel("Price");
                  setMinPrice("");
                  setMaxPrice("");
                  close();
                  onFilter?.(null, null);
                }}
                className={`flex items-center justify-between w-full px-8 py-4 text-sm transition-colors ${
                  selectedLabel === "Price"
                    ? "bg-blue-50 font-semibold text-gray-800"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                role="option"
                aria-selected={selectedLabel === "Price"}
              >
                <span>All</span>
                <span className="h-4 w-4 p-0 rounded-full flex items-center justify-center border border-[#273e8e]">
                  {selectedLabel === "Price" && (
                    <span className="h-3 w-3 rounded-full bg-[#273e8e]" aria-hidden="true" />
                  )}
                </span>
              </button>
              {PRICE_OPTIONS.map((option) => {
                const isSelected = selectedLabel === option.label;
                return (
                  <button
                    key={option.max == null ? `min-${option.min}` : `${option.min}-${option.max}`}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`flex items-center justify-between w-full px-8 py-4 text-sm transition-colors ${
                      isSelected ? "bg-blue-50 font-semibold text-gray-800" : "text-gray-700 hover:bg-gray-100"
                    }`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span>{option.label}</span>
                    <span className="h-4 w-4 p-0 rounded-full flex items-center justify-center border border-[#273e8e]">
                      {isSelected && (
                        <span className="h-3 w-3 rounded-full bg-[#273e8e]" aria-hidden="true" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="p-4 border-t shrink-0">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  id="product-price-filter-min"
                  name="product-price-min"
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="Min price"
                  className="border px-3 text-sm outline-none py-3 rounded-xl border-gray-300 focus:border-[#273e8e] focus:ring-1 focus:ring-[#273e8e]"
                  min="0"
                  aria-label="Minimum price"
                />
                <input
                  id="product-price-filter-max"
                  name="product-price-max"
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="Max price"
                  className="border px-3 text-sm outline-none py-3 rounded-xl border-gray-300 focus:border-[#273e8e] focus:ring-1 focus:ring-[#273e8e]"
                  min="0"
                  aria-label="Maximum price"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleClear}
                  className="border text-sm border-[#273e8e] py-3.5 rounded-full text-[#273e8e] hover:bg-[#273e8e]/10 transition duration-150"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  disabled={!minPrice || !maxPrice}
                  className="text-sm rounded-full py-3.5 bg-[#273e8e] text-white hover:bg-[#1f2f6e] disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductPriceFilter;
