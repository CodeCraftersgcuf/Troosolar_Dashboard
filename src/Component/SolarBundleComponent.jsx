import React, { useState } from "react";

const SolarBundleComponent = ({
  image,
  heading,
  price,
  oldPrice,
  discount,
  soldText,
  progressBar,
  rating,
  borderColor,
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Assuming image is the relative path, prepend the base URL
  // const imageUrl = `https://troosolar.hmstech.org/${image}`;

  const imageUrl = image;

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };
  return (
    <div
      className="sm:max-w-[243px] max-w-[500px] bg-white rounded-2xl p-2 shadow-sm"
      style={{ border: `2px solid ${borderColor}` }}
    >
      <div className="relative rounded-md mb-3 overflow-hidden">
        {/* Loading Indicator */}
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#273E8E]"></div>
          </div>
        )}

        {/* Error State */}
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center text-gray-400">
              <svg
                className="w-8 h-8 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-xs">Image unavailable</p>
            </div>
          </div>
        )}

        {/* Actual Image */}
        <img
          src={imageUrl}
          alt="Solar bundle product"
          className={`w-full h-auto transition-opacity duration-300 ${
            imageLoading ? "opacity-0" : "opacity-100"
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>
      {/* {bundleTitle && <h2 className="text-[16px] font-[400] mb-2">{bundleTitle}</h2>} */}
      {/* <hr className="mb-3 text-gray-400/40" /> */}

      <h2 className="text-[16px] font-[500] mb-2">{heading}</h2>

      <hr className="mb-3 text-gray-400/40" />

      <div className="flex justify-between items-start">
        {/* Left: Pricing */}
        <div>
          <p className="font-bold text-[#273E8E] text-lg">{price}</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-400 line-through text-sm">{oldPrice}</p>
            <span className="px-2 py-1 rounded-full text-[#FFA500] text-xs bg-[#FFA500]/20">
              {discount}
            </span>
          </div>
        </div>

        {/* Right: Progress & Rating */}
        <div className="space-y-2 text-right relative">
          <div>
            <p className="text-xs text-start text-gray-400 mb-1">{soldText}</p>
            {progressBar && (
              <img
                src={progressBar}
                alt="Progress bar"
                className="w-[100px] h-2 object-contain"
              />
            )}
          </div>
          <img
            src={rating}
            alt="Customer rating"
            className="w-[55px] absolute right-2 object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default SolarBundleComponent;
