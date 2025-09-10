
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
  const [afterTerm, setAfterTerm] = useState(true);
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
        const { data } = await axios.get(
          API.MONO_LOAN(id),
          {},
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // ✅ keep a local var, use it in both places
        const monoData = data?.data ?? data;
        setMonoCalc(monoData);
        sessionStorage.setItem("last_mono_calc", JSON.stringify(monoData)); // <-- fix
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
      {/* Desktop View */}
      <div className="sm:flex hidden  min-h-full w-full overflow-clip">
        <SideBar />
        <div className="flex-1 flex flex-col">
          <TopNavbar />
          <main className="bg-[#F5F7FF] flex-1 p-6 sm:p-10">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-[26px] font-medium tracking-tight">Credit Score</h1>
              <Link to="/loanCalculate" className="text-[#273e8e] underline hover:text-[#1e2f6b]">
                Go Back
              </Link>
            </div>

            <div className="flex flex-row gap-6">
              {/* Left */}
              <div className="bg-[#273e8e] flex justify-center items-center rounded-2xl w-full lg:w-1/2 aspect-square">
                <img src={assets.creditNeedle} className="h-[281px] w-[281px] object-contain" alt="Credit Score Meter" />
              </div>

              {/* Right */}
              {afterTerm ? (
                <div className="w-1/2">
                  <Terms />
                  <div className="space-y-4 mt-4 pt-4">
                    <label htmlFor="accept-terms" className="flex items-center gap-2 font-medium cursor-pointer">
                      <input type="checkbox" id="accept-terms" className="h-4 w-4 text-[#273e8e] border-gray-300 rounded" />
                      I accept the following terms of data usage
                    </label>
                    <div className="w-full">
                      <button onClick={() => setAfterTerm(false)} className="px-6 py-5 w-full rounded-full bg-[#273e8e] text-white">
                        Proceed
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-1/2 space-y-3">
                  <LoanCard />

                  <div className="p-4 border rounded-2xl">
                    {monoErr && <p className="text-red-600 text-sm mb-2">{monoErr}</p>}
                    {/* Pass both: original calculation + mono result */}
                    <LoanRepaymentCard calculation={calculation} monoCalc={monoCalc} />
                  </div>

                  <div className="grid grid-cols-2 pb-10 gap-3 pt-2">
                    <Link to="/loanCalculate" className="border text-sm border-[#273e8e] py-4 rounded-full text-[#273e8e] text-center">
                      Edit Details
                    </Link>
                    <Link
                      to="/uploadDocument"
                      state={{ monoLoanId: monoCalc?.id, monoCalc }}  // ✅ pass id + object
                      className="py-4 text-center text-sm rounded-full bg-[#273e8e] text-white"
                      onClick={(e) => {
                        if (!monoCalc?.id) {      // prevent navigation until mono is ready
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

      {/* Mobile View */}
      <div className="flex sm:hidden relative min-h-full w-full overflow-clip">
        <div className="flex-1 flex relative flex-col">
          <main className="bg-[#F5F7FF] relative flex-1">
            <div className="mb-6 flex absolute top-10 z-20">
              <Link to="/loanCalculate" className="text-[#273e8e] underline hover:text-[#1e2f6b]">
                <ChevronLeft color="white" />
              </Link>
              <p className="text-white absolute left-56">CreditScore</p>
            </div>

            <div className="flex flex-col gap-6">
              <div className="bg-[#273e8e] flex justify-center items-center w-full aspect-square">
                <img src={assets.creditNeedle} className="h-[281px] w-[281px] object-contain" alt="Credit Score Meter" />
              </div>

              {afterTerm ? (
                <div className="w-full -mt-36">
                  <Terms />
                  <div className="space-y-4 mt-4 pt-4">
                    <label htmlFor="accept-terms" className="flex items-center gap-2 font-medium cursor-pointer">
                      <input type="checkbox" id="accept-terms" className="h-4 w-4 text-[#273e8e] border-gray-300 rounded" />
                      I accept the following terms of data usage
                    </label>
                    <div className="w-full">
                      <button onClick={() => setAfterTerm(false)} className="px-6 py-5 w-full rounded-full bg-[#273e8e] text-white">
                        Proceed
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full p-2 rounded-t-2xl -mt-24 bg-white space-y-3">
                  <LoanCard />
                  <div className="p-4 border rounded-2xl">
                    {monoErr && <p className="text-red-600 text-sm mb-2">{monoErr}</p>}
                    <LoanRepaymentCard calculation={calculation} monoCalc={monoCalc} />
                  </div>
                  <div className="grid grid-cols-2 pb-10 gap-3 pt-2">
                    <Link to="/loanCalculate" className="border text-center text-sm border-[#273e8e] py-4 rounded-full text-[#273e8e]">
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
    </>
  );
};

export default React.memo(CreditScore);
