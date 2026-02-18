import React, { useState } from "react";
import { ChevronLeft } from "lucide-react";


import axios from "axios";
import API from "../../config/api.config";


const WithdrawalAccountPage = ({ onBack, onProceed, amount = 0 }) => {
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState(""); // manual bank input (no dropdown)
  const [accountName, setAccountName] = useState(""); // now editable
  const [saveAccount, setSaveAccount] = useState(true);
  
  // API state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleProceed = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!accountNumber || !bankName || !accountName) {
      setError("Please fill in all required fields");
      return;
    }

    if (amount <= 0) {
      setError("Invalid withdrawal amount");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess(false);

      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Please log in to make a withdrawal");
        return;
      }

      // Prepare withdrawal data
      const withdrawalData = {
        amount: amount.toString(), // Convert to string as required by API
        bank_name: bankName,
        account_name: accountName,
        account_number: accountNumber
      };

      console.log("Making withdrawal request:", withdrawalData);

      // Make API call
      const response = await axios.post(API.Withdraw_Referral_Balance, withdrawalData, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Withdrawal response:", response.data);

      if (response.data.status === "success" || response.status === 200) {
        setSuccess(true);
        // Show success message for a few seconds, then proceed
        setTimeout(() => {
          if (onProceed) onProceed();
        }, 2000);
      } else {
        setError(response.data.message || "Withdrawal failed. Please try again.");
      }
    } catch (err) {
      console.error("Withdrawal error:", err);
      setError(
        err?.response?.data?.message || 
        err?.message || 
        "Failed to process withdrawal. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Back Button */}
      <div className="px-4 py-4 border-b border-gray-200">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft size={24} />
          <span className="ml-1">Back</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        {/* Withdrawal Amount Display */}
        {amount > 0 && (
          <div className="mb-6 p-4 bg-[#273e8e] rounded-xl text-white">
            <div className="text-center">
              <p className="text-sm text-white/70 mb-1">Withdrawal Amount</p>
              <p className="text-2xl font-bold">₦{amount.toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-xl">
            <div className="text-center">
              <p className="text-green-800 font-semibold">Withdrawal Request Submitted!</p>
              <p className="text-green-700 text-sm mt-1">
                Your withdrawal request has been processed successfully.
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-xl">
            <div className="text-center">
              <p className="text-red-800 font-semibold">Error</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleProceed} className="space-y-6">
          {/* Account Number */}
          <div>
            <label
              htmlFor="accountNumber"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Account Number
            </label>
            <input
              id="accountNumber"
              type="text"
              placeholder="Enter your Account Number"
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                loading ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {/* Bank Name (manual input) */}
          <div>
            <label
              htmlFor="bankName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Bank Name
            </label>
            <input
              id="bankName"
              type="text"
              placeholder="Enter your Bank Name"
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                loading ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {/* Account Name (editable) */}
          <div>
            <label
              htmlFor="accountName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Account Name
            </label>
            <input
              id="accountName"
              type="text"
              placeholder="Enter Account Name"
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                loading ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {/* Save Account Checkbox */}
          <div className="flex items-center">
            <input
              id="saveAccount"
              type="checkbox"
              checked={saveAccount}
              onChange={(e) => setSaveAccount(e.target.checked)}
              disabled={loading}
              className="w-5 h-5 accent-[#273E8E] bg-gray-100 border-gray-300 rounded focus:ring-[#273E8E] focus:ring-2"
            />
            <label htmlFor="saveAccount" className="ml-3 text-sm text-gray-700">
              Save account for later withdrawals
            </label>
          </div>

          {/* Information Box */}
          <div className="border-2 border-dashed border-yellow-400 rounded-xl p-4 bg-yellow-50">
            <p className="text-gray-600 text-sm text-center">
              Your account will be credited in the next 24 - 72 hours
            </p>
          </div>

          {/* Proceed Button */}
          <button
            type="submit"
            disabled={loading || success}
            className={`w-full font-semibold py-4 rounded-xl transition-colors ${
              loading || success
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-[#273e8e] text-white hover:bg-[#1e327a]"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : success ? (
              "Request Submitted!"
            ) : (
              "Proceed"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WithdrawalAccountPage;
