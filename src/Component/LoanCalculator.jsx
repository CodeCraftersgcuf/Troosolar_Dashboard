import React, { useState, useEffect } from 'react';
import { Calculator, Calendar, DollarSign, ArrowRight } from 'lucide-react';

const LoanCalculator = ({ totalAmount, onConfirm, loanConfig }) => {
  // Use loan config from API if provided, otherwise use defaults
  const minDepositPercent = loanConfig?.equity_contribution_min || 30;
  const maxDepositPercent = loanConfig?.equity_contribution_max || 80;
  const minInterestRate = loanConfig?.interest_rate_min || 3;
  const maxInterestRate = loanConfig?.interest_rate_max || 4;
  const minAmount = loanConfig?.minimum_loan_amount || 1500000;
  const managementFeePercent = loanConfig?.management_fee_percentage || 1.0;
  const residualFeePercent = loanConfig?.residual_fee_percentage || 1.0;

  const [depositPercent, setDepositPercent] = useState(minDepositPercent);
  const [tenor, setTenor] = useState(12);
  const [interestRate, setInterestRate] = useState(maxInterestRate); // Use max as default

  // Calculations
  const depositAmount = (totalAmount * depositPercent) / 100;
  const principal = totalAmount - depositAmount;

  // Interest = Principal * Rate * Tenor
  const totalInterest = principal * (interestRate / 100) * tenor;
  
  // Management fee (1% of loan amount, paid upfront)
  const managementFee = principal * (managementFeePercent / 100);
  
  // Residual fee (1% of loan amount, paid at end)
  const residualFee = principal * (residualFeePercent / 100);
  
  // Total repayment includes principal, interest, and residual fee
  const totalRepayment = principal + totalInterest + residualFee;
  const monthlyRepayment = totalRepayment / tenor;

  const isEligible = totalAmount >= minAmount;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(val);
  };

  if (!isEligible) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <h3 className="text-red-700 font-bold text-lg mb-2">Order Value Too Low</h3>
        <p className="text-red-600 mb-4">
          Your order total ({formatCurrency(totalAmount)}) does not meet the minimum {formatCurrency(minAmount)} amount required for credit financing.
        </p>
        <p className="text-red-600">
          To qualify for Buy Now, Pay Later, please add more items to your cart. Thank you.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
      <div className="flex items-center mb-6">
        <div className="bg-blue-100 p-3 rounded-full mr-4">
          <Calculator className="text-[#273e8e]" size={24} />
        </div>
        <h2 className="text-2xl font-bold text-[#273e8e]">Loan Calculator</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Initial Deposit ({depositPercent}%)
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[30, 40, 50, 60, 70, 80].filter(p => p >= minDepositPercent && p <= maxDepositPercent).map((p) => (
                <button
                  key={p}
                  onClick={() => setDepositPercent(p)}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors ${depositPercent === p
                      ? 'bg-[#273e8e] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {p}%
                </button>
              ))}
            </div>
            <p className="text-[#273e8e] font-bold mt-2 text-lg">
              {formatCurrency(depositAmount)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Repayment Duration ({tenor} Months)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[3, 6, 9, 12].map((m) => (
                <button
                  key={m}
                  onClick={() => setTenor(m)}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors ${tenor === m
                      ? 'bg-[#273e8e] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {m} Mo
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-xl p-6 space-y-4">
          <h3 className="font-bold text-gray-800 border-b pb-2">Repayment Breakdown</h3>

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Loan Principal</span>
            <span className="font-medium">{formatCurrency(principal)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total Interest ({interestRate}%/mo)</span>
            <span className="font-medium text-orange-600">{formatCurrency(totalInterest)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Management Fee ({managementFeePercent}%)</span>
            <span className="font-medium text-orange-600">{formatCurrency(managementFee)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Residual Fee ({residualFeePercent}%)</span>
            <span className="font-medium text-orange-600">{formatCurrency(residualFee)}</span>
          </div>

          <div className="flex justify-between text-sm pt-2 border-t">
            <span className="text-gray-500">Total Repayment</span>
            <span className="font-bold">{formatCurrency(totalRepayment)}</span>
          </div>

          <div className="bg-[#273e8e] text-white p-4 rounded-lg mt-4">
            <p className="text-xs opacity-80 mb-1">Monthly Repayment</p>
            <p className="text-2xl font-bold">{formatCurrency(monthlyRepayment)}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t flex justify-end">
        <button
          onClick={() => onConfirm({
            depositPercent,
            tenor,
            depositAmount,
            monthlyRepayment,
            totalRepayment,
            principal,
            totalInterest,
            managementFee,
            residualFee
          })}
          className="bg-[#273e8e] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#1a2b6b] transition-colors flex items-center"
        >
          Proceed with Plan <ArrowRight size={18} className="ml-2" />
        </button>
      </div>
    </div>
  );
};

export default LoanCalculator;