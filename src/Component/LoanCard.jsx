import React from "react";

const LoanCard = ({ amount = "1,000,000", duration = "12 Months" }) => {
  return (
    <div className="max-w-[656px] h-[100px] p-3 rounded-2xl text-white bg-gradient-to-r from-[#273E8E] to-[#FFA500]">
      <div className="flex justify-between h-full">
        <div className="flex flex-col justify-between px-1 py-1">
          <p className="text-[12px]">Congratulations you are eligible for</p>
          <h1 className="text-2xl font-semibold">₦{amount}</h1>
        </div>
        <div className="flex flex-col justify-between text-left">
          <div>
            <span className="text-[12px]">Period</span>
            <h1 className="text-sm font-semibold">{duration}</h1>
          </div>
          <div className="mb-1s">
            <h1 className="text-sm">Repay Monthly</h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(LoanCard);
