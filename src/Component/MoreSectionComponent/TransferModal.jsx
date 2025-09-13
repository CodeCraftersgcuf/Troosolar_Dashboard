import React, { useState } from "react";
import { X } from "lucide-react";

const TransferModal = ({ isOpen, onClose, onProceed, maxAmount = 1000000 }) => {
  const [amount, setAmount] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    
    if (parseFloat(amount) > maxAmount) {
      alert("Amount cannot exceed available balance");
      return;
    }

    onProceed(parseFloat(amount));
    setAmount("");
    onClose();
  };

  const handleAllAmount = () => {
    setAmount(maxAmount.toString());
  };

  const handleClose = () => {
    setAmount("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-50">
      {/* Modal */}
      <div className="bg-white rounded-2xl shadow-lg w-[400px] max-w-[90vw] relative mx-4">
        {/* Header */}
        <div className="relative flex items-center justify-center py-6 px-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Transfer</h2>
          <button 
            onClick={handleClose}
            className="absolute right-6 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Amount Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#273e8e] focus:border-transparent text-gray-700 placeholder-gray-400"
                min="1"
                max={maxAmount}
                step="0.01"
              />
              <button
                type="button"
                onClick={handleAllAmount}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#273e8e] text-sm font-medium hover:text-[#1e327a] transition-colors"
              >
                All
              </button>
            </div>
          </div>

          {/* Proceed Button */}
          <button
            type="submit"
            className="w-full bg-[#273e8e] text-white font-semibold py-3 rounded-xl hover:bg-[#1e327a] transition-colors"
          >
            Proceed
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransferModal;
