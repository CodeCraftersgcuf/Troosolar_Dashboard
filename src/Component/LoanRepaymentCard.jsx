// src/Component/LoanRepaymentCard.jsx
import React from "react";

const fmtN = (n) => (n == null ? "—" : `N${Number(n).toLocaleString()}`);

const fmtDuration = (m) =>
  !m
    ? "—"
    : m % 12 === 0
    ? `${m / 12} Year${m === 12 ? "" : "s"}`
    : `${m} months`;

const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString(); // keep simple; you can re-use your fancy ordinal if you want
};

const Row = ({ label, value }) => (
  <>
    <div className="flex justify-between">
      <span className="text-gray-600 text-[14px]">{label}</span>
      <span className="text-[14px]">{value}</span>
    </div>
    <hr className="text-gray-400" />
  </>
);

/**
 * Props:
 * - calculation: OfferedLoanCalculation from /offered-loan-calculation
 */
const LoanRepaymentCard = ({ calculation }) => {
  // Use offered loan calculation data as primary source
  const base = calculation || {};
  const merged = {
    product_amount: base.loan_amount, // Using loan_amount as product amount
    loan_amount: base.loan_amount,
    repayment_duration: base.repayment_duration,
    monthly_payment: base.total_amount ? Math.round(base.total_amount / base.repayment_duration) : null, // Calculate monthly payment
    interest_percentage: base.interest_rate,
    repayment_date: base.created_at, // Using created_at as repayment date
    down_payment: base.down_payment,
    total_amount: base.total_amount,
    loan_limit: base.loan_limit,
    credit_score: base.credit_score,
    status: base.status,
  };

  const hasAny = Object.keys(merged).some((k) => merged[k] != null);

  return (
    <div className="w-full rounded-[10px] bg-[#FFFF001A] /10 border-dashed border-[2px] border-[#929295] p-5">
      <h2 className="text-[17px] mb-2">Loan Repayment Calculation</h2>

      {!hasAny ? (
        <p className="text-sm text-gray-500">
          Calculate your loan first to see details here.
        </p>
      ) : (
        <div className="flex flex-col gap-3 text-sm">
          <Row label="Loan Amount" value={fmtN(merged.loan_amount)} />
          <Row
            label="Duration"
            value={fmtDuration(merged.repayment_duration)}
          />
          <Row label="Monthly Payment" value={fmtN(merged.monthly_payment)} />
          <Row
            label="Interest Rate"
            value={
              merged.interest_percentage != null
                ? `${merged.interest_percentage}%`
                : "—"
            }
          />
          <Row label="Down Payment" value={fmtN(merged.down_payment)} />
          <Row label="Total Amount" value={fmtN(merged.total_amount)} />
          
          {merged.credit_score && (
            <Row label="Credit Score" value={merged.credit_score} />
          )}
          
          <div className="flex justify-between">
            <span className="text-gray-600 text-[14px]">Status</span>
            <span className="text-[14px] capitalize">
              {merged.status || "—"}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600 text-[14px]">Created Date</span>
            <span className="text-[14px]">
              {fmtDate(merged.repayment_date)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanRepaymentCard;
