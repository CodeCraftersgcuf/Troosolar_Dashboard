import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import API from "../config/api.config";
import { assets } from "../assets/data";
import { Input } from "../Component/Input";
import { ArrowLeft } from "lucide-react";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { id, name, value } = e.target;
    const key = id || name;
    if (!key) return;
    setFormData((prev) => ({ ...prev, [key]: value }));
    setError("");
    setSuccess("");
  };

  // Step 1: Request OTP (Forget Password)
  const handleForgetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await axios.post(
        API.Forgot_Password,
        { email: formData.email.trim() },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.data.status === "success" || response.data.message) {
        setSuccess(response.data.message || "OTP sent successfully to your email");
        setStep(2); // Move to OTP step
      } else {
        setError(response.data.message || "Failed to send OTP");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to send OTP. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await axios.post(
        API.Verify_Reset_Password_OTP,
        {
          email: formData.email.trim(),
          otp: formData.otp.trim(),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.data.status === "success" || response.data.message) {
        setSuccess(response.data.message || "OTP verified successfully");
        setStep(3); // Move to reset password step
      } else {
        setError(response.data.message || "Invalid OTP");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Invalid OTP. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        API.Reset_Password,
        {
          email: formData.email.trim(),
          password: formData.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.data.status === "success" || response.data.message) {
        setSuccess(response.data.message || "Password reset successfully");
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(response.data.message || "Failed to reset password");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to reset password. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Desktop */}
      <div className="w-full h-screen sm:flex hidden overflow-clip">
        <div className="relative w-1/2 overflow-hidden">
          <img
            src={assets.loginImage}
            alt="Login Visual"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute bottom-24 left-12 text-white w-[80%]">
            <p className="text-lg leading-relaxed">
              Providing affordable, sustainable and reliable <br />
              solar energy solutions for millions <br />
              of Nigerians
            </p>
          </div>
        </div>

        <div className="w-1/2 bg-[#f5f7ff] flex justify-center items-center ml-[-20px]">
          <div className="w-[90%] max-w-[600px] p-6 bg-white rounded-2xl shadow-lg h-[100%] overflow-y-auto">
            <Link
              to="/login"
              className="mb-4 flex items-center text-gray-500 hover:text-[#273e8e]"
            >
              <ArrowLeft size={16} className="mr-2" /> Back to Login
            </Link>

            <div className="text-center mb-6">
              <img
                src={assets.logo}
                alt="Logo"
                className="w-[200px] mx-auto mb-8"
                loading="lazy"
              />
              <h2 className="text-3xl font-semibold">Reset Password</h2>
              <p className="text-sm text-gray-600 mt-2">
                {step === 1 && "Enter your email to receive OTP"}
                {step === 2 && "Enter the OTP sent to your email"}
                {step === 3 && "Enter your new password"}
              </p>
            </div>

            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
            {success && <p className="text-green-600 text-sm mb-4">{success}</p>}

            {/* Step 1: Email */}
            {step === 1 && (
              <form onSubmit={handleForgetPassword} className="space-y-4">
                <Input
                  id="email"
                  name="email"
                  label="Email Address"
                  placeholder="Enter your email address"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <button
                  type="submit"
                  disabled={loading || !formData.email.trim()}
                  className="w-full bg-[#273e8e] text-white py-3 rounded-lg transition duration-200 disabled:opacity-60"
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </form>
            )}

            {/* Step 2: OTP */}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <Input
                  id="otp"
                  name="otp"
                  label="OTP Code"
                  placeholder="Enter 5-digit OTP"
                  type="text"
                  value={formData.otp}
                  onChange={handleChange}
                  maxLength={5}
                  required
                />
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg transition duration-200 hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || formData.otp.length !== 5}
                    className="flex-1 bg-[#273e8e] text-white py-3 rounded-lg transition duration-200 disabled:opacity-60"
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <Input
                  id="password"
                  name="password"
                  label="New Password"
                  placeholder="Enter new password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirm Password"
                  placeholder="Confirm new password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg transition duration-200 hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !formData.password || !formData.confirmPassword}
                    className="flex-1 bg-[#273e8e] text-white py-3 rounded-lg transition duration-200 disabled:opacity-60"
                  >
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="w-full min-h-screen sm:hidden block relative">
        <img
          src={assets.loginImage}
          className="w-full h-[40vh] object-cover"
          alt="Mobile Background"
        />

        <div className="bg-[#273e8e] absolute top-[31vh] w-full rounded-t-4xl shadow-md p-6 text-center mb-6">
          <Link
            to="/login"
            className="absolute top-4 left-4 text-white"
          >
            <ArrowLeft size={20} />
          </Link>
          <img src={assets.smLogo} alt="Logo" className="mx-auto mb-2 w-28" />
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          <p className="text-[10px] text-white mt-3">
            {step === 1 && "Enter your email to receive OTP"}
            {step === 2 && "Enter the OTP sent to your email"}
            {step === 3 && "Enter your new password"}
          </p>
        </div>

        <form
          className="space-y-4 p-4 mt-24 py-9"
          onSubmit={
            step === 1
              ? handleForgetPassword
              : step === 2
              ? handleVerifyOtp
              : handleResetPassword
          }
        >
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          {/* Step 1: Email */}
          {step === 1 && (
            <>
              <Input
                id="email"
                name="email"
                label="Email Address"
                placeholder="Enter your email address"
                type="email"
                value={formData.email}
                onChange={handleChange}
                isMobile={true}
                required
              />
              <button
                type="submit"
                disabled={loading || !formData.email.trim()}
                className="w-full bg-[#273e8e] text-white py-3 rounded-full disabled:opacity-60"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </>
          )}

          {/* Step 2: OTP */}
          {step === 2 && (
            <>
              <Input
                id="otp"
                name="otp"
                label="OTP Code"
                placeholder="Enter 5-digit OTP"
                type="text"
                value={formData.otp}
                onChange={handleChange}
                maxLength={5}
                isMobile={true}
                required
              />
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-full transition duration-200 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || formData.otp.length !== 5}
                className="w-full bg-[#273e8e] text-white py-3 rounded-full disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <>
              <Input
                id="password"
                name="password"
                label="New Password"
                placeholder="Enter new password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                isMobile={true}
                required
              />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm Password"
                placeholder="Confirm new password"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                isMobile={true}
                required
              />
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-full transition duration-200 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !formData.password || !formData.confirmPassword}
                className="w-full bg-[#273e8e] text-white py-3 rounded-full disabled:opacity-60"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </>
          )}
        </form>
      </div>
    </>
  );
};

export default ForgotPassword;

