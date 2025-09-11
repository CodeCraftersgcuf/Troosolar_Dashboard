import { ChevronLeft, ChevronDown } from "lucide-react";
import React, { useState } from "react";

const WithdrawalAccountPage = ({ onBack, onProceed }) => {
  const [accountNumber, setAccountNumber] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [accountName] = useState("QAMARDEEN ABDULMALIK");
  const [saveAccount, setSaveAccount] = useState(true);
  const [showBankDropdown, setShowBankDropdown] = useState(false);

  const banks = [
    "Access Bank",
    "Citibank",
    "Diamond Bank",
    "Ecobank",
    "Fidelity Bank",
    "First Bank of Nigeria",
    "First City Monument Bank",
    "Guaranty Trust Bank",
    "Heritage Bank",
    "Keystone Bank",
    "Kuda Bank",
    "Opay",
    "PalmPay",
    "Polaris Bank",
    "Providus Bank",
    "Stanbic IBTC Bank",
    "Standard Chartered Bank",
    "Sterling Bank",
    "Suntrust Bank",
    "Union Bank of Nigeria",
    "United Bank For Africa",
    "Unity Bank",
    "VFD",
    "Wema Bank",
    "Zenith Bank"
  ];

  const handleProceed = (e) => {
    e.preventDefault();
    if (!accountNumber || !selectedBank) {
      alert("Please fill in all required fields");
      return;
    }
    // Handle withdrawal logic here
    console.log("Withdrawal details:", {
      accountNumber,
      bank: selectedBank,
      accountName,
      saveAccount
    });
    if (onProceed) {
      onProceed();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center py-4 px-4 bg-white border-b border-gray-100">
        <button onClick={onBack} className="p-1">
          <ChevronLeft className="text-black" size={24} />
        </button>
        <h1 className="text-lg font-semibold text-black ml-4">Withdrawal Account</h1>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        <form onSubmit={handleProceed} className="space-y-6">
          {/* Account Number */}
          <div>
            <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Account Number
            </label>
            <input
              id="accountNumber"
              type="text"
              placeholder="Enter your Account Number"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
            />
          </div>

          {/* Bank Name */}
          <div>
            <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-2">
              Bank Name
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowBankDropdown(!showBankDropdown)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left flex items-center justify-between bg-white"
              >
                <span className={selectedBank ? "text-gray-900" : "text-gray-400"}>
                  {selectedBank || "Select Bank"}
                </span>
                <ChevronDown className="text-gray-400" size={20} />
              </button>
              
              {showBankDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {banks.map((bank, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setSelectedBank(bank);
                        setShowBankDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl"
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Account Name */}
          <div>
            <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-2">
              Account Name
            </label>
            <input
              id="accountName"
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-600"
              value={accountName}
              readOnly
            />
          </div>

          {/* Save Account Checkbox */}
          <div className="flex items-center">
            <input
              id="saveAccount"
              type="checkbox"
              checked={saveAccount}
              onChange={(e) => setSaveAccount(e.target.checked)}
              className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="saveAccount" className="ml-3 text-sm text-gray-700">
              Save account for later withdrawals
            </label>
          </div>

          {/* Information Box */}
          <div className="border-2 border-dashed border-yellow-400 rounded-xl p-4 bg-yellow-50">
            <p className="text-gray-600 text-sm text-center">
              Your account will be credited in the next 24 - 48 hours
            </p>
          </div>

          {/* Proceed Button */}
          <button
            type="submit"
            className="w-full bg-[#273e8e] text-white font-semibold py-4 rounded-xl hover:bg-[#1e327a] transition-colors"
          >
            Proceed
          </button>
        </form>
      </div>
    </div>
  );
};

export default WithdrawalAccountPage;
