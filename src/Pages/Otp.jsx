
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import API from "../config/api.config";
import { assets } from "../assets/data";

const OTP_LENGTH = 5; // set to 5 if your backend sends 5-digit codes

const Otp = () => {
  const navigate = useNavigate();
  const { state } = useLocation(); // { email, otp, userId, message }
  const userId = state?.userId;

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(59);
  const inputsRef = useRef([]);

  // Prefill if OTP passed from register (dev convenience)
  useEffect(() => {
    // Initialize all digits to empty
    setDigits(Array(OTP_LENGTH).fill(""));
  
    // Focus the first input
    inputsRef.current?.[0]?.focus();
  }, []); // Empty dependency array, runs only once on mount
  

  // countdown
  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const code = useMemo(() => digits.join(""), [digits]);

  const handleChange = (idx, val) => {
    setError("");
    // only allow digits
    const v = val.replace(/\D/g, "").slice(0, 1);
    setDigits((prev) => {
      const copy = [...prev];
      copy[idx] = v;
      return copy;
    });
    if (v && idx < OTP_LENGTH - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace") {
      if (digits[idx]) {
        // clear current
        setDigits((prev) => {
          const copy = [...prev];
          copy[idx] = "";
          return copy;
        });
      } else if (idx > 0) {
        // go back
        inputsRef.current[idx - 1]?.focus();
        setDigits((prev) => {
          const copy = [...prev];
          copy[idx - 1] = "";
          return copy;
        });
      }
    }
    if (e.key === "ArrowLeft" && idx > 0) inputsRef.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < OTP_LENGTH - 1) inputsRef.current[idx + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const arr = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) arr[i] = pasted[i];
    setDigits(arr);
    inputsRef.current[Math.min(pasted.length, OTP_LENGTH) - 1]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      setError("Missing user context. Please register again.");
      return;
    }
    if (code.length !== OTP_LENGTH) {
      setError(`Enter the ${OTP_LENGTH}-digit code.`);
      return;
    }

    setError("");
    setLoading(true);

    try {
      // 🔴 IMPORTANT: send { verify_otp: code } as the **body** (2nd param)
      const res = await axios.post(
        API.VERIFY_OTP_USER(userId),
        { verify_otp: code },
        { headers: { "Content-Type": "application/json", Accept: "application/json" } }
      );

      // success -> go to login
      navigate("/login");
    } catch (err) {
      // Log full server response so you can see the exact backend message
      console.log("verify-otp error:", err?.response?.data || err?.message);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Verification failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };



  const resendDisabled = timer > 0;

  return (
    <>
      {/* Large Screen Layout */}
      <div className="w-full h-screen sm:flex hidden overflow-clip">
        {/* Image Section */}
        <div className="relative w-1/2 overflow-hidden">
          <img src={assets.loginImage} alt="Login Visual" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute bottom-24 left-12 text-white w-[80%]">
            <p className="text-lg font-medium leading-relaxed">
              Providing affordable, sustainable and reliable <br />
              solar energy solutions for millions <br />
              of Nigerians
            </p>
          </div>
          <div className="absolute bottom-6 left-12 flex gap-4">
            <img src={assets.insta} alt="Instagram" className="h-10 w-10" />
            <img src={assets.whatsApp} alt="WhatsApp" className="h-10 w-10" />
            <img src={assets.twitter} alt="Twitter" className="h-10 w-10" />
            <img src={assets.yt} alt="YouTube" className="h-10 w-10" />
          </div>
        </div>

        {/* Form Section */}
        <div className="w-1/2 bg-[#f5f7ff] flex justify-center items-center">
          <div className="w-[90%] max-w-[600px] p-6 h-[700px] flex flex-col justify-start items-center bg-white rounded-2xl shadow-lg">
            <form className="space-y-6 w-full" onSubmit={handleSubmit}>
              <div className="text-center">
                <img src={assets.logo} alt="Logo" className="w-[200px] mx-auto mb-6" loading="lazy" />
                <h2 className="text-3xl font-bold">Phone Verification</h2>
                <p className="text-sm text-gray-600 mt-2">
                  {state?.email ? `Verify the code sent to ${state.email}` : "Verify your phone number to continue"}
                </p>
                {state?.message && <p className="text-green-700 mt-2">{state.message}</p>}
              </div>

              <div className="space-y-4">
                <div
                  className="flex justify-center items-center gap-2 mb-6"
                  onPaste={handlePaste}
                >
                  {digits.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => (inputsRef.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      onChange={(e) => handleChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      className="lg:w-20 lg:h-20 w-14 h-14 text-center text-4xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ))}
                </div>
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}
              <p>
                Request new code in{" "}
                <span className="text-[#273e8e] font-bold">
                  {String(Math.floor(timer / 60)).padStart(2, "0")}:
                  {String(timer % 60).padStart(2, "0")}s
                </span>
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#273e8e] text-white py-3 rounded-lg transition duration-200 disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Proceed"}
              </button>

              {/* Optional resend button (wire your resend API if available) */}
              {/* <button
                type="button"
                disabled={resendDisabled}
                onClick={handleResend}
                className="w-full bg-gray-100 text-gray-800 py-3 rounded-lg transition duration-200 disabled:opacity-50"
              >
                Resend Code
              </button> */}
            </form>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="w-full min-h-screen sm:hidden block relative">
        <img src={assets.loginImageForSm} className="w-full h-[40vh] object-cover" alt="Mobile Background" />
        <div className="bg-[#273e8e] absolute top-[31vh] w-full rounded-t-4xl shadow-md p-6 text-center mb-6">
          <img src={assets.smLogo} alt="Logo" className="mx-auto mb-2 w-28" />
          <h1 className="text-2xl font-bold text-white">Phone Verification</h1>
          <p className="text-xs text-white">
            {state?.email ? `Code sent to ${state.email}` : "Verify your Phone Number"}
          </p>
        </div>

        <form className="space-y-4 p-4 mt-24" onSubmit={handleSubmit}>
          <p className="">Input Verification Code</p>
          <div
            className="flex justify-center items-center gap-2 mb-6"
            onPaste={handlePaste}
          >
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="sm:w-20 w-14 sm:h-20 h-14 text-center text-4xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ))}
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          <p>
            Request new code in{" "}
            <span className="text-[#273e8e] font-bold">
              {String(Math.floor(timer / 60)).padStart(2, "0")}:
              {String(timer % 60).padStart(2, "0")}s
            </span>
          </p>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#273e8e] text-white py-3 rounded-full transition duration-200 disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Proceed"}
          </button>
        </form>
      </div>
    </>
  );
};

export default Otp;
