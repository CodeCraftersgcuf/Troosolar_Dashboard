import React, { useContext, useMemo, useState } from "react";
import axios from "axios";
import { ContextApi } from "../Context/AppContext";
import { assets } from "../assets/data";
import API from "../config/api.config";

// clamp helper
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

// title clamp (2 lines look)
const Title = ({ children }) => (
  <h2
    className="text-[13px] sm:text-[14px] font-medium text-slate-800 leading-snug min-h-[42px] overflow-hidden"
    style={{
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
    }}
  >
    {children}
  </h2>
);

// stars
const Stars = ({ value = 0 }) => {
  const v = clamp(Number(value || 0), 0, 5);
  const full = Math.floor(v);
  const hasHalf = v - full >= 0.5;

  const Star = ({ filled }) => (
    <svg
      viewBox="0 0 20 20"
      className={`h-4 w-4 max-sm:h-2 max-sm:w-2 ${
        filled ? "fill-[#273e8e]" : "fill-gray-300"
      }`}
      aria-hidden="true"
    >
      <path d="M10 15.27l-5.18 3.05 1.4-5.99L1 7.97l6.09-.52L10 1.5l2.91 5.95 6.09.52-5.22 4.36 1.4 5.99z" />
    </svg>
  );

  return (
    <div className="flex items-center gap-0.5 max-w-[70px]">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full || (i === full && hasHalf);
        return <Star key={i} filled={filled} />;
      })}
    </div>
  );
};

const formatTitle = (t) => {
  const s = (t ?? "").toString();
  return s.length > 80 ? `${s.slice(0, 77)}…` : s;
};

const Product = ({
  image,
  heading,
  price,
  oldPrice,
  discount, // "-50%"
  ratingAvg, // 0..5
  ratingCount, // int
  categoryName, // e.g., "Inverter"
  isHotDeal,
  id,
}) => {
  const { addToCart, fetchCartCount, showCartNotificationModal } =
    useContext(ContextApi);
  const [adding, setAdding] = useState(false);
  const [err, setErr] = useState("");

  console.log("The product Image", image);
  const Image_url =
    image || assets?.placeholderProduct || "/placeholder-product.png";
  const title = useMemo(() => formatTitle(heading), [heading]);

  const starting_base_url = "https://troosolar.hmstech.org/";
  const safeImage = Image_url.includes(starting_base_url)
    ? Image_url
    : starting_base_url + Image_url;

  const handleAddToCart = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    if (!id) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      addToCart?.(id);
      return;
    }

    try {
      setErr("");
      setAdding(true);
      await axios.post(
        API.CART,
        { itemable_type: "product", itemable_id: Number(id), quantity: 1 },
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Refresh global cart count after successful addition
      fetchCartCount();
      // Show cart notification
      showCartNotificationModal(heading, safeImage);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Failed to add.";
      setErr(msg);
    } finally {
      setAdding(false);
    }
  };

  // Debug logging to see what values we're receiving
  console.log("Product Debug:", {
    id,
    heading,
    price,
    oldPrice,
    discount,
    showingDiscount: !!(oldPrice || discount)
  });

  return (
    <div className="relative w-full sm:h-full sm:w-full bg-white border border-gray-200 rounded-[24px] p-3 sm:p-4 shadow-sm flex flex-col">
      {/* Vertical Hot Deal ribbon (mobile-friendly) */}
      {/* {(isHotDeal || discount) && (
          <div className="absolute left-0 top-6 flex items-start">
            <span
              className="bg-[#F3A01C] text-white text-[10px] font-semibold px-1.5 py-2 rounded-r-xl"
              style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
            >
              Hot Deal
            </span>
          </div>
        )} */}

      {/* Image: locked height so grid cards don't collapse on mobile */}
      <div className="bg-gray-100 h-[140px] sm:h-[180px] flex rounded-2xl overflow-hidden">
        <img
          src={safeImage}
          alt={title || "Product"}
          className="max-w-full max-h-full object-contain"
          loading="lazy"
        />
      </div>

      {/* Title */}
      <div className="mt-2 max-sm:text-[12px]">
        <Title>{title || "—"}</Title>
      </div>

      <hr className="border-gray-300 max-sm:mt-[-18px]" />

      {/* Price + right meta */}
      <div className="flex justify-between items-start mt-2">
        <div>
          <p className="font-semibold text-[#273E8E] text-[16px] max-sm:text-[14px]">
            {price ?? "—"}
          </p>

          {/* Show old price and discount when they exist */}
          {(oldPrice || discount) && (
            <div className="flex items-center gap-2 mt-1">
              {oldPrice && (
                <p className="text-gray-400 line-through text-[11px] max-sm:text-[8px]">
                  {oldPrice}
                </p>
              )}
              {discount && (
                <span className="px-2 py-[2px] rounded-full text-[#FFA500] max-sm:text-[8px] text-[10px] bg-[#FFA500]/20 max-sm:px-1 max-sm:py-[1px]">
                  {discount}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="text-right space-y-2">
          <div className="flex items-center justify-end gap-1 text-[11px] max-sm:text-[7px] text-gray-600">
            <img className="h-4 w-4" src={assets.solarProject} alt="" />
            <span className="truncate max-w-[100px] ">
              {categoryName || "Inverter"}
            </span>
          </div>

          <div className="flex items-center justify-end gap-1 ">
            <Stars value={ratingAvg} />
            {ratingCount ? (
              <span className="text-[11px] text-gray-500">
                &nbsp;({ratingCount})
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <hr className="border-gray-300 mt-2" />

      {/* Actions: pinned to bottom on mobile */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        <button className="h-10 border border-[#000000] text-[12px] max-sm:text-[8px] rounded-full max-sm:rounded-2xl text-[#181919] max-sm:h-7">
          Learn More
        </button>
        <button
          onClick={handleAddToCart}
          className="h-10 text-[10px] sm:text-[12px] rounded-full bg-[#273e8e] max-sm:text-[8px] max-sm:rounded-2xl  max-sm:h-7 text-white disabled:opacity-60"
          disabled={!id || adding}
          title={err || ""}
        >
          {adding ? "Adding…" : "Add to cart"}
        </button>
      </div>
    </div>
  );
};

export default Product;
