
// src/Component/CartItems.jsx
import React, { useContext } from "react";
import { Minus, Plus, Trash } from "lucide-react";
import { ContextApi } from "../Context/AppContext";

const CartItems = ({
  itemId,            // can be product id (context) OR cart-line id (API)
  name,
  price,
  image,
  showControls = true,

  // NEW (optional) when using API:
  quantity,         // override qty shown
  onIncrement,      // (id) => void
  onDecrement,      // (id) => void
  onDelete,         // (id) => void
}) => {
  const { addToCart, removeToCart, cartItems } = useContext(ContextApi);

  // If quantity is passed (API mode), use it; else fallback to context
  const itemQty = typeof quantity === "number"
    ? quantity
    : (cartItems[String(itemId)] || 0);

  const handleInc = () => (onIncrement ? onIncrement(itemId) : addToCart(itemId));
  const handleDec = () =>
    onDecrement ? onDecrement(itemId) : removeToCart(itemId);
  const handleDelete = () => onDelete && onDelete(itemId);

  return (
    <div className="min-h-[150px] w-full bg-white rounded-2xl border p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Product Image */}
        <div className="w-full sm:w-1/4 bg-[#f3f3f3] flex justify-center items-center rounded-2xl overflow-hidden">
          <img src={image} alt={name} className="h-[120px] object-contain" />
        </div>

        {/* Product Details */}
        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-2">
            <h2 className="text-lg sm:text-[15px]">{name}</h2>
            <p className="text-[16px] font-medium text-[#273e8e]">N{price}</p>
          </div>

          {/* Controls */}
          {showControls && (
            <div className="flex items-center justify-between mt-4">
              {/* Delete Button */}
              <button
                onClick={handleDelete}
                className="h-10 w-10 flex items-center justify-center rounded-lg shadow bg-white hover:bg-gray-100"
                aria-label="Remove item"
              >
                <Trash color="red" size={18} />
              </button>

              {/* Quantity Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDec}
                  className="h-7 w-7 flex items-center justify-center bg-[#273e8e] rounded-md text-white hover:bg-[#1f2f6e] transition"
                  aria-label="Decrease"
                >
                  <Minus size={16} />
                </button>

                <span className="text-lg font-medium">{itemQty}</span>

                <button
                  onClick={handleInc}
                  className="h-7 w-7 flex items-center justify-center bg-[#273e8e] rounded-md text-white hover:bg-[#1f2f6e] transition"
                  aria-label="Increase"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartItems;
