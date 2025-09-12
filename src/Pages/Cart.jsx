import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { LucideSquarePlus } from "lucide-react";
import { Link } from "react-router-dom";
import CartItems from "../Component/CartItems";
import SideBar from "../Component/SideBar";
import { RxCrossCircled } from "react-icons/rx";
import { GiCheckMark } from "react-icons/gi";
import TopNavbar from "../Component/TopNavbar";
import API, { BASE_URL } from "../config/api.config";

// helpers
const toNumber = (v) =>
  typeof v === "number"
    ? v
    : Number(String(v ?? "").replace(/[^\d.]/g, "")) || 0;

// Turn BASE_URL (http://localhost:8000/api) into origin (http://localhost:F8000)
const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, "");
const toAbsolute = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/")) return `${API_ORIGIN}${path}`;
  const cleaned = path.replace(/^public\//, "");
  return `${API_ORIGIN}/storage/${cleaned}`;
};

// Local storage key (set from Product Details page when you add to cart)
const INSTALL_MAP_KEY = "install_price_map";

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

  // Try to read a per-unit installation price from the item itself
  const installUnitFromModel = toNumber(
    model.installation_price ?? model.install_price ?? model.installation_cost
  );

  return {
    cartLineId: ci.id, // id to PUT/DELETE on
    refId: ci.itemable_id, // product/bundle id
    type: ci.itemable_type, // "App\\Models\\Product" or "App\\Models\\Bundles"
    name: title,
    image: toAbsolute(image),
    qty,
    unitPrice: unit,
    subtotal,
    installUnit: installUnitFromModel, // may be 0; we’ll backfill from localStorage
  };
};

// ---- Delivery Address endpoints (no index route used)
const ADDR_STORE = `${BASE_URL}/delivery-address/store`;
const ADDR_SHOW = (id) => `${BASE_URL}/delivery-address/show/${id}`;
const ADDR_UPDATE = (id) => `${BASE_URL}/delivery-address/update/${id}`;

const ADDR_CACHE_KEY = "addresses_cache";
const ADDR_SELECTED_KEY = "selected_address_id";

const parseAddressFromResponse = (resp) => {
  // Controller sometimes passes data as the 2nd arg to ResponseHelper::success
  // so address may appear in resp.data OR resp.message.
  const d = resp ?? {};
  if (d.data && typeof d.data === "object" && !Array.isArray(d.data))
    return d.data;
  if (d.message && typeof d.message === "object") return d.message;
  return null;
};

// Fallbacks if not present in api.config.js
const CHECKOUT_SUMMARY_URL =
  API.CART_CHECKOUT_SUMMARY || `${BASE_URL}/cart/checkout-summary`;
const ORDERS_URL = API.ORDERS || `${BASE_URL}/orders`;
const PAYMENT_CONFIRMATION_URL =
  API.Payment_Confirmation || `${BASE_URL}/order/payment-confirmation`;

// Flutterwave integration
const ensureFlutterwave = () =>
  new Promise((resolve, reject) => {
    if (window.FlutterwaveCheckout) return resolve();
    const s = document.createElement("script");
    s.src = "https://checkout.flutterwave.com/v3.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Flutterwave script"));
    document.body.appendChild(s);
  });

const Cart = () => {
  const [checkout, setCheckOut] = useState(true);
  const [checkoutPayment, setCheckOutPayment] = useState(false);

  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // addresses (kept locally; selected one also fetched via SHOW/:id if available)
  const [addresses, setAddresses] = useState([]);
  const [openPicker, setOpenPicker] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);

  // add new / edit
  const [addingNew, setAddingNew] = useState(false);
  const [savingNew, setSavingNew] = useState(false);
  const [newForm, setNewForm] = useState({
    title: "",
    address: "",
    state: "",
    phone_number: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [editingForm, setEditingForm] = useState({
    title: "",
    address: "",
    state: "",
    phone_number: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // checkout summary states
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [serverItemsTotal, setServerItemsTotal] = useState(0);
  const [serverItemsCount, setServerItemsCount] = useState(0);
  const [serverDeliveryPrice, setServerDeliveryPrice] = useState(0);
  const [serverInstallPrice, setServerInstallPrice] = useState(0);
  const [_serverGrandTotal, setServerGrandTotal] = useState(0);

  // place order state
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  // ─────────────────────────────
  // Cart: fetch
  // ─────────────────────────────
  const loadCart = async () => {
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

      // Map to our line shape
      let mapped = list.map(mapCartItem);

      // Backfill installUnit from localStorage (saved by Product Details add-to-cart)
      try {
        const m = JSON.parse(localStorage.getItem(INSTALL_MAP_KEY) || "{}");
        mapped = mapped.map((l) => ({
          ...l,
          installUnit: l.installUnit || toNumber(m?.[String(l.refId)]),
        }));
      } catch {
        // ignore
      }

      setLines(mapped);
    } catch (e) {
      setErr(
        e?.response?.data?.message || e?.message || "Failed to load cart."
      );
      setLines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
    // restore cached addresses (client-side cache)
    try {
      const raw = localStorage.getItem(ADDR_CACHE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      if (Array.isArray(arr)) setAddresses(arr);
    } catch {
      // ignore localStorage errors
    }
    // restore selected id & try SHOW/:id
    try {
      const selId = localStorage.getItem(ADDR_SELECTED_KEY);
      if (selId) {
        setSelectedAddressId(selId);
        void fetchAndSelect(selId);
      }
    } catch {
      // ignore localStorage errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistAddresses = (arr) => {
    setAddresses(arr);
    try {
      localStorage.setItem(ADDR_CACHE_KEY, JSON.stringify(arr));
    } catch {
      // ignore localStorage errors
    }
  };

  const setSelected = (id, addr) => {
    setSelectedAddressId(id);
    setSelectedAddress(addr);
    try {
      if (id) localStorage.setItem(ADDR_SELECTED_KEY, String(id));
    } catch {
      // ignore localStorage errors
    }
  };

  const fetchAndSelect = async (id) => {
    if (!token || !id) return;
    try {
      const { data } = await axios.get(ADDR_SHOW(id), {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const addr = parseAddressFromResponse(data);
      if (addr && addr.id) {
        // update local list (replace or append)
        const updated = (() => {
          const copy = [...addresses];
          const idx = copy.findIndex((a) => String(a.id) === String(addr.id));
          if (idx >= 0) copy[idx] = addr;
          else copy.push(addr);
          return copy;
        })();
        persistAddresses(updated);
        setSelected(String(addr.id), addr);
      }
    } catch {
      // ignore; keep local cache
    }
  };

  // ─────────────────────────────
  // Address: add
  // ─────────────────────────────
  const saveNew = async () => {
    if (!token) return;
    if (
      !newForm.title ||
      !newForm.address ||
      !newForm.state ||
      !newForm.phone_number
    ) {
      alert("Please fill all fields.");
      return;
    }
    setSavingNew(true);
    try {
      const { data } = await axios.post(
        ADDR_STORE,
        {
          title: newForm.title,
          address: newForm.address,
          state: newForm.state,
          phone_number: newForm.phone_number,
        },
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const addr = parseAddressFromResponse(data);
      if (addr && addr.id) {
        const updated = [...addresses, addr];
        persistAddresses(updated);
        setSelected(String(addr.id), addr);
        setAddingNew(false);
        setNewForm({ title: "", address: "", state: "", phone_number: "" });
      } else {
        alert("Address saved, but could not parse response.");
      }
    } catch (e) {
      alert(
        e?.response?.data?.message || e?.message || "Failed to add address"
      );
    } finally {
      setSavingNew(false);
    }
  };

  // ─────────────────────────────
  // Address: pick existing
  // ─────────────────────────────
  const selectExisting = (id) => {
    const found = addresses.find((a) => String(a.id) === String(id));
    setSelected(String(id), found || null);
    // refresh details from server (best effort)
    void fetchAndSelect(id);
  };

  // ─────────────────────────────
  // Address: edit/update
  // ─────────────────────────────
  const startEdit = (a) => {
    setEditingId(a.id);
    setEditingForm({
      title: a.title || "",
      address: a.address || "",
      state: a.state || "",
      phone_number: a.phone_number || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setSavingEdit(false);
  };

  const saveEdit = async () => {
    if (!token || !editingId) return;
    setSavingEdit(true);
    try {
      const { data } = await axios.put(
        ADDR_UPDATE(editingId),
        {
          title: editingForm.title,
          address: editingForm.address,
          state: editingForm.state,
          phone_number: editingForm.phone_number,
        },
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const addr = parseAddressFromResponse(data) || {
        id: editingId,
        ...editingForm,
      };
      // update local
      const updated = addresses.map((a) =>
        String(a.id) === String(editingId) ? { ...a, ...addr } : a
      );
      persistAddresses(updated);
      // if was selected, update selected
      if (String(selectedAddressId) === String(editingId)) {
        setSelected(
          String(editingId),
          updated.find((a) => String(a.id) === String(editingId)) || addr
        );
      }
      setEditingId(null);
    } catch (e) {
      alert(
        e?.response?.data?.message || e?.message || "Failed to update address"
      );
    } finally {
      setSavingEdit(false);
    }
  };

  // ─────────────────────────────
  // Cart: qty handlers
  // ─────────────────────────────
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

  // Totals (local)
  const itemCount = useMemo(
    () => lines.reduce((s, l) => s + l.qty, 0),
    [lines]
  );
  const amountTotal = useMemo(
    () => lines.reduce((s, l) => s + l.subtotal, 0),
    [lines]
  );

  // Installation total = sum(installUnit * qty) — per product (client-side)
  const installationTotal = useMemo(
    () =>
      lines.reduce((s, l) => s + toNumber(l.installUnit) * toNumber(l.qty), 0),
    [lines]
  );

  // Prefer server items_total if we have it (after pressing Checkout)
  const itemsTotalToShow = serverItemsTotal || amountTotal;
  // Prefer client-summed installation (per product); fall back to server installation.price
  const installationToShow =
    installationTotal > 0 ? installationTotal : serverInstallPrice;
  // Delivery from server (0 if not yet loaded)
  const deliveryToShow = serverDeliveryPrice || 0;
  // Grand = items + delivery + installation
  const grandTotal = itemsTotalToShow + deliveryToShow + installationToShow;

  const firstLine = lines[0];

  // ─────────────────────────────
  // Checkout summary
  // ─────────────────────────────
  const fetchCheckoutSummary = async () => {
    if (!token) return;
    setSummaryLoading(true);
    try {
      const res = await axios.get(CHECKOUT_SUMMARY_URL, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const payload = res?.data?.data || res?.data || {};
      const cart = payload.cart || {};
      const addressesArr = Array.isArray(payload.addresses)
        ? payload.addresses
        : [];
      const delivery = payload.delivery || {};
      const installation = payload.installation || {};

      setServerItemsTotal(toNumber(cart.items_total));
      setServerItemsCount(toNumber(cart.items_count));
      setServerDeliveryPrice(toNumber(delivery.price));
      setServerInstallPrice(toNumber(installation.price));
      setServerGrandTotal(toNumber(payload.grand_total));

      // merge in addresses from summary (non-destructive)
      if (addressesArr.length) {
        const merged = (() => {
          const byId = new Map(addresses.map((a) => [String(a.id), a]));
          addressesArr.forEach((a) => {
            if (!byId.has(String(a.id))) byId.set(String(a.id), a);
          });
          return Array.from(byId.values());
        })();
        persistAddresses(merged);
        // if none selected yet, pick the latest
        if (!selectedAddressId && merged[0]?.id) {
          setSelected(String(merged[0].id), merged[0]);
        }
      }
    } catch (e) {
      console.error("Checkout summary failed:", e?.response?.data || e);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleCheckoutClick = async () => {
    // switch to delivery view
    setCheckOut(false);
    // fetch server summary
    await fetchCheckoutSummary();
  };

  // ─────────────────────────────
  // Payment Confirmation
  // ─────────────────────────────
  const confirmPayment = async (orderId, txId, amount) => {
    if (!token) return false;
    try {
      const { data } = await axios.post(
        PAYMENT_CONFIRMATION_URL,
        {
          amount: String(amount),
          orderId: Number(orderId),
          txId: String(txId),
        },
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return data?.status === "success";
    } catch (e) {
      console.error("Payment confirmation failed:", e);
      return false;
    }
  };

  // ─────────────────────────────
  // Flutterwave Payment
  // ─────────────────────────────
  const startFlutterwavePayment = async (amount, orderId) => {
    try {
      setProcessingPayment(true);
      await ensureFlutterwave();
      const txRef = "txref_" + Date.now();

      window.FlutterwaveCheckout({
        public_key: "FLWPUBK_TEST-dd1514f7562b1d623c4e63fb58b6aedb-X", // 🔑 your test public key
        tx_ref: txRef,
        amount,
        currency: "NGN",
        payment_options: "card,ussd",
        customer: {
          email: "test@example.com",
          name: "Test User",
        },
        callback: async function (response) {
          console.log("Flutterwave response:", response);
          if (response?.status === "successful") {
            console.log("Payment successful:", {
              tx_ref: txRef,
              amount,
              response,
            });

            // Confirm payment with backend
            const confirmed = await confirmPayment(
              orderId,
              response.transaction_id,
              amount
            );
            if (confirmed) {
              // Show success modal
              setCheckOutPayment(true);
            } else {
              alert("Payment confirmation failed. Please contact support.");
            }
          } else {
            alert("Payment was not successful. Please try again.");
          }
          setProcessingPayment(false);
        },
        onclose: function () {
          console.log("Flutterwave modal closed");
          setProcessingPayment(false);
        },
        customizations: {
          title: "TrooSolar Payment",
          description: `Order ID: ${orderData?.order_number || orderId}`,
          logo: "https://yourdomain.com/logo.png",
        },
      });
    } catch (e) {
      console.error("Payment init failed:", e);
      setProcessingPayment(false);
      alert("Failed to initialize payment. Please try again.");
    }
  };

  // ─────────────────────────────
  // Place Order (final Checkout in Delivery step)
  // ─────────────────────────────
  const handlePlaceOrder = async () => {
    if (!token) {
      alert("Please log in first.");
      return;
    }
    if (!selectedAddressId) {
      setOpenPicker(true);
      alert(
        "Please select or add a delivery address before placing the order."
      );
      return;
    }
    if (lines.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    // Build items payload
    const itemsPayload = lines.map((l) => {
      const isBundle =
        /bundle/i.test(l.type || "") || /Bundles/i.test(l.type || "");
      return {
        itemable_type: isBundle ? "bundle" : "product",
        itemable_id: Number(l.refId),
        quantity: Number(l.qty) || 1,
      };
    });

    setPlacingOrder(true);
    try {
      const { data } = await axios.post(
        ORDERS_URL,
        {
          delivery_address_id: Number(selectedAddressId),
          payment_method: "direct",
          items: itemsPayload,
        },
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Store order data for payment
      if (data?.status === "success" && data?.data) {
        setOrderData(data.data);

        // Start Flutterwave payment with the order total
        const paymentAmount = Number(data.data.total_price) || grandTotal;
        await startFlutterwavePayment(paymentAmount, data.data.id);
      } else {
        alert("Order placed but payment initialization failed.");
      }
    } catch (e) {
      const msg =
        e?.response?.data?.message || e?.message || "Failed to place order.";
      alert(msg);
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#F5F7FF]">
      <SideBar />

      <main className="flex flex-col w-full">
        <TopNavbar />

        <section className="flex flex-col lg:flex-row justify-between gap-5 px-5 py-5 w-full">
          {/* Cart Items */}
          <div className="w-full sm:w-[57%] space-y-4 p-5">
            <h1 className="text-2xl">Shopping Cart</h1>
            <Link
              to="/homePage"
              className="text-blue-500 underline text-sm hover:text-blue-700"
            >
              Go Back
            </Link>

            <div className="px-4 p-2 text-xs rounded-xl bg-[#e0e4f3] text-[#273e8e] border-dashed border-[1.2px] my-3 border-[#273e8e]">
              <p>
                With product builder, you can order custom solar products <br />
                to fully suit your needs
              </p>
            </div>

            <Link to="/homePage">
              <div className="px-4 p-2 text-xs rounded-xl bg-[#fff] py-4 flex justify-between items-center border-[1.2px] my-3 border-gray-400">
                <p className="">Add a product</p>
                <LucideSquarePlus />
              </div>
            </Link>

            {loading ? (
              <div className="px-4 p-4 text-sm rounded-xl bg-white border text-gray-500">
                Loading…
              </div>
            ) : err ? (
              <div className="px-4 p-4 text-sm rounded-xl bg-white border text-red-600">
                {err}
              </div>
            ) : lines.length === 0 ? (
              <div className="px-4 p-4 text-sm rounded-xl bg-white border text-gray-500">
                Your cart is empty.
              </div>
            ) : (
              lines.map((line) => (
                <CartItems
                  key={line.cartLineId}
                  itemId={line.cartLineId} // cart line id for server handlers
                  name={line.name}
                  price={line.unitPrice}
                  image={line.image}
                  showControls={true}
                  // If your CartItems doesn't use these yet, UI stays same
                  quantity={line.qty}
                  onIncrement={increment}
                  onDecrement={decrement}
                  onDelete={removeLine}
                />
              ))
            )}
          </div>

          {/* Right Side: Order Summary or Delivery Section */}
          {checkout ? (
            <div className="w-full lg:w-1/2 p-5 mt-16 space-y-5">
              <h2 className="text-2xl ">Order Summary</h2>

              <div className="rounded-2xl bg-white p-5 space-y-3 border-[1px] border-gray-300">
                <div className="flex justify-between text-gray-600">
                  <span className="text-xs text-gray-400">Items</span>
                  <span className="text-gray-500">{itemCount}</span>
                </div>
                <hr className="border-gray-300" />
                <div className="flex justify-between text-[#273e8e]">
                  <span className="text-xs text-gray-400 ">Total</span>
                  <span className="font-semibold">
                    N{amountTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="py-4 border border-[#273e8e] text-[#273e8e] rounded-full text-sm hover:bg-[#273e8e]/10 transition">
                  Buy By Loan
                </button>
                <button
                  onClick={handleCheckoutClick}
                  className="py-4 bg-[#273e8e] text-white rounded-full text-sm hover:bg-[#1f2f6e] transition disabled:opacity-60"
                  disabled={lines.length === 0}
                >
                  Checkout
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full lg:w-1/2 p-5 mt-16 space-y-6">
              <h2 className="text-2xl font-semibold">Delivery Details</h2>

              <div className="bg-white border-[1px] border-gray-300 rounded-2xl p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Delivery Address</span>
                  <button
                    type="button"
                    onClick={() => setOpenPicker((s) => !s)}
                    className="text-sm text-[#273E8E] hover:text-[#1d3c73] underline p-2 cursor-pointer"
                  >
                    {summaryLoading ? "Loading…" : "Change"}
                  </button>
                </div>
                <hr className="border-gray-300" />

                {/* Address picker/editor (toggled) */}
                {openPicker && (
                  <div className="rounded-lg border border-gray-200 p-3 space-y-3">
                    {/* Existing addresses radio list */}
                    {addresses.length ? (
                      <div className="space-y-2">
                        {addresses.map((a) => (
                          <div key={a.id} className="border rounded-md p-2">
                            <label className="flex items-start gap-2">
                              <input
                                type="radio"
                                name="deliveryAddress"
                                checked={
                                  String(selectedAddressId) === String(a.id)
                                }
                                onChange={() => selectExisting(a.id)}
                              />
                              <div className="flex-1">
                                <div className="text-sm font-medium">
                                  {a.title}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {a.address}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {a.state} — {a.phone_number}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => startEdit(a)}
                                className="text-xs text-blue-600 hover:underline"
                              >
                                Edit
                              </button>
                            </label>

                            {/* Inline edit for this row */}
                            {editingId === a.id && (
                              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                                <input
                                  className="border rounded px-2 py-1 text-sm"
                                  placeholder="Title"
                                  value={editingForm.title}
                                  onChange={(e) =>
                                    setEditingForm((f) => ({
                                      ...f,
                                      title: e.target.value,
                                    }))
                                  }
                                />
                                <input
                                  className="border rounded px-2 py-1 text-sm"
                                  placeholder="State"
                                  value={editingForm.state}
                                  onChange={(e) =>
                                    setEditingForm((f) => ({
                                      ...f,
                                      state: e.target.value,
                                    }))
                                  }
                                />
                                <input
                                  className="border rounded px-2 py-1 text-sm md:col-span-2"
                                  placeholder="Address"
                                  value={editingForm.address}
                                  onChange={(e) =>
                                    setEditingForm((f) => ({
                                      ...f,
                                      address: e.target.value,
                                    }))
                                  }
                                />
                                <input
                                  className="border rounded px-2 py-1 text-sm md:col-span-2"
                                  placeholder="Phone Number"
                                  value={editingForm.phone_number}
                                  onChange={(e) =>
                                    setEditingForm((f) => ({
                                      ...f,
                                      phone_number: e.target.value,
                                    }))
                                  }
                                />
                                <div className="flex gap-2 mt-1 md:col-span-2">
                                  <button
                                    type="button"
                                    onClick={saveEdit}
                                    className="px-3 py-1 rounded-full bg-[#273e8e] text-white text-xs disabled:opacity-60"
                                    disabled={savingEdit}
                                  >
                                    {savingEdit ? "Saving..." : "Save"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="px-3 py-1 rounded-full border text-xs"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        No addresses yet.
                      </div>
                    )}

                    {/* Add new toggle */}
                    {!addingNew ? (
                      <button
                        type="button"
                        onClick={() => setAddingNew(true)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        + Add new address
                      </button>
                    ) : (
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                        <input
                          className="border rounded px-2 py-1 text-sm"
                          placeholder="Title (e.g., Home, Office)"
                          value={newForm.title}
                          onChange={(e) =>
                            setNewForm((f) => ({ ...f, title: e.target.value }))
                          }
                        />
                        <input
                          className="border rounded px-2 py-1 text-sm"
                          placeholder="State"
                          value={newForm.state}
                          onChange={(e) =>
                            setNewForm((f) => ({ ...f, state: e.target.value }))
                          }
                        />
                        <input
                          className="border rounded px-2 py-1 text-sm md:col-span-2"
                          placeholder="Address"
                          value={newForm.address}
                          onChange={(e) =>
                            setNewForm((f) => ({
                              ...f,
                              address: e.target.value,
                            }))
                          }
                        />
                        <input
                          className="border rounded px-2 py-1 text-sm md:col-span-2"
                          placeholder="Phone Number"
                          value={newForm.phone_number}
                          onChange={(e) =>
                            setNewForm((f) => ({
                              ...f,
                              phone_number: e.target.value,
                            }))
                          }
                        />
                        <div className="flex gap-2 mt-1 md:col-span-2">
                          <button
                            type="button"
                            onClick={saveNew}
                            className="px-3 py-1 rounded-full bg-[#273e8e] text-white text-xs disabled:opacity-60"
                            disabled={savingNew}
                          >
                            {savingNew ? "Saving..." : "Save"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAddingNew(false);
                              setNewForm({
                                title: "",
                                address: "",
                                state: "",
                                phone_number: "",
                              });
                            }}
                            className="px-3 py-1 rounded-full border text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Selected Address (original gray box — UI unchanged) */}
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full border">
                    <div className="h-3 w-3 rounded-full bg-[#273e8e]"></div>
                  </div>
                  <div className="w-full bg-[#ededed] rounded-xl p-4 space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="text-sm">
                        {selectedAddress?.address || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="text-sm">
                        {selectedAddress?.phone_number || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Estimated Time</span>
                  <span className="text-gray-900 font-medium">
                    July 3, 2025
                  </span>
                </div>
                <hr className="border-gray-300" />
                <div className="flex justify-between text-[#00000080] text-sm">
                  <span>Price</span>
                  {/* show server items_total when available */}
                  <span className="text-[#273E8E]">
                    N{itemsTotalToShow.toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <h1 className="text-xl py-3 font-semibold text-gray-600">
                  Installation
                </h1>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full border">
                    <div className="h-3 w-3 rounded-full bg-[#273e8e]"></div>
                  </div>
                  <div className="w-full border-[1px] bg-white  border-gray-300 rounded-xl p-4 space-y-3">
                    <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg py-2 px-2">
                      <p className="text-yellow-600">
                        Installation will be carried out by one of our skilled
                        technicians. You can choose not to use our installers.
                      </p>
                    </div>
                    <div className="flex justify-between text-gray-600 text-sm">
                      <span>Estimated Time</span>
                      <span className="text-gray-900 font-medium">
                        July 3, 2025
                      </span>
                    </div>
                    <hr className="border-gray-300" />
                    <div className="flex justify-between text-[#00000080] text-sm">
                      <span>Price</span>
                      {/* per-product sum (client) or server fallback */}
                      <span className="text-[#273E8E]">
                        N
                        {(installationTotal > 0
                          ? installationTotal
                          : installationToShow
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Breakdown */}
              <div className="border-[1px] border-gray-300 p-4 rounded-xl space-y-3 bg-white">
                <div className="flex justify-between">
                  <p>Items</p>
                  <p>{serverItemsCount || itemCount}</p>
                </div>
                <hr className="border-gray-300"/>
                <div className="flex justify-between">
                  <p>Payment Method</p>
                  <p>Direct</p>
                </div>
                <hr className="border-gray-300"/>
                <div className="flex justify-between">
                  <p>Charge</p>
                  {/* show delivery from server if present; keep label unchanged */}
                  <p>
                    {deliveryToShow
                      ? `N${deliveryToShow.toLocaleString()}`
                      : "Free"}
                  </p>
                </div>
                <hr className="border-gray-300"/>
                <div className="flex justify-between font-bold text-[#273e8e]">
                  <p>Total</p>
                  {/* grand = items + delivery + installation */}
                  <p>N{grandTotal.toLocaleString()}</p>
                </div>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setCheckOut(true)}
                  className="py-3 border border-gray-300 rounded-full text-sm hover:bg-gray-100 transition"
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  className="py-3 bg-[#273e8e] text-white rounded-full text-sm hover:bg-[#1f2f6e] transition disabled:opacity-60"
                  disabled={
                    lines.length === 0 ||
                    summaryLoading ||
                    placingOrder ||
                    processingPayment
                  }
                >
                  {placingOrder
                    ? "Placing..."
                    : processingPayment
                    ? "Processing Payment..."
                    : "Checkout"}
                </button>
              </div>
            </div>
          )}

          {/* Final Confirmation Modal */}
          {checkoutPayment && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
              <div className="w-[90%] max-w-[430px] bg-white rounded-2xl shadow-md p-4">
                <div className="max-h-[450px] overflow-y-auto border rounded-2xl p-4">
                  <div className="flex flex-col items-center gap-5 text-center">
                    <div
                      className={`${
                        checkout ? "bg-red-600 " : "bg-green-600"
                      } rounded-full flex items-center justify-center h-[100px] w-[100px]`}
                    >
                      {checkout ? (
                        <RxCrossCircled size={40} color="white" />
                      ) : (
                        <GiCheckMark size={40} color="white" />
                      )}
                    </div>

                    <p className="text-[15px]">
                      {checkout ? (
                        <span>
                          Oops! Something went wrong with your order.
                          <br />
                          Please try again or contact support.
                        </span>
                      ) : (
                        <span>
                          <strong>Congratulations</strong> your order has been
                          placed successfully, Expect delivery from Mon, July
                          3rd - Wed July 7th
                        </span>
                      )}
                    </p>

                    <div className="w-full text-start text-sm max-w-[350px]">
                      {firstLine ? (
                        <CartItems
                          itemId={firstLine.cartLineId}
                          name={firstLine.name}
                          price={firstLine.unitPrice}
                          image={firstLine.image}
                          showControls={false}
                          quantity={firstLine.qty}
                        />
                      ) : (
                        <div className="bg-white border rounded-xl p-4 text-gray-500">
                          No items
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <button
                    onClick={() => setCheckOutPayment(false)}
                    className="border border-[#273e8e] py-4 text-sm rounded-full text-[#273e8e] hover:bg-[#273e8e]/10 transition"
                  >
                    Leave a review
                  </button>
                  <Link
                    to="/homePage"
                    className="py-4 text-sm text-center rounded-full bg-[#273e8e] text-white hover:bg-[#1f2f6e] transition"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Cart;
