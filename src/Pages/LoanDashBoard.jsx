import React, { useState } from "react";
import SideBar from "../Component/SideBar";
import LoanWallet from "../Component/LoanWallet";
import { assets } from "../assets/data";
import Terms from "../Component/Terms";
import TopNavbar from "../Component/TopNavbar";
import LoanCard from "../Component/LoanCard";
import ActiveLoan from "./ActiveLoan";
import OverdueLoan from "./Overdue";
import CompletedLoan from "./CompletedLoan";
import PendingLoan from "./PendingLoan";

const LoanDashBoard = () => {
  const [showLoanTerms, setShowLoanTerms] = useState(true);

  // Route switches (unchanged behavior)
  const [activeLoan, setActiveLoan] = useState(false);
  const [overDueLoan, setOverDueLoan] = useState(false);
  const [completedLoan, setCompletedLoan] = useState(false);
  const [pendingLoan, setPendingLoan] = useState(true);

  if (activeLoan) return <ActiveLoan />;
  if (overDueLoan) return <OverdueLoan />;
  if (completedLoan) return <CompletedLoan />;
  if (pendingLoan) return <PendingLoan />;

  return (
    <>
      {/* ===================== DESKTOP (unchanged) ===================== */}
      <div
        className={`sm:flex hidden min-h-screen overflow-hidden ${
          !showLoanTerms ? "bg-black/40" : "bg-[#F5F7FF]"
        }`}
      >
        <SideBar />

        <div className="flex-1 flex flex-col">
          <TopNavbar />

          <div className="flex flex-col lg:flex-row gap-6 p-5 flex-1">
            {/* Left Section (UNCHANGED) */}
            <div className="lg:w-1/2 w-full">
              <h1 className="text-2xl font-semibold mb-1">Loans</h1>
              <p className="text-gray-500 mb-4">Welcome to the dashboard</p>

              <LoanWallet />

              {/* <div className="mt-5">
                <LoanCard />
              </div> */}

              {/* <p className="bg-gray-300 text-[#273e8e] p-3 rounded-xl border-dashed border mt-4">
                Your loan application is pending
              </p> */}

              {/* ===== Loan History (LEAVE AS YOU HAVE IT) =====
                  Whatever Loan History UI you already render here,
                  keep it exactly the same. We’re not changing it. */}
            </div>

            {/* Right Section (unchanged empty state condition) */}
            {activeLoan && overDueLoan && completedLoan && pendingLoan && (
              <div className="lg:w-1/2 w-full rounded-xl p-6 flex flex-col justify-center items-center">
                <img
                  src={assets.LoanBox}
                  alt="LoanBox"
                  className="w-40 h-40 object-contain mb-4"
                />
                <p className="text-gray-600 mb-4">
                  You have not taken any loan yet
                </p>
                <button
                  onClick={() => setShowLoanTerms(false)}
                  className="px-6 py-3 rounded-md bg-[#273e8e] text-white hover:bg-[#1d2f6b] transition cursor-pointer"
                >
                  Apply Now
                </button>
              </div>
            )}
          </div>
        </div>

        {!showLoanTerms && (
          <div className="absolute inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10">
              <Terms 
                link="/linkAccount" 
                onClose={() => setShowLoanTerms(true)}
              />
            </div>
          </div>
        )}
      </div>

      {/* ===================== MOBILE (new header layout only) ===================== */}
      <div className="sm:hidden flex min-h-screen w-full bg-[#F5F7FF]">
        <div className="flex-1 flex flex-col pb-24">
          <div className="p-5">
            {/* Wallet card (top) */}
            <LoanWallet />

            {/* Gradient eligibility card */}
            <div className="mt-5">
              <LoanCard />
            </div>

            {/* Pending banner */}
            <div className="mt-4 border-2 border-dashed border-[#273e8e] rounded-xl bg-white/30">
              <p className="text-[#273e8e] text-[13px] px-4 py-3">
                Your loan application is pending
              </p>
            </div>

            {/* ===== Loan History headline (keep your existing section below) ===== */}
            <div className="mt-6">
              <p className="text-[13px] text-gray-700">Recent loan</p>
              <div className="h-px bg-gray-200 mt-1" />
            </div>

            {/* >>> DO NOT TOUCH YOUR EXISTING LOAN HISTORY UI <<<
                Render your current mobile Loan History markup right here.
                We intentionally do not add or change any styling below. */}
          </div>

          {/* Bottom nav */}
          <SideBar />
        </div>

        {/* Mobile terms modal */}
        {!showLoanTerms && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <Terms 
              link="/linkAccount" 
              onClose={() => setShowLoanTerms(true)}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default LoanDashBoard;
