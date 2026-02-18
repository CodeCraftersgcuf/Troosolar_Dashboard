import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calculator, ArrowRight } from 'lucide-react';
import API from '../config/api.config';

const LoanCalculator = ({ totalAmount: totalAmountProp, onConfirm, loanConfig: loanConfigProp }) => {
  const isStandalone = totalAmountProp == null || totalAmountProp === undefined;

  const [loanConfig, setLoanConfig] = useState(loanConfigProp || null);
  const [configLoading, setConfigLoading] = useState(isStandalone);
  const [standaloneAmount, setStandaloneAmount] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!isStandalone || loanConfigProp) return;
    const fetchConfig = async () => {
      setConfigLoading(true);
      try {
        const res = await axios.get(API.CONFIG_LOAN_CONFIGURATION, { headers: { Accept: 'application/json' } });
        const data = res.data?.data ?? res.data;
        if (data && typeof data === 'object') {
          setLoanConfig(data);
        } else {
          setLoanConfig(null);
        }
      } catch (_) {
        setLoanConfig(null);
      } finally {
        setConfigLoading(false);
      }
    };
    fetchConfig();
  }, [isStandalone, loanConfigProp]);

  const config = loanConfigProp || loanConfig;
  const minDepositPercent = config?.equity_contribution_min ?? 30;
  const maxDepositPercent = config?.equity_contribution_max ?? 80;
  const minInterestRate = config?.interest_rate_min ?? 3;
  const maxInterestRate = config?.interest_rate_max ?? 4;
  const minAmount = Number(config?.minimum_loan_amount) || 1500000;
  const managementFeePercent = config?.management_fee_percentage ?? 1.0;
  const residualFeePercent = config?.residual_fee_percentage ?? 1.0;
  const allowedTenors = Array.isArray(config?.loan_durations) && config.loan_durations.length > 0
    ? config.loan_durations
    : [3, 6, 9, 12];

  const [depositPercent, setDepositPercent] = useState(minDepositPercent);
  const [tenor, setTenor] = useState(allowedTenors.includes(12) ? 12 : allowedTenors[0] || 12);
  const [interestRate, setInterestRate] = useState(maxInterestRate);

  const totalAmount = isStandalone
    ? Number(String(standaloneAmount).replace(/[^\d.]/g, '')) || 0
    : Number(totalAmountProp) || 0;

  const depositAmount = (totalAmount * depositPercent) / 100;
  const principal = totalAmount - depositAmount; // Total Loan Amount
  const totalInterest = principal * (interestRate / 100); // Flat % of total loan amount (configurable)
  const totalRepayment = principal + totalInterest; // Total Repayment Amount
  const monthlyRepayment = tenor > 0 ? totalRepayment / tenor : 0;
  const managementFee = principal * (managementFeePercent / 100);
  const residualFee = principal * (residualFeePercent / 100);

  const isEligible = totalAmount >= minAmount;
  const showMinError = isStandalone && touched && totalAmount > 0 && totalAmount < minAmount;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(Number(val) || 0);
  };

  useEffect(() => {
    if (Array.isArray(config?.loan_durations) && config.loan_durations.length > 0 && !allowedTenors.includes(tenor)) {
      setTenor(allowedTenors.includes(12) ? 12 : allowedTenors[0]);
    }
  }, [config?.loan_durations]);

  if (configLoading && isStandalone) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
        <p className="text-gray-500">Loading calculator settings…</p>
      </div>
    );
  }

  if (!isStandalone && !isEligible) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <h3 className="text-red-700 font-bold text-lg mb-2">Order Value Too Low</h3>
        <p className="text-red-600 mb-4">
          Your order total ({formatCurrency(totalAmountProp)}) does not meet the minimum {formatCurrency(minAmount)} amount required for credit financing.
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

      {isStandalone && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loan amount (₦)
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="e.g. 2000000"
            value={standaloneAmount}
            onChange={(e) => setStandaloneAmount(e.target.value)}
            onBlur={() => setTouched(true)}
            className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#273e8e] focus:border-[#273e8e] outline-none"
          />
          {showMinError && (
            <p className="mt-2 text-sm text-red-600">
              Minimum is {formatCurrency(minAmount)} (based on admin settings).
            </p>
          )}
          {!showMinError && totalAmount > 0 && totalAmount < minAmount && touched && (
            <p className="mt-2 text-sm text-red-600">
              Enter at least {formatCurrency(minAmount)} to see loan breakdown.
            </p>
          )}
        </div>
      )}

      {(!isStandalone || isEligible) && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Deposit ({depositPercent}%)
                </label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[30, 40, 50, 60, 70, 80].filter(p => p >= minDepositPercent && p <= maxDepositPercent).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setDepositPercent(p)}
                      className={`py-2 rounded-lg text-sm font-medium transition-colors ${depositPercent === p ? 'bg-[#273e8e] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {p}%
                    </button>
                  ))}
                </div>
                <p className="text-[#273e8e] font-bold mt-2 text-lg">{formatCurrency(depositAmount)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interest Rate (% of loan amount)
                </label>
                <div className="py-2 px-4 rounded-lg bg-[#273e8e] text-white text-sm font-medium inline-block">
                  {interestRate}%
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Tenor ({tenor} months)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {allowedTenors.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTenor(m)}
                      className={`py-2 rounded-lg text-sm font-medium transition-colors ${tenor === m ? 'bg-[#273e8e] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {m} Mo
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <h3 className="font-bold text-gray-800 border-b pb-2">Loan Breakdown</h3>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Amount</span>
                <span className="font-medium">{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Initial Deposit</span>
                <span className="font-medium text-red-600">−{formatCurrency(depositAmount)}</span>
              </div>
              <div className="flex justify-between text-sm border-b border-gray-200 pb-2">
                <span className="text-gray-500">Total Loan Amount</span>
                <span className="font-medium">{formatCurrency(principal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Interest Amount ({interestRate}% of loan)</span>
                <span className="font-medium text-orange-600">{formatCurrency(totalInterest)}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t">
                <span className="text-gray-500">Total Repayment Amount</span>
                <span className="font-bold">{formatCurrency(totalRepayment)}</span>
              </div>
              <div className="bg-[#273e8e] text-white p-4 rounded-lg mt-4">
                <p className="text-xs opacity-80 mb-1">Monthly Repayment Amount ({tenor} months)</p>
                <p className="text-2xl font-bold">{formatCurrency(monthlyRepayment)}</p>
              </div>
            </div>
          </div>

          {!isStandalone && onConfirm && (
            <div className="mt-8 pt-6 border-t flex justify-end">
              <button
                type="button"
                onClick={() => onConfirm({
                  totalAmount,
                  depositPercent,
                  depositAmount,
                  principal,
                  totalLoanAmount: principal,
                  interestRate,
                  totalInterestAmount: totalInterest,
                  totalRepaymentAmount: totalRepayment,
                  monthlyRepaymentAmount: monthlyRepayment,
                  tenor,
                  // legacy keys for backward compatibility
                  monthlyRepayment,
                  totalRepayment,
                  totalInterest,
                })}
                className="bg-[#273e8e] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#1a2b6b] transition-colors flex items-center"
              >
                Proceed with Plan <ArrowRight size={18} className="ml-2" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LoanCalculator;
