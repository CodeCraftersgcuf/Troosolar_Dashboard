import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { ContextApi } from "../Context/AppContext";

/**
 * props:
 * - categories: [{ id, name }]
 * - products: array of mapped products to filter (from HomePage)
 * - onFilteringChange: callback to notify parent when filtering state changes
 */
const SearchBar = ({ categories = [], products = [], onFilteringChange }) => {
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

  // value = "all" | "<categoryId>"
  const [selectedValue, setSelectedValue] = useState("all");
  const [query, setQuery] = useState("");

  const selectedLabel =
    dropdownOptions.find((o) => o.value === selectedValue)?.label || "All";

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter logic (debounced)
  useEffect(() => {
    const delay = setTimeout(() => {
      let results = [...products]; // Start with all products
      const isFilteringActive = selectedValue !== "all" || query.trim() !== "";

      console.log("SearchBar Filtering:", {
        totalProducts: products.length,
        selectedValue,
        query,
        isFilteringActive,
        firstProduct: products[0]
      });

      // Category filtering
      if (selectedValue !== "all") {
        const catId = Number(selectedValue);
        results = results.filter((item) => {
          // For mapped products from HomePage (they have categoryId)
          return Number(item.categoryId) === catId;
        });
        console.log("After category filter:", results.length);
      }

      // Search filtering
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        results = results.filter((item) => {
          // Check the heading field (which is the mapped title)
          const title = item.heading || "";
          return String(title).toLowerCase().includes(q);
        });
        console.log("After search filter:", results.length);
      }

      console.log("Final filtered results:", results.length);
      
      // Update filtered results in context
      setFilteredResults(results);
      
      // Notify parent about filtering state
      if (onFilteringChange) {
        onFilteringChange(isFilteringActive);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [query, selectedValue, products, setFilteredResults, onFilteringChange]);

  return (
    <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 w-[100%] relative">
      {/* Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen((prev) => !prev)}
          className="flex items-center gap-8 pl-4 py-3 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
        >
          <span className="mr-2 whitespace-nowrap">{selectedLabel}</span>
          <ChevronDown
            size={26}
            className={`transition-transform text-gray-400 ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isDropdownOpen && (
          <div className="absolute left-0 top-full mt-1 max-h-[400px] z-50 w-[280px] bg-white rounded-md shadow-lg border border-gray-200 overflow-y-auto">
            <div className="px-4 py-2 relative">
              <p className="text-center text-gray-500">Select Category</p>
              <X
                size={20}
                onClick={() => setIsDropdownOpen(false)}
                className="cursor-pointer absolute top-2.5 right-2 text-gray-500 hover:text-gray-800"
              />
            </div>

            {dropdownOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setSelectedValue(option.value);
                  setIsDropdownOpen(false);
                }}
                className={`flex items-center justify-between w-full px-4 py-2 text-sm hover:bg-gray-100 ${
                  selectedValue === option.value
                    ? "bg-blue-50 font-semibold"
                    : "text-gray-700"
                }`}
              >
                <span>{option.label}</span>
                <span className="h-4 w-4 rounded-full border border-[#273e8e] flex items-center justify-center">
                  {selectedValue === option.value && (
                    <span className="h-2 w-2 bg-[#273e8e] rounded-full" />
                  )}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-gray-300 mx-2"></div>

      {/* Input Field */}
      <div className="flex-1 flex items-center px-2">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for products..."
          className="w-full px-2 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
        />
        {(query || selectedValue !== "all") && (
          <button
            onClick={() => {
              setQuery("");
              setSelectedValue("all");
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
