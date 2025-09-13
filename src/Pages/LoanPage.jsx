// src/Pages/LoanPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "../Component/SideBar";
import LoanWallet from "../Component/LoanWallet";
import { Bell, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { assets } from "../assets/data";
import Terms from "../Component/Terms";
import TopNavbar from "../Component/TopNavbar";

import API from "../config/api.config";
import axios from "axios";

//Loan Cards (already in your project)
import LoanStatusCard from "../Component/LoanStatusCard";
import MainLoanCard from "../Component/MainLoanCard";
import RepaymentHistorySection from "../Component/RepaymentHistorySection";

const LoanPage = () => {
  const [showLoanTerms, setShowLoanTerms] = useState(true);

  // Loan calculation / status
  const [loanData, setLoanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toggle, setToggle] = useState(true);

  // Loan_Payment_Relate (installments + flags) — loaded only when approved
  const [relate, setRelate] = useState(null);
  const [relateLoading, setRelateLoading] = useState(false);
  const [relateError, setRelateError] = useState("");

  const navigate = useNavigate();

  /* ---------------- Fetch Loan_Calculation_Status ---------------- */
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

        if (
          response.data.status === "pending" ||
          response.data.status === "offered" ||
          response.data.status === "submitted" ||
          response.data.status === "approved"
        ) {
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

  /* ------------- When approved, fetch Loan_Payment_Relate ---------- */
  useEffect(() => {
    const fetchRelate = async () => {
      try {
        setRelateLoading(true);
        setRelateError("");

        const token = localStorage.getItem("access_token");
        if (!token) return;

        const response = await axios.get(API.Loan_Payment_Relate, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        // response.data.data has: current_month[], history[], flags
        setRelate(response?.data?.data || null);
      } catch (err) {
        console.error("Error fetching Loan_Payment_Relate:", err);
        setRelateError(
          err?.response?.data?.message || "Failed to load repayment schedule."
        );
      } finally {
        setRelateLoading(false);
      }
    };

    if (loanData?.status === "approved") {
      fetchRelate();
    }
  }, [loanData?.status]);

  /* ---------------- Derived helpers from relate ---------------- */
  const derived = useMemo(() => {
    if (!relate) return null;

    const current = Array.isArray(relate.current_month)
      ? relate.current_month
      : [];
    const history = Array.isArray(relate.history) ? relate.history : [];
    const all = [...current, ...history];

    const hasOverdue =
      relate.hasOverdue ||
      all.some((i) => i.computed_status === "overdue" || i.is_overdue);

    const paid = all.filter(
      (i) => i.computed_status === "paid" || i.status === "paid"
    );
    const activeList = all.filter(
      (i) =>
        (i.computed_status === "pending" || i.status === "pending") &&
        !i.is_overdue
    );

    const isCompleted =
      relate.isCompleted ||
      (paid.length > 0 && activeList.length === 0 && !hasOverdue);

    const isActive = relate.isActive || activeList.length > 0;

    // inferred pending when none of the above
    const isPending = !isCompleted && !hasOverdue && !isActive;

    // pick a “recent” item for summary cards
    const recentItem =
      current[0] ||
      activeList[0] ||
      paid[paid.length - 1] ||
      history[0] ||
      null;

    return {
      current,
      history,
      hasOverdue,
      isCompleted,
      isActive,
      isPending,
      recentItem,
      overdueCount: relate.overdueCount || 0,
      overdueAmount: relate.overdueAmount || 0,
    };
  }, [relate]);

  const formatMoney = (n) => {
    if (n == null || isNaN(Number(n))) return "N0";
    try {
      return `N${Number(n).toLocaleString()}`;
    } catch {
      return `N${n}`;
    }
  };

  const formatDate = (d) => {
    if (!d) return "";
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Handle accept offer button click
  const handleAcceptOffer = () => {
    navigate("/creditscore");
  };

  /* -------------------- Render content by status -------------------- */
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
          <p className="text-gray-600 mb-4">You have not taken any loan yet</p>
          <button
            onClick={() => setShowLoanTerms(false)}
            className="px-6 py-3 rounded-md bg-[#273e8e] text-white hover:bg-[#1d2f6b] transition"
          >
            Apply Now
          </button>
        </div>
      );
    }

    // APPROVED → show the four loan states using Loan_Payment_Relate data
    if (loanData.status === "approved") {
      if (relateLoading) {
        return (
          <div className="flex flex-col items-center text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#273e8e] mb-4"></div>
            <p className="text-gray-600">Loading repayment schedule…</p>
          </div>
        );
      }

      if (relateError) {
        return (
          <div className="flex flex-col items-center text-center">
            <AlertCircle className="text-red-500 mb-4" size={48} />
            <p className="text-red-600 mb-4">{relateError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
            >
              Retry
            </button>
          </div>
        );
      }

      // We have relate data — wire it into your existing cards
      const statusForCards = derived?.hasOverdue
        ? {
            label: "Overdue",
            statusTextColor: "text-[#FF0000]",
            statusBgColor: "bg-[#FF000033]",
          }
        : derived?.isCompleted
        ? {
            label: "Repaid",
            statusTextColor: "text-[#0000FF]",
            statusBgColor: "bg-[#0000FF33]",
          }
        : derived?.isActive
        ? {
            label: "Active",
            statusTextColor: "text-[#008000]",
            statusBgColor: "bg-[#00800033]",
          }
        : {
            label: "Pending",
            statusTextColor: "text-[#FFA500]",
            statusBgColor: "bg-[#FFA50033]",
          };

      const amountForCards =
        derived?.recentItem?.amount ??
        derived?.current?.[0]?.amount ??
        derived?.history?.[0]?.amount;

      const dateForCards =
        derived?.recentItem?.payment_date ??
        derived?.recentItem?.paid_at ??
        derived?.current?.[0]?.payment_date ??
        derived?.history?.[0]?.payment_date;

      // ✅ Correct: pull from relate.loan, not derived
      const loanRelated = relate?.loan;

      console.log("The loan related data is", loanRelated);

      return (
        <>
          {/* Right Section */}
          <div className="w-full mt-10">
            <p>Recen Loan</p>
            <div className="mt-2">
              {toggle ? (
                <div>
                  <LoanStatusCard
                    id={derived?.recentItem?.id}
                    amount={formatMoney(amountForCards)}
                    amountColor={
                      derived?.hasOverdue ? "text-[#FF0000]" : "text-[#008000]"
                    }
                    status={statusForCards.label}
                    statusTextColor={statusForCards.statusTextColor}
                    statusBgColor={statusForCards.statusBgColor}
                    date={formatDate(dateForCards)}
                    showBtn="false"
                    onClick={() => setToggle(!toggle)}
                  />
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h1 className="text-lg font-semibold">Loan History</h1>
                    <p
                      onClick={() => setToggle(!toggle)}
                      className="cursor-pointer text-[#273e8e] font-medium"
                    >
                      Back
                    </p>
                  </div>

                  <MainLoanCard
                    loanStatus={statusForCards.label}
                    intersetRate={loanRelated?.interest_rate || "—"}
                    duration={
                      loanRelated?.repayment_duration
                        ? `${loanRelated.repayment_duration} months`
                        : "—"
                    }
                    loanAmount={formatMoney(loanRelated?.loan_amount)}
                    date={formatDate(dateForCards)}
                    statusTextColor={statusForCards.statusTextColor}
                    statusBgColor={statusForCards.statusBgColor}
                    currentMonth={derived?.current}
                    history={derived?.history}
                  />

                  <div className="mt-4">
                    <p>Repayment History</p>
                    <RepaymentHistorySection
                      currentMonth={derived?.current}
                      history={derived?.history}
                      hasOverdue={derived?.hasOverdue}
                      overdueCount={derived?.overdueCount}
                      overdueAmount={derived?.overdueAmount}
                    />
                    {!derived?.isCompleted && (
                      <button className="w-full py-4 px-4 bg-[#273e8e] text-white text-sm text-center mt-5 rounded-full">
                        Repay All
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      );
    }

    //Submitted
    if (loanData.status === "submitted") {
      return (
        <div className="flex flex-col items-center text-center">
          <Clock className="text-gray-500 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Application Submitted
          </h3>
          <p className="text-gray-600 mb-4 text-center">
            Your loan application has been successfully received and is awaiting
            approval. Our admin team is currently reviewing it. You will be
            notified once a decision has been made.
          </p>
        </div>
      );
    }

    // Pending review
    if (loanData.status === "pending") {
      return (
        <div className="flex flex-col items-center text-center">
          <Clock className="text-yellow-500 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Application Received
          </h3>
          <p className="text-gray-600 mb-4 text-center">
            We have received your loan application and it is currently under
            review. Our admin team will update you on the status soon.
          </p>
          {loanData.data && (
            <div className="bg-gray-50 rounded-lg p-4 w-full max-w-sm">
              <p className="text-sm text-gray-600">
                <strong>Loan Amount:</strong> ₦
                {loanData.data.loan_amount?.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Duration:</strong> {loanData.data.repayment_duration}{" "}
                months
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
            Congratulations! We have a loan offer for you. Click below to view
            the details and accept the offer.
          </p>
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
        <p className="text-gray-600 mb-4">You have not taken any loan yet</p>
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
