import React, { useMemo, useState, useEffect } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { assets } from "../../assets/data";
import API, { BASE_URL } from "../../config/api.config";
import axios from "axios";
// Helper function to map API transaction to component format
const mapApiTransaction = (apiTx) => {
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateString;
    }
  };

  return {
    id: apiTx.id,
    title: apiTx.title,
    date: formatDate(apiTx.transacted_at),
    dateISO: apiTx.transacted_at,
    amount: parseFloat(apiTx.amount),
    status: apiTx.status,
    kind: apiTx.type === "deposit" ? "deposit" : "withdrawal",
    paymentType: apiTx.title,
    txnId: apiTx.tx_id || apiTx.reference || `TXN-${apiTx.id}`,
    method: apiTx.method,
    user: apiTx.user,
  };
};

const formatNaira = (v) =>
  typeof v === "number"
    ? `₦${v.toLocaleString("en-NG")}`
    : `₦${String(v || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

const formatPrettyDate = (iso, fallback) => {
  try {
    const d = new Date(iso);
    const opts = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return `${d.toLocaleDateString("en-US", opts)}`
      .replace(",", "")
      .replace(" at", " -");
  } catch {
    return fallback || "";
  }
};

const FieldRow = ({ label, value, isLink }) => (
  <div className="flex items-center justify-between gap-4 text-[13px] sm:text-sm py-3 px-4 bg-white rounded-xl border border-gray-200">
    <span className="text-gray-500">{label}</span>
    <span
      className={`font-medium truncate ${
        isLink ? "text-[#273e8e] underline underline-offset-2" : "text-gray-800"
      }`}
      title={String(value || "")}
    >
      {value || "—"}
    </span>
  </div>
);

const BottomSheet = ({ open, onClose, tx }) => {
  const isWithdrawal = tx?.kind === "withdrawal";
  const title = isWithdrawal ? "Withdrawal Successful" : "Deposit Successful";

  return (
    <>
      {/* Web Version - Centered Modal */}
      <div className="hidden sm:block">
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${
            open
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="bg-white rounded-2xl shadow-lg w-[400px] max-w-[90vw] relative">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-md font-semibold text-gray-900">Details</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Success Icon */}
              <div className="flex flex-col items-center mb-6">
                <img src={assets.tick} alt="tick" className="w-20 h-20" />
                <h3 className="text-md font-bold text-gray-900 mt-2">{title}</h3>
              </div>

              {/* Transaction Details */}
              <div className="space-y-4">
                <div className="flex justify-between items-center py-0">
                  <span className="text-gray-600 text-sm">Amount:</span>
                  <span
                    className={`font-semibold text-sm ${
                      tx?.kind === "deposit" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {tx?.kind === "deposit" ? "+" : "-"}
                    {formatNaira(tx?.amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-0">
                  <span className="text-gray-600 text-sm">Payment type:</span>
                  <span className="text-gray-900 text-sm">
                    {tx?.paymentType || tx?.title}
                  </span>
                </div>
                <div className="flex justify-between items-center py-0">
                  <span className="text-gray-600 text-sm">Transaction ID:</span>
                  <span className="text-gray-900 font-mono text-sm">
                    {tx?.txnId || "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-0">
                  <span className="text-gray-600 text-sm">Method:</span>
                  <span className="text-gray-900">{tx?.method || "—"}</span>
                </div>
                <div className="flex justify-between items-center py-0">
                  <span className="text-gray-600 text-sm">Status:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      tx?.status.toLowerCase() === "completed" ||
                      tx?.status.toLowerCase() === "paid"
                        ? "bg-green-100 text-green-800"
                        : tx?.status.toLowerCase() === "failed"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {tx?.status}
                  </span>
                </div>
                <div className="flex justify-between items-center py-0">
                  <span className="text-gray-600 text-sm">Date:</span>
                  <span className="text-gray-900 text-sm">
                    {formatPrettyDate(tx?.dateISO, tx?.date)}
                  </span>
                </div>
                {tx?.user && (
                  <div className="flex justify-between items-center py-0">
                    <span className="text-gray-600 text-sm">User:</span>
                    <span className="text-gray-900 text-sm">
                      {tx.user.first_name} {tx.user.sur_name}
                    </span>
                  </div>
                )}
              </div>

              {/* Extra for withdrawals */}
              {isWithdrawal && (
                <div className="space-y-4 mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center py-0">
                    <span className="text-gray-600 text-sm">Account Name:</span>
                    <span className="text-gray-900">
                      {tx?.accountName || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-0">
                    <span className="text-gray-600 text-sm">
                      Account number:
                    </span>
                    <span className="text-gray-900">
                      {tx?.accountNumber || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-0">
                    <span className="text-gray-600 text-sm">Bank Name:</span>
                    <span className="text-gray-900 text-sm">
                      {tx?.bankName || "—"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Version - Bottom Sheet */}
      <div className="sm:hidden block">
        <div
          className={`fixed inset-x-0 bottom-0 z-50 transform transition-transform duration-300 ${
            open ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="mx-auto w-full max-w-sm">
            <div className="bg-white rounded-t-2xl shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900 flex-1 text-center">
                  Details
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors absolute right-8"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Success Icon */}

                <div className="flex justify-center items-center">
                  <img src={assets.tick} alt="tick" className="w-20 h-20" />
                </div>

                {/* Transaction Details */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-0 border-b border-gray-100">
                    <span className="text-xs text-gray-600">Amount:</span>
                    <span
                      className={`font-semibold text-sm ${
                        tx?.kind === "deposit"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {tx?.kind === "deposit" ? "+" : "-"}
                      {formatNaira(tx?.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-0 border-b border-gray-100">
                    <span className="text-xs text-gray-600">Payment type:</span>
                    <span className="text-gray-900 text-xs">
                      {tx?.paymentType || tx?.title}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-0 border-b border-gray-100">
                    <span className="text-xs text-gray-600">
                      Transaction ID:
                    </span>
                    <span className="text-gray-900 font-mono text-xs">
                      {tx?.txnId || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-0 border-b border-gray-100">
                    <span className="text-xs text-gray-600">Method:</span>
                    <span className="text-gray-900 text-xs">
                      {tx?.method || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-0 border-b border-gray-100">
                    <span className="text-xs text-gray-600">Status:</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        tx?.status.toLowerCase() === "completed" ||
                        tx?.status.toLowerCase() === "paid"
                          ? "bg-green-100 text-green-800"
                          : tx?.status.toLowerCase() === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {tx?.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-0 border-b border-gray-100">
                    <span className="text-xs text-gray-600">Date:</span>
                    <span className="text-gray-900 text-xs">
                      {formatPrettyDate(tx?.dateISO, tx?.date)}
                    </span>
                  </div>
                  {tx?.user && (
                    <div className="flex justify-between items-center py-0">
                      <span className="text-xs text-gray-600">User:</span>
                      <span className="text-gray-900 text-xs">
                        {tx.user.first_name} {tx.user.sur_name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Extra for withdrawals */}
                {isWithdrawal && (
                  <div className="space-y-2 mt-4 pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center py-0 border-b border-gray-100">
                      <span className="text-xs text-gray-600">
                        Account Name:
                      </span>
                      <span className="text-gray-900 text-xs">
                        {tx?.accountName || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-0 border-b border-gray-100">
                      <span className="text-xs text-gray-600">
                        Account number:
                      </span>
                      <span className="text-gray-900 text-xs">
                        {tx?.accountNumber || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-0">
                      <span className="text-xs text-gray-600">Bank Name:</span>
                      <span className="text-gray-900 text-xs">
                        {tx?.bankName || "—"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const TransactionHistory = () => {
  const [selectedTx, setSelectedTx] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Filter state
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch all transactions from API (since API doesn't support pagination)
  const fetchTransactions = async (type = "all", status = "all") => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");
      const params = new URLSearchParams();

      // Add filters if not "all"
      if (type !== "all") {
        params.append("type", type);
      }
      if (status !== "all") {
        params.append("status", status);
      }

      const { data } = await axios.get(`${API.Transaction_History}?${params}`, {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (data.status) {
        const mappedTransactions = data.transactions.map(mapApiTransaction);
        setTransactions(mappedTransactions);

        // Calculate pagination info based on all transactions
        const total = mappedTransactions.length;
        setTotalItems(total);
        setTotalPages(Math.ceil(total / itemsPerPage));
      } else {
        setError(data.message || "Failed to fetch transactions");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load transactions"
      );
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Load transactions on component mount and when filters change
  useEffect(() => {
    fetchTransactions(typeFilter, statusFilter);
  }, [typeFilter, statusFilter]);

  // Handle filter changes
  const handleTypeFilterChange = (e) => {
    const newType = e.target.value;
    setTypeFilter(newType);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleStatusFilterChange = (e) => {
    const newStatus = e.target.value;
    setStatusFilter(newStatus);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Filter transactions based on current filters
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Apply filters
    if (typeFilter !== "all") {
      filtered = filtered.filter((tx) => tx.kind === typeFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (tx) => tx.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    return filtered;
  }, [transactions, typeFilter, statusFilter]);

  // Update pagination info when filtered transactions change
  useEffect(() => {
    const total = filteredTransactions.length;
    setTotalItems(total);
    setTotalPages(Math.ceil(total / itemsPerPage));

    // Reset to page 1 if current page is beyond available pages
    if (currentPage > Math.ceil(total / itemsPerPage)) {
      setCurrentPage(1);
    }
  }, [filteredTransactions, itemsPerPage, currentPage]);

  // Get paginated transactions for current page
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTransactions.slice(startIndex, endIndex);
  }, [filteredTransactions, currentPage, itemsPerPage]);

  return (
    <div className="bg-white rounded-2xl p-6 w-full">
      {/* Filters */}
      <div className="flex gap-2 justify-between items-center mb-5 border border-gray-300 rounded-2xl p-3">
        <div className="flex gap-4 w-full">
          {/* Type Filter */}
          <div className="relative w-1/2">
            <select
              value={typeFilter}
              onChange={handleTypeFilterChange}
              className="w-full appearance-none outline-none rounded-md px-3 py-0 text-sm text-gray-600"
            >
              <option value="all">All Types</option>
              <option value="deposit">Incoming</option>
              <option value="withdrawal">Outgoing</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none w-5 h-5" />
          </div>
          <div className="h-6 w-[2px] flex justify-center mt-[6px] items-center bg-black"></div>
          {/* Status Filter */}
          <div className="relative w-1/2">
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="w-full appearance-none outline-none rounded-md px-3 py-0 text-sm text-gray-600"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500">Loading transactions...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex justify-center items-center py-8">
          <div className="text-red-500 text-center">
            <p>{error}</p>
            <button
              onClick={() => fetchTransactions(typeFilter, statusFilter)}
              className="mt-2 text-[#273e8e] hover:underline"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Transactions List */}
      {!loading && !error && (
        <>
          <div className="space-y-3">
            {paginatedTransactions.map((tx) => (
              <button
                type="button"
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="w-full text-left flex justify-between border-gray-300 border items-center bg-[#ffffff] rounded-2xl px-4 py-3 transition hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#273e8e]/30"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-full p-2 ${
                      tx.kind === "deposit"
                        ? "bg-[#00800033] text-[#008000]"
                        : "bg-[#ff000033] text-[#ff0000]"
                    }`}
                  >
                    <ArrowUpRight size={23} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm text-gray-700">{tx.title}</h4>
                    <p className="text-[10px]">{tx.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm ${
                      tx.kind === "deposit"
                        ? "text-[#008000]"
                        : "text-[#ff0000]"
                    }`}
                  >
                    {tx.kind === "deposit" ? "+" : "-"}
                    {formatNaira(tx.amount)}
                  </p>
                  <span
                    className={`text-[8px] px-1 py-1.5 rounded-md ${
                      tx.status.toLowerCase() === "completed" ||
                      tx.status.toLowerCase() === "paid"
                        ? "bg-[#cce6cc] text-[#008000]"
                        : tx.status.toLowerCase() === "failed"
                        ? "bg-[#ffcccc] text-[#ff0000]"
                        : "bg-[#fff3cd] text-[#856404]"
                    }`}
                  >
                    {tx.status}
                  </span>
                </div>
              </button>
            ))}
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
                      className={`px-3 py-0 rounded-lg text-sm ${
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
            Showing {paginatedTransactions.length} of {totalItems} transactions
          </div>
        </>
      )}

      {/* Bottom Sheet Modal */}
      <BottomSheet
        open={!!selectedTx}
        onClose={() => setSelectedTx(null)}
        tx={selectedTx}
      />
    </div>
  );
};

export default TransactionHistory;
