import React, { useState, useEffect, useCallback } from "react";
import { Check, ChevronLeft, Star, Loader2 } from "lucide-react";
import ReviewModal from "./ReviewModal";
import { assets } from "../../assets/data";
import API, { BASE_URL } from "../../config/api.config";
import axios from "axios";
import Loading from "../Loading";

/** Fallback image when item has no featured_image */
const PLACEHOLDER_IMAGE = "https://api.troosolar.com/storage/products/d5c7f116-57ed-46ef-a659-337c94c308a9.png";

/** Parse API money (handles numbers, "25000.00", "25,000", etc.) */
const parseMoney = (v) => {
  if (v == null || v === "") return 0;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const s = String(v).replace(/,/g, "").replace(/[^\d.-]/g, "");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
};

const formatNgn = (amount) =>
  `₦${Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

/** Compare titles so bundle subtitle is hidden when it duplicates the main title (spacing/case). */
const normalizeTitleKey = (s) =>
  String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

/** Line items use itemable_type "product" | "bundles" from the orders API. */
const isProductLineItem = (lineItem) =>
  String(lineItem?.itemable_type || "").toLowerCase() === "product";

const getProductIdFromLineItem = (lineItem) => {
  if (!isProductLineItem(lineItem)) return null;
  const id = lineItem?.itemable_id ?? lineItem?.item?.id;
  if (id == null || id === "") return null;
  const n = Number(id);
  return Number.isFinite(n) && n > 0 ? n : null;
};

/** Unique product IDs the customer can review (one review per product per user in the backend). */
const getReviewableProductIdsFromOrder = (rawData) => {
  const ids = [];
  const seen = new Set();
  const items = Array.isArray(rawData?.items) ? rawData.items : [];
  for (const i of items) {
    const pid = getProductIdFromLineItem(i);
    if (pid && !seen.has(pid)) {
      seen.add(pid);
      ids.push(pid);
    }
  }
  if (ids.length === 0 && rawData?.product_id) {
    const n = Number(rawData.product_id);
    if (Number.isFinite(n) && n > 0) ids.push(n);
  }
  return ids;
};

const mapApiReviewToState = (review, userInfo) => {
  const adminReply =
    review.admin_reply && String(review.admin_reply).trim()
      ? String(review.admin_reply).trim()
      : null;
  return {
    id: review.id,
    productId: review.product_id,
    rating: review.rating,
    reviewText: review.review,
    userName:
      userInfo?.name?.trim() ||
      [userInfo?.first_name, userInfo?.sur_name].filter(Boolean).join(" ") ||
      "User",
    userInitials:
      (userInfo?.first_name?.[0] || userInfo?.name?.[0] || "U") +
      (userInfo?.sur_name?.[0] || ""),
    date: new Date(review.created_at)
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })
      .replace(/\//g, "-"),
    adminReply,
    adminRepliedAt: review.admin_replied_at || null,
  };
};

const isDeliveredOrCompleted = (status) => {
  const s = String(status || "").toLowerCase();
  return s === "delivered" || s === "completed";
};

const OrderSummary = ({ order, onBack }) => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  /** Map product id string → review object, or `null` if none; empty object before fetch. */
  const [reviewsByProductId, setReviewsByProductId] = useState({});
  const [reviewModalProductId, setReviewModalProductId] = useState(null);
  const [reviewModalProductTitle, setReviewModalProductTitle] = useState("");
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  /** Server truth: product id string → may user review on this order (hides "Rate" when false). */
  const [reviewEligibleByProductId, setReviewEligibleByProductId] = useState({});

  const fetchReviewsForOrderProducts = useCallback(async (rawData) => {
    const ids = getReviewableProductIdsFromOrder(rawData);
    const userInfo = rawData?.user_info;
    const token = localStorage.getItem("access_token");
    if (!token || ids.length === 0) {
      setReviewsByProductId({});
      return;
    }
    const next = {};
    await Promise.all(
      ids.map(async (pid) => {
        try {
          const response = await axios.get(API.Product_Reviews, {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            params: {
              product_id: pid,
              mine: 1,
            },
          });
          if (response.data.status === "success" && response.data.data?.length > 0) {
            next[String(pid)] = mapApiReviewToState(response.data.data[0], userInfo);
          } else {
            next[String(pid)] = null;
          }
        } catch (err) {
          console.error("Error fetching review for product", pid, err);
          next[String(pid)] = null;
        }
      })
    );
    setReviewsByProductId(next);
  }, []);

  const fetchReviewEligibilityForOrder = useCallback(async (rawData) => {
    const delivered = isDeliveredOrCompleted(rawData?.order_status);
    const ids = getReviewableProductIdsFromOrder(rawData);
    const token = localStorage.getItem("access_token");
    const orderId = rawData?.id;
    if (!delivered || !token || ids.length === 0 || !orderId) {
      setReviewEligibleByProductId({});
      return;
    }
    const next = {};
    await Promise.all(
      ids.map(async (pid) => {
        try {
          const res = await axios.get(API.Product_Review_Eligibility, {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            params: { product_id: pid, order_id: orderId },
          });
          next[String(pid)] = res.data?.data?.eligible === true;
        } catch (e) {
          console.warn("Review eligibility check failed for product", pid, e);
          next[String(pid)] = true;
        }
      })
    );
    setReviewEligibleByProductId(next);
  }, []);

  // Fetch order details from API
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("access_token");
        const response = await axios.get(`${API.ORDERS}/${order.id}`, {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (response.data.status === "success") {
          const data = response.data.data;

          // Build address from delivery_address, or from BNPL application (property_address) when missing
          const addr = data.delivery_address;
          const appAddr = data.loan_application || data.application_address;
          const deliveryAddressText =
            addr?.address ||
            [addr?.state, addr?.title].filter(Boolean).join(", ") ||
            appAddr?.property_address ||
            (appAddr?.address && [appAddr.address, appAddr.state].filter(Boolean).join(", ")) ||
            [appAddr?.state, appAddr?.title].filter(Boolean).join(", ") ||
            "Address not provided";
          const phoneNumber =
            addr?.phone_number ||
            appAddr?.phone_number ||
            data.user_info?.phone ||
            "Phone not provided";
          // Always use the order owner's profile — never the admin/viewer's account (include_user_info / viewer_account)
          const customerName =
            (data.user_info?.name && String(data.user_info.name).trim()) ||
            [data.user_info?.first_name, data.user_info?.sur_name].filter(Boolean).join(" ").trim() ||
            "Customer";
          const customerEmail = data.user_info?.email || "Email not provided";
          const contactNameDisplay =
            (addr?.contact_name && String(addr.contact_name).trim()) ||
            customerName;
          const fmtEst = (iso) => {
            if (!iso) return null;
            const d = new Date(iso);
            if (Number.isNaN(d.getTime())) return null;
            return d.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
          };
          const estimatedDeliverySummary =
            data.estimated_delivery_from && data.estimated_delivery_to
              ? `${fmtEst(data.estimated_delivery_from)} – ${fmtEst(data.estimated_delivery_to)}${
                  data.delivery_estimate_label
                    ? ` (${data.delivery_estimate_label})`
                    : ""
                }`
              : data.delivery_estimate_label || null;
          const orderPlacedDate = new Date(data.created_at).toLocaleDateString(
            "en-GB",
            {
              weekday: "short",
              day: "numeric",
              month: "long",
              year: "numeric",
            }
          );

          // Total quantity across all line items; keep items array for per-line display
          const items = Array.isArray(data.items) ? data.items : [];
          const totalQuantity = items.reduce(
            (sum, i) => sum + (Number(i?.quantity) || 0),
            0
          ) || 1;

          // Transform API data to match component structure
          const transformedData = {
            id: data.id,
            orderNumber: data.order_number,
            orderStatus: data.order_status,
            paymentStatus: data.payment_status,
            productName:
              data.items?.[0]?.item?.title ||
              data.items?.[0]?.item?.name ||
              "Purchase",
            price: formatNgn(parseMoney(data.total_price)),
            deliveryDate: orderPlacedDate,
            orderPlacedDate,
            estimatedDeliverySummary,
            deliveryAddress: deliveryAddressText,
            contactNameDisplay,
            phoneNumber,
            customerName,
            customerEmail,
            paymentMethod:
              data.payment_method === "direct" ? "Direct" : data.payment_method,
            charge:
              data.delivery_fee != null && Number(data.delivery_fee) > 0
                ? `₦${Number(data.delivery_fee).toLocaleString()}`
                : "Free",
            insuranceFee:
              data.insurance_fee != null && Number(data.insurance_fee) > 0
                ? `₦${Number(data.insurance_fee).toLocaleString()}`
                : null,
            installationFee:
              data.installation_price != null &&
              Number(data.installation_price) > 0
                ? `₦${Number(data.installation_price).toLocaleString()}`
                : null,
            productImage: (() => {
              const img = data.items?.[0]?.item?.featured_image;
              if (!img) return PLACEHOLDER_IMAGE;
              return img.startsWith("http") ? img : `${BASE_URL.replace("/api", "")}${img}`;
            })(),
            technicianName: data.installation?.technician_name,
            userInfo: data.user_info,
            includeUserInfo: data.viewer_account ?? data.include_user_info,
            // Additional API data
            rawData: data,
            quantity: totalQuantity,
            items, // full items list for per-line display
            unitPrice: data.items?.[0]?.unit_price || data.total_price,
            subtotal: data.items?.[0]?.subtotal || data.total_price,
          };

          setOrderData(transformedData);

          await Promise.all([
            fetchReviewsForOrderProducts(data),
            fetchReviewEligibilityForOrder(data),
          ]);
        }
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    if (order?.id) {
      fetchOrderDetails();
    } else {
      setError("Order ID not provided");
      setLoading(false);
    }
  }, [order?.id, fetchReviewsForOrderProducts, fetchReviewEligibilityForOrder]);

  const handleReviewSubmit = async (reviewData) => {
    const productId = reviewModalProductId;
    if (!productId) {
      setReviewError("Product ID not found");
      return;
    }

    const key = String(productId);
    const existingForProduct = reviewsByProductId[key];

    try {
      setReviewLoading(true);
      setReviewError(null);

      const token = localStorage.getItem("access_token");
      if (!token) {
        setReviewError("Please log in to submit a review");
        return;
      }

      const orderId = orderData?.rawData?.id ?? orderData?.id;
      const payload = {
        product_id: String(productId),
        review: reviewData.reviewText,
        rating: reviewData.rating,
        ...(orderId != null ? { order_id: String(orderId) } : {}),
      };

      let response;
      if (existingForProduct?.id) {
        response = await axios.put(
          API.Update_Product_Review(existingForProduct.id),
          payload,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        response = await axios.post(API.Product_Reviews, payload, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }

      if (response.data.status === "success") {
        const authUser = orderData?.rawData?.user_info || orderData?.userInfo || {};
        const saved = response.data.data || {};
        const adminReply =
          saved.admin_reply && String(saved.admin_reply).trim()
            ? String(saved.admin_reply).trim()
            : existingForProduct?.adminReply ?? null;
        const adminRepliedAt =
          saved.admin_replied_at ?? existingForProduct?.adminRepliedAt ?? null;

        setReviewsByProductId((prev) => ({
          ...prev,
          [key]: {
            id: saved.id || existingForProduct?.id,
            productId: Number(saved.product_id) || productId,
            rating: reviewData.rating,
            reviewText: reviewData.reviewText,
            userName:
              authUser?.name ||
              [authUser?.first_name, authUser?.sur_name].filter(Boolean).join(" ") ||
              "User",
            userInitials:
              (authUser?.first_name?.[0] || authUser?.name?.[0] || "U") +
              (authUser?.sur_name?.[0] || ""),
            date: new Date()
              .toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
              })
              .replace(/\//g, "-"),
            adminReply,
            adminRepliedAt,
          },
        }));

        setShowReviewModal(false);
        setReviewModalProductId(null);
        setReviewModalProductTitle("");
        alert(existingForProduct?.id ? "Review updated successfully!" : "Review submitted successfully!");
      } else {
        setReviewError("Failed to submit review");
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      setReviewError(err?.response?.data?.message || err?.message || "Failed to submit review");
    } finally {
      setReviewLoading(false);
    }
  };

  const openReviewModal = (productId, productTitle) => {
    if (!productId) return;
    setReviewModalProductId(productId);
    setReviewModalProductTitle(productTitle || "");
    setReviewError(null);
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    if (reviewLoading) return;
    setShowReviewModal(false);
    setReviewModalProductId(null);
    setReviewModalProductTitle("");
    setReviewError(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading fullScreen={false} message="Loading order details..." progress={null} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-x-2">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#273e8e] text-white rounded-lg hover:bg-[#1e327a] transition-colors"
            >
              Retry
            </button>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No order data available</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-[#273e8e] text-white rounded-lg hover:bg-[#1e327a] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const canReviewOrder = isDeliveredOrCompleted(orderData.orderStatus);
  const reviewableProductIds = getReviewableProductIdsFromOrder(orderData.rawData);
  const hasReviewableProducts = reviewableProductIds.length > 0;

  const renderProductReviewSection = (productId, productTitle) => {
    if (!productId || !canReviewOrder) return null;
    if (reviewEligibleByProductId[String(productId)] === false) return null;
    const rev = reviewsByProductId[String(productId)];
    return (
      <div className="mt-3 pt-3 border-t border-gray-200">
        {rev ? (
          <div className="mb-2 space-y-1">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  className={
                    star <= rev.rating
                      ? "text-[#273E8E] fill-current"
                      : "text-gray-300"
                  }
                />
              ))}
              <span className="text-xs text-gray-600 ml-1">Your review</span>
            </div>
            {rev.reviewText ? (
              <p className="text-xs text-gray-700 line-clamp-2">{rev.reviewText}</p>
            ) : null}
            {rev.adminReply ? (
              <div className="text-xs text-gray-800 mt-1 p-2 bg-[#f5f7ff] rounded-lg border border-[#273e8e]/20">
                <span className="font-semibold text-[#273e8e]">Troosolar</span>
                <p className="whitespace-pre-wrap mt-0.5">{rev.adminReply}</p>
              </div>
            ) : null}
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => openReviewModal(productId, productTitle)}
          className="text-sm font-medium text-[#273e8e] hover:text-[#1e327a] underline-offset-2 hover:underline"
        >
          {rev ? "Edit review for this product" : "Rate this product"}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Web Header with Back Arrow */}
      <div className="hidden sm:block bg-white border-b border-gray-300">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="text-sm font-medium">Back to Order Details</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 space-y-6 bg-white">
        {/* Order Status Banner - "Congratulations delivered" only when delivered */}
        {(() => {
          const isDelivered =
            String(orderData.orderStatus || "").toLowerCase() === "delivered" ||
            String(orderData.orderStatus || "").toLowerCase() === "completed";
          return (
            <div className="bg-white rounded-2xl p-6 text-center mt-4 border border-gray-400">
              <div className="flex justify-center items-center">
                <img
                  src={assets.tick}
                  alt="tick"
                  className="w-20 h-20 align-middle mb-4"
                />
              </div>
              <h2 className="text-sm font-semibold text-gray-900 text-center max-w-md mx-auto">
                {isDelivered ? (
                  <>
                    <b>Congratulations</b> — your order {orderData.orderNumber}{" "}
                    has been successfully delivered
                  </>
                ) : (
                  <>
                    Your order <b>{orderData.orderNumber}</b> is confirmed
                    {orderData.orderPlacedDate ? (
                      <> (placed on {orderData.orderPlacedDate})</>
                    ) : null}
                    {orderData.estimatedDeliverySummary ? (
                      <span className="block mt-2 text-xs font-normal text-gray-600">
                        Estimated delivery: {orderData.estimatedDeliverySummary}
                      </span>
                    ) : null}
                  </>
                )}
              </h2>
              <div className="mt-2 text-xs text-gray-600">
                Order Status:{" "}
                <span className="font-medium capitalize">
                  {orderData.orderStatus}
                </span>{" "}
                | Payment Status:{" "}
                <span className="font-medium capitalize">
                  {orderData.paymentStatus}
                </span>
              </div>
            </div>
          );
        })()}

        {/* Product Details Section - show all line items with correct quantity */}
        <div>
          <div className="flex ">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Product Details
            </h3>
            <hr className="border-gray-400" />
          </div>
          <div className="bg-white rounded-2xl p-2 border border-gray-400 space-y-4">
            {Array.isArray(orderData.items) && orderData.items.length > 0 ? (
              orderData.items.map((lineItem, idx) => {
                const rawImg = lineItem?.item?.featured_image;
                const img = rawImg
                  ? (rawImg.startsWith("http") ? rawImg : `${BASE_URL.replace("/api", "")}${rawImg}`)
                  : PLACEHOLDER_IMAGE;
                const qty = Number(lineItem?.quantity) || 1;
                const lineSubtotal = parseMoney(lineItem?.subtotal);
                const unitPrice = parseMoney(lineItem?.unit_price);
                const listUnitPrice = parseMoney(lineItem?.list_unit_price);
                const outrightPct = parseMoney(
                  lineItem?.referral_outright_discount_percent
                );
                const displayAmount =
                  lineSubtotal > 0 ? lineSubtotal : unitPrice > 0 ? unitPrice * qty : 0;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-4"
                  >
                    <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <img
                        src={img}
                        alt={lineItem?.item?.title || "Product"}
                        className="w-16 h-16 bg-gray-200 rounded-lg object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        {lineItem?.item?.title || lineItem?.item?.name || lineItem?.name || "Purchase"}
                      </h4>
                      {lineItem?.item?.subtitle &&
                        normalizeTitleKey(lineItem.item.subtitle) !==
                          normalizeTitleKey(lineItem?.item?.title || "") && (
                        <p className="text-xs text-gray-600 mb-2">{lineItem.item.subtitle}</p>
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-purple-100 text-[#000000] text-xs px-2 py-1 rounded">
                          Qty: {qty}
                        </span>
                      </div>
                      {listUnitPrice > 0 &&
                        unitPrice > 0 &&
                        listUnitPrice > unitPrice + 0.005 &&
                        outrightPct > 0 && (
                          <p className="text-xs text-gray-500 mb-1">
                            List price:{" "}
                            <span className="line-through">{formatNgn(listUnitPrice)}</span>
                            {" · "}
                            Outright discount ({outrightPct}%)
                          </p>
                        )}
                      {unitPrice > 0 && (
                        <p className="text-xs text-gray-600 mb-1">
                          Unit price (charged): {formatNgn(unitPrice)}
                        </p>
                      )}
                      <p className="text-xl font-bold text-[#273E8E]">
                        {displayAmount > 0 ? (
                          formatNgn(displayAmount)
                        ) : (
                          <span className="text-gray-600 text-sm font-normal">Amount unavailable</span>
                        )}
                      </p>
                      {renderProductReviewSection(
                        getProductIdFromLineItem(lineItem),
                        lineItem?.item?.title || lineItem?.item?.name || "Product"
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <img
                    src={orderData.productImage || PLACEHOLDER_IMAGE}
                    alt={orderData.productName}
                    className="w-16 h-16 bg-gray-200 rounded-lg object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    {orderData.productName}
                  </h4>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-purple-100 text-[#000000] text-xs px-2 py-1 rounded">
                      Qty: {orderData.quantity}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-[#273E8E]">
                    {orderData.price}
                  </p>
                  {renderProductReviewSection(
                    reviewableProductIds[0] ?? null,
                    orderData.productName
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delivery Details Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Delivery Details
          </h3>
          <div className="bg-white rounded-2xl border border-gray-400 ">
            {/* Card Header */}
            <div className="px-6 py-3 border-b border-gray-300">
              <h2 className="text-base font-medium text-gray-900">
                Delivery Address
              </h2>
            </div>

            <div className="p-6 pb-1 space-y-6">
              {/* Delivery Address Box */}
              <div className="bg-gray-100 rounded-xl p-4 space-y-3">
                <div>
                  <span className="block text-xs text-gray-600">
                    Contact name (delivery)
                  </span>
                  <p className="text-sm font-medium text-gray-900">
                    {orderData.contactNameDisplay || orderData.customerName}
                  </p>
                </div>
                <div>
                  <span className="block text-xs text-gray-600">Address</span>
                  <p className="text-sm font-medium text-gray-900">
                    {orderData.deliveryAddress}
                  </p>
                </div>
                <div>
                  <span className="block text-xs text-gray-600">
                    Phone Number
                  </span>
                  <p className="text-sm font-medium text-gray-900">
                    {orderData.phoneNumber}
                  </p>
                </div>
              </div>

              {orderData.estimatedDeliverySummary && (
                <div className="flex justify-between items-center py-3 border-t border-gray-300">
                  <span className="text-sm text-gray-600">Estimated delivery</span>
                  <span className="text-sm font-medium text-gray-900 text-right max-w-[65%]">
                    {orderData.estimatedDeliverySummary}
                  </span>
                </div>
              )}

              {/* Customer Name */}
              <div className="flex justify-between items-center py-3 border-t border-gray-300 mb-0">
                <span className="text-sm text-gray-600">Account name</span>
                <span className="text-sm font-medium text-gray-900">
                  {orderData.customerName}
                </span>
              </div>

              {/* Customer Email */}
              <div className="flex justify-between items-center py-3 border-t border-gray-300">
                <span className="text-sm text-gray-600">Email</span>
                <span className="text-sm text-gray-900">
                  {orderData.customerEmail}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Payment</h3>
          <div className="bg-white rounded-2xl p-2 border border-gray-400 space-y-4">
            <div className="flex justify-between items-center p-2">
              <span className="text-sm text-gray-600">Payment method</span>
              <span className="text-sm font-medium text-gray-900">
                {orderData.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between items-center p-2">
              <span className="text-sm text-gray-600">Delivery</span>
              <span className="text-sm font-medium text-gray-900">
                {orderData.charge}
              </span>
            </div>
            {orderData.installationFee && (
              <div className="flex justify-between items-center p-2">
                <span className="text-sm text-gray-600">Installation</span>
                <span className="text-sm font-medium text-gray-900">
                  {orderData.installationFee}
                </span>
              </div>
            )}
            {orderData.insuranceFee && (
              <div className="flex justify-between items-center p-2">
                <span className="text-sm text-gray-600">Insurance</span>
                <span className="text-sm font-medium text-gray-900">
                  {orderData.insuranceFee}
                </span>
              </div>
            )}
            {(() => {
              const disc = parseMoney(orderData.rawData?.online_checkout_discount_amount);
              const catalog = parseMoney(orderData.rawData?.catalog_items_subtotal);
              const charged = parseMoney(orderData.rawData?.items_subtotal);
              const pctRaw = orderData.rawData?.items?.find(
                (i) => parseMoney(i?.referral_outright_discount_percent) > 0
              )?.referral_outright_discount_percent;
              const pctLabel =
                pctRaw != null && String(pctRaw).trim() !== ""
                  ? ` (${Number(pctRaw)}%)`
                  : "";

              if (disc > 0 && catalog > 0 && charged > 0) {
                return (
                  <>
                    <div className="flex justify-between items-center p-2 border-t border-gray-200">
                      <span className="text-sm text-gray-600">Items subtotal</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatNgn(catalog)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2">
                      <span className="text-sm text-gray-600">
                        Online checkout discount{pctLabel}
                      </span>
                      <span className="text-sm font-medium text-red-600">
                        −{formatNgn(disc)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2">
                      <span className="text-sm text-gray-600">Items after discount</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatNgn(charged)}
                      </span>
                    </div>
                  </>
                );
              }

              if (charged > 0) {
                return (
                  <div className="flex justify-between items-center p-2 border-t border-gray-200">
                    <span className="text-sm text-gray-600">Items subtotal</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatNgn(charged)}
                    </span>
                  </div>
                );
              }
              return null;
            })()}
            {orderData.rawData?.vat_amount != null &&
              Number(orderData.rawData.vat_amount) > 0 && (
                <div className="flex justify-between items-center p-2">
                  <span className="text-sm text-gray-600">
                    VAT
                    {orderData.rawData.vat_percentage != null
                      ? ` (${parseMoney(orderData.rawData.vat_percentage)}%)`
                      : ""}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatNgn(parseMoney(orderData.rawData.vat_amount))}
                  </span>
                </div>
              )}
            <div className="flex justify-between items-center p-2 border-t border-gray-200 font-semibold">
              <span className="text-sm text-gray-800">Order total</span>
              <span className="text-sm text-[#273e8e]">{orderData.price}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom hint — reviews are per product above */}
      <div className="sm:relative fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 p-4">
        <div className="sm:max-w-md sm:mx-auto">
          {hasReviewableProducts ? (
            <p className="text-center text-sm text-gray-600 leading-relaxed">
              {canReviewOrder
                ? "Use “Rate this product” under each item. Each product has its own rating and review."
                : "After delivery, you can rate each product individually from this order."}
            </p>
          ) : (
            <p className="text-center text-sm text-gray-600">
              {canReviewOrder
                ? "This order has no separate products to review (e.g. bundle-only). Reviews apply to individual catalog products."
                : "Product reviews are available after your order is delivered."}
            </p>
          )}
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={closeReviewModal}
        onSubmit={handleReviewSubmit}
        loading={reviewLoading}
        error={reviewError}
        productTitle={reviewModalProductTitle}
        existingReview={
          reviewModalProductId != null
            ? reviewsByProductId[String(reviewModalProductId)] ?? null
            : null
        }
      />
    </div>
  );
};

export default OrderSummary;
