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
 * - calculation: LoanCalculation from /loan-calculation
 * - monoCalc: MonoLoanCalculation from /mono-loan/{id} (with loanCalculation relation)
 */
const LoanRepaymentCard = ({ calculation, monoCalc }) => {
  // prefer mono values if present (monoCalc may update amounts)
  const base = monoCalc?.loanCalculation || calculation || {};
  const merged = {
    product_amount: base.product_amount,
    loan_amount: monoCalc?.loan_amount ?? base.loan_amount,
    repayment_duration: monoCalc?.repayment_duration ?? base.repayment_duration,
    monthly_payment: base.monthly_payment,
    interest_percentage: base.interest_percentage,
    repayment_date: base.repayment_date,
    down_payment: monoCalc?.down_payment, // mono only
  };

  const hasAny = Object.keys(merged).some((k) => merged[k] != null);

  return (
    <div className="w-full rounded-[10px] bg-[#bfc9f0] /10 border-dashed border-[2px] border-[#929295] p-5">
      <h2 className="text-[17px] mb-2">Loan Repayment Calculation</h2>

      {!hasAny ? (
        <p className="text-sm text-gray-500">
          Calculate your loan first to see details here.
        </p>
      ) : (
        <div className="flex flex-col gap-3 text-sm">
          <Row label="Product Amount" value={fmtN(merged.product_amount)} />
          <Row label="Loan Amount" value={fmtN(merged.loan_amount)} />
          <Row
            label="Duration"
            value={fmtDuration(merged.repayment_duration)}
          />
          <Row label="Monthly Payment" value={fmtN(merged.monthly_payment)} />
          <Row
            label="Interest Percentage"
            value={
              merged.interest_percentage != null
                ? `${merged.interest_percentage}% Monthly`
                : "—"
            }
          />
          {/* New: Down Payment from MONO */}
          <Row label="Down Payment (Mono)" value={fmtN(merged.down_payment)} />

          <div className="flex justify-between">
            <span className="text-gray-600 text-[14px]">Repayment Date</span>
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
