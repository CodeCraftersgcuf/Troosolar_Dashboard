import { ChevronDown , ChevronLeft} from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import LoanRepaymentCard from './LoanRepaymentCard';
const LoanCalculator = () => {
  return (
    <>
    {/* Desktop View  */}
    <div className="min-h-screen sm:block hidden bg-[#f5f6ff] px-6 py-10">
      <h1 className="text-2xl mb-6">Loan Calculator</h1>
      <Link to="/" className="text-[#273e8e] underline  text-left">Go Back</Link>

      <div className="flex flex-col lg:flex-row gap-8 mt-4">
        {/* Left: Loan Input Form */}
        <div className="space-y-6 w-full lg:w-1/2">
          {/* Product Price */}
          <div>
            <label className="block text-[17px] mb-2 text-gray-700">
              How much is the product you are purchasing
            </label>
            <input
              type="number"
              placeholder="Enter Product Price"
              className="w-full py-3 px-4 border border-gray-300 rounded-lg bg-white text-[15px] outline-none focus:ring-2 focus:ring-[#273e8e]"
            />
          </div>

          {/* Loan Amount */}
          <div>
            <label className="block text-[17px] mb-2 text-gray-700">Loan Amount</label>
            <input
              type="number"
              placeholder="Enter Loan Amount"
              className="w-full py-3 px-4 border border-gray-300 rounded-lg bg-white text-[15px] outline-none focus:ring-2 focus:ring-[#273e8e]"
            />
          </div>

          {/* Duration Dropdown */}
          <div className="relative">
            <label className="block  text-sm mb-2 text-[17px] text-gray-700">Loan Duration</label>
            <select
              id="duration"
              name="duration"
              className="appearance-none w-full py-3 px-4 border border-gray-300 rounded-lg bg-white text-[15px] text-gray-700 outline-none"
            >
              <option value="">Select Duration</option>
              <option value="3">3 months</option>
              <option value="6">6 months</option>
              <option value="9">9 months</option>
              <option value="11">11 months</option>
              <option value="12">1 Year</option>
              <option value="24">2 Years</option>
            </select>
            <ChevronDown className="absolute right-4 top-[55px] transform -translate-y-1/2 text-gray-500 pointer-events-none" size={22} />
          </div>
        </div>

        {/* Right: Result Card */}
        <div className="w-full lg:w-1/2">
          <LoanRepaymentCard />
        </div>
      </div>
    </div>
    {/* Mobile View   */}
    <div className="min-h-screen sm:hidden block bg-white px-4 pb-20">
      

      {/* Introduction */}
      <div className="mb-6">
        <h2 className="text-base font-semibold text-black mb-2">
          What is a loan calculator?
        </h2>
        <p className="text-sm text-gray-600">
          A loan calculator is a tool that helps you estimate your monthly payments, total interest, and repayment schedule based on the loan amount, interest rate, and term.
        </p>
      </div>

      {/* Input Fields */}
      <div className="space-y-4 mb-6">
        {/* Product Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How much is the product you want to purchase?
          </label>
          <input
            type="number"
            placeholder="Enter Product Price"
            defaultValue="1,300,000"
            className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-3 text-sm outline-none"
          />
        </div>

        {/* Loan Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loan Amount
          </label>
          <input
            type="number"
            placeholder="Enter Loan Amount"
            defaultValue="1,000,000"
            className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-3 text-sm outline-none"
          />
        </div>

        {/* Repayment Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Repayment Duration
          </label>
          <div className="relative">
            <select
              id="duration"
              name="duration"
              className="appearance-none w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-3 text-sm text-gray-700 outline-none"
            >
              <option value="">Select Duration</option>
              <option value="3">3 months</option>
              <option value="6" selected>6 months</option>
              <option value="9">9 months</option>
              <option value="11">11 months</option>
              <option value="12">1 Year</option>
              <option value="24">2 Years</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
          </div>
        </div>
      </div>

   {/* Important Note */}
<div className="mb-6">
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
    <p className="text-sm text-[#E8A91D]">
      Kindly note that loan amount is{" "}
      <strong className="font-semibold">70%</strong> of product amount, you are
      required to pay the remaining <strong className="font-semibold">30%</strong>{" "}
      complete the <strong className="font-semibold">30%</strong> payment by
      funding your wallet directly with{" "}
      <strong className="font-semibold">300,000</strong>
    </p>
  </div>
</div>

{/* Loan Repayment Calculation */}
<div className="mb-6">
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 shadow-sm">
    <h3 className="text-lg font-semibold text-black mb-4">
      Loan Repayment Calculation
    </h3>

    <div className="space-y-4 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-600">Product Amount</span>
        <span className="font-medium">N1,300,000</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Loan Amount</span>
        <span className="font-medium">N1,000,000</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Down Payment</span>
        <span className="font-medium">N300,000</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Duration</span>
        <span className="font-medium">6 months</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Monthly Payment</span>
        <span className="font-medium">N170,000</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Interest Percentage</span>
        <span className="font-medium">5% Monthly</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Repayment Date</span>
        <span className="font-medium">25th Dec, 2025</span>
      </div>
    </div>
  </div>
</div>

    </div>
    </>

  );
};

export default LoanCalculator;