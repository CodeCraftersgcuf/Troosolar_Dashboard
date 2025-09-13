import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { ContextApi } from "../Context/AppContext";

/**
 * props:
 * - categories: [{ id, name }]
 * - products: array of products to filter (optional, falls back to context)
 */
const SearchBar = ({ categories = [], products: propProducts }) => {
  const { products: contextProducts, setFilteredResults } = useContext(ContextApi);
  
  // Use prop products if provided, otherwise fall back to context products
  const products = propProducts || contextProducts;

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
      let results = products || [];

      // Category filtering
      if (selectedValue !== "all") {
        const catId = Number(selectedValue);
        results = results.filter((item) => {
          // For mapped products from HomePage (they have categoryId)
          if (item.categoryId != null) {
            return Number(item.categoryId) === catId;
          }
          // For raw API products (they have category_id)
          if (item.category_id != null) {
            return Number(item.category_id) === catId;
          }
          // Fallback for mocked products that use `category` string
          const label = dropdownOptions.find(
            (o) => o.value === selectedValue
          )?.label;
          if (label && item.category) {
            return String(item.category).toLowerCase() === label.toLowerCase();
          }
          return false;
        });
      }

      // Search filtering
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        results = results.filter((item) => {
          // Check multiple possible title fields
          const title = item.heading || item.title || item.name || "";
          return String(title).toLowerCase().includes(q);
        });
      }

      setFilteredResults(results);
    }, 300);

    return () => clearTimeout(delay);
  }, [query, selectedValue, products, setFilteredResults, dropdownOptions]);

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
      </div>
    </div>
  );
};

export default SearchBar;
