import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import SideBar from "../Component/SideBar";
import TopNavbar from "../Component/TopNavbar";
import { Link } from "react-router-dom";
import { CgAddR } from "react-icons/cg";
import CartItems from "../Component/CartItems";
import API, { BASE_URL } from "../config/api.config";

// helpers
const toNumber = (v) =>
  typeof v === "number"
    ? v
    : Number(String(v ?? "").replace(/[^\d.]/g, "")) || 0;

// Turn BASE_URL (http://.../api) into origin (http://...)
const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, "");
const toAbsolute = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/")) return `${API_ORIGIN}${path}`;
  const cleaned = path.replace(/^public\//, "");
  return `${API_ORIGIN}/storage/${cleaned}`;
};

// Map server cart item -> UI line
const mapCartItem = (ci) => {
  const model = ci?.itemable || {};
  const title = model.name || model.title || `Item #${ci?.itemable_id}`;
  const image =
    model.featured_image ||
    model.image_url ||
    model.image ||
    (Array.isArray(model.images) && model.images[0]?.image) ||
    "/placeholder-product.png";

  const unit = toNumber(
    ci?.unit_price ?? model.discount_price ?? model.price ?? model.total_price
  );
  const qty = toNumber(ci?.quantity);
  const subtotal = toNumber(ci?.subtotal ?? unit * qty);

  return {
    cartLineId: ci.id,
    refId: ci.itemable_id,
    type: ci.itemable_type,
    name: title,
    image: toAbsolute(image),
    qty,
    unitPrice: unit,
    subtotal,
  };
};

const SolarBuilder = () => {
  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  // Load cart data
  const loadCart = useCallback(async () => {
    if (!token) {
      setErr("Please log in to view your cart.");
      setLines([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setErr("");
      const { data } = await axios.get(API.CART, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const list = Array.isArray(data?.data) ? data.data : [];
      const mapped = list.map(mapCartItem);
      setLines(mapped);
    } catch (e) {
      setErr(
        e?.response?.data?.message || e?.message || "Failed to load cart."
      );
      setLines([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Cart quantity handlers
  const updateQty = async (cartLineId, newQty) => {
    if (!token) return;
    if (newQty <= 0) {
      await removeLine(cartLineId);
      return;
    }
    try {
      await axios.put(
        API.CART_ITEM(cartLineId),
        { quantity: newQty },
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLines((prev) =>
        prev.map((l) =>
          l.cartLineId === cartLineId
            ? { ...l, qty: newQty, subtotal: newQty * l.unitPrice }
            : l
        )
      );
    } catch {
      await loadCart();
    }
  };

  const increment = (cartLineId) => {
    const line = lines.find((l) => l.cartLineId === cartLineId);
    if (!line) return;
    updateQty(cartLineId, line.qty + 1);
  };

  const decrement = (cartLineId) => {
    const line = lines.find((l) => l.cartLineId === cartLineId);
    if (!line) return;
    updateQty(cartLineId, line.qty - 1);
  };

  const removeLine = async (cartLineId) => {
    if (!token) return;
    try {
      await axios.delete(API.CART_ITEM(cartLineId), {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setLines((prev) => prev.filter((l) => l.cartLineId !== cartLineId));
    } catch {
      await loadCart();
    }
  };

  // Calculate totals
  const itemCount = useMemo(
    () => lines.reduce((s, l) => s + l.qty, 0),
    [lines]
  );
  const amountTotal = useMemo(
    () => lines.reduce((s, l) => s + l.subtotal, 0),
    [lines]
  );
  return (
    <div>
      <div className="flex min-h-screen w-full">
        <SideBar />
        {/* Main Content */}
        <div className="w-full sm:w-[calc(100%-250px)]">
          {/* Topbar */}
          <div className="sm:block hidden">
            <TopNavbar />
          </div>
          <div className="bg-[#F5F7FF] p-3 sm:p-5 flex flex-col lg:flex-row justify-between items-start gap-5">
            {/* left section */}
            <div className="w-full lg:w-1/2">
              <h1 className="text-xl sm:text-2xl font-medium">Product Builder</h1>
              <Link to="/" className="text-blue-500 underline text-sm">
                Go Back
              </Link>
              <div className="mt-5 bg-[#273E8E1A] w-full h-[60px] sm:h-[70px] rounded-xl border-dashed border-[#273e8e] border-[2px] p-3 flex items-center">
                <p className="text-sm sm:text-base">
                  With product builder, you can order custom solar products to
                  fully suit your needs
                </p>
              </div>
              <Link
                to="/homePage"
                className="mt-5 bg-[#ffffff] w-full h-[60px] sm:h-[70px] rounded-xl border-gray-400 border-[2px] p-3 flex justify-between items-center"
              >
                <span className="text-sm sm:text-base">Add a Product</span>
                <CgAddR color="black" size={20} className="sm:w-6 sm:h-6" />
              </Link>
              <div className="mt-4 space-y-3">
                {loading ? (
                  <div className="px-4 p-4 text-sm rounded-xl bg-white border text-gray-500">
                    Loading cart items...
                  </div>
                ) : err ? (
                  <div className="px-4 p-4 text-sm rounded-xl bg-white border text-red-600">
                    {err}
                  </div>
                ) : lines.length === 0 ? (
                  <div className="px-4 p-4 text-sm rounded-xl bg-white border text-gray-500">
                    Your cart is empty. Add some products to get started.
                  </div>
                ) : (
                  lines.map((line) => (
                    <CartItems
                      key={line.cartLineId}
                      itemId={line.cartLineId}
                      name={line.name}
                      price={line.unitPrice}
                      image={line.image}
                      showControls={true}
                      quantity={line.qty}
                      onIncrement={increment}
                      onDecrement={decrement}
                      onDelete={removeLine}
                    />
                  ))
                )}
              </div>
            </div>
            {/* Right section */}
            <div className="w-full lg:w-1/2 lg:mt-12">
              <h1 className="text-xl sm:text-2xl font-medium">Order Summary</h1>

              <div className="bg-white rounded-2xl border-[2px] mt-2 border-gray-400/40 w-full p-4">
                <div className="flex justify-between items-center p-2">
                  <span className="text-gray-500/70 text-sm sm:text-base">Items</span>
                  <span className="text-gray-800 text-base sm:text-lg">{itemCount}</span>
                </div>
                <hr className="text-gray-400/40 p-2" />

                <div className="flex justify-between items-center p-2">
                  <span className="text-gray-500/70 text-sm sm:text-base">Total</span>
                  <span className="text-[#273e8e] font-semibold text-base sm:text-lg">
                    N{amountTotal.toLocaleString()}
                  </span>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  to="/loan"
                  className="border text-center border-[#273e8e] py-3 sm:py-4 rounded-full text-[#273e8e] text-xs sm:text-sm"
                >
                  Buy With Loan
                </Link>
                <Link
                  to="/cart"
                  className="py-3 sm:py-4 text-center rounded-full bg-[#273e8e] text-white text-xs sm:text-sm"
                >
                  Checkout
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolarBuilder;
