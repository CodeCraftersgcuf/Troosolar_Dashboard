import React from "react";
import { X, AlertCircle } from "lucide-react";

const InsufficientBalanceModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-50">
      {/* Modal */}
      <div className="bg-white rounded-2xl shadow-lg w-[400px] max-w-[90vw] relative mx-4">
        {/* Header */}
        <div className="relative flex items-center justify-center py-6 px-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Insufficient Balance</h2>
          <button
            onClick={onClose}
            className="absolute right-6 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning Icon */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="text-yellow-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Balance Available</h3>
            <p className="text-gray-600 text-center">
              Your referral balance is currently ₦0. You need to have a positive balance to make a withdrawal.
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-blue-900 mb-2">How to earn referral rewards:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Share your referral code with friends</li>
              <li>• Earn 30% bonus when they make purchases</li>
              <li>• Build up your referral balance over time</li>
            </ul>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-[#273e8e] text-white font-semibold py-3 rounded-xl hover:bg-[#1e327a] transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsufficientBalanceModal;
