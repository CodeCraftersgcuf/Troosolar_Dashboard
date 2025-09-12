import React, { useState, useEffect } from "react";
import { Check, ChevronLeft, Star, Loader2 } from "lucide-react";
import ReviewModal from "./ReviewModal";
import { assets } from "../../assets/data";
import API, { BASE_URL } from "../../config/api.config";
import axios from "axios";

const OrderSummary = ({ order, onBack }) => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch order details from API
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("access_token");
        const response = await axios.get(`${API.ORDERS}/${order.id}`, {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (response.data.status === "success") {
          const data = response.data.data;
          
          // Transform API data to match component structure
          const transformedData = {
            id: data.id,
            orderNumber: data.order_number,
            orderStatus: data.order_status,
            paymentStatus: data.payment_status,
            productName: data.items?.[0]?.item?.title || "Product",
            price: `N${parseFloat(data.total_price).toLocaleString()}`,
            views: "12 views", // This might not be in API response
            deliveryDate: new Date(data.created_at).toLocaleDateString("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
            deliveryAddress: data.delivery_address?.address || "Address not provided",
            phoneNumber: data.delivery_address?.phone_number || "Phone not provided",
            estimatedDeliveryTime: "July 2 - 7, 2025", // This might need to be calculated or from API
            deliveryPrice: "N20,000", // This might need to be from API
            installationNote: "Installation will be carried out by one of our skilled technicians, you can choose not to use our installers",
            estimatedInstallationTime: data.installation?.installation_date 
              ? new Date(data.installation.installation_date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "July 2 - 7, 2025",
            installationPrice: data.installation?.installation_fee 
              ? `N${parseFloat(data.installation.installation_fee).toLocaleString()}`
              : "N25,000",
            paymentMethod: data.payment_method === "direct" ? "Direct" : data.payment_method,
            charge: "Free", // This might need to be from API
            productImage: data.items?.[0]?.item?.featured_image 
              ? `${BASE_URL.replace('/api', '')}${data.items[0].item.featured_image}`
              : "https://troosolar.hmstech.org/storage/products/gallery/87177e7f-3879-4aba-9952-3a9e989dc0c0.png",
            technicianName: data.installation?.technician_name,
            userInfo: data.user_info,
            includeUserInfo: data.include_user_info,
            // Additional API data
            rawData: data, // Keep original data for reference
            quantity: data.items?.[0]?.quantity || 1,
            unitPrice: data.items?.[0]?.unit_price || data.total_price,
            subtotal: data.items?.[0]?.subtotal || data.total_price,
          };
          
          setOrderData(transformedData);
        }
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    if (order?.id) {
      fetchOrderDetails();
    } else {
      setError("Order ID not provided");
      setLoading(false);
    }
  }, [order?.id]);

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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#273e8e]" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-x-2">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#273e8e] text-white rounded-lg hover:bg-[#1e327a] transition-colors"
            >
              Retry
            </button>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No order data available</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-[#273e8e] text-white rounded-lg hover:bg-[#1e327a] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

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
      <div className="px-4 py-6 space-y-6 bg-white">
        {/* Success Confirmation Banner */}
        <div className="bg-white rounded-2xl p-6 text-center mt-4 border border-gray-300">
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
            <b>Congratulations</b> your order {orderData.orderNumber} has been successfully delivered on{" "}
            {orderData.deliveryDate}
          </h2>
          <div className="mt-2 text-xs text-gray-600">
            Order Status: <span className="font-medium capitalize">{orderData.orderStatus}</span> | 
            Payment Status: <span className="font-medium capitalize">{orderData.paymentStatus}</span>
          </div>
        </div>

        {/* Product Details Section */}
        <div>
          <div className="flex ">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Product Details
            </h3>
            <hr className="border-gray-300" />
          </div>
          <div className="bg-white rounded-2xl p-2 border border-gray-300">
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
                  <span className="bg-purple-100 text-[#000000] text-xs px-2 py-1 rounded">
                    Qty: {orderData.quantity}
                  </span>
                  <span className="bg-gray-100 text-[#000000] text-xs px-2 py-1 rounded">
                    {orderData.views}
                  </span>
                </div>
                <p className="text-xl font-bold text-[#273E8E]">
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
          <div className="bg-white rounded-2xl border border-gray-300 ">
            {/* Card Header */}
            <div className="px-6 py-3 border-b border-gray-200">
              <h2 className="text-base font-medium text-gray-900">
                Delivery Address
              </h2>
            </div>

            <div className="p-6 pb-1 space-y-6">
              {/* Delivery Address Box */}
              <div className="bg-gray-100 rounded-xl p-4 space-y-3">
                <div>
                  <span className="block text-sm text-gray-600">Address</span>
                  <p className="text-sm font-medium text-gray-900">
                    {orderData.deliveryAddress}
                  </p>
                </div>
                <div>
                  <span className="block text-sm text-gray-600">
                    Phone Number
                  </span>
                  <p className="text-sm font-medium text-gray-900">
                    {orderData.phoneNumber}
                  </p>
                </div>
              </div>

              {/* Estimated Time */}
              <div className="flex justify-between items-center py-3 border-t border-gray-200">
                <span className="text-sm text-gray-600">Estimated time</span>
                <span className="text-sm font-medium text-gray-900">
                  {orderData.estimatedDeliveryTime}
                </span>
              </div>

              {/* Price */}
              <div className="flex justify-between items-center py-3 border-t border-gray-200">
                <span className="text-sm text-gray-600">Price</span>
                <span className="text-sm font-bold text-blue-900">
                  {orderData.deliveryPrice}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Installation Section */}
        <div className="bg-white rounded-2xl border border-gray-300">
          {/* Card Header */}
          <div className="px-6 py-3 border-b border-gray-300">
            <h3 className="text-base font-medium text-gray-900">
              Installation
            </h3>
          </div>

          <div className="p-6 pb-1 space-y-6">
            {/* Installation Note */}
            <div className="bg-gray-100 border-2 border-dashed border-blue-600 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                {orderData.installationNote}
              </p>
            </div>

            {/* Estimated Time */}
            <div className="flex justify-between items-center py-3 border-t border-gray-200">
              <span className="text-sm text-gray-600">Estimated time</span>
              <span className="text-sm font-medium text-gray-900">
                {orderData.estimatedInstallationTime}
              </span>
            </div>

            {/* Price */}
            <div className="flex justify-between items-center py-3 border-t border-gray-200">
              <span className="text-sm text-gray-600">Price</span>
              <span className="text-sm font-bold text-blue-900">
                {orderData.installationPrice}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Payment</h3>
          <div className="bg-white rounded-2xl p-2 border border-gray-300 space-y-4">
            <div className="flex justify-between items-center p-2">
              <span className="text-sm text-gray-600">Payment method</span>
              <span className="text-sm font-medium text-gray-900">
                {orderData.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between items-center p-2">
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
      <div className="sm:relative fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
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
