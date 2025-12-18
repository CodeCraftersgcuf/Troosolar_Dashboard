import React, { useState, useEffect } from "react";
import { assets } from "../assets/data";

const Loading = ({ 
  message = "Loading...", 
  progress = null, // 0-100, if null will auto-animate
  fullScreen = false,
  className = "" 
}) => {
  const [currentProgress, setCurrentProgress] = useState(0);

  useEffect(() => {
    if (progress !== null) {
      setCurrentProgress(progress);
      return;
    }

    // Auto-animate progress if not provided
    const interval = setInterval(() => {
      setCurrentProgress((prev) => {
        if (prev >= 100) return 0; // Reset to 0 for continuous animation
        return prev + 10;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [progress]);

  // Determine which image to show based on progress
  const loadingImage = currentProgress < 50 ? assets.loading1 : assets.loading2;
  const displayProgress = Math.min(100, Math.max(0, currentProgress));

  const content = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative mb-4">
        <img 
          src={loadingImage} 
          alt="Loading" 
          className="w-64 h-64 sm:w-80 sm:h-80 object-contain"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl sm:text-5xl font-bold text-white">
            {displayProgress}%
          </span>
        </div>
      </div>
      {message && (
        <p className="text-gray-600 text-sm sm:text-base mt-4 text-center">
          {message}
        </p>
      )}
      <div className="mt-4 w-64 sm:w-80 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#273e8e] transition-all duration-500 ease-out"
          style={{ width: `${displayProgress}%` }}
        />
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};

export default Loading;

