import React, { useState } from "react";
import { ChevronLeft } from "lucide-react";
import OrderSummary from "./OrderSummary";

const OrderDetails = ({ order, onBack }) => {
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  // Dummy data for the order details - you can replace this with actual order data
  const orderData = {
    id: order?.id || "ORD-001",
    productName: "Newman 12200 AGM Solar Inverter",
    price: "N1,500,000",
    status: "Pending",
    orderDate: "15 May, 25 - 09:22 AM",
    productImage: order?.productImage || "https://troosolar.hmstech.org/storage/products/gallery/87177e7f-3879-4aba-9952-3a9e989dc0c0.png", // Dummy image placeholder
    description: "High-quality AGM solar inverter with advanced features for residential and commercial use.",
    specifications: [
      "Power: 12V/200Ah",
      "Battery Type: AGM",
      "Warranty: 2 years",
      "Weight: 45kg",
    ],
  };

  const handleOrderItemClick = () => {
    setShowOrderSummary(true);
  };

  const handleBackFromSummary = () => {
    setShowOrderSummary(false);
  };

  // Show OrderSummary component if showOrderSummary is true
  if (showOrderSummary) {
    return <OrderSummary order={order} onBack={handleBackFromSummary} />;
  }

  const OrderItem = ({ productImage, productName, price }) => (
    <button
      onClick={handleOrderItemClick}
      className="w-full text-left bg-white rounded-2xl p-4 border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-start gap-4">
        {/* Product Image */}
        <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <img
            src={productImage}
            alt={productName}
            className="w-16 h-16 bg-gray-200 rounded-lg object-cover"
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 mb-1">{productName}</h3>
          <p className="text-lg font-bold text-blue-600">{price}</p>
        </div>
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Web Header with Back Arrow */}
      <div className="hidden sm:block bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ChevronLeft size={20} />
            <span className="text-sm font-medium">Back to Orders</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        {/* Order Items */}
        <div className="space-y-4">
          {/* Map through the order items and render them */}
          <OrderItem
            productImage={orderData.productImage}
            productName={orderData.productName}
            price={orderData.price}
          />
          <OrderItem
            productImage={orderData.productImage}
            productName={orderData.productName}
            price={orderData.price}
          />
          <OrderItem
            productImage={orderData.productImage}
            productName={orderData.productName}
            price={orderData.price}
          />
        </div>
      </div>

      {/* Bottom Action Button */}
      <div className="sm:relative sm:mt-6 fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="sm:max-w-md sm:mx-auto">
          <button className="w-full bg-[#273e8e] text-white font-semibold py-4 rounded-xl hover:bg-[#1e327a] transition-colors">
            View Full Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
