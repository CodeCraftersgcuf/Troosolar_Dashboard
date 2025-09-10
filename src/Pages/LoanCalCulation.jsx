
import React, { useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import SideBar from "../Component/SideBar";
import { Input } from "../Component/Input";
import LoanRepaymentCard from "../Component/LoanRepaymentCard";
import { Link, useNavigate } from "react-router-dom";
import { DurationDropDown } from "../Component/DurationDropDown";
import axios from "axios";
import API from "../config/api.config";

const DURATION_OPTIONS = ["3 month", "6 month", "9 month", "12 month", "1 Year", "2 Year"];

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

const LoanCalculation = () => {
  const [productAmount, setProductAmount] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [repaymentLabel, setRepaymentLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [result, setResult] = useState(null);

  const navigate = useNavigate();
  const repaymentMonths = useMemo(() => asMonths(repaymentLabel), [repaymentLabel]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    else delete axios.defaults.headers.common.Authorization;
  }, []);

  const handleDurationChange = (eOrVal) => {
    const val = typeof eOrVal === "string" ? eOrVal : eOrVal?.target?.value ?? "";
    setRepaymentLabel(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      // put response into card
      const calc = data?.data ?? data;
      setResult(calc);
      sessionStorage.setItem("last_calculation", JSON.stringify(calc));
      // stay on page; show Continue button under the card
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
        setError(resp?.message || resp?.error || "Loan calculation failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full overflow-clip">
      <SideBar />

      <div className="flex-1">
        {/* Topbar */}
        <div className="flex gap-3 items-center h-[90px] bg-white justify-end px-5 sm:pr-10 py-5">
          <div className="rounded-lg flex justify-center items-center shadow-md h-10 w-10">
            <Bell size={24} />
          </div>
          <div className="bg-[#e9e9e9] h-12 w-12 rounded-full flex items-center justify-center">
            <p className="text-lg text-[#909090] font-bold">QA</p>
          </div>
          <p className="text-[#000000] text-lg hidden sm:block">Qamardeen AbdulMalik</p>
        </div>

        {/* Form + Card */}
        <div className="bg-[#F5F7FF] h-full w-full p-6 sm:p-10">
          <h1 className="text-[26px] font-medium tracking-tight">Loan Calculation</h1>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Left: form */}
            <form onSubmit={handleSubmit} className="w-full md:w-1/2 rounded-lg">
              <Input
                id="productAmount"
                label="How much is the product you are purchasing"
                placeholder="Enter product amount"
                type="number"
                value={productAmount}
                onChange={(e) => setProductAmount(e.target.value)}
              />
              {fieldErrors?.product_amount && (
                <p className="text-red-600 text-sm -mt-3 mb-2">{fieldErrors.product_amount[0]}</p>
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
                <p className="text-red-600 text-sm -mt-3 mb-2">{fieldErrors.loan_amount[0]}</p>
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
                <p className="text-red-600 text-sm -mt-3 mb-2">{fieldErrors.repayment_duration[0]}</p>
              )}

              {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

              <div className="flex justify-center items-center gap-4">
                <Link
                  to={"/linkAccount"}
                  className="mt-4 text-center py-4 w-[40%] px-10 bg-white border text-black rounded-full transition duration-200"
                >
                  Back
                </Link>

                {/* ⬇️ Calculate instead of Proceed */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 py-4 w-full px-10 bg-[#273e8e] text-white rounded-full hover:bg-[#1f2f6d] transition duration-200 disabled:opacity-60"
                >
                  {loading ? "Calculating..." : "Calculate"}
                </button>
              </div>
            </form>

            {/* Right: card + Continue button */}
            <div className="w-full md:w-1/2 h-full flex flex-col items-start justify-start gap-4">
              <LoanRepaymentCard calculation={result} />

              {/* Show continue only when we have a calculation */}
              <button
                type="button"
                disabled={!result}
                onClick={() => navigate("/creditscore", { state: { calculation: result } })}
                className="py-4 w-full px-10 bg-[#273e8e] text-white rounded-full hover:bg-[#1f2f6d] transition duration-200 disabled:opacity-60"
              >
                Continue to Credit Page
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanCalculation;
