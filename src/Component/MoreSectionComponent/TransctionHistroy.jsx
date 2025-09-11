import React, { useMemo, useState } from "react";
import { ArrowUpRight, ChevronDown, Check, X } from "lucide-react";
import { assets } from "../../assets/data";

/** You can keep your original list; I added a few fields used by the modal.
 * - kind: "deposit" | "withdrawal"
 * - paymentType: label under "Payment type"
 * - txnId, dateISO: for details
 * - bank fields are optional and only shown for withdrawals
 */
const transactions = [
  {
    title: "Wallet deposit",
    date: "15-May-25, 09:22 AM",
    dateISO: "2025-05-15T09:22:00",
    amount: 4040000,
    status: "Completed",
    kind: "deposit",
    paymentType: "Wallet deposit",
    txnId: "xkcnke34k5kmvkrkmkm",
  },
  {
    title: "Referral Bonus",
    date: "15-May-25, 09:22 AM",
    dateISO: "2025-05-15T09:22:00",
    amount: 4040000,
    status: "Completed",
    kind: "withdrawal",
    paymentType: "Referral Bonus",
    txnId: "xkcnke34k5kmvkrkmkm",
    bankName: "Access Bank",
    accountName: "Qamardeen Malik",
    accountNumber: "1294933959",
  },
  // ...your existing rows will still render; the modal will gracefully
  // fallback if some optional fields are missing.
];

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
              <h2 className="text-lg font-semibold text-gray-900">Details</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Success Icon */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                  <Check className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{title}</h3>
              </div>

              {/* Transaction Details */}
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Amount:</span>
                  <span className="text-blue-600 font-semibold">
                    {formatNaira(tx?.amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Payment type:</span>
                  <span className="text-gray-900">
                    {tx?.paymentType || tx?.title}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Transaction id:</span>
                  <span className="text-gray-900 font-mono text-sm">
                    {tx?.txnId || "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Date:</span>
                  <span className="text-gray-900">
                    {formatPrettyDate(tx?.dateISO, tx?.date)}
                  </span>
                </div>
              </div>

              {/* Extra for withdrawals */}
              {isWithdrawal && (
                <div className="space-y-4 mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Account Name:</span>
                    <span className="text-gray-900">
                      {tx?.accountName || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Account number:</span>
                    <span className="text-gray-900">
                      {tx?.accountNumber || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Bank Name:</span>
                    <span className="text-gray-900">{tx?.bankName || "—"}</span>
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
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-xs text-gray-600">Amount:</span>
                    <span className="text-blue-600 font-semibold text-sm">
                      {formatNaira(tx?.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-xs text-gray-600">Payment type:</span>
                    <span className="text-gray-900 text-xs">
                      {tx?.paymentType || tx?.title}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-xs text-gray-600">
                      Transaction id:
                    </span>
                    <span className="text-gray-900 font-mono text-xs">
                      {tx?.txnId || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xs text-gray-600">Date:</span>
                    <span className="text-gray-900 text-xs">
                      {formatPrettyDate(tx?.dateISO, tx?.date)}
                    </span>
                  </div>
                </div>

                {/* Extra for withdrawals */}
                {isWithdrawal && (
                  <div className="space-y-2 mt-4 pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-xs text-gray-600">
                        Account Name:
                      </span>
                      <span className="text-gray-900 text-xs">
                        {tx?.accountName || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-xs text-gray-600">
                        Account number:
                      </span>
                      <span className="text-gray-900 text-xs">
                        {tx?.accountNumber || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
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

  // keep your filters as-is (not wired here)
  const list = useMemo(() => transactions, []);

  return (
    <div className="bg-white rounded-2xl p-6 w-full">
      <div className="flex gap-2 justify-between items-center mb-5 border border-gray-300 rounded-2xl p-3">
        <div className="flex gap-4 w-full">
          {/* First Select */}
          <div className="relative w-1/2">
            <select className="w-full appearance-none outline-none rounded-md px-3 py-2 text-sm text-gray-600 ">
              <option>Incoming</option>
              <option>Outgoing</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none w-5 h-5" />
          </div>
          <div className="h-6 w-[2px] flex justify-center mt-[6px] items-center bg-black"></div>
          {/* Second Select */}
          <div className="relative w-1/2">
            <select className="w-full appearance-none outline-none rounded-md px-3 py-2 text-sm text-gray-600">
              <option>Successful</option>
              <option>Failed</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {list.map((tx, idx) => (
          <button
            type="button"
            key={idx}
            onClick={() => setSelectedTx(tx)}
            className="w-full text-left flex justify-between border-gray-300 border items-center bg-[#ffffff] rounded-2xl px-4 py-3 transition hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#273e8e]/30"
          >
            <div className="flex items-center gap-3">
              <div className="bg-[#00800033] text-[#008000] rounded-full p-2">
                <ArrowUpRight size={23} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm text-gray-700">{tx.title}</h4>
                <p className="text-[10px]">{tx.date}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#273e8e]">{formatNaira(tx.amount)}</p>
              <span className="text-[8px] bg-[#cce6cc] text-[#008000] px-1 py-1.5 rounded-md">
                {tx.status}
              </span>
            </div>
          </button>
        ))}
      </div>

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
