// // src/Component/LoanRepaymentCard.jsx
// import React from "react";

// // format helpers
// const formatNaira = (n) =>
//   typeof n === "number"
//     ? `N${n.toLocaleString()}`
//     : n
//     ? `N${Number(n).toLocaleString()}`
//     : "—";

// const ordinal = (d) => {
//   const s = ["th", "st", "nd", "rd"], v = d % 100;
//   return d + (s[(v - 20) % 10] || s[v] || s[0]);
// };
// const formatDate = (iso) => {
//   if (!iso) return "—";
//   const dt = new Date(iso);
//   const day = ordinal(dt.getDate());
//   const mon = dt.toLocaleString("en-GB", { month: "short" }); // e.g., Dec
//   const yr = dt.getFullYear();
//   return `${day} ${mon}., ${yr}`;
// };
// const formatDuration = (months) => {
//   if (!months) return "—";
//   const m = Number(months);
//   return m % 12 === 0 ? `${m / 12} Year${m === 12 ? "" : "s"}` : `${m} months`;
// };

// const Row = ({ label, value }) => (
//   <>
//     <div className="flex justify-between">
//       <span className="text-gray-600 text-[14px]">{label}</span>
//       <span className="text-[14px]">{value}</span>
//     </div>
//     <hr className="text-gray-400" />
//   </>
// );

// const LoanRepaymentCard = ({ calculation }) => {
//   // expected shape from your API controller:
//   // {
//   //   product_amount, loan_amount, repayment_duration,
//   //   monthly_payment, interest_percentage, repayment_date, ...
//   // }
//   const c = calculation || {};

//   return (
//     <div className="w-full max-h-full rounded-[10px] bg-[#ffff00]/10 border-dashed border-[2px] border-[#E8A91D] p-5 flex flex-col gap-4">
//       <h2 className="text-[17px]">Loan Repayment Calculation</h2>

//       {!calculation ? (
//         <p className="text-sm text-gray-500">
//           Fill the form and click <strong>Proceed</strong> to see your calculation.
//         </p>
//       ) : (
//         <div className="flex flex-col gap-3 text-sm">
//           <Row label="Product Amount" value={formatNaira(c.product_amount)} />
//           <Row label="Loan Amount" value={formatNaira(c.loan_amount)} />
//           <Row label="Duration" value={formatDuration(c.repayment_duration)} />
//           <Row label="Monthly Payment" value={formatNaira(c.monthly_payment)} />
//           <Row
//             label="Interest Percentage"
//             value={
//               c.interest_percentage != null
//                 ? `${c.interest_percentage}% Monthly`
//                 : "—"
//             }
//           />
//           <div className="flex justify-between">
//             <span className="text-gray-600 text-[14px]">Repayment Date</span>
//             <span className="text-[14px]">{formatDate(c.repayment_date)}</span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default LoanRepaymentCard;

// src/Component/LoanRepaymentCard.jsx
import React from "react";

const fmtN = (n) =>
  n == null ? "—" : `N${Number(n).toLocaleString()}`;

const fmtDuration = (m) =>
  !m ? "—" : (m % 12 === 0 ? `${m/12} Year${m===12 ? "" : "s"}` : `${m} months`);

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
    <div className="w-full rounded-[10px] bg-[#ffff00]/10 border-dashed border-[2px] border-[#E8A91D] p-5">
      <h2 className="text-[17px] mb-2">Loan Repayment Calculation</h2>

      {!hasAny ? (
        <p className="text-sm text-gray-500">
          Calculate your loan first to see details here.
        </p>
      ) : (
        <div className="flex flex-col gap-3 text-sm">
          <Row label="Product Amount" value={fmtN(merged.product_amount)} />
          <Row label="Loan Amount" value={fmtN(merged.loan_amount)} />
          <Row label="Duration" value={fmtDuration(merged.repayment_duration)} />
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
            <span className="text-[14px]">{fmtDate(merged.repayment_date)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanRepaymentCard;
