import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { assets } from "../assets/data";
import LoanWallet from "../Component/LoanWallet";
import SmallBoxes from "../Component/SmallBoxes";
import ShoppingWallet from "../Component/ShoppingWallet";
import SideBar from "../Component/SideBar";
import TopNavbar from "../Component/TopNavbar";
import { Bell } from "lucide-react";
import Product from "../Component/Product";
import { Link } from "react-router-dom";
import SolarBundleComponent from "../Component/SolarBundleComponent";
import HrLine from "../Component/MobileSectionResponsive/HrLine";
import API, { BASE_URL } from "../config/api.config";

/* ---------------- helpers ---------------- */

// origin from BASE_URL
const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, "");

// ₦ formatter
const formatNGN = (n) => {
  const num =
    typeof n === "number"
      ? n
      : Number(String(n ?? "").replace(/[^\d.]/g, "")) || 0;
  try {
    return `₦${new Intl.NumberFormat("en-NG").format(num)}`;
  } catch {
    return `₦${num}`;
  }
};

// convert storage paths to absolute URLs
const toAbsolute = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/")) return `${API_ORIGIN}${path}`;
  const cleaned = path.replace(/^public\//, "");
  return `${API_ORIGIN}/storage/${cleaned}`;
};

// map API product -> Product card props
const mapApiProductToCard = (p) => {
  const image =
    toAbsolute(p?.featured_image_url || p?.featured_image) ||
    toAbsolute(p?.images?.[0]?.image) ||
    assets?.placeholderProduct ||
    "/placeholder-product.png";

  const heading = p?.title || p?.name || `Product #${p?.id ?? ""}`;

  const priceRaw = Number(p?.price ?? 0);
  const discountRaw =
    p?.discount_price != null ? Number(p.discount_price) : null;

  let isDiscountActive = false;
  if (discountRaw != null && discountRaw < priceRaw) {
    isDiscountActive = p?.discount_end_date
      ? new Date(p.discount_end_date) > new Date()
      : true;
  }

  const effectiveRaw = isDiscountActive ? discountRaw : priceRaw;
  const oldRaw = isDiscountActive ? priceRaw : null;

  const price = formatNGN(effectiveRaw);
  const oldPrice = oldRaw != null ? formatNGN(oldRaw) : "";

  let discount = "";
  if (isDiscountActive && priceRaw > 0) {
    const pct = Math.round(((priceRaw - discountRaw) / priceRaw) * 100);
    discount = `-${pct}%`;
  }

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
    isHotDeal: !!p?.top_deal,
  };
};

// map API bundle -> card props (unchanged)
const mapBundle = (b) => {
  const image = b?.featured_image
    ? toAbsolute(b.featured_image)
    : assets?.placeholderProduct || "/placeholder-product.png";

  const title = b?.title || `Bundle #${b?.id ?? ""}`;
  const total = Number(b?.total_price ?? 0);
  const discount = Number(b?.discount_price ?? 0);
  const showDiscount = discount > 0 && discount < total;

  const price = formatNGN(showDiscount ? discount : total);
  const oldPrice = showDiscount ? formatNGN(total) : "";
  const pct = showDiscount ? Math.round((1 - discount / total) * 100) : 0;
  const badge = showDiscount ? `-${pct}%` : "";

  return {
    id: b?.id,
    image,
    heading: title,
    price,
    oldPrice,
    discount: badge,
    rating: assets?.fiveStars || assets?.rating || "",
    bundleTitle: b?.bundle_type || "",
    borderColor: "#273e8e",
  };
};

// read a stored user (unchanged)
const CANDIDATE_KEYS = [
  "user",
  "auth_user",
  "current_user",
  "profile",
  "logged_in_user",
  "loggedInUser",
];
const readStoredUser = () => {
  for (const k of CANDIDATE_KEYS) {
    try {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const obj = JSON.parse(raw);
      if (obj && typeof obj === "object") return obj;
    } catch {}
  }
  return null;
};
const getDisplayName = (u) =>
  (
    u?.full_name ||
    u?.name ||
    [u?.first_name, u?.last_name].filter(Boolean).join(" ") ||
    ""
  ).trim();
const getFirstName = (u) => {
  if (!u) return "";
  if (u.first_name) return String(u.first_name);
  const name = getDisplayName(u);
  return name.split(/\s+/)[0] || "";
};

const getAvatarUrl = (u) => {
  if (!u) return "";
  return (
    u.avatar ||
    u.profile_picture ||
    u.photo ||
    u.image_url ||
    u.avatar_url ||
    ""
  );
};

const getInitials = (name) => {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || "").join("") || "U";
};

/* ---------------- component ---------------- */

const Home = () => {
  const [showWallet, setShowWallet] = useState(true);
  const [user, setUser] = useState(null);

  // bundles
  const [bundles, setBundles] = useState([]);
  const [bundlesLoading, setBundlesLoading] = useState(false);
  const [bundlesErr, setBundlesErr] = useState("");

  // products (new)
  const [categories, setCategories] = useState([]);
  const [apiProducts, setApiProducts] = useState([]);
  const [prodLoading, setProdLoading] = useState(false);
  const [prodError, setProdError] = useState("");

  useEffect(() => {
    setUser(readStoredUser());
  }, []);

  // fetch bundles
  useEffect(() => {
    const fetchBundles = async () => {
      setBundlesLoading(true);
      setBundlesErr("");
      try {
        const token = localStorage.getItem("access_token");
        const { data } = await axios.get(API.BUNDLES, {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const root = data?.data ?? data;
        const arr = Array.isArray(root)
          ? root
          : Array.isArray(root?.data)
          ? root.data
          : [];
        setBundles(arr.map(mapBundle));
      } catch (e) {
        setBundlesErr(
          e?.response?.data?.message || e?.message || "Failed to load bundles."
        );
        setBundles([]);
      } finally {
        setBundlesLoading(false);
      }
    };
    fetchBundles();
  }, []);

  // fetch categories + products (same as HomePage)
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("access_token");
        const catRes = await axios.get(API.CATEGORIES, {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const catList = Array.isArray(catRes?.data?.data)
          ? catRes.data.data
          : [];
        setCategories(catList);
      } catch {}
    })();
  }, []);

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
        setApiProducts(list.map(mapApiProductToCard));
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
  }, []);

  const catMap = useMemo(() => {
    const map = {};
    for (const c of categories || []) {
      const name = c?.name || c?.title || c?.category_name || "";
      if (c?.id) map[c.id] = name || "";
    }
    return map;
  }, [categories]);

  const gridProducts = useMemo(
    () =>
      (apiProducts || []).map((p) => ({
        ...p,
        categoryName: catMap[p.categoryId] || "Inverter",
      })),
    [apiProducts, catMap]
  );

  const firstName = useMemo(() => getFirstName(user) || "there", [user]);
  const avatar = useMemo(() => getAvatarUrl(user), [user]);
  const initials = useMemo(() => getInitials(getDisplayName(user)), [user]);

  return (
    <div className="flex min-h-screen w-full">
      <SideBar />

      {/* Main Content */}
      <div className="flex-grow w-1/2">
        <div>
          {/* Topbar */}
          <div className="sm:block hidden">
            <TopNavbar />
          </div>

          <div className="bg-[#F5F7FF] p-5">
            {/* Greeting / bell */}
            <div className="flex justify-between items-center">
              <div className="flex justify-start gap-2 items-center">
                <div className="sm:hidden bg-[#e9e9e9] h-12 w-12 rounded-full overflow-hidden flex items-center justify-center">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={getDisplayName(user)}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <p className="text-[20px] text-[#909090] font-medium">
                      {initials}
                    </p>
                  )}
                </div>
                <div>
                  <h1 className="text-md lg:text-2xl">
                    Hi,{" "}
                    <span className="sm:text-[#273e8e] text-black">
                      {firstName}
                    </span>
                  </h1>
                  <p className="mt-1 text-xs lg:text-base">
                    Welcome to your dashboard
                  </p>
                </div>
              </div>

              <button className="rounded-lg sm:hidden flex justify-center items-center shadow-md lg:h-10 lg:w-10 h-8 w-8 bg-white">
                <Bell size={18} lg:size={24} />
              </button>
            </div>

            {/* Wallets / banner */}
            <div className="grid items-center md:grid-cols-2 grid-cols-1 xl:grid-cols-3 gap-5 mt-4">
              <div className="flex justify-start items-center sm:hidden gap-3 pt-2">
                <button
                  onClick={() => setShowWallet(!showWallet)}
                  className={`border text-[12px] w-[30%] border-[#273e8e] py-3 rounded-full ${
                    showWallet ? "text-white bg-[#273e8e]" : "text-black "
                  }`}
                >
                  Loan Wallet
                </button>
                <button
                  onClick={() => setShowWallet(!showWallet)}
                  className={`border text-[11px] w-[35%] border-[#273e8e] py-3 rounded-full ${
                    showWallet ? "text-black " : "text-white bg-[#273e8e]"
                  }`}
                >
                  Shopping Wallet
                </button>
              </div>

              <div className="block sm:hidden">
                {showWallet ? <LoanWallet /> : <ShoppingWallet />}
              </div>
              <div className="sm:block hidden">
                <LoanWallet />
              </div>
              <div className="sm:block hidden">
                <ShoppingWallet />
              </div>
              <img
                src={assets.sale}
                className="hidden lg:block min-w-full h-[243px] rounded-lg"
                alt="Sale banner"
              />
            </div>

            <div className="mt-4">
              <SmallBoxes />
            </div>
            <img src={assets.sale} className="sm:hidden block my-4" alt="" />

            {/* ---------- Solar Bundles (backend) ---------- */}
            <div className="mt-6">
              <h1 className="text-xl sm:block hidden font-[500]">
                Solar Bundles
              </h1>
              <p className="text-gray-500 pt-4 text-sm w-1/2 sm:block hidden sm:text-base">
                You can select from one of our custom bundles tailored towards
                various homes and uses, or you can build your custom builder
                from custom builder
              </p>
              <HrLine text={"Hottest Deals"} />
            </div>

            <div className="my-4 hidden sm:flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
              {bundlesErr && (
                <div className="text-red-600 text-sm">{bundlesErr}</div>
              )}
              {bundlesLoading && (
                <div className="text-gray-600 text-sm">Loading…</div>
              )}
              {!bundlesLoading &&
                !bundlesErr &&
                bundles.slice(0, 4).map((item) => (
                  <Link
                    to={`/productBundle/details/${item.id}`}
                    key={item.id}
                    className="flex-shrink-0"
                  >
                    <SolarBundleComponent
                      id={item.id}
                      image={item.image}
                      heading={item.heading}
                      price={item.price}
                      oldPrice={item.oldPrice}
                      discount={item.discount}
                      rating={item.rating}
                      borderColor={item.borderColor}
                      bundleTitle={item.bundleTitle}
                    />
                  </Link>
                ))}
              {!bundlesLoading && !bundlesErr && bundles.length === 0 && (
                <div className="text-gray-500 bg-white border rounded-xl p-4">
                  No bundles found.
                </div>
              )}
            </div>

            {/* ---------- Mobile products from API (new) ---------- */}
            <div className="my-4 sm:hidden">
              {/* <HrLine text={"All Products"} /> */}
              {prodError && (
                <p className="text-red-600 text-sm mt-3">{prodError}</p>
              )}
              {prodLoading && (
                <p className="text-gray-600 text-sm mt-3">Loading…</p>
              )}

              <div className="grid grid-cols-2 gap-4 max-sm:gap-5 max-sm:ml-[-10px] max-[320px]:grid-cols-2">
                {!prodLoading &&
                  !prodError &&
                  gridProducts.map((item) => (
                    <Link
                      to={`/homePage/product/${item.id}`}
                      key={item.id}
                      className="w-full max-[380px]:w-[160px] min-sm:w-[190px]" // keep card height consistent
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

              {!prodLoading && !prodError && gridProducts.length === 0 && (
                <div className="text-gray-500 bg-white border rounded-xl p-4 mt-3">
                  No products found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
