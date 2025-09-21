import React from "react";
import { Link } from "react-router-dom";
import { X, ShoppingCart, ArrowRight } from "lucide-react";

const CartNotification = ({ isOpen, onClose, productName, productImage }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                Added to Cart
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Product Info */}
            <div className="flex items-center gap-3">
              {productImage && (
                <img
                  src={productImage}
                  alt={productName}
                  className="h-16 w-16 object-cover rounded-lg bg-gray-100"
                />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  {productName}
                </p>
                <p className="text-xs text-gray-500">
                  Successfully added to your cart
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Link
                to="/cart"
                onClick={onClose}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#273e8e] text-white rounded-lg text-sm font-medium hover:bg-[#1f2f6e] transition-colors"
              >
                <ShoppingCart className="h-4 w-4" />
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Keep Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartNotification;
