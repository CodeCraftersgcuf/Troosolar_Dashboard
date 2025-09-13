import React from "react";
import { useNavigate } from "react-router-dom";

const LoanPopUp = ({ icon, text, imgBg }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/loan");
  };

  return (
    <div className="fixed flex items-center justify-center inset-0">
      <div className="w-[430px] rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex flex-col items-center space-y-6 rounded-2xl border border-gray-300 p-6 shadow-2xl">
          {/* Icon */}
          <div
            className={`flex h-[70px] w-[70px] items-center justify-center rounded-full ${imgBg}`}
          >
            {icon}
          </div>

          {/* Message */}
          <p className="text-sm text-center">{text}</p>

          {/* Single Button */}
          <button
            onClick={handleNavigate}
            className="w-full rounded-full bg-[#273e8e] py-3 text-sm text-white"
          >
            Go to Loan Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoanPopUp;
