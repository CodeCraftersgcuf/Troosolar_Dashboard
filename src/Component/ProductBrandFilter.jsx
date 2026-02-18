import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { ChevronDown, X } from "lucide-react";
import API, { BASE_URL } from "../config/api.config";

const Z_BACKDROP = 10000;
const Z_PANEL = 10001;

const CATEGORY_BRANDS = (categoryId) =>
  API?.CATEGORY_BRANDS?.(categoryId) ?? `${BASE_URL}/categories/${categoryId}/brands`;
const BRAND_PRODUCTS = (idsCsv) =>
  API?.BRAND_PRODUCTS?.(idsCsv) ?? `${BASE_URL}/brands/${idsCsv}/products`;

const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, "");
const toAbsolute = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/")) return `${API_ORIGIN}${path}`;
  return `${API_ORIGIN}/storage/${path.replace(/^public\//, "")}`;
};

/**
 * Product page brand filter – inline modal (no portal) so open/close/select work.
 * Same design as BrandDropDown. Props: categoryId, onFilter(rawProductsOrAllToken).
 */
const ProductBrandFilter = ({ categoryId, onFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const desktopTriggerRef = useRef(null);
  const mobileTriggerRef = useRef(null);
  const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0 });
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" && window.innerWidth >= 640
  );
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

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
              name: b.name ?? b.title ?? `Brand #${b.id}`,
              icon: toAbsolute(b.icon ?? b.logo ?? b.image),
            }))
          );
          setSelectedIds([]);
        }
      } catch (e) {
        if (mounted) {
          setBrands([]);
          setErr(e?.response?.data?.message || e?.message || "Failed to load brands.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (categoryId) load();
    return () => { mounted = false; };
  }, [categoryId, token]);

  useEffect(() => {
    if (!isOpen) return;
    const desktop = typeof window !== "undefined" && window.innerWidth >= 640;
    setIsDesktop(desktop);
    const el = desktop ? desktopTriggerRef.current : mobileTriggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPanelPosition({ top: rect.bottom + 8, left: rect.left });
  }, [isOpen]);

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

  const clearSelection = () => setSelectedIds([]);

  const applySelection = async () => {
    if (!selectedIds.length) {
      onFilter?.("__ALL__");
      setIsOpen(false);
      return;
    }
    try {
      const idsCsv = selectedIds.join(",");
      const { data } = await axios.get(BRAND_PRODUCTS(idsCsv), {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const arr = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      onFilter?.(arr);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Failed to fetch products.");
    } finally {
      setIsOpen(false);
    }
  };

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
          className="px-4 py-4 bg-white border border-black/50 rounded-2xl shadow-sm flex items-center justify-between w-full font-medium cursor-pointer select-none hover:border-black/70 transition-colors"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          onClick={() => setIsOpen((s) => !s)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsOpen((s) => !s);
            }
          }}
        >
          <span className="text-sm lg:text-lg text-gray-500">{selectedLabel}</span>
          <ChevronDown
            size={26}
            className={`transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </div>
      {/* Mobile trigger */}
      <div className="relative block sm:hidden w-full max-w-[160px]">
        <div
          ref={mobileTriggerRef}
          role="button"
          tabIndex={0}
          style={{ touchAction: "manipulation" }}
          className="px-2 py-3 sm:px-5 sm:py-5 bg-white border border-r-0 border-black/50 rounded-tl-2xl rounded-bl-2xl sm:rounded-2xl sm:border shadow-sm flex items-center justify-between w-full font-medium cursor-pointer select-none hover:border-black/70 transition-colors"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          onClick={() => setIsOpen((s) => !s)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsOpen((s) => !s);
            }
          }}
        >
          <span className="text-sm lg:text-lg text-gray-500">{selectedLabel}</span>
          <ChevronDown
            size={26}
            className={`transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {/* Inline overlay + panel (no portal) – events stay in React tree */}
      {isOpen && (
        <div
          className="fixed inset-0"
          style={{ zIndex: Z_BACKDROP }}
          aria-hidden="true"
          onClick={(e) => {
            if (!e.target.closest("[data-product-brand-panel]")) close();
          }}
          onKeyDown={(e) => e.key === "Escape" && close()}
        >
          <div
            className={isDesktop ? "bg-black/20" : "bg-black/30"}
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          />
          <div
            data-product-brand-panel
            className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden w-[400px] max-h-[400px] flex flex-col"
            style={{
              position: "fixed",
              zIndex: Z_PANEL,
              top: isDesktop ? panelPosition.top : "50%",
              left: isDesktop ? panelPosition.left : "50%",
              transform: isDesktop ? undefined : "translate(-50%, -50%)",
              pointerEvents: "auto",
            }}
            role="listbox"
            aria-label="Brand filter"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative px-4 py-2 border-b border-gray-200 shrink-0">
              <p className="text-center text-gray-900 py-1 font-medium">Brand</p>
              <button
                type="button"
                onClick={close}
                className="absolute top-3 right-2 text-gray-500 hover:text-gray-700 cursor-pointer p-1"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {loading && <div className="px-4 py-3 text-sm text-gray-500">Loading…</div>}
            {err && !loading && <div className="px-4 py-3 text-sm text-red-600">{err}</div>}

            {!loading && !err && (
              <>
                <div className="overflow-y-auto flex-1 min-h-0" style={{ maxHeight: "280px" }}>
                  {brands.length === 0 && (
                    <div className="px-4 py-3 text-sm text-gray-500">No brands in this category.</div>
                  )}
                  <button
                    type="button"
                    onClick={clearSelection}
                    className={`flex items-center justify-between w-full px-8 py-4 text-sm transition-colors ${
                      !selectedIds.length ? "bg-blue-50 font-semibold text-gray-800" : "text-gray-700 hover:bg-gray-100"
                    }`}
                    role="option"
                    aria-selected={!selectedIds.length}
                  >
                    <span>All</span>
                    <span className="h-4 w-4 p-0 flex items-center justify-center border border-[#273e8e]">
                      {!selectedIds.length && <span className="h-4 w-4 bg-[#273e8e]" aria-hidden="true" />}
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
                          checked ? "bg-blue-50 font-semibold text-gray-800" : "text-gray-700 hover:bg-gray-100"
                        }`}
                        role="option"
                        aria-selected={checked}
                      >
                        <span className="flex items-center gap-3">
                          {b.icon && (
                            <img
                              src={b.icon}
                              alt=""
                              className="h-5 w-5 object-contain rounded"
                              onError={(e) => { e.currentTarget.style.display = "none"; }}
                            />
                          )}
                          {b.name}
                        </span>
                        <span className="h-4 w-4 p-0 flex items-center justify-center border border-[#273e8e]">
                          {checked && <span className="h-4 w-4 bg-[#273e8e]" aria-hidden="true" />}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-3 py-4 px-4 border-t shrink-0">
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
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ProductBrandFilter;
