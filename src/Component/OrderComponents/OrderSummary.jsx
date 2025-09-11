import React, { useState } from "react";
import { Check, ChevronLeft, Star } from "lucide-react";
import ReviewModal from "./ReviewModal";
import { assets } from "../../assets/data";

const OrderSummary = ({ order, onBack }) => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userReview, setUserReview] = useState(null);
  // Dummy data for the order summary - you can replace this with actual order data
  const orderData = {
    id: order?.id || "ORD-001",
    productName: "Newman 12200 AGM Solar Inverter",
    price: "N4,500,000",
    views: "12 views",
    deliveryDate: "Wed July 7th, 2025",
    deliveryAddress: "No 1, abcds street, Ikeja, Lagos",
    phoneNumber: "07012345678",
    estimatedDeliveryTime: "July 2 - 7, 2025",
    deliveryPrice: "N20,000",
    installationNote:
      "Installation will be carried one of our skilled technician, you can choose not to use our installers",
    estimatedInstallationTime: "July 2 - 7, 2025",
    installationPrice: "N25,000",
    paymentMethod: "Direct",
    charge: "Free",
    productImage:
      order?.productImage ||
      "https://troosolar.hmstech.org/storage/products/gallery/87177e7f-3879-4aba-9952-3a9e989dc0c0.png",
  };

  const handleReviewSubmit = (reviewData) => {
    console.log("Review submitted:", reviewData);
    // Set the user review to display it
    setUserReview({
      ...reviewData,
      userName: "Adewale", // You can get this from user context
      userInitials: "AD",
      date: new Date()
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        })
        .replace(/\//g, "-"),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Web Header with Back Arrow */}
      <div className="hidden sm:block bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="text-sm font-medium">Back to Order Details</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Success Confirmation Banner */}
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm mt-4 ">
          <div className="flex justify-center items-center">
            {/* Green Check Icon Circle */}
            <img
              src={assets.tick}
              alt="tick"
              className="w-20 h-20 align-middle mb-4"
            />
          </div>
          {/* Status Message */}
          <h2 className="text-sm font-semibold text-gray-900 text-center max-w-md mx-auto">
            Congratulations your order has been successfully delivered on{" "}
            {orderData.deliveryDate}
          </h2>
        </div>

        {/* Product Details Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Product Details
          </h3>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-start gap-4">
              {/* Product Image */}
              <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <img
                  src={orderData.productImage}
                  alt={orderData.productName}
                  className="w-16 h-16 bg-gray-200 rounded-lg object-cover"
                />
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  {orderData.productName}
                </h4>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded">
                    {orderData.views}
                  </span>
                </div>
                <p className="text-xl font-bold text-blue-600">
                  {orderData.price}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Details Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Delivery Details
          </h3>
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
            {/* Delivery Address */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Address</span>
                  <p className="text-sm font-medium text-gray-900">
                    {orderData.deliveryAddress}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Phone Number</span>
                  <p className="text-sm font-medium text-gray-900">
                    {orderData.phoneNumber}
                  </p>
                </div>
              </div>
            </div>

            {/* Estimated Time and Price */}
            <div className="flex justify-between items-center py-3 border-t border-gray-200 mt-4">
              <span className="text-sm text-gray-600">Estimated Time</span>
              <span className="text-sm font-medium text-gray-900">
                {orderData.estimatedDeliveryTime}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-sm text-gray-600">Price</span>
              <span className="text-sm font-bold text-blue-600">
                {orderData.deliveryPrice}
              </span>
            </div>
          </div>
        </div>

        {/* Installation Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Installation
          </h3>
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6 border-gray-500 border-1">
            {/* Installation Note */}
            <div className="bg-yellow-100 border-2 border-dashed border-orange-400 rounded-xl p-4">
              <p className="text-sm text-[#E8A91D]">
                {orderData.installationNote}
              </p>
            </div>

            {/* Estimated Time and Price */}
            <div className="flex justify-between items-center py-3 border-t border-gray-200 mt-4">
              <span className="text-sm text-gray-600">Estimated Time</span>
              <span className="text-sm font-medium text-gray-900">
                {orderData.estimatedInstallationTime}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-sm text-gray-600">Price</span>
              <span className="text-sm font-bold text-blue-600">
                {orderData.installationPrice}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment</h3>
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Payment method</span>
              <span className="text-sm font-medium text-gray-900">
                {orderData.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Charge</span>
              <span className="text-sm font-medium text-gray-900">
                {orderData.charge}
              </span>
            </div>
          </div>
        </div>

        {/* My Review Section - Only show if user has submitted a review */}
        {userReview && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              My Review
            </h3>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-start gap-4">
                {/* User Avatar */}
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-600 font-semibold text-sm">
                    {userReview.userInitials}
                  </span>
                </div>

                {/* Review Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1">
                        {userReview.userName}
                      </h4>
                      {/* Star Rating */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            className={`${
                              star <= userReview.rating
                                ? "text-blue-600 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {userReview.date}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {userReview.reviewText}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Button */}
      <div className="sm:relative sm:mt-6 fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="sm:max-w-md sm:mx-auto">
          <button
            onClick={() => setShowReviewModal(true)}
            className="w-full bg-[#273e8e] text-white font-semibold py-4 rounded-xl hover:bg-[#1e327a] transition-colors"
          >
            {userReview ? "Edit Review" : "Leave a review"}
          </button>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
};

export default OrderSummary;
