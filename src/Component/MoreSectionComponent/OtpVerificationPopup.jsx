import React, { useState } from "react";
import { X, ChevronRight, Loader2 } from "lucide-react";
import axios from "axios";
import API from "../../config/api.config";

const OtpVerificationPopup = ({ email, onVerify, onClose, onResend }) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 5) {
      setError("Please enter a valid 5-digit OTP");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Call verify-reset-password-otp API
      const response = await axios.post(
        API.Verify_Reset_Password_OTP,
        {
          email: email,
          otp: otp,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        // Success - proceed to new password
        onVerify(otp);
      } else {
        setError(response.data.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Invalid OTP. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setError("");

    try {
      // Call forgot-password API again to resend OTP
      const response = await axios.post(
        API.Forgot_Password,
        { email: email },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        // Success - show success message
        setError("OTP has been resent successfully!");
        setTimeout(() => setError(""), 3000);
      } else {
        setError(
          response.data.message || "Failed to resend OTP. Please try again."
        );
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to resend OTP. Please try again.";
      setError(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-opacity-50">
      <div className="w-[350px] rounded-2xl bg-white shadow-lg relative p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            OTP Verification
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={22} />
          </button>
        </div>

        <hr className="border-gray-300 mb-4" />

        <p className="text-sm text-gray-600 mb-4">
          We've sent a 6-digit OTP to{" "}
          <span className="font-medium">{email}</span>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="otp" className="block text-sm text-gray-700 mb-2">
              Enter OTP
            </label>
            <input
              id="otp"
              type="text"
              placeholder="Enter 6-digit code"
              className={`w-full px-4 py-3 border ${
                error && !error.includes("resent successfully")
                  ? "border-red-500"
                  : "border-gray-300"
              } rounded-xl outline-none focus:ring-2 focus:ring-blue-500`}
              maxLength="5"
              pattern="\d{5}"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            />
            {error && (
              <p
                className={`mt-1 text-sm ${
                  error.includes("resent successfully")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {error}
              </p>
            )}
          </div>

          <div className="flex justify-between items-center mb-6">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendLoading}
              className={`text-sm ${
                resendLoading
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-blue-600 hover:text-blue-800"
              }`}
            >
              {resendLoading ? (
                <div className="flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Resending...</span>
                </div>
              ) : (
                "Resend OTP"
              )}
            </button>
            <span className="text-sm text-gray-500">Valid for 5 minutes</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-full text-white transition-colors ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#273e8e] hover:bg-[#1e327a]"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying...</span>
              </div>
            ) : (
              "Verify OTP"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OtpVerificationPopup;
