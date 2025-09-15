import React from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#F5F7FF] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-6 sm:mb-8">
          <div className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-[#273e8e] mb-3 sm:mb-4">
            404
          </div>
          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 mx-auto bg-[#273e8e] rounded-full flex items-center justify-center mb-4 sm:mb-6">
            <Home size={24} className="text-white sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" />
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-2 sm:mb-3">
            Page Not Found
          </h1>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg px-2 sm:px-0">
            Sorry, the page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 sm:space-y-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-[#273e8e] text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg font-medium hover:bg-[#1e2f6b] transition-colors text-sm sm:text-base"
          >
            <Home size={16} className="sm:w-5 sm:h-5" />
            Go to Home
          </Link>

          <div className="pt-1 sm:pt-2">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 text-[#273e8e] px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg font-medium hover:bg-[#273e8e] hover:text-white transition-colors border border-[#273e8e] text-sm sm:text-base"
            >
              <ArrowLeft size={16} className="sm:w-5 sm:h-5" />
              Go Back
            </button>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
          <p className="text-xs sm:text-sm text-gray-500 px-2 sm:px-0">
            If you believe this is an error, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
