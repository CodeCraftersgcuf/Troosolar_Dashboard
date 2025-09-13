import React, { useState } from "react";
import { X, Star } from "lucide-react";

const ReviewModal = ({ isOpen, onClose, onSubmit }) => {
  const [rating, setRating] = useState(4);
  const [reviewText, setReviewText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ rating, reviewText });
    }
    setReviewText("");
    setRating(4);
    onClose();
  };

  const handleClose = () => {
    setReviewText("");
    setRating(4);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent bg-opacity-50">
      {/* Web Version - Centered Modal */}
      <div className="hidden sm:block">
        <div className="bg-white rounded-2xl shadow-lg w-[400px] max-w-[90vw] relative">
          {/* Header */}
          <div className="relative flex items-center justify-center py-2 px-6 border-b border-gray-200">
            <h2 className="text-md text-gray-900">
              Add a review
            </h2>
            <button
              onClick={handleClose}
              className="absolute right-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Star Rating */}
            <div className="flex items-center justify-center gap-2 mb-6 border-1 border-gray-300 rounded-xl px-2 py-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    size={24}
                    className={`${
                      star <= rating
                        ? "text-[#273e8e] fill-current"
                        : "text-gray-300"
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>

            {/* Review Text */}
            <div className="mb-6">
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Type here"
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#273e8e] focus:border-transparent resize-none text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="w-full bg-[#273e8e] text-white font-semibold py-3 rounded-xl hover:bg-[#1e327a] transition-colors"
            >
              Save
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Version - Bottom Sheet */}
      <div className="sm:hidden block w-full">
        <div className="bg-white rounded-t-3xl shadow-lg w-full max-h-[80vh] relative animate-slide-up">
          {/* Header */}
          <div className="relative flex items-center justify-center p-6 border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Add a review
            </h2>
            <button
              onClick={handleClose}
              className="absolute right-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Star Rating */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    size={28}
                    className={`${
                      star <= rating
                        ? "text-[#273e8e] fill-current"
                        : "text-gray-300"
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>

            {/* Review Text */}
            <div className="mb-6">
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Type here"
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#273e8e] focus:border-transparent resize-none text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="w-full bg-[#273e8e] text-white font-semibold py-4 rounded-xl hover:bg-[#1e327a] transition-colors"
            >
              Save
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
