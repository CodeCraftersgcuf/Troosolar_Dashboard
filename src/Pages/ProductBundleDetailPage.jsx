import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";

import SideBar from "../Component/SideBar";
import TopNavbar from "../Component/TopNavbar";
import { assets } from "../assets/data";
import API, { BASE_URL } from "../config/api.config";
import { ChevronLeft, ShoppingCart } from "lucide-react"; // ← chevron back
import Loading from "../Component/Loading";

// Turn BASE_URL (http://localhost:8000/api) into origin (http://localhost:8000)
const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, "");

// Fallback image URL
const FALLBACK_IMAGE = "https://troosolar.hmstech.org/storage/products/d5c7f116-57ed-46ef-a659-337c94c308a9.png";

// currency helpers
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

// make image path absolute
const toAbsolute = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/")) return `${API_ORIGIN}${path}`;
  const cleaned = path.replace(/^public\//, "");
  return `${API_ORIGIN}/storage/${cleaned}`;
};

// robustly read bundle from API: { data: bundle } or { data: { data: bundle } } or plain bundle
const extractObject = (payload) => payload?.data?.data ?? payload?.data ?? payload ?? null;

// Map API bundle -> props
const mapBundleDetail = (b) => {
  if (!b) return null;

  const id = b.id;
  const title = b.title || `Bundle #${id}`;
  const label = b.bundle_type || "";
  const image = (b.featured_image && toAbsolute(b.featured_image)) || (b.featured_image_url && toAbsolute(b.featured_image_url)) || null;

  const total = toNumber(b.total_price);
  const discount = toNumber(b.discount_price);
  const showDiscount = discount > 0 && discount < total;

  const price = formatNGN(showDiscount ? discount : total);
  const oldPrice = showDiscount ? formatNGN(total) : "";
  const pct = showDiscount ? Math.round((1 - discount / total) * 100) : 0;
  const discountBadge = showDiscount ? `-${pct}%` : "";

  const relItems = b.bundleItems ?? b.bundle_items ?? [];
  const relServices = b.customServices ?? b.custom_services ?? [];
  const relMaterials = b.materials ?? b.bundle_materials ?? [];

  const itemsIncluded = [
    // Products from bundle_items
    ...relItems
      .map((bi) => {
        const p = bi?.product;
        if (!p) return null;
        const productImage = p?.featured_image || p?.featured_image_url;
        return {
          icon: productImage
            ? toAbsolute(productImage)
            : FALLBACK_IMAGE,
          title: p?.title || p?.name || `Product #${p?.id ?? ""}`,
          price: toNumber(p?.price),
          quantity: bi?.quantity ?? 1,
        };
      })
      .filter(Boolean),
    // Materials from API materials array: { id, name, quantity, unit, rate, selling_rate, category }
    ...relMaterials.map((m) => {
      const material = m?.material || m;
      const materialImage = material?.featured_image || material?.featured_image_url || material?.image || null;
      const materialPrice = toNumber(material?.selling_rate || material?.rate || material?.price || 0);
      const displayPrice = materialPrice === 0 ? 1000 : materialPrice;
      return {
        icon: materialImage ? toAbsolute(materialImage) : FALLBACK_IMAGE,
        title: material?.name || m?.name || `Material #${material?.id ?? m?.id ?? ""}`,
        price: displayPrice,
        quantity: m?.quantity ?? material?.quantity ?? 1,
        unit: material?.unit || m?.unit || "",
      };
    }),
    // Custom services
    ...relServices.map((s) => ({
      icon: FALLBACK_IMAGE,
      title: s?.title || "Custom service",
      price: toNumber(s?.service_amount),
      quantity: s?.quantity ?? 1,
    })),
  ];

  // Extract appliances from API response
  // Check multiple possible field names: appliances, load_calculator_appliances, appliances_from_load_calculator
  const appliancesData = b.appliances ?? 
                        b.load_calculator_appliances ?? 
                        b.appliances_from_load_calculator ?? 
                        b.loadCalculatorAppliances ??
                        b.load_calculator?.appliances ??
                        b.calculator_appliances ??
                        [];

  // Map appliances to the expected format
  const appliances = Array.isArray(appliancesData) && appliancesData.length > 0
    ? appliancesData.map((app) => ({
        name: app?.name || app?.appliance_name || app?.title || app?.appliance?.name || "Unknown Appliance",
        power: app?.power || app?.wattage || app?.watts || app?.power_watts || app?.appliance?.power || 0,
        image: app?.image || app?.icon || app?.appliance?.image || FALLBACK_IMAGE,
      }))
    : [];

  const totalLoad = b.total_load ?? "";
  const inverterRating = b.inver_rating ?? "";
  const totalOutput = b.total_output ?? "";

  // API: detailed_description, description, desc – prefer detailed_description for display
  const description = (b.detailed_description && String(b.detailed_description).trim())
    ? b.detailed_description
    : (b.description && String(b.description).trim())
      ? b.description
      : (b.desc && String(b.desc).trim())
        ? b.desc
        : "";

  // API fields: backup_time_description, what_is_inside_bundle_text, what_bundle_powers_text, system_capacity_display, product_model, fees
  const backupInfo = (b.backup_time_description && String(b.backup_time_description).trim()) || b.backup_info || "";
  const whatIsInsideBundle = (b.what_is_inside_bundle_text && String(b.what_is_inside_bundle_text).trim()) || "";
  const whatBundlePowers = (b.what_bundle_powers_text && String(b.what_bundle_powers_text).trim()) || "";
  const systemCapacityDisplay = (b.system_capacity_display && String(b.system_capacity_display).trim()) || "";
  const productModel = (b.product_model && String(b.product_model).trim()) || "";
  const fees = b.fees && typeof b.fees === "object"
    ? {
        installation_fee: toNumber(b.fees.installation_fee),
        delivery_fee: toNumber(b.fees.delivery_fee),
        inspection_fee: toNumber(b.fees.inspection_fee),
      }
    : { installation_fee: 0, delivery_fee: 0, inspection_fee: 0 };

  return {
    id,
    label,
    bundleTitle: title,
    backupInfo,
    description,
    whatIsInsideBundle,
    whatBundlePowers,
    systemCapacityDisplay,
    productModel,
    fees,
    price,
    oldPrice,
    discount: discountBadge,
    heroImage: image,
    totalLoad,
    inverterRating,
    totalOutput,
    itemsIncluded,
    appliances,
  };
};

// Default appliances (fallback if API doesn't provide)
const defaultAppliances = [
  { name: "Ceiling Fan", power: 70 },
  { name: "Laptop", power: 70 },
  { name: "LED Bulbs", power: 70 },
  { name: "Fridge", power: 70 },
  { name: "Washing Machine", power: 70 },
  { name: "Rech Fan", power: 70 },
  { name: "OX Fan", power: 70 },
  { name: '65" TV', power: 70 },
  { name: "CCTV Camera", power: 70 },
  { name: "Desktop", power: 70 },
];

const ProductBundle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const flowType = searchParams.get("flow"); // 'buy_now' or 'bnpl'
  const cartToken = searchParams.get("token");

  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [bundleDetailTab, setBundleDetailTab] = useState("description"); // 'description' | 'specs'

  // Try to get appliances from localStorage or URL params (if coming from load calculator)
  const getAppliancesFromStorage = (bundleId) => {
    try {
      // Try bundle-specific key first
      const bundleKey = `bundle_${bundleId}_appliances`;
      const bundleStored = localStorage.getItem(bundleKey);
      if (bundleStored) {
        const parsed = JSON.parse(bundleStored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      
      // Try general load calculator appliances
      const stored = localStorage.getItem('loadCalculatorAppliances');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      
      // Try from URL query parameters
      const appliancesParam = searchParams.get('appliances');
      if (appliancesParam) {
        try {
          const decoded = JSON.parse(decodeURIComponent(appliancesParam));
          if (Array.isArray(decoded) && decoded.length > 0) return decoded;
        } catch (e) {
          // Ignore parse errors
        }
      }
    } catch (e) {
      // Ignore errors
    }
    return null;
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const token = localStorage.getItem("access_token");
        // Try bundle details endpoint first (has more info including appliances)
        let bundleData = null;
        try {
          const { data: detailsData } = await axios.get(API.BUNDLE_DETAILS(id), {
            headers: {
              Accept: "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
          bundleData = extractObject(detailsData);
        } catch (detailsError) {
          // Fallback to basic bundle endpoint if details endpoint fails
          console.warn("Bundle details endpoint failed, using basic endpoint:", detailsError);
          const { data } = await axios.get(API.BUNDLE_BY_ID(id), {
            headers: {
              Accept: "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
          bundleData = extractObject(data);
        }
        
        const mapped = mapBundleDetail(bundleData);
        
        // If no appliances from API, try to get from localStorage or URL params
        if (mounted) {
          if (!mapped.appliances || mapped.appliances.length === 0) {
            const storedAppliances = getAppliancesFromStorage(id);
            if (storedAppliances && storedAppliances.length > 0) {
              mapped.appliances = storedAppliances.map((app) => ({
                name: app?.name || app?.appliance_name || app?.title || app?.appliance?.name || "Unknown Appliance",
                power: app?.power || app?.wattage || app?.watts || app?.power_watts || app?.appliance?.power || 0,
                image: app?.image || app?.icon || app?.appliance?.image || FALLBACK_IMAGE,
              }));
            }
          }
          setProductData(mapped);
        }
      } catch (e) {
        if (mounted) {
          setErr(
            e?.response?.data?.message || e?.message || "Failed to load bundle."
          );
          setProductData(null);
        }
      } finally {
        mounted && setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleBuyNowPayLater = async () => {
    const token = localStorage.getItem("access_token");
    
    try {
      // Add bundle to cart
      await axios.post(
        API.CART,
        { itemable_type: "bundle", itemable_id: Number(id), quantity: 1 },
        {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      
      // Navigate to BNPL flow, continuing from after bundle selection (step 6.5 - Order Summary)
      const returnUrl = cartToken
        ? `/bnpl?token=${cartToken}&bundleId=${id}&step=6.5&fromBundle=true`
        : `/bnpl?bundleId=${id}&step=6.5&fromBundle=true`;
      navigate(returnUrl);
    } catch (e) {
      if (e?.response?.status === 409) {
        // Item already in cart, proceed to BNPL flow
        const returnUrl = cartToken
          ? `/bnpl?token=${cartToken}&bundleId=${id}&step=6.5&fromBundle=true`
          : `/bnpl?bundleId=${id}&step=6.5&fromBundle=true`;
        navigate(returnUrl);
        return;
      }
      if (e?.response?.status === 401) {
        return alert("Please log in to continue.");
      }
      alert(
        e?.response?.data?.message || e?.message || "Failed to add to cart."
      );
    }
  };

  const handleBuyNow = async () => {
    const token = localStorage.getItem("access_token");
    
    try {
      // Add bundle to cart
      await axios.post(
        API.CART,
        { itemable_type: "bundle", itemable_id: Number(id), quantity: 1 },
        {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      
      // Navigate to Buy Now flow, continuing from after bundle selection (step 7 - Order Summary)
      const returnUrl = cartToken
        ? `/buy-now?token=${cartToken}&bundleId=${id}&step=7&fromBundle=true`
        : `/buy-now?bundleId=${id}&step=7&fromBundle=true`;
      navigate(returnUrl);
    } catch (e) {
      if (e?.response?.status === 409) {
        // Item already in cart, proceed to Buy Now flow
        const returnUrl = cartToken
          ? `/buy-now?token=${cartToken}&bundleId=${id}&step=7&fromBundle=true`
          : `/buy-now?bundleId=${id}&step=7&fromBundle=true`;
        navigate(returnUrl);
        return;
      }
      if (e?.response?.status === 401) {
        return alert("Please log in to continue.");
      }
      alert(
        e?.response?.data?.message || e?.message || "Failed to add to cart."
      );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full relative bg-[#F5F7FF]">
        <SideBar />
        <div className="w-full sm:w-[calc(100%-250px)]">
          <div className="sm:block hidden">
            <TopNavbar />
          </div>
          <div className="flex items-center justify-center min-h-screen">
            <Loading fullScreen={false} message="Loading bundle details..." progress={null} />
          </div>
        </div>
      </div>
    );
  }
  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!productData) return <div className="p-6">Not found.</div>;

  return (
    <div className="flex min-h-screen w-full relative bg-[#F5F7FF]">
      {/* DESKTOP */}
      <SideBar />
      <div className="w-full sm:w-[calc(100%-250px)]">
        <div className="sm:block hidden">
          <TopNavbar />
        </div>

        {/* ↓ smaller padding on mobile */}
        <div className="p-3 sm:p-5">
          <div className="bg-[#F6F8FF] min-h-screen rounded-lg p-3 sm:p-6">
            {/* Desktop Title + Back */}
            <div className="hidden sm:block">
              <h1 className="text-2xl font-semibold mb-2">
                Recommended Bundle
              </h1>
              <Link
                to="/solar-bundles"
                className="text-blue-500 underline mb-3 block"
              >
                Back
              </Link>
            </div>

            {/* Desktop two-column layout - aligned with BNPL/Buy Now flow */}
            <div className="hidden sm:flex justify-between items-start gap-6">
              {/* Left column */}
              <div className="min-w-[66%]">
                <div className="bg-white w-full border border-gray-200 rounded-xl mt-3 shadow-sm overflow-hidden">
                  {/* Image */}
                  <div className="relative h-[350px] bg-[#F8FAFC] m-3 rounded-lg flex justify-center items-center overflow-hidden">
                    {/* {productData.label && (
                      <div className="absolute top-4 right-4 bg-[#800080] text-white text-xs px-3 py-1 rounded-full shadow">
                        {productData.label}
                      </div>
                    )} */}
                    {productData.heroImage ? (
                      <img
                        src={productData.heroImage}
                        alt="Bundle"
                        className="max-h-[80%] object-contain"
                      />
                    ) : (
                      <>
                        <img
                          className="w-[160px] h-[160px]"
                          src={assets.inverter}
                          alt="Inverter"
                        />
                        <img
                          src={assets.solar}
                          className="w-[171px] h-[171px] absolute right-40 bottom-24"
                          alt="Solar"
                        />
                      </>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h2 className="text-xl font-semibold">
                      {productData.bundleTitle}
                    </h2>
                    {productData.label && (
                      <p className="text-sm text-gray-500 pt-1">
                        {productData.label}
                      </p>
                    )}
                    {productData.backupInfo && (
                      <p className="text-sm text-gray-500 pt-1">
                        {productData.backupInfo}
                      </p>
                    )}

                    <hr className="my-3 text-gray-300" />

                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Bundle Price</span>
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col items-start">
                          <p className="text-xl font-bold text-[#273E8E]">
                            {productData.price}
                          </p>
                          <div className="flex gap-2 mt-0.5">
                            {productData.oldPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                {productData.oldPrice}
                              </span>
                            )}
                            {productData.discount && (
                              <span className="text-xs px-2 py-[2px] bg-[#FFA500]/20 text-[#FFA500] rounded-full">
                                {productData.discount}
                              </span>
                            )}
                          </div>
                        </div>
                        <img
                          src={assets.stars}
                          alt="Rating"
                          className="w-20 h-auto"
                        />
                      </div>
                    </div>
                  </div>

                  <hr className="my-2 text-gray-300" />

                  {/* Tabs: Description | Specifications - same as BNPL/Buy Now flow */}
                  <div className="p-4">
                    <div className="flex border-b border-gray-200 mb-4">
                      <button
                        type="button"
                        onClick={() => setBundleDetailTab("description")}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${bundleDetailTab === "description" ? "border-[#273E8E] text-[#273E8E]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                      >
                        Description
                      </button>
                      <button
                        type="button"
                        onClick={() => setBundleDetailTab("specs")}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${bundleDetailTab === "specs" ? "border-[#273E8E] text-[#273E8E]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                      >
                        Specifications
                      </button>
                    </div>

                    {bundleDetailTab === "description" && (
                      <div className="min-h-[80px] space-y-4">
                        {productData.description && String(productData.description).trim() ? (
                          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {productData.description}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400 italic">No description available.</p>
                        )}
                        {productData.backupInfo && (
                          <>
                            <h4 className="text-sm font-semibold text-gray-800 mt-3">Backup time</h4>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">{productData.backupInfo}</p>
                          </>
                        )}
                        {productData.systemCapacityDisplay && (
                          <>
                            <h4 className="text-sm font-semibold text-gray-800 mt-3">System capacity</h4>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">{productData.systemCapacityDisplay}</p>
                          </>
                        )}
                        {productData.whatIsInsideBundle && (
                          <>
                            <h4 className="text-sm font-semibold text-gray-800 mt-3">What&apos;s inside this bundle</h4>
                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{productData.whatIsInsideBundle}</p>
                          </>
                        )}
                        {productData.whatBundlePowers && (
                          <>
                            <h4 className="text-sm font-semibold text-gray-800 mt-3">What this bundle powers</h4>
                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{productData.whatBundlePowers}</p>
                          </>
                        )}
                        {productData.productModel && (
                          <>
                            <h4 className="text-sm font-semibold text-gray-800 mt-3">Product model</h4>
                            <p className="text-sm text-gray-600">{productData.productModel}</p>
                          </>
                        )}
                      </div>
                    )}

                    {bundleDetailTab === "specs" && (
                      <div className="overflow-x-auto">
                        {(productData.itemsIncluded || []).length > 0 ? (
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-2 pr-4 text-gray-500 font-medium w-10">#</th>
                                <th className="text-left py-2 pr-4 text-gray-700 font-medium">Item</th>
                                <th className="text-right py-2 pr-4 text-gray-500 font-medium w-16">Qty</th>
                                <th className="text-left py-2 text-gray-500 font-medium w-16">Unit</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(productData.itemsIncluded || []).map((item, index) => (
                                <tr key={index} className="border-b border-gray-100">
                                  <td className="py-2.5 pr-4 text-gray-500">{index + 1}</td>
                                  <td className="py-2.5 pr-4 text-[#273E8E] font-medium">{item.title}</td>
                                  <td className="py-2.5 pr-4 text-right text-gray-600">{item.quantity ?? 1}</td>
                                  <td className="py-2.5 text-gray-600">{item.unit || "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p className="text-sm text-gray-500 py-4">No items attached to this bundle.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 mt-6 px-2">
                  <div className="flex gap-3">
                    <button
                      onClick={handleBuyNowPayLater}
                      className="flex-1 text-sm bg-[#E8A91D] text-white py-4 rounded-full hover:bg-[#d4991a] transition-colors"
                    >
                      Buy Now Pay Later
                    </button>
                    <button
                      onClick={handleBuyNow}
                      className="flex-1 text-sm bg-[#273E8E] text-white py-4 rounded-full hover:bg-[#1a2b6b] transition-colors"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Right column (stats) - aligned with BNPL/Buy Now flow */}
              <div className="w-[34%]">
                <div className="flex flex-col gap-3 rounded-2xl">
                  <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden">
                    <div className="bg-[#273E8E] text-white px-3 py-2.5 flex flex-col justify-between rounded-xl min-h-0">
                      <div className="text-xs text-left font-medium">Total Load</div>
                      <div className="bg-white text-[#273E8E] font-semibold rounded-lg flex justify-center items-center min-h-[52px] mt-1 px-1 py-1">
                        <span className="text-sm text-center break-words leading-tight">{productData.totalLoad || "—"}</span>
                      </div>
                    </div>

                    <div className="bg-[#273E8E] text-white px-3 py-2.5 flex flex-col justify-between rounded-xl min-h-0">
                      <div className="text-xs text-left font-medium">Inverter Rating</div>
                      <div className="bg-white text-[#273E8E] font-semibold rounded-lg flex justify-center items-center min-h-[52px] mt-1 px-1 py-1">
                        <span className="text-sm text-center break-words leading-tight">{productData.inverterRating || "—"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#273E8E] text-white px-4 py-3 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 min-h-0">
                    <div className="text-sm font-bold shrink-0">Total Output</div>
                    <div className="bg-white text-[#273E8E] font-semibold rounded-lg flex justify-center items-center min-h-[52px] px-2 py-1 flex-1 min-w-0">
                      <span className="text-sm text-center break-words leading-tight">{productData.totalOutput || "—"}</span>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                    <h3 className="text-base font-semibold text-gray-800 mb-4">Order Summary</h3>
                    
                    {/* Bundle Details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Items</span>
                        <span className="font-medium">1</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Bundle Price</span>
                        <span className="font-medium">{productData.price}</span>
                      </div>
                      {productData.fees && (productData.fees.installation_fee > 0 || productData.fees.delivery_fee > 0 || productData.fees.inspection_fee > 0) && (
                        <>
                          {productData.fees.installation_fee > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Installation</span>
                              <span className="font-medium">{formatNGN(productData.fees.installation_fee)}</span>
                            </div>
                          )}
                          {productData.fees.delivery_fee > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Delivery</span>
                              <span className="font-medium">{formatNGN(productData.fees.delivery_fee)}</span>
                            </div>
                          )}
                          {productData.fees.inspection_fee > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Inspection</span>
                              <span className="font-medium">{formatNGN(productData.fees.inspection_fee)}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <hr className="my-4 border-gray-200" />

                    {/* Backup Time */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">Backup Time</h4>
                      <p className="text-xs text-gray-600 whitespace-pre-wrap">
                        {productData.backupInfo || "Depending on usage and load."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MOBILE */}
            <div className="sm:hidden">
              {/* Top bar — less vertical space */}
              <div className="px-3 pt-2 pb-2 flex items-center justify-between">
                {/* <button
                  onClick={() => navigate(-1)}
                  aria-label="Back"
                  className="h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm"
                >
                  <ChevronLeft size={20} /> 
                </button> */}
                <p className="text-[12px] font-medium text-[#0F172A]">
                  Recommended bundles
                </p>
                <Link
                  to="/cart"
                  aria-label="Cart"
                  className="h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm"
                >
                  <ShoppingCart size={20} />
                </Link>
              </div>

              {/* Bundle card - aligned with BNPL/Buy Now flow */}
              <div className="mx-3 mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                {/* Image area */}
                <div className="relative h-[200px] rounded-xl bg-[#F8FAFC] flex items-center justify-center overflow-hidden">
                  {/* {productData.label && (
                    <div className="absolute top-3 right-3 bg-[#800080] text-white text-[11px] px-3 py-[6px] rounded-full shadow">
                      {productData.label}
                    </div>
                  )} */}
                  {productData.heroImage ? (
                    <img
                      src={productData.heroImage}
                      alt="Bundle"
                      className="max-h-[80%] object-contain"
                    />
                  ) : (
                    <>
                      <img
                        src={assets.inverter}
                        alt="Inverter"
                        className="w-[140px] h-[140px]"
                      />
                      <img
                        src={assets.solar}
                        alt="Solar"
                        className="w-[150px] h-[150px] absolute right-10 bottom-6"
                      />
                    </>
                  )}
                </div>

                {/* Title + price block - aligned with BNPL/Buy Now flow */}
                <div className="pt-3">
                  <h2 className="text-[12px] lg:text-[16px] font-semibold text-[#0F172A]">
                    {productData.bundleTitle}
                  </h2>
                  {productData.label && (
                    <p className="text-[12px] text-gray-500 mt-[2px]">{productData.label}</p>
                  )}
                  {productData.backupInfo && (
                    <p className="text-[12px] text-gray-500 mt-[2px]">
                      {productData.backupInfo}
                    </p>
                  )}

                  <div className="mt-3 flex flex-col gap-0.5">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wide">Bundle Price</span>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-[12px] lg:text-[18px] font-bold text-[#273E8E] leading-5">
                          {productData.price}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          {productData.oldPrice && (
                            <span className="text-[10px] lg:text-[12px] text-gray-400 line-through">
                              {productData.oldPrice}
                            </span>
                          )}
                          {productData.discount && (
                            <span className="px-2 py-[2px] rounded-full text-[11px] text-orange-600 bg-orange-100">
                              {productData.discount}
                            </span>
                          )}
                        </div>
                      </div>
                      <img src={assets.stars} alt="Rating" className="w-[76px]" />
                    </div>
                  </div>
                </div>

                {/* Tabs: Description | Specifications - Mobile (same as BNPL/Buy Now flow) */}
                <div className="mt-4">
                  <div className="flex border-b border-gray-200 mb-3">
                    <button
                      type="button"
                      onClick={() => setBundleDetailTab("description")}
                      className={`px-3 py-2 text-[12px] font-medium border-b-2 -mb-px transition-colors ${bundleDetailTab === "description" ? "border-[#273E8E] text-[#273E8E]" : "border-transparent text-gray-500"}`}
                    >
                      Description
                    </button>
                    <button
                      type="button"
                      onClick={() => setBundleDetailTab("specs")}
                      className={`px-3 py-2 text-[12px] font-medium border-b-2 -mb-px transition-colors ${bundleDetailTab === "specs" ? "border-[#273E8E] text-[#273E8E]" : "border-transparent text-gray-500"}`}
                    >
                      Specifications
                    </button>
                  </div>

                  {bundleDetailTab === "description" && (
                    <div className="min-h-[60px] space-y-3">
                      {productData.description && String(productData.description).trim() ? (
                        <p className="text-[11px] lg:text-[13px] text-gray-600 leading-relaxed whitespace-pre-wrap">
                          {productData.description}
                        </p>
                      ) : (
                        <p className="text-[11px] text-gray-400 italic">No description available.</p>
                      )}
                      {productData.backupInfo && (
                        <>
                          <h4 className="text-[11px] font-semibold text-gray-800 mt-2">Backup time</h4>
                          <p className="text-[11px] text-gray-600 whitespace-pre-wrap">{productData.backupInfo}</p>
                        </>
                      )}
                      {productData.systemCapacityDisplay && (
                        <>
                          <h4 className="text-[11px] font-semibold text-gray-800 mt-2">System capacity</h4>
                          <p className="text-[11px] text-gray-600 whitespace-pre-wrap">{productData.systemCapacityDisplay}</p>
                        </>
                      )}
                      {productData.whatIsInsideBundle && (
                        <>
                          <h4 className="text-[11px] font-semibold text-gray-800 mt-2">What&apos;s inside</h4>
                          <p className="text-[11px] text-gray-600 whitespace-pre-wrap">{productData.whatIsInsideBundle}</p>
                        </>
                      )}
                      {productData.whatBundlePowers && (
                        <>
                          <h4 className="text-[11px] font-semibold text-gray-800 mt-2">What it powers</h4>
                          <p className="text-[11px] text-gray-600 whitespace-pre-wrap">{productData.whatBundlePowers}</p>
                        </>
                      )}
                      {productData.productModel && (
                        <>
                          <h4 className="text-[11px] font-semibold text-gray-800 mt-2">Product model</h4>
                          <p className="text-[11px] text-gray-600">{productData.productModel}</p>
                        </>
                      )}
                    </div>
                  )}

                  {bundleDetailTab === "specs" && (
                    <div className="overflow-x-auto -mx-1">
                      {(productData.itemsIncluded || []).length > 0 ? (
                        <table className="w-full text-[11px] lg:text-[12px] border-collapse">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-2 pr-2 text-gray-500 font-medium w-8">#</th>
                              <th className="text-left py-2 pr-2 text-gray-700 font-medium">Item</th>
                              <th className="text-right py-2 pr-2 text-gray-500 font-medium w-10">Qty</th>
                              <th className="text-left py-2 text-gray-500 font-medium w-10">Unit</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(productData.itemsIncluded || []).map((item, idx) => (
                              <tr key={idx} className="border-b border-gray-100">
                                <td className="py-2 pr-2 text-gray-500">{idx + 1}</td>
                                <td className="py-2 pr-2 text-[#273E8E] font-medium">{item.title}</td>
                                <td className="py-2 pr-2 text-right text-gray-600">{item.quantity ?? 1}</td>
                                <td className="py-2 text-gray-600">{item.unit || "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="text-[11px] text-gray-500 py-3">No items attached to this bundle.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleBuyNowPayLater}
                      className="h-11 rounded-full bg-[#E8A91D] text-white text-[11px] lg:text-[14px] hover:bg-[#d4991a] transition-colors"
                    >
                      Buy Now Pay Later
                    </button>
                    <button
                      onClick={handleBuyNow}
                      className="h-11 rounded-full bg-[#273E8E] text-white text-[11px] lg:text-[14px] hover:bg-[#1a2b6b] transition-colors"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* /MOBILE */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductBundle;
