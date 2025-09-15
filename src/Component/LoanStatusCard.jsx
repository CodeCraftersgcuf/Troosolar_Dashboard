import React, { useState } from "react";
import { assets } from "../assets/data";
import RepayModal from "./RepayModal";

const LoanStatusCard = ({
  id,
  amount,
  amountColor,
  status,
  statusTextColor,
  statusBgColor,
  date,
  onClick,
  onRepay,
  maxAmount = 0,
}) => {
  const [showRepayModal, setShowRepayModal] = useState(false);

  const handleRepayClick = () => {
    setShowRepayModal(true);
  };

  const handleRepayProceed = (repayAmount) => {
    if (onRepay) {
      onRepay(repayAmount);
    }
    setShowRepayModal(false);
  };

  const handleRepayClose = () => {
    setShowRepayModal(false);
  };
  console.log("The id is", id);
  return (
    <div className="h-[150px] min-w-full border rounded-2xl p-4 bg-white  border-gray-400">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className={`text-md lg:text-2xl font-semibold ${amountColor}`}>
            {amount}
          </h1>
          <p className=" text-gray-400 pb-2 text-xs lg:text-sm">{date}</p>
        </div>
        <button
          className={` py-1 px-2 text-sm rounded-lg  ${statusBgColor} ${statusTextColor}`}
        >
          {status}
        </button>
      </div>
      <hr />
      <div className="flex justify-between items-center pt-2">
        <div className="space-y-1">
          <p className="text-xs lg:text-sm text-gray-400">
            Next Repayment Date
          </p>
          <p className="text-black pb-2 text-sm">{date}</p>
        </div>
        <div className="flex justify-center items-center gap-2">
          <div className="lg:py-2 py-1 rounded-md shadow-2xl border-gray-400 border lg:px-2 px-1 ">
            <img
              src={assets.rePayIcon}
              alt=""
              onClick={onClick}
              className="lg:w-6 w-5 lg:h-6 h-5"
            />
          </div>
          <button
            onClick={handleRepayClick}
            className="bg-[#273e8e] lg:py-3.5 py-2 lg:px-6 px-4 text-sm rounded-full text-[#ffffff] hover:bg-[#1e2f6b] transition-colors"
          >
            Repay Now
          </button>
        </div>
      </div>

      {/* Repay Modal */}
      <RepayModal
        id={id}
        isOpen={showRepayModal}
        onClose={handleRepayClose}
        onProceed={handleRepayProceed}
        maxAmount={maxAmount}
      />
    </div>
  );
};

export default LoanStatusCard;
