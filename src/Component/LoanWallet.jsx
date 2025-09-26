import { Eye, EyeOff } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import API from "../config/api.config";

const LoanWallet = () => {
  const [open, setOpen] = useState(false); // true => mask (kept your behavior)
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [balance, setBalance] = useState(0); // numeric

  useEffect(() => {
    const fetchWallet = async () => {
      setErr("");
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          navigate("/login");
          return;
        }

        const { data } = await axios.get(API.LOAN_WALLET, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        // ResponseHelper::success($data, 'Your loan Wallet')
        const raw = data?.data;
        // backend returns { 'Loan balance': number }
        const val =
          typeof raw === "object" && raw !== null ? raw["Loan balance"] : 0;

        setBalance(Number(val || 0));
      } catch (e) {
        const status = e?.response?.status;
        if (status === 401) {
          localStorage.removeItem("access_token");
          navigate("/login");
          return;
        }
        if (status === 404) {
          // wallet not created yet; treat as zero
          setBalance(0);
        } else {
          setErr(
            e?.response?.data?.message || e?.message || "Failed to load wallet."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, [navigate]);

  const path = location.pathname.includes("loanDetails/loanDashboard");

  const displayBalance = useMemo(() => {
    const txt = `N${Number(balance || 0).toLocaleString()}`;
    return open ? "******" : txt;
  }, [balance, open]);

  return (
    <div className="bg-[#273e8e] rounded-[16px] px-4 pt-4 pb-3 text-white shadow-md">
      {/* Header: Label & Icon */}
      <div className="flex justify-between items-center mb-2">
        <p className="text-white/70 text-xs lg:text-sm">Loan Wallet</p>
        <div className="bg-[#1d3073] h-7 w-7 rounded-md flex items-center justify-center">
          {open ? (
            <Eye
              onClick={() => setOpen(!open)}
              size={18}
              className="text-white/70 cursor-pointer"
              title="Show balance"
            />
          ) : (
            <EyeOff
              onClick={() => setOpen(!open)}
              size={18}
              className="text-white/70 cursor-pointer"
              title="Hide balance"
            />
          )}
        </div>
      </div>

      {/* Balance */}
      <h1 className="text-xl font-bold mb-2">
        {loading ? "Loading…" : displayBalance}
      </h1>

      {/* Loan Info + Countdown (kept your static UI) */}
      <div className="flex min-h-[70px] flex-row justify-between items-start sm:items-center bg-[#1d3073] py-3 px-3 rounded-md gap-3">
        <div className="flex flex-col text-sm leading-tight">
          <p className="text-white/80 text-xs">
            {err ? "Unable to fetch wallet" : "You have no loans"}
          </p>
          <p className="text-white">-</p>
        </div>

        <div className="flex items-center h-[20px] gap-4 lg:mt-0 mt-3">
          <div className="w-[50px] h-[50px] flex flex-col items-center justify-center border border-[#ccc] rounded-[12px] shadow-[0_2px_0_#ccc]">
            <p className="text-[20px] font-bold leading-none">00</p>
            <p className="text-xs">Days</p>
          </div>
          <div className="text-[24px] font-extrabold">:</div>
          <div className="w-[50px] h-[50px] flex flex-col items-center justify-center border border-[#ccc] rounded-[12px] shadow-[0_2px_0_#ccc]">
            <p className="text-[20px] font-bold leading-none">00</p>
            <p className="text-xs">Hours</p>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={() => navigate("/loan")}
        className="bg-white text-[#000] text-sm rounded-full py-3 mt-2 w-full cursor-pointer text-[12px] hover:bg-gray-100 transition-colors"
      >
        {path ? "Transfer to Wallet" : "Apply for Loan"}
      </button>
    </div>
  );
};

export default LoanWallet;
