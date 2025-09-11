// src/Pages/LoanPage.jsx
import React, { useState } from "react";
import SideBar from "../Component/SideBar";
import LoanWallet from "../Component/LoanWallet";
import { Bell } from "lucide-react";
import { assets } from "../assets/data";
import Terms from "../Component/Terms";
import TopNavbar from "../Component/TopNavbar";

const LoanPage = () => {
  const [showLoan, setShowLoan] = useState(true); // true = no modal

  return (
    <>
      {/* ---------------- Desktop / Tablet ---------------- */}
      <div
        className={`hidden sm:flex relative min-h-screen overflow-hidden ${
          !showLoan ? "bg-black/40" : "bg-[#F5F7FF]"
        }`}
      >
        <SideBar />

        <div className="flex-1 flex flex-col">
          <TopNavbar />

          <div className="flex flex-col lg:flex-row gap-6 p-5 flex-1">
            {/* Left */}
            <div className="lg:w-1/2 py-2 w-full">
              <h1 className="text-2xl py-1">Loans</h1>
              <p className="text-[#00000080] mb-4">Welcome to the dashboard</p>
              <LoanWallet />
            </div>

            {/* Right */}
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
                onClick={() => setShowLoan(false)}
                className="px-6 py-3 rounded-md bg-[#273e8e] text-white hover:bg-[#1d2f6b] transition"
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Modal */}
        {!showLoan && (
          <div className="absolute inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10">
              <Terms link="/linkAccount" />
            </div>
          </div>
        )}
      </div>

      {/* ---------------- Mobile (<= 640px) ---------------- */}
      <div
        className={`sm:hidden relative flex min-h-screen w-full ${
          !showLoan ? "bg-black/40" : "bg-[#F5F7FF]"
        }`}
      >
        <div className="flex-1 flex flex-col pb-24">
          {/* Header */}
          <div className="px-5 pt-6 flex items-start justify-between">
            <div>
              <h1 className="text-[20px] font-semibold">Loans</h1>
              <p className="text-[12px] text-black/50">Welcome to the dashboard</p>
            </div>
            <button className="h-10 w-10 rounded-lg bg-white flex items-center justify-center shadow-md">
              <Bell size={20} />
            </button>
          </div>

          {/* Wallet */}
          <div className="px-5 mt-4">
            <LoanWallet />
          </div>

          {/* Empty state + CTA */}
          <div className="px-5 mt-10 flex flex-col items-center text-center">
            <img
              src={assets.LoanBox}
              alt="LoanBox"
              className="w-32 h-32 object-contain mb-3"
            />
            <p className="text-gray-600">You have not taken any loan yet</p>
            <button
              onClick={() => setShowLoan(false)}
              className="mt-4 px-6 py-3 rounded-md bg-[#273e8e] text-white"
            >
              Apply Now
            </button>
          </div>
        </div>

        {/* Bottom nav (SideBar renders mobile bottom bar) */}
        <SideBar />

        {/* Mobile Modal (centered sheet) */}
        {!showLoan && (
          <div className="absolute inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10 w-[92%] max-w-md">
              <Terms link="/linkAccount" />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default LoanPage;
