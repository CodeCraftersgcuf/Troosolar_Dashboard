import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { ContextApi } from "../Context/AppContext";

const Z_DROPDOWN_BACKDROP = 9999;
const Z_DROPDOWN_PANEL = 10000;

/**
 * props:
 * - categories: [{ id, name }]
 * - products: array of mapped products to filter (from HomePage or SolarBundle)
 * - onFilteringChange: callback(boolean) when filtering state changes
 * - onFilteredResults: callback(filteredArray) when filtered list is computed (e.g. for SolarBundle)
 */
const SearchBar = ({ categories = [], products = [], onFilteringChange, onFilteredResults }) => {
  const { setFilteredResults } = useContext(ContextApi);

  // Build dropdown options from API cats
  const dropdownOptions = useMemo(() => {
    const base = [{ label: "All", value: "all" }];
    const fromApi = categories.map((c) => ({
      label: c.title || c.name || c.category_name || `Category ${c.id}`,
      value: String(c.id),
    }));
    return [...base, ...fromApi];
  }, [categories]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // value = "all" | "<categoryId>"
  const [selectedValue, setSelectedValue] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedSize, setSelectedSize] = useState("all");

  // Size options from 1.2kW to 10kW
  const sizeOptions = useMemo(() => {
    const sizes = [];
    for (let i = 1.2; i <= 10; i += 0.5) {
      sizes.push({
        label: `${i}kW`,
        value: i.toString(),
      });
    }
    return [{ label: "All Sizes", value: "all" }, ...sizes];
  }, []);

  const selectedLabel =
    dropdownOptions.find((o) => o.value === selectedValue)?.label || "All";

  /**
   * Fallback: infer if product belongs to category by title/heading.
   * Ensures inverters show under Inverters, panels under Panels, batteries under Lithium Batteries, etc.,
   * even when product.category_id is wrong in the API.
   */
  const productTitleMatchesCategory = (heading, categoryLabel) => {
    if (!heading || !categoryLabel) return false;
    const h = String(heading).toLowerCase();
    const c = String(categoryLabel).toLowerCase();
    // Inverters / Solar Inverters
    if (c.includes("inverter")) return /inverter|inv\b|kva|hybrid\s*inv/i.test(h);
    // Solar Panels / Panels
    if (c.includes("panel") || c === "solar panels") return /panel|monofacial|bifacial|solar\s*pv|jinko|longi|canadian|trina|watt\s*\d|^\d+w\b/i.test(h) && !/inverter|battery|lithium/i.test(h);
    // Lithium Batteries / Batteries
    if (c.includes("battery") || c.includes("lithium")) return /battery|batteries|lithium|li-ion|li-ion|kwh\s*battery/i.test(h);
    // All In One Systems
    if (c.includes("all in one") || c.includes("system")) return /all\s*in\s*one|system|hybrid\s*system/i.test(h);
    // Accessories, Cables, etc. - optional keyword match
    if (c.includes("accessor")) return /cable|wire|connector|meter|stick|wifi/i.test(h);
    if (c.includes("cable") || c.includes("wiring")) return /cable|wire|flexible|dc\s*cable|ac\s*cable/i.test(h);
    if (c.includes("mounting") || c.includes("installation")) return /mount|rack|structure|installation/i.test(h);
    if (c.includes("electrical")) return /breaker|combiner|surge|bypass|switch|busbar|earth/i.test(h);
    return false;
  };

  // Position dropdown below trigger when open (for fixed positioning so it's not clipped by overflow)
  useEffect(() => {
    if (!isDropdownOpen || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setDropdownPosition({ top: rect.bottom + 4, left: rect.left });
  }, [isDropdownOpen]);

  // Close dropdown if clicked outside (including when dropdown is fixed/portaled)
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClickOutside = (event) => {
      const panel = document.querySelector("[data-search-bar-dropdown-panel]");
      if (triggerRef.current?.contains(event.target) || panel?.contains(event.target)) return;
      setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  // Extract size from query (e.g., "1.2kW" or "1.2 kw")
  const extractSizeFromQuery = (q) => {
    const sizeMatch = q.match(/(\d+\.?\d*)\s*kw/i);
    if (sizeMatch) {
      return parseFloat(sizeMatch[1]);
    }
    return null;
  };

  // Filter logic (debounced for search, immediate for dropdown selections)
  useEffect(() => {
    // Use shorter delay for dropdown selections, longer for search input
    const delay = query.trim() ? 300 : 0; // Immediate for category/size, debounced for search
    
    const timeoutId = setTimeout(() => {
      if (!products || products.length === 0) {
        setFilteredResults([]);
        if (onFilteringChange) {
          onFilteringChange(false);
        }
        return;
      }

      let results = [...products]; // Start with all products
      const querySize = extractSizeFromQuery(query);
      const sizeToFilter = selectedSize !== "all" ? parseFloat(selectedSize) : querySize;
      const isFilteringActive = selectedValue !== "all" || query.trim() !== "" || selectedSize !== "all";

      // Category filtering: by category_id first, then fallback by product title so
      // inverters show under Inverters, panels under Panels, batteries under Lithium Batteries, etc.
      if (selectedValue !== "all") {
        const catId = Number(selectedValue);
        const categoryLabel = dropdownOptions.find((o) => o.value === selectedValue)?.label || "";
        results = results.filter((item) => {
          const itemCategoryId = Number(item.categoryId);
          const matchesId = !isNaN(itemCategoryId) && itemCategoryId === catId;
          const matchesTitle = productTitleMatchesCategory(item.heading || item.title || item.name, categoryLabel);
          return matchesId || matchesTitle;
        });
      }

      // Size filtering (for bundles)
      if (sizeToFilter && !isNaN(sizeToFilter)) {
        results = results.filter((item) => {
          // Check if it's a bundle (has bundle properties)
          const bundle = item.bundle || item;
          
          // Try to extract size from various bundle properties
          const totalLoad = parseFloat(bundle.total_load || bundle.totalLoad || 0);
          const inverterRating = parseFloat(bundle.inver_rating || bundle.inverterRating || bundle.inverter_rating || 0);
          const totalOutput = parseFloat(bundle.total_output || bundle.totalOutput || 0);
          
          // Convert to kW if needed (assuming values might be in W)
          const loadkW = totalLoad > 1000 ? totalLoad / 1000 : totalLoad;
          const inverterkW = inverterRating > 1000 ? inverterRating / 1000 : inverterRating;
          const outputkW = totalOutput > 1000 ? totalOutput / 1000 : totalOutput;
          
          // Check if any of these values match the selected size (within ±0.3kW range)
          const tolerance = 0.3;
          const matchesLoad = loadkW > 0 && Math.abs(loadkW - sizeToFilter) <= tolerance;
          const matchesInverter = inverterkW > 0 && Math.abs(inverterkW - sizeToFilter) <= tolerance;
          const matchesOutput = outputkW > 0 && Math.abs(outputkW - sizeToFilter) <= tolerance;
          
          return matchesLoad || matchesInverter || matchesOutput;
        });
      }

      // Search filtering (excluding size if already filtered by size)
      if (query.trim() && !querySize) {
        const q = query.trim().toLowerCase();
        results = results.filter((item) => {
          // Check the heading field (which is the mapped title)
          const title = item.heading || item.title || item.name || "";
          return String(title).toLowerCase().includes(q);
        });
      }
      
      // Update filtered results in context
      setFilteredResults(results);
      // Notify parent with filtered array (e.g. SolarBundle can display these)
      if (onFilteredResults) {
        onFilteredResults(results);
      }
      // Notify parent about filtering state
      if (onFilteringChange) {
        onFilteringChange(isFilteringActive);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, selectedValue, selectedSize, products]); // Removed setFilteredResults and onFilteringChange to prevent infinite loops

  return (
    <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 w-[100%] relative" ref={dropdownRef}>
      {/* Dropdown trigger */}
      <div className="relative" ref={triggerRef}>
        <button
          type="button"
          onClick={() => setIsDropdownOpen((prev) => !prev)}
          className="flex items-center gap-8 pl-4 py-3 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
          aria-expanded={isDropdownOpen}
          aria-haspopup="listbox"
        >
          <span className="mr-2 whitespace-nowrap">{selectedLabel}</span>
          <ChevronDown
            size={26}
            className={`transition-transform text-gray-400 ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Dropdown panel: fixed so it's not clipped by overflow-y-auto ancestors */}
      {isDropdownOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/10"
            style={{ zIndex: Z_DROPDOWN_BACKDROP }}
            aria-hidden="true"
            onClick={() => setIsDropdownOpen(false)}
          />
          <div
            data-search-bar-dropdown-panel
            className="fixed max-h-[500px] w-[320px] bg-white rounded-md shadow-lg border border-gray-200 overflow-y-auto"
            style={{
              zIndex: Z_DROPDOWN_PANEL,
              top: dropdownPosition.top,
              left: dropdownPosition.left,
            }}
            role="listbox"
            aria-label="Select category and size"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-2 relative border-b border-gray-200 shrink-0">
              <p className="text-center text-gray-500 font-medium">Select Category</p>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(false)}
                className="cursor-pointer absolute top-2.5 right-2 text-gray-500 hover:text-gray-800 p-1"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Category Options */}
            {dropdownOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedValue(option.value);
                }}
                className={`flex items-center justify-between w-full px-4 py-2 text-sm hover:bg-gray-100 ${
                  selectedValue === option.value
                    ? "bg-blue-50 font-semibold"
                    : "text-gray-700"
                }`}
                role="option"
                aria-selected={selectedValue === option.value}
              >
                <span>{option.label}</span>
                <span className="h-4 w-4 rounded-full border border-[#273e8e] flex items-center justify-center">
                  {selectedValue === option.value && (
                    <span className="h-2 w-2 bg-[#273e8e] rounded-full" />
                  )}
                </span>
              </button>
            ))}

            {/* Size Filter Section */}
            <div className="border-t border-gray-200 mt-2">
              <div className="px-4 py-2 bg-gray-50">
                <p className="text-center text-gray-500 font-medium">Select Size</p>
              </div>
              <div className="max-h-[200px] overflow-y-auto">
                {sizeOptions.map((size) => (
                  <button
                    key={size.value}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedSize(size.value);
                    }}
                    className={`flex items-center justify-between w-full px-4 py-2 text-sm hover:bg-gray-100 ${
                      selectedSize === size.value
                        ? "bg-blue-50 font-semibold"
                        : "text-gray-700"
                    }`}
                    role="option"
                    aria-selected={selectedSize === size.value}
                  >
                    <span>{size.label}</span>
                    <span className="h-4 w-4 rounded-full border border-[#273e8e] flex items-center justify-center">
                      {selectedSize === size.value && (
                        <span className="h-2 w-2 bg-[#273e8e] rounded-full" />
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Divider */}
      <div className="h-6 w-px bg-gray-300 mx-2"></div>

      {/* Input Field */}
      <div className="flex-1 flex items-center px-2">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          id="search-bar-query"
          name="search-query"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Choose Solar Bundle"
          className="w-full px-2 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
          aria-label="Search solar bundles"
        />
        {(query || selectedValue !== "all" || selectedSize !== "all") && (
          <button
            onClick={() => {
              setQuery("");
              setSelectedValue("all");
              setSelectedSize("all");
              // This will trigger the useEffect and clear filters
            }}
            className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Clear filters"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
