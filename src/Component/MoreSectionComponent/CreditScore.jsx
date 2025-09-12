import React from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/data";
const CreditScore = () => {
  const _navigate = useNavigate();

  const _creditScore = 50; // This would come from API in real implementation

  const improvementTips = [
    {
      title: "Ontime loan Payment",
      description:
        "Payment history makes up a big chunk of your credit score. Late payments hurt — consistent on-time payments help build trust with lenders.",
    },
    {
      title: "Reduce Credit Card Balances",
      description:
        "Keep your credit utilization (how much you use vs. your limit) below 30%. Lower balances signal responsible credit use.",
    },
    {
      title: "Limit New Credit Applications",
      description:
        "Each application triggers a hard inquiry, which can slightly lower your score. Too many in a short time can be a red flag.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#243a84]">
      {/* Credit Score Gauge */}
      <div className="p-6 mb-6 shadow-sm border-t border-r border-[#273e8e] rounded-tl-none rounded-br-none rounded-2xl">
        <div className="flex flex-col items-center max-w-[240px] justify-center mx-auto">
          {/* Circular Gauge */}
          <img src={assets.creditNeedle} alt="Credit Score Meter" />
        </div>
      </div>

      {/* Improvement Tips Section */}
      <div className="bg-white rounded-tl-2xl rounded-tr-2xl p-6 border-t border-r border-[#273E8E]">
        <h2 className="text-lg font-bold text-[#273e8e] mb-6 text-center">
          How to improve your credit score
        </h2>

        <div className="space-y-4">
          {improvementTips.map((tip, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-[#273E8E] py-2 px-4 shadow-sm"
            >
              <h3 className="font-bold text-[#273e8e] text-[14px] ">
                {tip.title}
              </h3>
              <p className="text-gray-600 text-[12px] leading-relaxed">
                {tip.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreditScore;
