// src/Pages/LoanPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "../Component/SideBar";
import LoanWallet from "../Component/LoanWallet";
import { Bell, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { assets } from "../assets/data";
import Terms from "../Component/Terms";
import TopNavbar from "../Component/TopNavbar";

import API from "../config/api.config";
import axios from "axios";


const LoanPage = () => {
  const [showLoanTerms, setShowLoanTerms] = useState(true);
  
  // Loan status state
  const [loanData, setLoanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();

  // Fetch loan calculation data
  useEffect(() => {
    const fetchLoanData = async () => {
      try {
        setLoading(true);
        setError("");
        
        const token = localStorage.getItem("access_token");
        if (!token) {
          setError("Please log in to view loan information");
          return;
        }

        const response = await axios.get(API.Loan_Calculation_Status, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.status === "pending" || response.data.status === "offered") {
          setLoanData(response.data);
        } else {
          setLoanData(null);
        }
      } catch (err) {
        console.error("Error fetching loan data:", err);
        if (err?.response?.status === 404) {
          // No loan calculation found - this is normal for new users
          setLoanData(null);
        } else {
          setError("Failed to load loan information");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLoanData();
  }, []);

  // Handle accept offer button click
  const handleAcceptOffer = () => {
    navigate("/creditscore");
  };

  // Render loan status content
  const renderLoanStatus = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#273e8e] mb-4"></div>
          <p className="text-gray-600">Loading loan information...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center text-center">
          <AlertCircle className="text-red-500 mb-4" size={48} />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
          >
            Retry
          </button>
        </div>
      );
    }

    // No loan exists - show apply button
    if (!loanData || !loanData.exists) {
      return (
        <div className="flex flex-col items-center text-center">
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
            className="px-6 py-3 rounded-md bg-[#273e8e] text-white hover:bg-[#1d2f6b] transition"
          >
            Apply Now
          </button>
        </div>
      );
    }

    // Loan exists - check status
    if (loanData.status === "pending") {
      return (
        <div className="flex flex-col items-center text-center">
          <Clock className="text-yellow-500 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Application Received
          </h3>
          <p className="text-gray-600 mb-4 text-center">
            We have received your loan application and it is currently under review. 
            Our admin team will update you on the status soon.
          </p>
          {loanData.data && (
            <div className="bg-gray-50 rounded-lg p-4 w-full max-w-sm">
              <p className="text-sm text-gray-600">
                <strong>Loan Amount:</strong> ₦{loanData.data.loan_amount?.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Duration:</strong> {loanData.data.repayment_duration} months
              </p>
            </div>
          )}
        </div>
      );
    }

    if (loanData.status === "offered") {
      return (
        <div className="flex flex-col items-center text-center">
          <CheckCircle className="text-green-500 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Loan Offer Available
          </h3>
          <p className="text-gray-600 mb-4 text-center">
            Congratulations! We have a loan offer for you. Click below to view the details and accept the offer.
          </p>
          {/* {loanData.data && (
            <div className="bg-green-50 rounded-lg p-4 w-full max-w-sm mb-4">
              <p className="text-sm text-gray-700">
                <strong>Loan Amount:</strong> ₦{loanData.data.loan_amount?.toLocaleString()}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Monthly Payment:</strong> ₦{loanData.data.monthly_payment}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Duration:</strong> {loanData.data.repayment_duration} months
              </p>
              <p className="text-sm text-gray-700">
                <strong>Interest Rate:</strong> {loanData.data.interest_percentage}%
              </p>
            </div>
          )} */}
          <button
            onClick={handleAcceptOffer}
            className="px-6 py-3 rounded-md bg-green-600 text-white hover:bg-green-700 transition"
          >
            Accept Offer
          </button>
        </div>
      );
    }

    // Default fallback
    return (
      <div className="flex flex-col items-center text-center">
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
          className="px-6 py-3 rounded-md bg-[#273e8e] text-white hover:bg-[#1d2f6b] transition"
        >
          Apply Now
        </button>
      </div>
    );
  };

  return (
    <>
      {/* ---------------- Desktop / Tablet ---------------- */}
      <div
        className={`hidden sm:flex relative min-h-screen overflow-hidden ${
          !showLoanTerms ? "bg-black/40" : "bg-[#F5F7FF]"
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
            <div className="lg:w-1/2 w-full rounded-xl p-6 flex flex-col  items-center">
              {renderLoanStatus()}
            </div>
          </div>
        </div>

        {/* Desktop Modal */}
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

      {/* ---------------- Mobile (<= 640px) ---------------- */}
      <div
        className={`sm:hidden relative flex min-h-screen w-full ${
          !showLoanTerms ? "bg-black/40" : "bg-[#F5F7FF]"
        }`}
      >
        <div className="flex-1 flex flex-col pb-24">
          {/* Header */}
          <div className="px-5 pt-6 flex items-start justify-between">
            <div>
              <h1 className="text-[20px] font-semibold">Loans</h1>
              <p className="text-[12px] text-black/50">
                Welcome to the dashboard
              </p>
            </div>
            <button className="h-10 w-10 rounded-lg bg-white flex items-center justify-center shadow-md">
              <Bell size={20} />
            </button>
          </div>

          {/* Wallet */}
          <div className="px-5 mt-4">
            <LoanWallet />
          </div>

          {/* Loan Status Content */}
          <div className="px-5 mt-10 flex flex-col items-center text-center">
            {renderLoanStatus()}
          </div>
        </div>

        {/* Bottom nav (SideBar renders mobile bottom bar) */}
        <SideBar />

        {/* Mobile Modal (centered sheet) */}
        {!showLoanTerms && (
          <div className="absolute inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10 w-[92%] max-w-md">
              <Terms
                link="/linkAccount"
                pnClose={() => setShowLoanTerms(true)}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default LoanPage;
