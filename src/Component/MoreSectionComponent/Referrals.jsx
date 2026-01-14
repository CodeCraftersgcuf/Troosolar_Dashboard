import { Eye, EyeOff, ChevronLeft, Share2, Copy, Check } from "lucide-react";
import React, { useState, useEffect } from "react";
import WithdrawalAccountPage from "./WithdrawalAccountPage";
import TransferModal from "./TransferModal";
import InsufficientBalanceModal from "./InsufficientBalanceModal";

import axios from "axios";
import API from "../../config/api.config";

// Helper function to format currency
const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return `₦${num.toLocaleString("en-NG")}`;
};

const Referrals = () => {
  const [open, setOpen] = useState(true);
  const [showWithdrawalPage, setShowWithdrawalPage] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showInsufficientBalanceModal, setShowInsufficientBalanceModal] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState(0);
  
  // API data state
  const [referralData, setReferralData] = useState({
    referral_code: "",
    referral_balance: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Fetch referral details from API and create if doesn't exist
  useEffect(() => {
    const fetchReferralDetails = async () => {
      try {
        setLoading(true);
        setError("");
        
        const token = localStorage.getItem("access_token");
        if (!token) {
          setError("Please log in to view referral details");
          return;
        }

        const response = await axios.get(API.Get_Referral_Details, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.status === "success") {
          const data = response.data.data;
          // If no referral code exists, try to create one (assuming backend creates it automatically on first access)
          if (!data.referral_code || data.referral_code === "") {
            // The referral code should be created automatically by the backend
            // If not, we'll show a message to contact support
            setReferralData({
              ...data,
              referral_code: data.referral_code || "Not available"
            });
          } else {
            setReferralData(data);
          }
        } else {
          setError(response.data.message || "Failed to fetch referral details");
        }
      } catch (err) {
        setError(
          err?.response?.data?.message || 
          err?.message || 
          "Failed to load referral details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReferralDetails();
  }, []);

  // Share referral code
  const handleShare = async () => {
    const referralCode = referralData.referral_code;
    if (!referralCode || referralCode === "N/A" || referralCode === "Not available") {
      alert("Referral code not available. Please contact support.");
      return;
    }

    const shareText = `Join TrooSolar using my referral code: ${referralCode}\n\nGet great deals on solar energy solutions!`;
    const shareUrl = `${window.location.origin}/register?referral_code=${referralCode}`;

    // Try Web Share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: "TrooSolar Referral Code",
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // User cancelled or error occurred, fall back to copy
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert("Failed to copy. Please copy manually: " + referralCode);
    }
  };

  // Copy referral code to clipboard
  const handleCopy = async () => {
    const referralCode = referralData.referral_code;
    if (!referralCode || referralCode === "N/A" || referralCode === "Not available") {
      alert("Referral code not available.");
      return;
    }

    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert("Failed to copy. Referral code: " + referralCode);
    }
  };

  const handleBackFromWithdrawalPage = () => {
    setShowWithdrawalPage(false);
    setWithdrawalAmount(0);
  };

  const handleProceedFromWithdrawal = () => {
    // After successful withdrawal account setup, go back to referrals page
    setShowWithdrawalPage(false);
    setWithdrawalAmount(0);
  };

  const handleWithdrawClick = () => {
    // Check if balance is sufficient for withdrawal
    if (referralData.referral_balance < 0) {
      setShowInsufficientBalanceModal(true);
    } else {
      setShowTransferModal(true);
    }
  };

  const handleTransferProceed = (amount) => {
    setWithdrawalAmount(amount);
    setShowWithdrawalPage(true);
  };

  // Show withdrawal account page for both mobile and web if showWithdrawalPage is true
  if (showWithdrawalPage) {
    return (
      <WithdrawalAccountPage
        onBack={handleBackFromWithdrawalPage}
        onProceed={handleProceedFromWithdrawal}
        amount={withdrawalAmount}
      />
    );
  }

  return (
    <>
      {/* Desktop View */}
      <main className="hidden sm:block bg-[#ffffff] h-full rounded-2xl border border-gray-400 w-full p-5">

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
            {loading ? (
              "Loading..."
            ) : error ? (
              "Error"
            ) : open ? (
              "******"
            ) : (
              formatCurrency(referralData.referral_balance)
            )}
          </h1>

          {/* Loan Info + Referral */}
          <div className="flex  flex-col min-h-[80px] sm:flex-row justify-between items-start sm:items-center bg-[#1d3073] py-3 px-5 border-gray-500 rounded-xl border gap-3">
            <div className="flex flex-col text-sm leading-tight flex-1">
              <p className="text-white/50 pb-3">Referral Code</p>
              <div className="flex items-center gap-2">
                <p className="text-white flex-1">
                  {loading ? "Loading..." : error ? "Error" : referralData.referral_code || "N/A"}
                </p>
                {!loading && !error && referralData.referral_code && referralData.referral_code !== "N/A" && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="p-1.5 bg-white/20 hover:bg-white/30 rounded-md transition-colors"
                      title="Copy code"
                    >
                      {copied ? (
                        <Check size={16} className="text-white" />
                      ) : (
                        <Copy size={16} className="text-white" />
                      )}
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-1.5 bg-white/20 hover:bg-white/30 rounded-md transition-colors"
                      title="Share code"
                    >
                      <Share2 size={16} className="text-white" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col text-sm leading-tight">
              <p className="text-white/50 pb-3">My Referrals</p>
              <p className="text-white text-end">
                {loading ? "..." : error ? "Error" : "0"}
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleWithdrawClick}
            className="bg-white text-[#000] text-sm rounded-full py-4 mt-4 w-full"
          >
            Withdraw
          </button>
        </div>

        <div className="py-4 px-4 w-full border-dashed border-[#273e8e] border-[2px] rounded-2xl mt-4 bg-[#e9ebf3] text-center text-sm text-[#273e8e]">
          <p>Earn 5% referral bonus from the people you refer</p>
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
              {loading ? (
                "Loading..."
              ) : error ? (
                "Error"
              ) : open ? (
                "******"
              ) : (
                formatCurrency(referralData.referral_balance)
              )}
            </h1>

            {/* Referral Details */}
            <div className="bg-[#1d3073] rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center">
                <div className="flex flex-col flex-1">
                  <p className="text-white/70 text-xs mb-1">Referral Code</p>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold flex-1">
                      {loading ? "Loading..." : error ? "Error" : referralData.referral_code || "N/A"}
                    </p>
                    {!loading && !error && referralData.referral_code && referralData.referral_code !== "N/A" && (
                      <div className="flex gap-2">
                        <button
                          onClick={handleCopy}
                          className="p-1.5 bg-white/20 hover:bg-white/30 rounded-md transition-colors"
                          title="Copy code"
                        >
                          {copied ? (
                            <Check size={14} className="text-white" />
                          ) : (
                            <Copy size={14} className="text-white" />
                          )}
                        </button>
                        <button
                          onClick={handleShare}
                          className="p-1.5 bg-white/20 hover:bg-white/30 rounded-md transition-colors"
                          title="Share code"
                        >
                          <Share2 size={14} className="text-white" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col">
                  <p className="text-white/70 text-xs mb-1">My Referrals</p>
                  <p className="text-white font-semibold">
                    {loading ? "..." : error ? "Error" : "0"}
                  </p>
                </div>
              </div>
            </div>

            {/* Withdraw Button */}
            <button
              onClick={handleWithdrawClick}
              className="bg-white text-black text-sm font-semibold rounded-xl py-4 w-full"
            >
              Withdraw
            </button>
          </div>

          {/* Referral Bonus Info */}
          <div className="mt-6 p-4 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50">
            <p className="text-center text-sm text-gray-700">
              Earn 5% referral bonus from the people you refer
            </p>
          </div>
        </div>
      </div>

      {/* Transfer Modal */}
      <TransferModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        onProceed={handleTransferProceed}
        maxAmount={referralData.referral_balance}
      />

      {/* Insufficient Balance Modal */}
      <InsufficientBalanceModal
        isOpen={showInsufficientBalanceModal}
        onClose={() => setShowInsufficientBalanceModal(false)}
      />
    </>
  );
};

export default Referrals;
