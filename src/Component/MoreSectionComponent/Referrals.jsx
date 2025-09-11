import { Eye, EyeOff, ChevronLeft } from "lucide-react";
import React, { useState } from "react";
import WithdrawalAccountPage from "./WithdrawalAccountPage";

const Referrals = () => {
  const [open, setOpen] = useState(true);
  const [showWithdrawalPage, setShowWithdrawalPage] = useState(false);

  const handleBackFromWithdrawalPage = () => {
    setShowWithdrawalPage(false);
  };

  const handleProceedFromWithdrawal = () => {
    // After successful withdrawal account setup, go back to referrals page
    setShowWithdrawalPage(false);
  };

  // Show withdrawal account page for both mobile and web if showWithdrawalPage is true
  if (showWithdrawalPage) {
    return <WithdrawalAccountPage onBack={handleBackFromWithdrawalPage} onProceed={handleProceedFromWithdrawal} />;
  }

  return (
    <>
      {/* Desktop View */}
      <main className="hidden sm:block bg-[#ffffff] h-full rounded-2xl border border-gray-400 w-full p-5">
        <h1 className="text-center text-lg font-medium pb-5">Referral Details</h1>

        <div className="bg-[#273e8e] rounded-2xl px-4 py-5 text-white shadow-md">
          {/* Header: Label & Icon */}
          <div className="flex justify-between items-center mb-2">
            <p className="text-white/70 text-sm">Referral Wallet</p>
            <div className="bg-[#1d3073] h-7 w-7 rounded-md flex items-center justify-center">
              {open ? (
                <Eye
                  onClick={() => setOpen(!open)}
                  size={18}
                  className="text-white/70 cursor-pointer"
                />
              ) : (
                <EyeOff
                  onClick={() => setOpen(!open)}
                  size={18}
                  className="text-white/70 cursor-pointer"
                />
              )}
            </div>
          </div>

          {/* Balance */}
          <h1 className="text-xl font-extrabold mb-3">
            {open ? "******" : "N1,000,000"}
          </h1>

          {/* Loan Info + Referral */}
          <div className="flex  flex-col min-h-[80px] sm:flex-row justify-between items-start sm:items-center bg-[#1d3073] py-3 px-5 border-gray-500 rounded-xl border gap-3">
            <div className="flex flex-col text-sm leading-tight">
              <p className="text-white/50 pb-3">Referral Code</p>
              <p className="text-white">XD123KC</p>
            </div>
            <div className="flex flex-col text-sm leading-tight">
              <p className="text-white/50 pb-3">My Referrals</p>
              <p className="text-white text-end">3</p>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => setShowWithdrawalPage(true)}
            className="bg-white text-[#000] text-sm rounded-full py-4 mt-4 w-full"
          >
            Withdraw
          </button>
        </div>

        <div className="py-4 px-4 w-full border-dashed border-[#273e8e] border-[2px] rounded-2xl mt-4 bg-[#e9ebf3] text-center text-sm text-[#273e8e]">
          <p>Earn 30% referral bonus from the people you refer</p>
        </div>
      </main>

      {/* Mobile View */}
      <div className="sm:hidden block min-h-screen bg-white">
        {/* Main Content */}
        <div className="px-4 mt-4">
          {/* Referral Wallet Card */}
          <div className="bg-[#273e8e] rounded-2xl p-6 text-white shadow-md">
            {/* Header: Label & Icon */}
            <div className="flex justify-between items-center mb-4">
              <p className="text-white text-sm font-medium">Referral Wallet</p>
              <div className="bg-[#1d3073] h-8 w-8 rounded-md flex items-center justify-center">
                {open ? (
                  <Eye
                    onClick={() => setOpen(!open)}
                    size={18}
                    className="text-white cursor-pointer"
                  />
                ) : (
                  <EyeOff
                    onClick={() => setOpen(!open)}
                    size={18}
                    className="text-white cursor-pointer"
                  />
                )}
              </div>
            </div>

            {/* Balance */}
            <h1 className="text-3xl font-bold mb-6">
              {open ? "N200,000" : "******"}
            </h1>

            {/* Referral Details */}
            <div className="bg-[#1d3073] rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <p className="text-white/70 text-xs mb-1">Referral Code</p>
                  <p className="text-white font-semibold">XD123KC</p>
                </div>
                <div className="flex flex-col">
                  <p className="text-white/70 text-xs mb-1">My Referrals</p>
                  <p className="text-white font-semibold">3</p>
                </div>
              </div>
            </div>

            {/* Withdraw Button */}
            <button
              onClick={() => setShowWithdrawalPage(true)}
              className="bg-white text-black text-sm font-semibold rounded-xl py-4 w-full"
            >
              Withdraw
            </button>
          </div>

          {/* Referral Bonus Info */}
          <div className="mt-6 p-4 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50">
            <p className="text-center text-sm text-gray-700">
              Earn 30% referral bonus from the people you refer
            </p>
          </div>
        </div>
      </div>

    </>
  );
};

export default Referrals;
