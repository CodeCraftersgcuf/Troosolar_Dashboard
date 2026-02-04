import React, { useContext, useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import SideBar from "../Component/SideBar";
import SearchBar from "../Component/SearchBar";
import Items from "../Component/Items";
import Product from "../Component/Product";
import { Link } from "react-router-dom";
import { ContextApi } from "../Context/AppContext";
import TopNavbar from "../Component/TopNavbar";
import HrLine from "../Component/MobileSectionResponsive/HrLine";
import { ShoppingCart, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import API from "../config/api.config";
import SizeDropDown from "../Component/SizeDropDown";
import PriceDropDown from "../Component/PriceDropDown";

// ₦ formatter
const formatNGN = (n) => {
  if (n == null || n === "") return "—";
  const num = Number(n);
  if (Number.isNaN(num)) return String(n);
  try {
    return `₦${new Intl.NumberFormat("en-NG").format(num)}`;
  } catch {
    return `₦${num}`;
  }
};

// Fallback image URL
const FALLBACK_IMAGE = "https://troosolar.hmstech.org/storage/products/d5c7f116-57ed-46ef-a659-337c94c308a9.png";

// Map API product -> card props the Product component expects
const mapApiProductToCard = (p) => {
  const image =
    p?.featured_image_url ||
    p?.featured_image ||
    p?.images?.[0]?.image ||
    FALLBACK_IMAGE;

  const heading = p?.title || p?.name || `Product #${p?.id ?? ""}`;

  const priceRaw = Number(p?.price ?? 0);
  const discountRaw = p?.discount_price != null ? Number(p.discount_price) : null;

  let isDiscountActive = false;
  let effectivePrice = priceRaw;
  let oldPrice = "";
  let discount = "";

  // Check if there's a meaningful discount
  if (discountRaw != null && discountRaw < priceRaw) {
    // Check if discount is still valid based on end date
    if (p?.discount_end_date) {
      isDiscountActive = new Date(p.discount_end_date) > new Date();
    } else {
      isDiscountActive = true;
    }
    
    if (isDiscountActive) {
      effectivePrice = discountRaw;
      oldPrice = formatNGN(priceRaw);
      const pct = Math.round(((priceRaw - discountRaw) / priceRaw) * 100);
      discount = `-${pct}%`;
    }
  }

  // Pass the effective price as formatted string, and oldPrice/discount for display
  const price = formatNGN(effectivePrice);

  // average rating from reviews[]
  const reviews = Array.isArray(p?.reviews) ? p.reviews : [];
  const ratingAvg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + Number(r?.rating ?? 0), 0) / reviews.length
      : 0;

  return {
    id: p?.id,
    image,
    heading,
    price, // This is the effective (discounted) price, formatted
    oldPrice, // This is the original price, formatted (only if there's a discount)
    discount, // This is the discount percentage (only if there's a discount)
    ratingAvg,
    ratingCount: reviews.length,
    categoryId: p?.category_id,
    stock: p?.stock,
    isHotDeal: !!p?.top_deal,
  };
};

const HomePage = () => {
  const { registerProducts, filteredResults, setFilteredResults } =
    useContext(ContextApi);

  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState("");

  const [apiProducts, setApiProducts] = useState([]);
  const [rawProducts, setRawProducts] = useState([]); // Store raw API products for filtering
  const [prodLoading, setProdLoading] = useState(false);
  const [prodError, setProdError] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);
  const [searchBarKey, setSearchBarKey] = useState(0); // Key to force SearchBar re-render
  const [selectedSize, setSelectedSize] = useState(null);
  const [priceRange, setPriceRange] = useState({ min: null, max: null });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // 12 items per page

  // Memoize the filtering change callback to prevent infinite loops
  const handleFilteringChange = useCallback((isActive) => {
    setIsFiltering(isActive);
  }, []);

  // Handle size filter
  const handleSizeFilter = useCallback((size) => {
    setSelectedSize(size);
    setCurrentPage(1); // Reset to first page when filter changes
  }, []);

  // Handle price filter
  const handlePriceFilter = useCallback((min, max) => {
    setPriceRange({ 
      min: min !== null && min !== undefined ? min : null, 
      max: max !== null && max !== undefined ? max : null 
    });
    setCurrentPage(1); // Reset to first page when filter changes
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setCatLoading(true);
      setCatError("");
      try {
        const token = localStorage.getItem("access_token");
        const { data } = await axios.get(API.CATEGORIES, {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        setCategories(Array.isArray(data?.data) ? data.data : []);
      } catch (err) {
        setCatError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load categories."
        );
      } finally {
        setCatLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setProdLoading(true);
      setProdError("");
      try {
        const token = localStorage.getItem("access_token");
        const { data } = await axios.get(API.PRODUCTS, {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const list = Array.isArray(data?.data) ? data.data : [];
        const mappedProducts = list.map(mapApiProductToCard);
        setApiProducts(mappedProducts);
        setRawProducts(list); // Store raw products for filtering
        // Initialize filtered results with all products
        setFilteredResults(mappedProducts);
        setIsFiltering(false); // Reset filtering state
        setCurrentPage(1); // Reset to first page when products load
        // keep raw list in context if you use it elsewhere
        registerProducts?.(list);
      } catch (err) {
        setProdError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load products."
        );
      } finally {
        setProdLoading(false);
      }
    };
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount - removed registerProducts and setFilteredResults to prevent infinite loops

  // Build a quick id->name map for categories
  const catMap = useMemo(() => {
    const map = {};
    for (const c of categories || []) {
      const name = c?.name || c?.title || c?.category_name || "";
      if (c?.id) map[c.id] = name || "";
    }
    return map;
  }, [categories]);

  // Helper function to extract size from product title (e.g., "455W" -> 0.455kW)
  const extractSizeFromTitle = useCallback((title) => {
    if (!title) return null;
    
    // Match patterns like "455W", "530W", "1.2kW", "2.5kW", "1.2kVA", etc.
    // Try to match kW or kVA first (more specific)
    let match = title.match(/(\d+\.?\d*)\s*(?:kW|kVA)/i);
    if (match) {
      return parseFloat(match[1]);
    }
    
    // Then try to match W or VA (convert to kW)
    match = title.match(/(\d+\.?\d*)\s*(?:W|VA)/i);
    if (match) {
      const value = parseFloat(match[1]);
      // Convert W/VA to kW if value is >= 100 (assume it's in watts/VA)
      if (value >= 100) {
        return value / 1000; // Convert watts/VA to kW
      }
      // For values < 100, assume they're already in kW
      return value;
    }
    
    // Try to match standalone numbers that might represent kW (e.g., "1.2", "2.5")
    // This is less reliable, so we'll be more conservative
    match = title.match(/\b(\d+\.?\d*)\b/);
    if (match) {
      const value = parseFloat(match[1]);
      // Only consider values between 0.5 and 20 as potential kW values
      if (value >= 0.5 && value <= 20) {
        return value;
      }
    }
    
    return null;
  }, []);

  // Apply size and price filters
  const filteredBySizeAndPrice = useMemo(() => {
    // Start with the base product list (either from search or all products)
    let products = isFiltering ? filteredResults : apiProducts || [];
    let rawProductsList = rawProducts || [];
    
    // Create a map of product ID to raw product for filtering
    const rawProductMap = {};
    rawProductsList.forEach(raw => {
      if (raw?.id) {
        rawProductMap[raw.id] = raw;
      }
    });
    
    // Create a map of mapped product ID to mapped product for quick lookup
    const mappedProductMap = {};
    products.forEach(p => {
      if (p?.id) {
        mappedProductMap[p.id] = p;
      }
    });
    
    // Apply size filter - extract size from product titles
    if (selectedSize !== null && selectedSize !== undefined) {
      const filteredProductIds = new Set();
      
      // Check each raw product for size match
      rawProductsList.forEach(raw => {
        if (!raw?.id) return;
        
        const title = raw?.title || raw?.name || "";
        const productSize = extractSizeFromTitle(title);
        
        let matches = false;
        
        if (productSize !== null) {
          // Match product size with selected size (within ±0.3kW tolerance)
          const tolerance = 0.3;
          matches = Math.abs(productSize - selectedSize) <= tolerance;
        } else {
          // If no size found in title, check for bundle properties (for backward compatibility)
          const mappedProduct = mappedProductMap[raw.id];
          if (mappedProduct) {
            const bundle = mappedProduct.bundle || mappedProduct;
            const totalLoad = parseFloat(bundle.total_load || bundle.totalLoad || 0);
            const inverterRating = parseFloat(bundle.inver_rating || bundle.inverterRating || bundle.inverter_rating || 0);
            const totalOutput = parseFloat(bundle.total_output || bundle.totalOutput || 0);
            
            // Convert to kW if needed
            const loadkW = totalLoad > 1000 ? totalLoad / 1000 : totalLoad;
            const inverterkW = inverterRating > 1000 ? inverterRating / 1000 : inverterRating;
            const outputkW = totalOutput > 1000 ? totalOutput / 1000 : totalOutput;
            
            // Check if any of these values match the selected size (within ±0.3kW range)
            const tolerance = 0.3;
            const matchesLoad = loadkW > 0 && Math.abs(loadkW - selectedSize) <= tolerance;
            const matchesInverter = inverterkW > 0 && Math.abs(inverterkW - selectedSize) <= tolerance;
            const matchesOutput = outputkW > 0 && Math.abs(outputkW - selectedSize) <= tolerance;
            
            matches = matchesLoad || matchesInverter || matchesOutput;
          }
        }
        
        if (matches) {
          filteredProductIds.add(raw.id);
        }
      });
      
      // Filter products to only include those that match the size
      products = products.filter(item => filteredProductIds.has(item.id));
    }
    
    // Apply price filter - use raw price values from API
    if (priceRange.min !== null && priceRange.max !== null) {
      products = products.filter((item) => {
        const rawProduct = rawProductMap[item.id];
        if (!rawProduct) return false;
        
        // Use discount_price if available and valid, otherwise use price
        const discountPrice = rawProduct.discount_price != null ? Number(rawProduct.discount_price) : null;
        const regularPrice = rawProduct.price != null ? Number(rawProduct.price) : 0;
        const actualPrice = discountPrice !== null && discountPrice > 0 ? discountPrice : regularPrice;
        
        return actualPrice >= priceRange.min && actualPrice <= priceRange.max;
      });
    }
    
    return products;
  }, [filteredResults, apiProducts, rawProducts, isFiltering, selectedSize, priceRange, extractSizeFromTitle]);

  // Enrich cards with category name
  const gridProducts = useMemo(() => {
    const sourceProducts = filteredBySizeAndPrice;

    return sourceProducts.map((p) => ({
      ...p,
      categoryName: catMap[p.categoryId] || "Inverter",
    }));
  }, [filteredBySizeAndPrice, catMap]);

  // Pagination calculations
  const totalItems = gridProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = gridProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSize, priceRange, isFiltering]);

  // Handle page change
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const baseUrl = "https://troosolar.hmstech.org/";

  categories.forEach((category) => {
    const iconUrl = `${baseUrl}${category.icon}`;
    console.log("Category Icon:", iconUrl);
  });
  return (
    <>
      {/* Desktop view */}
      <div className="sm:flex hidden w-full min-h-screen bg-gray-100">
        <div className="w-auto">
          <SideBar />
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto">
          <TopNavbar />

          <div className="bg-[#273e8e] px-6 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-6">
              <div className="min-w-[180px]">
                <h1 className="text-3xl font-bold text-white">Solar Store</h1>
              </div>

              {/* SearchBar gets full width 841px on desktop via the component */}
              <SearchBar 
                key={searchBarKey}
                categories={categories} 
                products={apiProducts} 
                onFilteringChange={handleFilteringChange}
              />
            </div>

            {catError && (
              <p className="text-red-200 text-sm mb-2">{catError}</p>
            )}
            <Items categories={categories} loading={catLoading} />
          </div>

          <div className="px-6 py-6 w-full overflow-x-hidden">
            {/* Filters - relative z-[100] so dropdown panels paint above "All Products" and grid */}
            <div className="relative z-[100] flex justify-start items-center gap-4 mb-4">
              <SizeDropDown onFilter={handleSizeFilter} />
              <PriceDropDown onFilter={handlePriceFilter} />
              {/* Show active filters count */}
              {(selectedSize !== null || (priceRange.min !== null && priceRange.max !== null)) && (
                <button
                  onClick={() => {
                    setSelectedSize(null);
                    setPriceRange({ min: null, max: null });
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>

            <h1 className="text-xl text-gray-800 mb-4 font-bold">
              All Products
            </h1>

            {prodError && (
              <p className="text-red-600 text-sm mb-3">{prodError}</p>
            )}
            
            {prodLoading ? (
              <div className="grid xl:grid-cols-4 lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-full bg-white border border-gray-200 rounded-[24px] p-3 sm:p-4 shadow-sm flex flex-col animate-pulse"
                  >
                    <div className="bg-gray-200 h-[140px] sm:h-[180px] rounded-2xl mb-2" />
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2 mt-2" />
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div className="h-10 bg-gray-200 rounded-full" />
                      <div className="h-10 bg-gray-200 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : gridProducts.length > 0 ? (
              <>
                <div className="grid xl:grid-cols-4 lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
                  {paginatedProducts.map((item) => (
                    <Link
                      key={item.id}
                      to={`/homePage/product/${item.id}`}
                      className="w-full"
                    >
                      <Product
                        id={item.id}
                        image={item.image}
                        heading={item.heading}
                        price={item.price}
                        oldPrice={item.oldPrice}
                        discount={item.discount}
                        ratingAvg={item.ratingAvg}
                        ratingCount={item.ratingCount}
                        categoryName={item.categoryName}
                        isHotDeal={item.isHotDeal}
                      />
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      aria-label="Previous page"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === pageNum
                                ? "bg-[#273e8e] text-white"
                                : "border border-gray-300 hover:bg-gray-50 text-gray-700"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      aria-label="Next page"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}

                {/* Results Info */}
                {totalItems > 0 && (
                  <div className="text-center text-sm text-gray-500 mt-4">
                    Showing {startIndex + 1} - {Math.min(endIndex, totalItems)} of {totalItems} products
                  </div>
                )}
              </>
            ) : isFiltering ? (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-500 mb-4">
                    We couldn't find any products matching your search criteria. Try adjusting your filters or search terms.
                  </p>
                  <button
                    onClick={() => {
                      // Reset filters by re-rendering SearchBar
                      setSearchBarKey(prev => prev + 1);
                      setIsFiltering(false);
                      setFilteredResults(apiProducts);
                      setSelectedSize(null);
                      setPriceRange({ min: null, max: null });
                      setCurrentPage(1);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#273e8e] hover:bg-[#1e327a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#273e8e]"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products available</h3>
                  <p className="text-gray-500">
                    There are currently no products in our catalog. Please check back later.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="flex sm:hidden w-full min-h-screen bg-gray-100">
        <div className="flex-1 flex flex-col overflow-y-auto pb-20">
          {/* Top banner */}
          <div className="bg-[#273e8e] pt-8 rounded-b-2xl px-5 pb-5">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-white text-[20px] font-semibold">
                  Solar Store
                </h1>
                <p className="text-white/90 text-[12px]">
                  Shop the latest solar products
                </p>
              </div>
              <Link
                to="/cart"
                className="h-10 w-10 flex justify-center items-center rounded-lg bg-[#1D3073] border border-white/10"
                aria-label="Cart"
              >
                <ShoppingCart color="white" size={18} />
              </Link>
            </div>

            {/* Search */}
            <div className="mt-4">
              <SearchBar 
                key={searchBarKey}
                categories={categories} 
                products={apiProducts} 
                onFilteringChange={handleFilteringChange}
              />
            </div>
          </div>

          {/* Categories */}
          <div className="px-5 pt-5">
            <HrLine text={"Categories"} />
          </div>
          <Items categories={categories} loading={catLoading} />

          {/* Products */}
          <div className="px-5 py-6 w-full">
            {/* Filters - relative z-[100] so dropdown panels paint above content below */}
            <div className="relative z-[100] flex justify-start items-center gap-2 mb-4 flex-wrap">
              <SizeDropDown onFilter={handleSizeFilter} />
              <PriceDropDown onFilter={handlePriceFilter} />
              {/* Show active filters count */}
              {(selectedSize !== null || (priceRange.min !== null && priceRange.max !== null)) && (
                <button
                  onClick={() => {
                    setSelectedSize(null);
                    setPriceRange({ min: null, max: null });
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 text-xs text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>

            <h1 className="text-[16px] font-semibold text-gray-800 mb-3">
              <HrLine text={"All Products"} />
            </h1>

            {prodError && (
              <p className="text-red-600 text-sm mb-3">{prodError}</p>
            )}
            
            {prodLoading ? (
              <div className="grid grid-cols-2 gap-4 max-sm:gap-5 max-sm:ml-[-10px] max-[320px]:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-full max-[380px]:w-[160px] min-sm:w-[190px] bg-white border border-gray-200 rounded-[24px] p-3 shadow-sm flex flex-col animate-pulse"
                  >
                    <div className="bg-gray-200 h-[140px] rounded-2xl mb-2" />
                    <div className="h-3 bg-gray-200 rounded mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-2 bg-gray-200 rounded w-1/2 mt-2" />
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div className="h-7 bg-gray-200 rounded-full" />
                      <div className="h-7 bg-gray-200 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : gridProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-4 max-sm:gap-5 max-sm:ml-[-10px] max-[320px]:grid-cols-2">
                  {paginatedProducts.map((item) => (
                    <Link
                      key={item.id}
                      to={`/homePage/product/${item.id}`}
                      className="w-full  max-[380px]:w-[160px] min-sm:w-[190px]  "
                    >
                      <Product
                        id={item.id}
                        image={item.image}
                        heading={item.heading}
                        price={item.price}
                        oldPrice={item.oldPrice}
                        discount={item.discount}
                        ratingAvg={item.ratingAvg}
                        ratingCount={item.ratingCount}
                        categoryName={item.categoryName}
                        isHotDeal={item.isHotDeal}
                      />
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      aria-label="Previous page"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === pageNum
                                ? "bg-[#273e8e] text-white"
                                : "border border-gray-300 hover:bg-gray-50 text-gray-700"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      aria-label="Next page"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}

                {/* Results Info */}
                {totalItems > 0 && (
                  <div className="text-center text-sm text-gray-500 mt-3">
                    Showing {startIndex + 1} - {Math.min(endIndex, totalItems)} of {totalItems} products
                  </div>
                )}
              </>
            ) : isFiltering ? (
              <div className="text-center py-8">
                <div className="max-w-sm mx-auto px-4">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-medium text-gray-900 mb-2">No products found</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    We couldn't find any products matching your search criteria.
                  </p>
                  <button
                    onClick={() => {
                      // Reset filters by re-rendering SearchBar
                      setSearchBarKey(prev => prev + 1);
                      setIsFiltering(false);
                      setFilteredResults(apiProducts);
                      setSelectedSize(null);
                      setPriceRange({ min: null, max: null });
                      setCurrentPage(1);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#273e8e] hover:bg-[#1e327a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#273e8e]"
                  >
                    Clear filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="max-w-sm mx-auto px-4">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="text-base font-medium text-gray-900 mb-2">No products available</h3>
                  <p className="text-sm text-gray-500">
                    There are currently no products in our catalog.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom nav (mobile sidebar) */}
        <SideBar />
      </div>
    </>
  );
};

export default HomePage;
