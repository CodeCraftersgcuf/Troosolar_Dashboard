// src/Pages/CreditScore.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Bell, ChevronLeft } from "lucide-react";
import SideBar from "../Component/SideBar";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { assets } from "../assets/data";
import Terms from "../Component/Terms";
import LoanCard from "../Component/LoanCard";
import LoanRepaymentCard from "../Component/LoanRepaymentCard";
import TopNavbar from "../Component/TopNavbar";
import axios from "axios";
import API from "../config/api.config";

const CreditScore = () => {
  // shows the Terms screen first; when false, show offer/repayment details
  const [afterTerm, setAfterTerm] = useState(true);
  const [accepted, setAccepted] = useState(false); // mobile: enable Proceed only if checked

  const { state } = useLocation();
  const navigate = useNavigate();

  // Pull calculation from route state, else sessionStorage (from previous screen)
  const calculation = useMemo(() => {
    if (state?.calculation) return state.calculation;
    try {
      const s = sessionStorage.getItem("last_calculation");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  }, [state]);

  const [monoCalc, setMonoCalc] = useState(null);
  const [monoErr, setMonoErr] = useState("");

  useEffect(() => {
    const fetchMono = async () => {
      setMonoErr("");
      setMonoCalc(null);

      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/login");
        return;
      }
      const id = calculation?.id;
      if (!id) return;

      try {
        // ✅ pass a single config object to axios.get
        const { data } = await axios.get(API.MONO_LOAN(id), {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const monoData = data?.data ?? data;
        setMonoCalc(monoData);
        sessionStorage.setItem("last_mono_calc", JSON.stringify(monoData));
      } catch (err) {
        const status = err?.response?.status;
        const resp = err?.response?.data;
        if (status === 401) {
          localStorage.removeItem("access_token");
          navigate("/login");
        } else {
          setMonoErr(resp?.message || "Mono loan calculation failed.");
        }
      }
    };

    fetchMono();
  }, [calculation?.id, navigate]);

  return (
    <>
      {/* ---------------- Desktop / Tablet ---------------- */}
      <div className="sm:flex hidden min-h-full w-full overflow-clip">
        <SideBar />
        <div className="flex-1 flex flex-col">
          <TopNavbar />

          <main className="bg-[#F5F7FF] flex-1 p-6 sm:p-10">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-[26px] font-medium tracking-tight">
                Credit Score
              </h1>
              <Link
                to="/loanCalculate"
                className="text-[#273e8e] underline hover:text-[#1e2f6b]"
              >
                Go Back
              </Link>
            </div>

            <div className="flex flex-row gap-6">
              {/* Left: gauge */}
              <div className="bg-[#273e8e] flex justify-center items-center rounded-2xl w-full lg:w-1/2 aspect-square px-5 ">
                <img
                  src={assets.creditNeedle}
                  className="h-[240px] w-[240] object-contain"
                  alt="Credit Score Meter"
                />
              </div>

              {/* Right: Terms -> Offer */}
              {afterTerm ? (
                <div className="w-1/2">
                  <Terms showFullWidth={true} />
                  <div className="space-y-4 mt-4 pt-4">
                    <label
                      htmlFor="accept-terms"
                      className="flex items-center gap-2 font-medium cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        id="accept-terms"
                        className="h-4 w-4 text-[#273e8e] border-gray-300 rounded"
                        onChange={(e) => setAccepted(e.target.checked)}
                        checked={accepted}
                      />
                      I accept the following terms of data usage
                    </label>
                    <div className="w-full">
                      <button
                        onClick={() => accepted && setAfterTerm(false)}
                        disabled={!accepted}
                        className="px-6 py-5 w-full rounded-full bg-[#273e8e] text-white disabled:opacity-60"
                      >
                        Proceed
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-1/2 space-y-3">
                  <LoanCard />

                  <div className="p-4 border rounded-2xl">
                    {monoErr && (
                      <p className="text-red-600 text-sm mb-2">{monoErr}</p>
                    )}
                    {/* Pass both: original calculation + mono result */}
                    <LoanRepaymentCard
                      calculation={calculation}
                      monoCalc={monoCalc}
                    />
                  </div>

                  <div className="grid grid-cols-2 pb-10 gap-3 pt-2">
                    <Link
                      to="/loanCalculate"
                      className="border text-sm border-[#273e8e] py-4 rounded-full text-[#273e8e] text-center"
                    >
                      Edit Details
                    </Link>
                    <Link
                      to="/uploadDocument"
                      state={{ monoLoanId: monoCalc?.id, monoCalc }}
                      className="py-4 text-center text-sm rounded-full bg-[#273e8e] text-white"
                      onClick={(e) => {
                        if (!monoCalc?.id) {
                          e.preventDefault();
                          setMonoErr("Please wait, preparing your offer…");
                        }
                      }}
                    >
                      Accept Offer
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* -------------------- Mobile View -------------------- */}
      <div className="flex sm:hidden min-h-screen w-full overflow-clip">
        <div className="flex-1 flex flex-col bg-[#F5F7FF]">
          {/* Blue header with chevron + centered title */}
          <div className="bg-[#273e8e] relative pt-5 pb-6">
            <button
              onClick={() => navigate(-1)}
              aria-label="Back"
              className="absolute left-5 top-5 h-9 w-9 rounded-full flex items-center justify-center text-white"
            >
              <ChevronLeft size={22} />
            </button>
            <h1 className="text-white text-center text-[16px] font-semibold">
              Credit Score
            </h1>

            {/* Gauge */}
            <div className="mt-4 flex justify-center">
              <img
                src={assets.creditNeedle}
                alt="Credit Score Meter"
                className="h-[240px] w-[240px] object-contain"
              />
            </div>
          </div>

          {/* White rounded “sheet” that overlaps the blue header */}
          <div className="-mt-6 bg-white rounded-t-2xl p-5">
            {afterTerm ? (
              <>
                {/* Terms (credit-score mode shows fee + terms, no internal buttons) */}
                <Terms />

                {/* Checkbox + Proceed */}
                <label
                  htmlFor="accept-terms-mobile"
                  className="mt-4 flex items-center gap-3 text-[13px] font-medium"
                >
                  <input
                    id="accept-terms-mobile"
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                    className="h-4 w-4 rounded-[4px] border-[#273e8e] text-[#273e8e] focus:ring-[#273e8e]"
                  />
                  I accept the following terms of data usage
                </label>

                {/* Powered by Mono microtext */}
                <div className="mt-4 mb-2 flex justify-center">
                  <span className="text-[11px] text-gray-500">
                    Powered by <span className="font-medium">Mono</span>
                  </span>
                </div>

                <button
                  className={`w-full h-12 rounded-full ${
                    accepted
                      ? "bg-[#273e8e] text-white"
                      : "bg-gray-300 text-gray-500"
                  }`}
                  disabled={!accepted}
                  onClick={() => setAfterTerm(false)}
                >
                  Proceed
                </button>
              </>
            ) : (
              <>
                {/* Offer cards */}
                <div className="space-y-3 max-sm:mt-[20px]">
                  <LoanCard />

                  <div className="p-4 border rounded-2xl">
                    {monoErr && (
                      <p className="text-red-600 text-sm mb-2">{monoErr}</p>
                    )}
                    <LoanRepaymentCard
                      calculation={calculation}
                      monoCalc={monoCalc}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 pb-4">
                    <Link
                      to="/loanCalculate"
                      className="border text-center text-sm border-[#273e8e] py-4 rounded-full text-[#273e8e]"
                    >
                      Edit Details
                    </Link>
                    <Link
                      to="/uploadDocument"
                      state={{ monoLoanId: monoCalc?.id, monoCalc }}
                      className="py-4 text-center text-sm rounded-full bg-[#273e8e] text-white"
                      onClick={(e) => {
                        if (!monoCalc?.id) {
                          e.preventDefault();
                          setMonoErr("Please wait, preparing your offer…");
                        }
                      }}
                    >
                      Accept Offer
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(CreditScore);
