import React, { useState } from "react";
import { Link } from "react-router-dom";

const SolarBundleComponent = ({
  id,
  image,
  heading,
  price,
  oldPrice,
  discount,
  soldText,
  progressBar,
  rating,
  borderColor,
  bundleTitle,
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
      className="w-full h-full sm:w-[243px] bg-white rounded-[24px] p-3 sm:p-4 shadow-sm flex flex-col min-h-[320px] sm:min-h-0"
      style={{ border: `2px solid ${borderColor || '#273e8e'}` }}
    >
      {/* Image: Fixed height container to prevent layout shift - matches Product component */}
      <div className="relative rounded-2xl mb-2 overflow-hidden bg-gray-100 h-[140px] sm:h-[180px] flex items-center justify-center">
        {/* Loading Indicator - Shows while image is loading */}
        {imageLoading && !imageError && (
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

        {/* Actual Image - Fixed size to prevent layout shift */}
        <img
          src={imageUrl}
          alt="Solar bundle product"
          className={`w-full h-full object-contain transition-opacity duration-300 ${
            imageLoading ? "opacity-0" : "opacity-100"
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>
      {/* {bundleTitle && <h2 className="text-[16px] font-[400] mb-2">{bundleTitle}</h2>} */}
      {/* <hr className="mb-3 text-gray-400/40" /> */}

      {/* Title - with fixed height to prevent layout shift */}
      <div className="min-h-[42px] mb-2">
        <h2 className="text-[13px] sm:text-[14px] font-medium text-slate-800 leading-snug line-clamp-2">
          {heading}
        </h2>
      </div>

      <hr className="border-gray-300 mb-2" />

      <div className="flex justify-between items-start mb-2">
        {/* Left: Pricing */}
        <div className="flex-1">
          <p className="font-semibold text-[#273E8E] text-[16px] max-sm:text-[14px]">{price}</p>
          {(oldPrice || discount) && (
            <div className="flex items-center gap-2 mt-1">
              {oldPrice && (
                <p className="text-gray-400 line-through text-[11px] max-sm:text-[8px]">{oldPrice}</p>
              )}
              {discount && (
                <span className="px-2 py-[2px] rounded-full text-[#FFA500] max-sm:text-[8px] text-[10px] bg-[#FFA500]/20 max-sm:px-1 max-sm:py-[1px]">
                  {discount}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right: Rating (simplified to match Product component) */}
        {rating && (
          <div className="ml-2">
            <img
              src={rating}
              alt="Customer rating"
              className="w-[55px] max-sm:w-[40px] object-contain"
            />
          </div>
        )}
      </div>

      <hr className="border-gray-300 mt-2 mb-3" />

      {/* Actions: Buttons similar to Product component */}
      <div className="grid grid-cols-2 gap-3 mt-auto">
        <Link
          to={`/productBundle/details/${id}`}
          className="h-10 border border-[#000000] text-[12px] max-sm:text-[8px] rounded-full max-sm:rounded-2xl text-[#181919] max-sm:h-7 flex items-center justify-center hover:bg-gray-50 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          Learn More
        </Link>
        <Link
          to={`/productBundle/details/${id}`}
          className="h-10 text-[10px] sm:text-[12px] rounded-full bg-[#273e8e] max-sm:text-[8px] max-sm:rounded-2xl max-sm:h-7 text-white flex items-center justify-center hover:bg-[#1a2b6b] transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          Buy Now
        </Link>
      </div>
    </div>
  );
};

export default SolarBundleComponent;
