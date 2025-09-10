
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { ChevronDown, X } from "lucide-react";
import API, { BASE_URL } from "../config/api.config";

// Fallbacks in case api.config.js doesn't have these helpers yet
const CATEGORY_BRANDS = (categoryId) =>
  (API && API.CATEGORY_BRANDS)
    ? API.CATEGORY_BRANDS(categoryId)
    : `${BASE_URL}/categories/${categoryId}/brands`;

const BRAND_PRODUCTS = (brandIdsCsv) =>
  (API && API.BRAND_PRODUCTS)
    ? API.BRAND_PRODUCTS(brandIdsCsv)
    : `${BASE_URL}/brands/${brandIdsCsv}/products`;

// Turn BASE_URL (http://localhost:8000/api) into origin (http://localhost:8000)
const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, "");
const toAbsolute = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/")) return `${API_ORIGIN}${path}`;
  const cleaned = path.replace(/^public\//, "");
  return `${API_ORIGIN}/storage/${cleaned}`;
};

/**
 * Props:
 * - categoryId: number|string (required)
 * - onFilter: function(rawProductsOrAllToken) — called with:
 *      "__ALL__" when user clears selection,
 *      or an array of RAW product objects from API.
 */
const BrandDropDown = ({ categoryId, onFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Multi-select of brand ids (as strings for consistency)
  const [selectedIds, setSelectedIds] = useState([]);

  const desktopWrapRef = useRef(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  // Load brands for this category
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setErr("");
      try {
        const { data } = await axios.get(CATEGORY_BRANDS(categoryId), {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const arr = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        if (mounted) {
          setBrands(
            arr.map((b) => ({
              id: String(b.id),
              name: b.name || b.title || `Brand #${b.id}`,
              icon: toAbsolute(b.icon || b.logo || b.image),
            }))
          );
          setSelectedIds([]); // reset when category changes
        }
      } catch (e) {
        if (mounted) {
          setBrands([]);
          setErr(e?.response?.data?.message || e?.message || "Failed to load brands.");
        }
      } finally {
        mounted && setLoading(false);
      }
    };
    if (categoryId) load();
    return () => {
      mounted = false;
    };
  }, [categoryId, token]);

  const selectedLabel = useMemo(() => {
    if (!selectedIds.length) return "All";
    if (selectedIds.length === 1) {
      const b = brands.find((x) => x.id === selectedIds[0]);
      return b ? b.name : "1 selected";
    }
    return `${selectedIds.length} selected`;
  }, [selectedIds, brands]);

  const toggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const applySelection = async () => {
    // If nothing selected => All
    if (!selectedIds.length) {
      onFilter?.("__ALL__");
      setIsOpen(false);
      return;
    }

    try {
      // Multiple selection supported by /brands/1,7/products
      const idsCsv = selectedIds.join(",");
      const { data } = await axios.get(BRAND_PRODUCTS(idsCsv), {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      // Pass RAW products back up; parent will map/limit to category.
      const arr = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];

      onFilter?.(arr);
    } catch (e) {
      setErr(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to fetch products for selected brands."
      );
    } finally {
      setIsOpen(false);
    }
  };

  // The dropdown list UI (reused in desktop + mobile containers)
  const List = () => (
    <div
      className="w-[400px] bg-white border border-gray-200 rounded-md shadow-lg max-h-[400px] overflow-y-auto"
      role="listbox"
      onClick={(e) => e.stopPropagation()} // keep clicks inside
    >
      <div className="relative px-4 py-2 border-b">
        <p className="text-center text-gray-900 py-1">Brand</p>
        <X
          size={20}
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-2 text-gray-500 hover:text-gray-700 cursor-pointer"
          aria-label="Close dropdown"
        />
      </div>

      {/* Loading / Error */}
      {loading && <div className="px-4 py-3 text-sm text-gray-500">Loading…</div>}
      {err && !loading && <div className="px-4 py-3 text-sm text-red-600">{err}</div>}

      {/* Options */}
      {!loading && !err && (
        <>
          {/* "All" row */}
          <button
            type="button"
            onClick={clearSelection}
            className={`flex items-center justify-between w-full px-8 py-4 text-sm transition-colors ${
              !selectedIds.length
                ? "bg-blue-50 font-semibold text-gray-800"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            role="option"
            aria-selected={!selectedIds.length}
          >
            <span>All</span>
            <span className="h-4 w-4 p-0 flex items-center justify-center border border-[#273e8e]">
              {!selectedIds.length && (
                <span className="h-4 w-4 bg-[#273e8e]" aria-hidden="true" />
              )}
            </span>
          </button>

          {brands.map((b) => {
            const checked = selectedIds.includes(b.id);
            return (
              <button
                type="button"
                key={b.id}
                onClick={() => toggle(b.id)}
                className={`flex items-center justify-between w-full px-8 py-4 text-sm transition-colors ${
                  checked
                    ? "bg-blue-50 font-semibold text-gray-800"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                role="option"
                aria-selected={checked}
              >
                <span className="flex items-center gap-3">
                  {b.icon ? (
                    <img
                      src={b.icon}
                      alt={b.name}
                      className="h-5 w-5 object-contain rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : null}
                  {b.name}
                </span>
                <span className="h-4 w-4 p-0 flex items-center justify-center border border-[#273e8e]">
                  {checked && (
                    <span className="h-4 w-4 bg-[#273e8e]" aria-hidden="true" />
                  )}
                </span>
              </button>
            );
          })}
        </>
      )}

      <div className="grid grid-cols-2 gap-3 py-4 px-2">
        <button
          type="button"
          onClick={clearSelection}
          className="border text-sm border-[#273e8e] py-3.5 rounded-full text-[#273e8e] hover:bg-[#273e8e]/10 transition duration-150"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={applySelection}
          className="text-sm rounded-full py-3.5 bg-[#273e8e] text-white hover:bg-[#1f2f6e] transition duration-150"
        >
          Save
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div
        ref={desktopWrapRef}
        className="relative sm:block hidden w-full max-w-[200px]"
      >
        <div className="px-5 py-5 bg-white border border-black/50 rounded-2xl shadow-sm">
          <button
            type="button"
            onClick={() => setIsOpen((s) => !s)}
            className="flex items-center justify-between w-full font-medium"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
          >
            <span className="text-lg text-gray-500">{selectedLabel}</span>
            <ChevronDown
              size={26}
              className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isOpen && (
            <>
              {/* Backdrop (desktop) */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />
              <div className="absolute left-0 z-50 mt-1">
                <List />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="relative block sm:hidden w-full max-w-[160px]">
        <div className="px-5 py-5 bg-white border border-r-0 border-black/50 sm:rounded-2xl rounded-tl-2xl rounded-bl-2xl shadow-sm">
          <button
            type="button"
            onClick={() => setIsOpen((s) => !s)}
            className="flex items-center justify-between w-full font-medium"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
          >
            <span className="text-lg text-gray-500">{selectedLabel}</span>
            <ChevronDown
              size={26}
              className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isOpen && (
            <>
              {/* Backdrop (mobile) */}
              <div
                className="fixed inset-0 bg-black/30 z-40"
                onClick={() => setIsOpen(false)}
              />
              {/* Centered Dropdown */}
              <div className="fixed z-50 top-[70%] left-1/2 -translate-x-1/2 -translate-y-1/2">
                <List />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default BrandDropDown;
