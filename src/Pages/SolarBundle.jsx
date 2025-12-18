import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SideBar from "../Component/SideBar";
import TopNavbar from "../Component/TopNavbar";
import SearchBar from "../Component/SearchBar";
import SolarBundleComponent from "../Component/SolarBundleComponent";
import API, { BASE_URL } from "../config/api.config";
import { assets } from "../assets/data";
import { Edit } from "lucide-react";
import Loading from "../Component/Loading";

// --- utils -------------------------------------------------------------

// turn BASE_URL (http://localhost:8000/api) into API origin (http://localhost:8000)
const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, "");

// format ₦ nicely
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
  if (/^https?:\/\//i.test(path)) return path; // already absolute
  if (path.startsWith("/")) return `${API_ORIGIN}${path}`; // "/storage/xyz.jpg"
  // "bundles/xyz.jpg" or "public/bundles/xyz.jpg"
  const cleaned = path.replace(/^public\//, "");
  return `${API_ORIGIN}/storage/${cleaned}`;
};

// map API bundle -> card props
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
  const pct = showDiscount && total > 0 ? Math.round((1 - discount / total) * 100) : 0;
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
    borderColor: "#273e8e", // theme color frame
  };
};

// normalize API response to an array
const normalizeBundles = (data) => {
  const root = data?.data ?? data;
  if (Array.isArray(root)) return root;              // /api/bundles (all)
  if (Array.isArray(root?.data)) return root.data;   // alt shape
  if (root && typeof root === "object") return [root]; // /api/bundles?q=... (single)
  return [];
};

// ----------------------------------------------------------------------

const SolarBundle = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const qParam = searchParams.get("q")?.trim();

  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const fetchBundles = async () => {
      setLoading(true);
      setErr("");
      try {
        const token = localStorage.getItem("access_token");

        // decide URL based on presence of ?q=
        const url = qParam && !Number.isNaN(Number(qParam))
          ? `${API.BUNDLES}?q=${encodeURIComponent(qParam)}`
          : API.BUNDLES;

        const { data } = await axios.get(url, {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const arr = normalizeBundles(data).map(mapBundle);
        setBundles(arr);
      } catch (e) {
        setErr(
          e?.response?.data?.message || e?.message || "Failed to load bundles."
        );
        setBundles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBundles();
  }, [qParam]);

  return (
    <div className="flex w/full min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-auto">
        <SideBar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <TopNavbar />

        {/* Header and Search */}
        <div className="bg-[#273e8e] border-l-2 border-gray-500 px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="min-w-[180px]">
              <h1 className="text-md font-semibold text-white">Solar Bundles</h1>
              <p className="text-white text-xs">
                {qParam
                  ? "Choose from recommended bundles based on your load calculation"
                  : "Welcome to the dashboard"}
              </p>
            </div>
            {!qParam && <SearchBar />}
          </div>
          {qParam && (
            <div className="mt-4">
              <button
                onClick={() => navigate("/tools")}
                className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors text-sm font-medium"
              >
                <Edit size={16} />
                <span>Edit Load</span>
              </button>
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="px-6 py-6 w-full overflow-scroll">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">
            {qParam ? "Choose from Recommended Bundle(s)" : "All Bundles"}
          </h1>

          {err && <p className="text-red-600 text-sm mb-3">{err}</p>}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <Loading message="Loading bundles..." progress={null} />
            </div>
          )}

          <div className="grid xl:grid-cols-4 lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
            {bundles.map((item) => (
              <Link key={item.id} to={`/productBundle/details/${item.id}`}>
                <SolarBundleComponent
                  id={item.id}
                  image={item.image}
                  heading={item.heading}
                  price={item.price}
                  oldPrice={item.oldPrice}
                  discount={item.discount}
                  borderColor={item.borderColor}
                  rating={item.rating}
                  bundleTitle={item.bundleTitle}
                />
              </Link>
            ))}

            {!loading && !err && bundles.length === 0 && (
              <div className="text-gray-500 bg-white border rounded-xl p-4">
                {qParam
                  ? "No matching bundle found for that target."
                  : "No bundles found."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolarBundle;
