import React from "react";

const RepaymentHistorySection = ({
  currentMonth = [],
  history = [],
  hasOverdue = false,
}) => {
  const formatMoney = (n) =>
    n != null ? `₦${Number(n).toLocaleString()}` : "—";

  const formatDate = (d) => {
    if (!d) return "—";
    const date = new Date(d);
    return isNaN(date.getTime())
      ? d
      : date.toLocaleDateString(undefined, {
          year: "2-digit",
          month: "short",
          day: "2-digit",
        });
  };

  return (
    <div className="relative">
      {/* Vertical dashed line (behind cards) */}
      <div className="absolute left-16 top-0 h-full border-l-[1px] border-dashed border-gray-600 z-0"></div>

      {/* Current Month (next repayment) */}
      {currentMonth.map((item) => (
        <div
          key={item.id}
          className={`relative h-[100px] mt-10 flex justify-between items-center w-full py-3 px-2 bg-white border-gray-300 border rounded-2xl z-10 ${
            item.is_overdue ? "shadow-md shadow-[#FF0000]" : ""
          }`}
        >
          <div className="flex items-center">
            <div className="ml-4">
              <span className="lg:text-sm text-xs">Next Repayment</span>
              <h1
                className={`lg:text-lg text-sm font-medium ${
                  item.is_overdue ? "text-[#FF0000]" : "text-[#273e8e]"
                }`}
              >
                {item.is_overdue
                  ? "Overdue"
                  : item.status === "paid"
                  ? `Paid - ${formatDate(item.paid_at)}`
                  : formatDate(item.payment_date)}
              </h1>
            </div>
          </div>

          {/* Countdown Placeholder (only if pending & not overdue) */}
          {item.status === "pending" && !item.is_overdue && (
            <div className="flex items-center gap-4">
              {/* Days */}
              <div className="w-[60px] h-[60px] flex flex-col items-center justify-center border border-[#ccc] rounded-[12px] shadow-[0_2px_0_#ccc]">
                <p className="text-[20px] font-bold leading-none">00</p>
                <p className="lg:text-xs text-xs">Days</p>
              </div>

              {/* Colon */}
              <div className="text-[24px] font-extrabold">:</div>

              {/* Hours */}
              <div className="w-[60px] h-[60px] flex flex-col items-center justify-center border border-[#ccc] rounded-[12px] shadow-[0_2px_0_#ccc]">
                <p className="text-[20px] font-bold leading-none">00</p>
                <p className="lg:text-xs text-xs">Hours</p>
              </div>
            </div>
          )}

          <h1 className="lg:text-sm text-xs font-medium text-[#273e8e]">
            {formatMoney(item.amount)}
          </h1>
        </div>
      ))}

      {/* History (past repayments) */}
      {history.map((item) => (
        <div
          key={item.id}
          className="relative h-[100px] mt-10 flex justify-between items-center w-full py-3 px-2 bg-white border-gray-300 border rounded-2xl z-10"
        >
          <div className="flex ">
            <div className="ml-4">
              <span className="lg:text-sm text-xs">Repayment</span>
              <h1 className="lg:text-lg text-sm font-medium text-[#273e8e]">
                {item.status === "paid"
                  ? `Paid - ${formatDate(item.paid_at)}`
                  : formatDate(item.payment_date)}
              </h1>
            </div>
          </div>
          <h1 className="lg:text-sm text-xs font-medium text-[#273e8e]">
            {formatMoney(item.amount)}
          </h1>
        </div>
      ))}
    </div>
  );
};

export default RepaymentHistorySection;
