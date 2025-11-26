import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import SearchBar from "../Component/SearchBar";
import Items from "../Component/Items";
import Product from "../Component/Product";
import { Link, useNavigate } from "react-router-dom";
import { ContextApi } from "../Context/AppContext";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import API from "../config/api.config";
import { assets } from "../assets/data";

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

// Map API product -> card props
const mapApiProductToCard = (p) => {
    const image =
        p?.featured_image_url ||
        p?.featured_image ||
        p?.images?.[0]?.image ||
        assets?.placeholderProduct ||
        "/placeholder-product.png";

    const heading = p?.title || p?.name || `Product #${p?.id ?? ""}`;

    const priceRaw = Number(p?.price ?? 0);
    const discountRaw = p?.discount_price != null ? Number(p.discount_price) : null;

    let isDiscountActive = false;
    let effectivePrice = priceRaw;
    let oldPrice = "";
    let discount = "";

    if (discountRaw != null && discountRaw < priceRaw) {
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

    const price = formatNGN(effectivePrice);
    const reviews = Array.isArray(p?.reviews) ? p.reviews : [];
    const ratingAvg =
        reviews.length > 0
            ? reviews.reduce((s, r) => s + Number(r?.rating ?? 0), 0) / reviews.length
            : 0;

    return {
        id: p?.id,
        image,
        heading,
        price,
        oldPrice,
        discount,
        ratingAvg,
        ratingCount: reviews.length,
        categoryId: p?.category_id,
        stock: p?.stock,
        isHotDeal: !!p?.top_deal,
    };
};

const SolarShop = () => {
    const navigate = useNavigate();
    const { registerProducts, filteredResults, setFilteredResults } = useContext(ContextApi);

    const [categories, setCategories] = useState([]);
    const [catLoading, setCatLoading] = useState(false);
    const [catError, setCatError] = useState("");

    const [apiProducts, setApiProducts] = useState([]);
    const [prodLoading, setProdLoading] = useState(false);
    const [prodError, setProdError] = useState("");
    const [isFiltering, setIsFiltering] = useState(false);
    const [searchBarKey, setSearchBarKey] = useState(0);

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
                if (err.response && err.response.status === 401) {
                    navigate('/login');
                    return;
                }
                setCatError("Failed to load categories.");
            } finally {
                setCatLoading(false);
            }
        };
        fetchCategories();
    }, [navigate]);

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
                setFilteredResults(mappedProducts);
                setIsFiltering(false);
                registerProducts?.(list);
            } catch (err) {
                if (err.response && err.response.status === 401) {
                    navigate('/login');
                    return;
                }
                setProdError("Failed to load products.");
            } finally {
                setProdLoading(false);
            }
        };
        fetchProducts();
    }, [registerProducts, setFilteredResults, navigate]);

    // Category Map
    const catMap = useMemo(() => {
        const map = {};
        for (const c of categories || []) {
            const name = c?.name || c?.title || c?.category_name || "";
            if (c?.id) map[c.id] = name || "";
        }
        return map;
    }, [categories]);

    // Grid Products
    const gridProducts = useMemo(() => {
        const sourceProducts = isFiltering ? filteredResults : apiProducts || [];
        return sourceProducts.map((p) => ({
            ...p,
            categoryName: catMap[p.categoryId] || "Solar Product",
        }));
    }, [filteredResults, apiProducts, catMap, isFiltering]);

    // Most Popular (Mock logic: take first 4 items)
    const mostPopular = useMemo(() => {
        return apiProducts.slice(0, 4).map((p) => ({
            ...p,
            categoryName: catMap[p.categoryId] || "Solar Product",
        }));
    }, [apiProducts, catMap]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <div className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            <button onClick={() => navigate('/')} className="mr-4 text-gray-500 hover:text-[#273e8e]">
                                <ArrowLeft size={24} />
                            </button>
                            <div className="font-bold text-2xl text-[#273e8e]">TrooSolar Shop</div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-[#273e8e]">
                                <ShoppingCart size={24} />
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                                    0
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero / Search Section */}
            <div className="bg-[#273e8e] py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-white mb-4">Find Your Energy Solution</h1>
                    <p className="text-blue-100 mb-8 max-w-2xl">
                        Browse our wide range of solar panels, inverters, and batteries. High quality, affordable prices, and expert support.
                    </p>
                    <SearchBar
                        key={searchBarKey}
                        categories={categories}
                        products={apiProducts}
                        onFilteringChange={setIsFiltering}
                    />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Categories */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Shop by Category</h2>
                    <Items categories={categories} loading={catLoading} />
                </div>

                {/* Most Popular (Only show if not filtering) */}
                {!isFiltering && mostPopular.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Most Popular</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {mostPopular.map((item) => (
                                <Link key={item.id} to={`/homePage/product/${item.id}`}>
                                    <Product {...item} />
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* All Products */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                        {isFiltering ? "Search Results" : "All Products"}
                    </h2>

                    {prodLoading && <p>Loading products...</p>}
                    {prodError && <p className="text-red-600">{prodError}</p>}

                    {gridProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {gridProducts.map((item) => (
                                <Link key={item.id} to={`/homePage/product/${item.id}`}>
                                    <Product {...item} />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                            <p className="text-gray-500">No products found matching your criteria.</p>
                            <button
                                onClick={() => {
                                    setSearchBarKey(prev => prev + 1);
                                    setIsFiltering(false);
                                    setFilteredResults(apiProducts);
                                }}
                                className="mt-4 text-[#273e8e] font-bold hover:underline"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SolarShop;
