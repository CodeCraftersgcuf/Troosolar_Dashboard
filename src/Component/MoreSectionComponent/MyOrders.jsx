import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { PiShoppingCartSimple } from "react-icons/pi";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import API, { BASE_URL } from "../../config/api.config";
// import OrderDetails from "../OrderComponents/OrderDetails";
import OrderSummary from "../OrderComponents/OrderSummary";
const formatNGN = (n) => {
  const num = Number(n) || 0;
  try {
    return `₦${new Intl.NumberFormat("en-NG").format(num)}`;
  } catch {
    return `₦${num}`;
  }
};

const formatDate = (s) => {
  // backend sends "Y-m-d H:i:s" e.g. 2025-05-05 06:22:00
  const d = new Date(s?.replace(" ", "T"));
  if (isNaN(d.getTime())) return s || "—";
  const day = d.getDate();
  const month = d.toLocaleString("en-GB", { month: "short" });
  const year = String(d.getFullYear()).slice(-2);
  const time = d.toLocaleString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${day} ${month}, ${year} - ${time}`;
};

const statusBadge = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "delivered" || s === "completed" || s === "complete") {
    return { text: "Completed", cls: "bg-green-100 text-green-700" };
  }
  return { text: "Pending", cls: "bg-yellow-100 text-yellow-700" };
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("all"); // all | pending | completed
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchParams] = useSearchParams();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const ORDERS_URL = API.ORDERS || `${BASE_URL}/orders`;
  
  // Get orderId from URL params
  const orderIdFromUrl = searchParams.get("orderId");

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!token) {
        setErr("Please log in to see your orders.");
        setOrders([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setErr("");
        const { data } = await axios.get(ORDERS_URL, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const list = Array.isArray(data?.orders) ? data.orders : [];
        if (mounted) {
          setOrders(list);
          
          // Auto-select order if orderId is provided in URL
          if (orderIdFromUrl && list.length > 0) {
            const orderToSelect = list.find(
              (o) => String(o.id) === String(orderIdFromUrl) || 
                     String(o.order_id) === String(orderIdFromUrl)
            );
            if (orderToSelect) {
              setSelectedOrder(orderToSelect);
            }
          }
        }
      } catch (e) {
        if (mounted) {
          setErr(
            e?.response?.data?.message || e?.message || "Failed to load orders."
          );
          setOrders([]);
        }
      } finally {
        mounted && setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderIdFromUrl]);

  // Filter orders based on current tab
  const filtered = useMemo(() => {
    if (tab === "all") return orders;
    if (tab === "completed") {
      return orders.filter(
        (o) => String(o.order_status).toLowerCase() === "delivered"
      );
    }
    // pending
    return orders.filter(
      (o) => String(o.order_status).toLowerCase() === "pending"
    );
  }, [tab, orders]);

  // Update pagination info when filtered orders change
  useEffect(() => {
    const total = filtered.length;
    setTotalItems(total);
    setTotalPages(Math.ceil(total / itemsPerPage));
    
    // Reset to page 1 if current page is beyond available pages
    if (currentPage > Math.ceil(total / itemsPerPage)) {
      setCurrentPage(1);
    }
  }, [filtered, itemsPerPage, currentPage]);

  // Get paginated orders for current page
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  }, [filtered, currentPage, itemsPerPage]);

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
  };

  const handleBackFromOrderDetails = () => {
    setSelectedOrder(null);
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Handle tab change with pagination reset
  const handleTabChange = (newTab) => {
    setTab(newTab);
    setCurrentPage(1); // Reset to first page when tab changes
  };

  // Show OrderDetails component if an order is selected
  if (selectedOrder) {
    return (
      <OrderSummary order={selectedOrder} onBack={handleBackFromOrderDetails} />
    );
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl shadow-md p-5">
        {/* Tabs */}
        <div className="inline-flex bg-gray-100 rounded-full p-1 mb-5">
          {[
            { key: "all", label: "All" },
            { key: "pending", label: "Pending" },
            { key: "completed", label: "Completed" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => handleTabChange(t.key)}
              className={`px-4 py-2 text-sm rounded-full transition ${
                tab === t.key ? "bg-[#273e8e] text-white" : "text-gray-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-gray-500 text-sm">Loading orders…</div>
        ) : err ? (
          <div className="text-red-600 text-sm">{err}</div>
        ) : filtered.length === 0 ? (
          <div className="text-gray-500 text-sm">No orders to show.</div>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedOrders.map((o) => {
              const badge = statusBadge(o.order_status);
              return (
                <button
                  key={o.id}
                  onClick={() => handleOrderClick(o)}
                  className="w-full text-left bg-white border-1 border-gray-300 rounded-xl px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-indigo-50 flex items-center justify-center">
                      <PiShoppingCartSimple
                        className="text-indigo-600"
                        size={20}
                      />
                    </div>
                    <div>
                      <div className="text-sm font-medium">
                        {o.order_number || `ORD-${o.id}`}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {formatDate(o.created_at)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[#273e8e] font-semibold text-sm">
                      {formatNGN(o.total_price)}
                    </div>
                    <span
                      className={`mt-1 inline-block text-[10px] px-2 py-[2px] rounded-full ${badge.cls}`}
                    >
                      {badge.text}
                    </span>
                  </div>
                </button>
              );
            })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 rounded-lg text-sm ${
                          currentPage === pageNum
                            ? "bg-[#273e8e] text-white"
                            : "border border-gray-300 hover:bg-gray-50"
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
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}

            {/* Results Info */}
            <div className="text-center text-sm text-gray-500 mt-4">
              Showing {paginatedOrders.length} of {totalItems} orders
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
