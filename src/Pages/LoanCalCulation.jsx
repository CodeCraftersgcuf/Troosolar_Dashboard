import React, { useEffect, useMemo, useState } from "react";
import { Bell, ChevronLeft } from "lucide-react";
import SideBar from "../Component/SideBar";
import { Input } from "../Component/Input";
import LoanRepaymentCard from "../Component/LoanRepaymentCard";
import { Link, useNavigate } from "react-router-dom";
import { DurationDropDown } from "../Component/DurationDropDown";
import axios from "axios";
import API from "../config/api.config";

const DURATION_OPTIONS = [
  "3 month",
  "6 month",
  "9 month",
  "12 month",
  "1 Year",
  "2 Year",
];

const asMonths = (label) => {
  if (!label) return null;
  const lower = String(label).toLowerCase().trim();
  if (lower.includes("year")) {
    const n = parseInt(lower, 10);
    return isNaN(n) ? null : n * 12;
  }
  const n = parseInt(lower, 10);
  return isNaN(n) ? null : n;
};

const formatNGN = (n) => {
  const num = Number(n) || 0;
  try {
    return `₦${new Intl.NumberFormat("en-NG").format(num)}`;
  } catch {
    return `₦${num}`;
  }
};

const LoanCalculation = () => {
  const [productAmount, setProductAmount] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [repaymentLabel, setRepaymentLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [result, setResult] = useState(null);
  const [finalizing, setFinalizing] = useState(false);

  const navigate = useNavigate();
  const repaymentMonths = useMemo(
    () => asMonths(repaymentLabel),
    [repaymentLabel]
  );

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    else delete axios.defaults.headers.common.Authorization;
  }, []);

  const handleDurationChange = (eOrVal) => {
    const val =
      typeof eOrVal === "string" ? eOrVal : eOrVal?.target?.value ?? "";
    setRepaymentLabel(val);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setError("");
    setFieldErrors({});
    setResult(null);

    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Please login first.");
      navigate("/login");
      return;
    }

    const pAmt = Number(productAmount);
    const lAmt = Number(loanAmount);
    if (!pAmt || pAmt <= 0) return setError("Enter a valid product amount.");
    if (!lAmt || lAmt <= 0) return setError("Enter a valid loan amount.");
    if (!repaymentMonths) return setError("Select a valid repayment duration.");

    setLoading(true);
    try {
      const payload = {
        product_amount: pAmt,
        loan_amount: lAmt,
        repayment_duration: repaymentMonths,
      };
      const { data } = await axios.post(API.LOAN_CALCULATION, payload, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      const calc = data?.data ?? data;
      setResult(calc);
      sessionStorage.setItem("last_calculation", JSON.stringify(calc));
    } catch (err) {
      const status = err?.response?.status;
      const resp = err?.response?.data;
      if (!err?.response) setError("Network/CORS error. Check server & CORS.");
      else if (status === 401) {
        setError("Session expired. Please login again.");
        localStorage.removeItem("access_token");
        navigate("/login");
      } else if (status === 422 && resp?.errors) {
        setFieldErrors(resp.errors);
        setError(resp.message || "Validation error.");
      } else {
        setError(
          resp?.message ||
            resp?.error ||
            "Loan calculation failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const onContinue = async () => {
    if (!result || !result.id) {
      setError("No calculation result found. Please calculate again.");
      return;
    }

    try {
      setFinalizing(true);
      setError("");

      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Please log in first.");
        navigate("/login");
        return;
      }

      // Call the finalize API with the calculation ID
      const response = await axios.post(
        API.Loan_Calculation_finalize(result.id),
        {},
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Finalize response:", response.data);

      // Redirect to loan page after successful finalization
      navigate("/loan");
    } catch (err) {
      console.error("Error finalizing loan calculation:", err);
      const status = err?.response?.status;
      const resp = err?.response?.data;

      if (status === 401) {
        setError("Session expired. Please login again.");
        localStorage.removeItem("access_token");
        navigate("/login");
      } else {
        setError(
          resp?.message ||
            resp?.error ||
            "Failed to finalize loan calculation. Please try again."
        );
      }
    } finally {
      setFinalizing(false);
    }
  };

  // dynamic yellow notice text
  const pAmt = Number(productAmount) || 0;
  const lAmt = Number(loanAmount) || 0;
  const maxLoan = pAmt * 0.7;
  const yellowText =
    pAmt > 0
      ? `Kindly note that loan amount is 70% of product amount, you are required to pay the remaining 30%, complete the 30% payment by funding your wallet directly with ${formatNGN(
          Math.round(pAmt * 0.3)
        )}`
      : "Kindly note that loan amount is 70% of product amount, you are required to pay the remaining 30%.";

  return (
    <div className="flex min-h-screen w-full overflow-clip">
      <SideBar />

      <div className="flex-1">
        {/* Desktop Topbar */}
        <div className="hidden sm:flex gap-3 items-center h-[90px] bg-white justify-end px-5 sm:pr-10 py-5">
          <div className="rounded-lg flex justify-center items-center shadow-md h-10 w-10">
            <Bell size={24} />
          </div>
          <div className="bg-[#e9e9e9] h-12 w-12 rounded-full flex items-center justify-center">
            <p className="text-lg text-[#909090] font-bold">QA</p>
          </div>
          <p className="text-[#000000] text-lg">Qamardeen AbdulMalik</p>
        </div>

        {/* Mobile header (white, chevron, centered title) */}
        <div className="sm:hidden sticky top-0 z-20 bg-white px-5 pt-5 pb-3 flex items-center justify-center relative border-b border-gray-100">
          <button
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="absolute left-5 h-9 w-9 rounded-full flex items-center justify-center"
          >
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-[16px] font-semibold">Loan Calculation</h1>
        </div>

        {/* Content */}
        <div className="bg-[#F5F7FF] min-h-screen w-full p-5 sm:p-10 pb-28 sm:pb-10">
          {/* Desktop title */}
          <h1 className="hidden sm:block text-[26px] font-medium tracking-tight">
            Loan Calculation
          </h1>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Left: form */}
            <form
              id="loan-calc-form"
              onSubmit={handleSubmit}
              className="w-full md:w-1/2 rounded-lg"
            >
              <Input
                id="productAmount"
                label="How much is the product you want to purchase ?"
                placeholder="Enter product amount"
                type="number"
                value={productAmount}
                onChange={(e) => setProductAmount(e.target.value)}
              />
              {fieldErrors?.product_amount && (
                <p className="text-red-600 text-sm -mt-3 mb-2">
                  {fieldErrors.product_amount[0]}
                </p>
              )}

              <Input
                id="loanAmount"
                label="Loan Amount"
                placeholder="Enter loan amount"
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
              />
              {fieldErrors?.loan_amount && (
                <p className="text-red-600 text-sm -mt-3 mb-2">
                  {fieldErrors.loan_amount[0]}
                </p>
              )}

              <DurationDropDown
                id="duration"
                label="Repayment Duration"
                value={repaymentLabel}
                placeHolder="Select Duration"
                onChange={handleDurationChange}
                options={DURATION_OPTIONS}
              />
              {fieldErrors?.repayment_duration && (
                <p className="text-red-600 text-sm -mt-3 mb-2">
                  {fieldErrors.repayment_duration[0]}
                </p>
              )}

              {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

              {/* Desktop buttons row */}
              <div className="hidden sm:flex justify-center items-center gap-4">
                <Link
                  to={"/linkAccount"}
                  className="mt-4 text-center py-4 w-[40%] px-10 bg-white border text-black rounded-full transition duration-200"
                >
                  Back
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 py-4 w-full px-10 bg-[#273e8e] text-white rounded-full hover:bg-[#1f2f6d] transition duration-200 disabled:opacity-60"
                >
                  {loading ? "Calculating..." : "Calculate"}
                </button>
              </div>
            </form>

            {/* Right: info + card + desktop continue */}
            <div className="w-full md:w-1/2 flex flex-col items-start justify-start gap-4">
              {/* Yellow dashed notice (always visible; mobile style matches mock) */}
              <div className="bg-amber-50 text-amber-700 border border-dashed border-amber-400 rounded-xl p-4 w-full">
                <p className="text-sm leading-relaxed">
                  {yellowText}
                  {pAmt > 0 && lAmt > 0 && (
                    <>
                      {" "}
                      complete the 30% payment by funding your wallet directly
                      with{" "}
                      <span className="font-semibold">
                        {formatNGN(Math.max(pAmt - maxLoan, 0))}
                      </span>
                    </>
                  )}
                </p>
              </div>

              {/* Repayment summary card */}
              <LoanRepaymentCard calculation={result} />

              {/* Desktop "Continue" button (only after result) */}
              <button
                type="button"
                disabled={!result || finalizing}
                onClick={onContinue}
                className="hidden sm:block py-4 w-full px-10 bg-[#273e8e] text-white rounded-full hover:bg-[#1f2f6d] transition duration-200 disabled:opacity-60"
              >
                {finalizing ? "Finalizing..." : "Continue to Credit Page"}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile sticky CTA: Calculate -> Proceed */}
        <div className="sm:hidden fixed left-0 right-0 bottom-24 px-5">
          <button
            form="loan-calc-form"
            type={result ? "button" : "submit"}
            onClick={result ? onContinue : undefined}
            disabled={loading || finalizing}
            className="w-full h-12 rounded-full bg-[#273e8e] text-white disabled:opacity-60"
          >
            {finalizing
              ? "Finalizing..."
              : result
              ? "Proceed"
              : loading
              ? "Calculating..."
              : "Calculate"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoanCalculation;
