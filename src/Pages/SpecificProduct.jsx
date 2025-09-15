import React, { useEffect, useMemo, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

import SideBar from "../Component/SideBar";
import SearchBar from "../Component/SearchBar";
import Product from "../Component/Product";
import BrandDropDown from "../Component/BrandDropDown";
import PriceDropDown from "../Component/PriceDropDown";
import TopNavbar from "../Component/TopNavbar";
import HrLine from "../Component/MobileSectionResponsive/HrLine";

import API from "../config/api.config";
import { ContextApi } from "../Context/AppContext";
import { assets } from "../assets/data";
import { SearchIcon, ShoppingCart } from "lucide-react";

const toNumber = (v) =>
  typeof v === "number"
    ? v
    : Number(String(v ?? "").replace(/[^\d.]/g, "")) || 0;

const formatNGN = (n) => {
  const num = toNumber(n);
  try {
    return `₦${new Intl.NumberFormat("en-NG").format(num)}`;
  } catch {
    return `₦${num}`;
  }
};

const mapApiProductToCard = (p) => {
  if (!p) return null;

  const image =
    p.featured_image ||
    p?.images?.[0]?.image ||
    assets?.placeholderProduct ||
    "/placeholder-product.png";

  const heading =
    p.name || p.title || p.product_name || `Product #${p.id ?? ""}`;

  const priceRaw = p.price ?? p.amount ?? p.sale_price ?? p.product_price;
  const oldRaw = p.compare_at_price ?? p.old_price;

  const price = formatNGN(priceRaw);
  const oldPrice = oldRaw != null ? formatNGN(oldRaw) : "";

  let discount = "";
  const oldNum = toNumber(oldRaw);
  const priceNum = toNumber(priceRaw);
  if (oldNum > priceNum && oldNum > 0) {
    const pct = Math.round(((oldNum - priceNum) / oldNum) * 100);
    discount = `-${pct}%`;
  }

  return {
    id: p.id,
    image,
    heading,
    price,
    oldPrice,
    discount,
    rating: assets?.rating || assets?.fiveStars || "",
    _price_numeric: priceNum,
    _category_id: p.category_id,
  };
};

// Pull an array out of common Laravel API shapes
const extractArray = (payload) => {
  const root = payload?.data ?? payload;

  if (Array.isArray(root)) return root;
  if (Array.isArray(root?.data)) return root.data;
  if (Array.isArray(root?.data?.data)) return root.data.data;

  if (
    root?.data &&
    typeof root.data === "object" &&
    !Array.isArray(root.data)
  ) {
    return Object.values(root.data);
  }
  if (root && typeof root === "object") {
    const candidates = Object.values(root).filter((v) => typeof v === "object");
    if (
      candidates.length === 1 &&
      candidates[0] &&
      !Array.isArray(candidates[0])
    ) {
      return Object.values(candidates[0]);
    }
  }
  return [];
};

const SpecificProduct = () => {
  const { id } = useParams(); // category ID from /product/:id
  const { registerProducts } = useContext(ContextApi);

  // category details
  const [category, setCategory] = useState(null);
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState("");

  // products in this category
  const [allProducts, setAllProducts] = useState([]); // full set for this category
  const [specificProduct, setSpecificProduct] = useState([]); // currently displayed list
  const [prodLoading, setProdLoading] = useState(false);
  const [prodError, setProdError] = useState("");

  // fetch category details
  useEffect(() => {
    const fetchCategory = async () => {
      setCatLoading(true);
      setCatError("");
      try {
        const token = localStorage.getItem("access_token");
        const { data } = await axios.get(API.CATEGORY_BY_ID(id), {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        setCategory(data?.data ?? data ?? null);
      } catch (e) {
        setCategory(null);
        setCatError(
          e?.response?.data?.message || e?.message || "Failed to load category."
        );
      } finally {
        setCatLoading(false);
      }
    };
    if (id) fetchCategory();
  }, [id]);

  // fetch category products + fallback to /products filtered by category_id
  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setProdLoading(true);
      setProdError("");
      try {
        const token = localStorage.getItem("access_token");
        const headers = {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        // 1) try /categories/:id/products (if you have it in api.config)
        const { data: catResp } = await axios.get(API.CATEGORY_PRODUCTS(id), {
          headers,
        });
        let rawList = extractArray(catResp);

        // 2) Fallback: if empty, pull /products and filter client-side
        if (!rawList.length) {
          const { data: allResp } = await axios.get(API.PRODUCTS, { headers });
          const every = extractArray(allResp);
          rawList = every.filter((p) => String(p?.category_id) === String(id));
        }

        // Keep original raw in Context for cart (if your cart uses it)
        registerProducts(rawList);

        const mapped = rawList.map(mapApiProductToCard).filter(Boolean);
        setAllProducts(mapped);
        setSpecificProduct(mapped); // default view: all
      } catch (e) {
        setAllProducts([]);
        setSpecificProduct([]);
        setProdError(
          e?.response?.data?.message || e?.message || "Failed to load products."
        );
      } finally {
        setProdLoading(false);
      }
    };
    if (id) fetchCategoryProducts();
  }, [id, registerProducts]);

  // price filter
  const handlePriceFilter = (min, max) => {
    const minNum = min == null ? -Infinity : Number(min);
    const maxNum = max == null ? Infinity : Number(max);
    const filtered = allProducts.filter((p) => {
      const n = Number(p._price_numeric || 0);
      return n >= minNum && n <= maxNum;
    });
    setSpecificProduct(filtered);
  };

  // brand dropdown result handler
  // result === "__ALL__" -> restore allProducts
  // result === raw products array from /brands/{ids}/products -> map + restrict to this category (just in case)
  const handleBrandFilterResult = (result) => {
    if (result === "__ALL__") {
      setSpecificProduct(allProducts);
      return;
    }
    const sameCat = (Array.isArray(result) ? result : []).filter(
      (p) => String(p?.category_id) === String(id)
    );
    const mapped = sameCat.map(mapApiProductToCard).filter(Boolean);
    setSpecificProduct(mapped);
  };

  const displayCategoryName = useMemo(() => {
    return category?.name || category?.title || `Category #${id}`;
  }, [category, id]);

  return (
    <>
      {/* Desktop View */}
      <div className="sm:flex hidden w-full min-h-screen bg-gray-100">
        <div className="w-auto">
          <SideBar />
        </div>

        <div className="flex-1 flex flex-col">
          <TopNavbar />

          <div className="bg-[#273e8e] border-l-2 border-gray-500 px-6 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-white">
                  {catLoading ? "Loading…" : displayCategoryName}
                </h1>
                <p className="text-white">
                  {catError
                    ? "Couldn't load category."
                    : `Shop for ${displayCategoryName}`}
                </p>
              </div>
              <SearchBar />
            </div>
          </div>

          <div className="px-6 py-6 flex-1 overflow-auto">
            <div className="flex justify-start items-center gap-4 mb-4">
              {/* pass categoryId + result handler */}
              <BrandDropDown
                categoryId={id}
                onFilter={handleBrandFilterResult}
              />
              <PriceDropDown onFilter={handlePriceFilter} />
            </div>

            <h1 className="text-xl font-semibold text-black-800 my-4">
              {displayCategoryName}
            </h1>

            {prodError && (
              <p className="text-red-600 text-sm mb-3">{prodError}</p>
            )}
            {prodLoading && <p className="text-gray-600 text-sm">Loading…</p>}

            <div className="grid xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1 gap-4">
              {specificProduct.map((item) => (
                <Link key={item.id} to={`/homePage/product/${item.id}`}>
                  <Product
                    id={item.id}
                    image={item.image}
                    heading={item.heading}
                    price={item.price}
                    oldPrice={item.oldPrice}
                    discount={item.discount}
                    rating={item.rating}
                  />
                </Link>
              ))}
              {!prodLoading && !specificProduct.length && !prodError && (
                <div className="text-gray-500 bg-white border rounded-xl p-4">
                  No products in this category.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="flex sm:hidden w-full min-h-screen bg-gray-100">
        <div className="flex-1 flex flex-col">
          <div className="bg-[#273e8e] border-l-2 border-gray-500 px-6 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex justify-between w-full items-center">
                <div>
                  <h1 className="text-2xl font-semibold text-white">
                    {catLoading ? "Loading…" : displayCategoryName}
                  </h1>
                  <p className="text-white">
                    {catError
                      ? "Couldn't load category."
                      : `Shop for ${displayCategoryName}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 flex justify-center items-center bg-[#1D3073] rounded-lg">
                    <SearchIcon size={18} color="white" />
                  </div>
                  <div className="w-9 h-9 flex justify-center items-center bg-[#1D3073] rounded-lg">
                    <ShoppingCart size={18} color="white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex h-[70px] justify-center items-center mb-4">
              <BrandDropDown
                categoryId={id}
                onFilter={handleBrandFilterResult}
              />
              <div className="h-full flex items-center px-3">
                <div className="h-[50px] w-[4px] bg-white rounded" />
              </div>
              <PriceDropDown onFilter={handlePriceFilter} />
            </div>
          </div>

          <div className="px-6 py-6 flex-1 overflow-auto">
            <HrLine text={displayCategoryName} />

            {prodError && (
              <p className="text-red-600 text-sm mb-3">{prodError}</p>
            )}
            {prodLoading && <p className="text-gray-600 text-sm">Loading…</p>}

            <div className="grid grid-cols-2 place-items-center gap-4">
              {specificProduct.map((item) => (
                <Link key={item.id} to={`/homePage/product/${item.id}`}>
                  <Product
                    id={item.id}
                    image={item.image}
                    heading={item.heading}
                    price={item.price}
                    oldPrice={item.oldPrice}
                    discount={item.discount}
                    rating={item.rating}
                  />
                </Link>
              ))}
              {!prodLoading && !specificProduct.length && !prodError && (
                <div className="text-gray-500 bg-white border rounded-xl p-4 col-span-2 w-full text-center">
                  No products in this category.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SpecificProduct;
