import React, { useEffect, useState } from "react";
import { Bell, ChevronLeft } from "lucide-react";
import SideBar from "../Component/SideBar";
import { Input } from "../Component/Input";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API from "../config/api.config";

const LinkAccount = () => {
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const navigate = useNavigate();
  const goBack = () => navigate(-1);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    else delete axios.defaults.headers.common.Authorization;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setOkMsg("");
    setFieldErrors({});
    if (!accountNumber || !bankName || !accountName) {
      setError("Please fill all fields.");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Please log in first.");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        account_name: accountName.trim(),
        account_number: String(accountNumber).trim(),
        bank_name: bankName.trim(),
      };
      const { data } = await axios.post(API.LINK_ACCOUNTS, payload, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setOkMsg(data?.message || "Account linked successfully.");
      navigate("/loanCalculate");
    } catch (err) {
      const status = err?.response?.status;
      const resp = err?.response?.data;
      if (!err?.response)
        setError(
          "Network/CORS error. Ensure API allows your origin and 'Authorization' header."
        );
      else if (status === 401) {
        setError(
          "Your session expired or token is invalid. Please login again."
        );
        localStorage.removeItem("access_token");
        navigate("/login");
      } else if (status === 422 && resp?.errors) {
        setFieldErrors(resp.errors);
        setError(resp.message || "Validation error.");
      } else
        setError(
          resp?.message ||
            resp?.error ||
            "Link account failed. Please try again."
        );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      <SideBar />

      <div className="flex-1">
        {/* Desktop topbar (unchanged) */}
        <div className="hidden sm:flex gap-3 items-center h-[90px] bg-white justify-end px-5 sm:pr-10 py-5">
          <div className="rounded-lg flex justify-center items-center shadow-md h-10 w-10">
            <Bell size={24} />
          </div>
          <div className="bg-[#e9e9e9] h-12 w-12 rounded-full flex items-center justify-center">
            <p className="text-lg text-[#909090] font-bold">QA</p>
          </div>
          <p className="text-[#000000] text-lg">Qamardeen AbdulMalik</p>
        </div>

        {/* Mobile header (matches mock) */}
        <div className="sm:hidden sticky top-0 z-20 bg-white px-5 pt-5 pb-3 flex items-center justify-center relative border-b border-gray-100">
          <button
            onClick={goBack}
            aria-label="Back"
            className="absolute left-5 h-9 w-9 rounded-full flex items-center justify-center"
          >
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-[16px] font-semibold">Account Linking</h1>
        </div>

        {/* Form Section */}
        <div className="bg-[#F5F7FF] min-h-screen w-full p-5 sm:p-10 pb-28 sm:pb-10">
          {/* Desktop title */}
          <h1 className="hidden sm:block text-[26px] font-medium tracking-tight">
            Link Account
          </h1>
          <p className="hidden sm:block text-lg text-gray-500 pb-6">
            Add your bank details
          </p>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Form */}
            <form
              id="link-account-form"
              onSubmit={handleSubmit}
              className="w-full md:w-1/2 rounded-lg"
            >
              <Input
                id="accountNumber"
                label="Account Number"
                placeholder="Enter Your Account Number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
              {fieldErrors?.account_number && (
                <p className="text-red-600 text-sm -mt-3 mb-2">
                  {fieldErrors.account_number[0]}
                </p>
              )}

              <Input
                id="bankName"
                label="Bank Name"
                placeholder="Enter Your Bank Name"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
              {fieldErrors?.bank_name && (
                <p className="text-red-600 text-sm -mt-3 mb-2">
                  {fieldErrors.bank_name[0]}
                </p>
              )}

              <Input
                id="accountName"
                label="Account Name"
                placeholder="Enter Your Account Name"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
              />
              {fieldErrors?.account_name && (
                <p className="text-red-600 text-sm -mt-3 mb-2">
                  {fieldErrors.account_name[0]}
                </p>
              )}

              {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
              {okMsg && <p className="text-green-600 text-sm mt-2">{okMsg}</p>}

              {/* Desktop button (unchanged) */}
              <button
                type="submit"
                disabled={loading}
                className="hidden sm:block mt-4 py-4 w-full px-10 bg-[#273e8e] text-white rounded-full hover:bg-[#1f2f6d] transition duration-200 disabled:opacity-60"
              >
                {loading ? "Linking..." : "Proceed"}
              </button>
            </form>

            {/* Right Note (desktop) */}
            <div className="hidden md:flex w-full md:w-1/2 items-start justify-center">
              <div className="bg-[#273E8E1A] mt-10 p-4 rounded-lg border-dashed border-2 border-[#273e8e] max-w-md w-full">
                <p className="text-center text-sm text-[#273E8E]">
                  Kindly note that a service charge of <strong>N50</strong> will
                  be deducted
                </p>
              </div>
            </div>

            {/* Mobile notice (yellow dashed like mock) */}
            <div className="md:hidden mt-4">
              <div className="bg-amber-50 text-amber-700 border border-dashed border-amber-400 rounded-xl p-4">
                <p className="text-center text-sm">
                  Kindly note that a service charge of{" "}
                  <span className="font-semibold">N50</span> will be deducted
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile sticky CTA (big pill, above bottom nav) */}
        <div className="sm:hidden fixed left-0 right-0 bottom-24 px-5">
          <button
            form="link-account-form"
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-full bg-[#273e8e] text-white disabled:opacity-60"
          >
            {loading ? "Linking..." : "Proceed"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkAccount;
