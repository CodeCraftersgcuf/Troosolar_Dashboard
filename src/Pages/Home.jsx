


import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { assets, products } from "../assets/data";
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

/* ---------------- helpers (same behavior as your SolarBundle page) ---------------- */

// turn BASE_URL (http://localhost:8000/api) into API origin (http://localhost:8000)
const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, "");

// format ₦ nicely
const formatNGN = (n) => {
  const num = typeof n === "number" ? n : Number(String(n ?? "").replace(/[^\d.]/g, "")) || 0;
  try {
    return `₦${new Intl.NumberFormat("en-NG").format(num)}`;
  } catch {
    return `₦${num}`;
  }
};

// convert storage paths to absolute URLs
const toAbsolute = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;             // already absolute
  if (path.startsWith("/")) return `${API_ORIGIN}${path}`; // "/storage/xyz.jpg"
  const cleaned = path.replace(/^public\//, "");
  return `${API_ORIGIN}/storage/${cleaned}`;
};

// map API bundle -> card props
const mapBundle = (b) => {
  const image =
    b?.featured_image
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

/* ---------------- pull user (same logic you used earlier) ---------------- */

const CANDIDATE_KEYS = ["user", "auth_user", "current_user", "profile", "logged_in_user", "loggedInUser"];

const readStoredUser = () => {
  for (const k of CANDIDATE_KEYS) {
    try {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const obj = JSON.parse(raw);
      if (obj && typeof obj === "object") return obj;
    } catch {/* ignore */}
  }
  return null;
};

const getDisplayName = (u) =>
  (u?.full_name || u?.name || [u?.first_name, u?.last_name].filter(Boolean).join(" ") || "").trim();

const getFirstName = (u) => {
  if (!u) return "";
  if (u.first_name) return String(u.first_name);
  const name = getDisplayName(u);
  return name.split(/\s+/)[0] || "";
};

/* ---------------------------------- component ---------------------------------- */

const Home = ({}) => {
  const [showWallet, setShowWallet] = useState(true);
  const [user, setUser] = useState(null);

  // bundles state
  const [bundles, setBundles] = useState([]);
  const [bundlesLoading, setBundlesLoading] = useState(false);
  const [bundlesErr, setBundlesErr] = useState("");

  useEffect(() => {
    setUser(readStoredUser());
  }, []);

  // fetch bundles from backend
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

        // support common Laravel shapes
        const root = data?.data ?? data;
        const arr = Array.isArray(root) ? root : Array.isArray(root?.data) ? root.data : [];
        setBundles(arr.map(mapBundle));
      } catch (e) {
        setBundlesErr(e?.response?.data?.message || e?.message || "Failed to load bundles.");
        setBundles([]);
      } finally {
        setBundlesLoading(false);
      }
    };
    fetchBundles();
  }, []);

  const firstName = useMemo(() => getFirstName(user) || "there", [user]);

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
            <div className=" flex justify-between items-center  ">
              <div className="flex justify-start gap-2 items-center">
                <img className=" sm:hidden block" src={assets.userImage} alt="" />
                <div>
                  <div>
                    <h1 className=" text-2xl">
                      Hi,{" "}
                      <span className="sm:text-[#273e8e] text-black">
                        {firstName}
                      </span>
                    </h1>
                    <p className="mt-1">Welcome to your dashboard</p>
                  </div>
                </div>
              </div>

              <button
                className={`rounded-lg sm:hidden  flex justify-center items-center shadow-md h-10 w-10  transition-colors bg-white`}
              >
                <Bell size={24} />
              </button>
            </div>

            <div className="grid items-center  md:grid-cols-2 grid-cols-1 xl:grid-cols-3 gap-5 mt-4">
              <div className="flex justify-start items-center sm:hidden gap-3 pt-2">
                <button
                  onClick={() => setShowWallet(!showWallet)}
                  className={`border text-sm w-[40%] border-[#273e8e] py-4 rounded-full text-[#273e8e] ${
                    showWallet ? "text-[#fff] bg-[#273e8e]" : "text-[#273e8e] bg-white"
                  }`}
                >
                  Loan Wallet
                </button>
                <button
                  onClick={() => setShowWallet(!showWallet)}
                  className={`border w-[40%] border-[#273e8e] py-4 rounded-full text-sm text-[#273e8e] ${
                    showWallet ? " text-[#273e8e] bg-white" : "text-[#fff] bg-[#273e8e]"
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
                className="hidden lg:block min-w-full min-h-full rounded-lg"
                alt="Sale banner"
              />
            </div>

            <div className="mt-4">
              <SmallBoxes />
            </div>
            <img src={assets.sale} className="sm:hidden block my-4" alt="" />

            {/* ---------- Solar Bundles (from backend) ---------- */}
            <div className="mt-6">
              <h1 className="text-xl sm:block hidden font-[500]">
                Solar Bundles
              </h1>
              <p className="text-gray-500 pt-4 text-sm w-1/2 sm:block hidden sm:text-base">
                You can select from one of our custom bundles tailored towards
                various homes and uses, or you can build your custom builder from
                custom builder
              </p>
              <HrLine text={"Hottest Deals"} />
            </div>

            {/* Desktop strip: horizontal scroll of live bundles (limit to first 4) */}
            <div className="my-4 hidden sm:flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
              {bundlesErr && (
                <div className="text-red-600 text-sm">{bundlesErr}</div>
              )}
              {bundlesLoading && (
                <div className="text-gray-600 text-sm">Loading…</div>
              )}
              {!bundlesLoading && !bundlesErr && bundles.slice(0, 4).map((item) => (
                <Link to={`/productBundle/details/${item.id}`} key={item.id}>
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

            {/* Mobile: keep your existing products grid (unchanged) */}
            <div className="my-4 sm:hidden grid grid-cols-2 gap-5 place-items-center ">
              {products.map((item) => (
                <Link to={`/homePage/product/${item.id}`} key={item.id}>
                  <Product
                    image={item.image}
                    heading={item.heading}
                    price={item.price}
                    oldPrice={item.oldPrice}
                    discount={item.discount}
                    soldText={item.soldText}
                    progressBar={item.progressBar}
                    rating={item.rating}
                  />
                </Link>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
