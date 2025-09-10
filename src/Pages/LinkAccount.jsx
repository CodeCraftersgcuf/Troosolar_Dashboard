
import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import SideBar from "../Component/SideBar";
import { Input } from "../Component/Input";
import { BankDropdown } from "../Component/BankDropDown";
import { bankOptions } from "../assets/data";
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

  // Optional: set default auth header once (helps later calls too)
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common.Authorization;
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setOkMsg("");
    setFieldErrors({});

    // Defensive UI validation
    if (!accountNumber || !bankName || !accountName) {
      setError("Please fill all fields.");
      return;
    }

    const token = localStorage.getItem("access_token");
    console.log("link-accounts token present?", !!token, token ? token.slice(0, 12) + "…" : "(none)");
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
      console.log("link-accounts payload:", payload);

      const { data, status } = await axios.post(API.LINK_ACCOUNTS, payload, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`, // kept explicit here too
        },
      });

      console.log("link-accounts success:", status, data);
      setOkMsg(data?.message || "Account linked successfully.");
      navigate("/loanCalculate");
    } catch (err) {
      // Axios error triage
      const status = err?.response?.status;
      const resp = err?.response?.data;

      if (!err?.response) {
        // CORS / network / preflight
        console.error("link-accounts network/CORS error:", err?.message || err);
        setError("Network/CORS error. Ensure API allows your origin and 'Authorization' header.");
      } else {
        console.log("link-accounts error:", status, resp);

        if (status === 401) {
          setError("Your session expired or token is invalid. Please login again.");
          localStorage.removeItem("access_token");
          navigate("/login");
          return;
        }

        if (status === 422 && resp?.errors) {
          setFieldErrors(resp.errors);
          setError(resp.message || "Validation error.");
          return;
        }

        const msg =
          resp?.message ||
          resp?.error ||
          "Link account failed. Please try again.";
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Support both patterns from BankDropdown: onChange(e) or onChange(value)
  const handleBankChange = (eOrValue) => {
    const val =
      typeof eOrValue === "string"
        ? eOrValue
        : eOrValue?.target?.value ?? "";
    setBankName(val);
  };

  return (
    <div className="flex min-h-screen w-full">
      <SideBar />

      <div className="flex-1">
        {/* Topbar */}
        <div className="flex gap-3 items-center h-[90px] bg-white justify-end px-5 sm:pr-10 py-5">
          <div className="rounded-lg flex justify-center items-center shadow-md h-10 w-10">
            <Bell size={24} />
          </div>
          <div className="bg-[#e9e9e9] h-12 w-12 rounded-full flex items-center justify-center">
            <p className="text-lg text-[#909090] font-bold">QA</p>
          </div>
          <p className="text-[#000000] text-lg hidden sm:block">
            Qamardeen AbdulMalik
          </p>
        </div>

        {/* Form Section */}
        <div className="bg-[#F5F7FF] h-full w-full p-6 sm:p-10">
          <h1 className="text-[26px] font-medium tracking-tight">Link Account</h1>
          <p className="text-lg text-gray-500 pb-6">Add your bank details</p>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Form */}
            <form onSubmit={handleSubmit} className="w-full md:w-1/2 rounded-lg">
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

              <BankDropdown
                id="bankName"
                label="Bank Name"
                value={bankName}
                placeHolder="Select Bank"
                onChange={handleBankChange}
                options={bankOptions}
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

              <button
                type="submit"
                disabled={loading}
                className="mt-4 py-4 w-full px-10 bg-[#273e8e] text-white rounded-full hover:bg-[#1f2f6d] transition duration-200 disabled:opacity-60"
              >
                {loading ? "Linking..." : "Proceed"}
              </button>
            </form>

            {/* Right Note */}
            <div className="w-full md:w-1/2 flex items-start justify-center">
              <div className="bg-[#273E8E1A] mt-4 md:mt-10 p-4 rounded-lg border-dashed border-2 border-[#273e8e] max-w-md w-full">
                <p className="text-center text-sm text-[#273E8E]">
                  Kindly note that a service charge of <strong>N50</strong> will be deducted
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkAccount;
