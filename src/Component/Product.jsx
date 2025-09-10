// import React, { useContext } from "react";
// import { ContextApi } from "../Context/AppContext";
// import { FaUserTie } from "react-icons/fa"; // Investor icon
// import { assets } from "../assets/data";

// const Product = ({
//   image,
//   heading,
//   price,
//   oldPrice,
//   discount,
//   soldText,
//   rating,
//   id,
// }) => {
//   const { addToCart } = useContext(ContextApi);

//   return (
//     <div className="max-w-[380px] w-full max-h-[460px] bg-white border border-gray-300 rounded-2xl p-2 space-y-5">
//       {/* Image Section */}
//       <div className="bg-gray-100 border-l-3 border-amber-400 h-[180px] flex justify-center items-center rounded-xl overflow-hidden">
//         <img
//           src={image}
//           alt="Solar bundle product"
//           className="w-[60%] h-[60%] object-contain"
//         />
//       </div>

//       {/* Title */}
//       <h2 className="text-[14px] font-normal text-gray-800">
//         {heading.slice(0, 24)}
//       </h2>

//       <hr className="mt-2 mb-2 border-gray-300" />

//       {/* Price and Investor Section */}
//       <div className="flex justify-between items-center">
//         {/* Left: Price Info */}
//         <div>
//           <p className="font-medium text-[#273E8E] text-lg">{price}</p>
//           <div className="flex items-center gap-2 mt-1">
//             <p className="text-gray-400 line-through text-[10px]">{oldPrice}</p>
//             <span className="px-2 py-[2px] rounded-full text-[#FFA500] text-[9px] bg-[#FFA500]/20">
//               {discount}
//             </span>
//           </div>
//         </div>

//         {/* Right: Investor + Rating */}
//         <div className="text-right space-y-2">
//           <div className="flex items-center justify-end gap-1 text-sm text-gray-600">
//             {/* <FaUserTie className="text-[#273E8E]" /> */}
//             <img className="h-4 w-4" src={assets.solarProject} alt="" />
//             <span>Investor</span>
//           </div>
//           <img
//             src={rating}
//             alt="Customer rating"
//             className="w-[70px] object-contain"
//           />
//         </div>
//       </div>

//       <hr className="border-gray-300" />

//       {/* Action Buttons */}
//       <div className="grid grid-cols-2 gap-3">
//         <button className="border border-[#273e8e]  text-xs rounded-full text-[#273e8e] ">
//           Learn More
//         </button>
//         <button
//           onClick={() => addToCart(id)}
//           className="py-1.5 text-xs rounded-full bg-[#273e8e] text-white "
//         >
//           Add to Cart
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Product;
// src/Component/Product.jsx
// import React, { useContext, useMemo } from "react";
// import { ContextApi } from "../Context/AppContext";
// import { assets } from "../assets/data";

// const formatTitle = (t) => {
//   const s = (t ?? "").toString();
//   return s.length > 60 ? `${s.slice(0, 57)}…` : s;
// };

// const Product = ({
//   image,
//   heading,
//   price,
//   oldPrice,
//   discount,
//   rating,
//   id,
// }) => {
//   const { addToCart } = useContext(ContextApi);

//   const safeImage =
//     image || assets?.placeholderProduct || "/placeholder-product.png";
//   const title = useMemo(() => formatTitle(heading), [heading]);

//   return (
//     <div className="max-w-[380px] w-full max-h-[460px] bg-white border border-gray-300 rounded-2xl p-2 space-y-5">
//       {/* Image */}
//       <div className="bg-gray-100 h-[180px] flex justify-center items-center rounded-xl overflow-hidden">
//         <img
//           src={safeImage}
//           alt={title || "Product"}
//           className="w-[60%] h-[60%] object-contain"
//         />
//       </div>

//       {/* Title */}
//       <h2 className="text-[14px] font-normal text-gray-800">{title || "—"}</h2>

//       <hr className="mt-2 mb-2 border-gray-300" />

//       {/* Price + Rating */}
//       <div className="flex justify-between items-center">
//         <div>
//           <p className="font-medium text-[#273E8E] text-lg">{price ?? "—"}</p>
//           {(oldPrice || discount) && (
//             <div className="flex items-center gap-2 mt-1">
//               {oldPrice && (
//                 <p className="text-gray-400 line-through text-[10px]">
//                   {oldPrice}
//                 </p>
//               )}
//               {discount && (
//                 <span className="px-2 py-[2px] rounded-full text-[#FFA500] text-[9px] bg-[#FFA500]/20">
//                   {discount}
//                 </span>
//               )}
//             </div>
//           )}
//         </div>

//         <div className="text-right space-y-2">
//           <div className="flex items-center justify-end gap-1 text-sm text-gray-600">
//             <img className="h-4 w-4" src={assets.solarProject} alt="" />
//             <span>Investor</span>
//           </div>
//           {rating ? (
//             <img src={rating} alt="Customer rating" className="w-[70px] object-contain" />
//           ) : null}
//         </div>
//       </div>

//       <hr className="border-gray-300" />

//       {/* Actions */}
//       <div className="grid grid-cols-2 gap-3">
//         <button className="border border-[#273e8e] text-xs rounded-full text-[#273e8e]">
//           Learn More
//         </button>
//         <button
//           onClick={() => addToCart && id && addToCart(id)}
//           className="py-1.5 text-xs rounded-full bg-[#273e8e] text-white disabled:opacity-60"
//           disabled={!id || !addToCart}
//         >
//           Add to Cart
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Product;

// src/Component/Product.jsx
import React, { useContext, useMemo, useState } from "react";
import axios from "axios";
import { ContextApi } from "../Context/AppContext";
import { assets } from "../assets/data";
import API from "../config/api.config";

const formatTitle = (t) => {
  const s = (t ?? "").toString();
  return s.length > 60 ? `${s.slice(0, 57)}…` : s;
};

const Product = ({
  image,
  heading,
  price,
  oldPrice,
  discount,
  rating,
  id,
}) => {
  const { addToCart } = useContext(ContextApi);
  const [adding, setAdding] = useState(false);
  const [err, setErr] = useState("");

  const safeImage =
    image || assets?.placeholderProduct || "/placeholder-product.png";
  const title = useMemo(() => formatTitle(heading), [heading]);

  const handleAddToCart = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.(); // <-- important when this card is wrapped in <Link>

    if (!id) return;

    const token = localStorage.getItem("access_token");
    // If no token, fall back to context (local cart)
    if (!token) {
      addToCart?.(id);
      return;
    }

    try {
      setErr("");
      setAdding(true);
      await axios.post(
        API.CART, // points to http://127.0.0.1:8000/api/cart
        {
          itemable_type: "product",
          itemable_id: Number(id),
          quantity: 1,
        },
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // (Optional) toast/snackbar here
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Failed to add.";
      setErr(msg);
      // If it's already in the cart (409), we silently ignore or show a tiny note
      // You can also navigate to /cart if you prefer.
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="max-w-[380px] w-full max-h-[460px] bg-white border border-gray-300 rounded-2xl p-2 space-y-5">
      {/* Image */}
      <div className="bg-gray-100 h-[180px] flex justify-center items-center rounded-xl overflow-hidden">
        <img
          src={safeImage}
          alt={title || "Product"}
          className="w-[60%] h-[60%] object-contain"
        />
      </div>

      {/* Title */}
      <h2 className="text-[14px] font-normal text-gray-800">
        {title || "—"}
      </h2>

      <hr className="mt-2 mb-2 border-gray-300" />

      {/* Price + Rating */}
      <div className="flex justify-between items-center">
        <div>
          <p className="font-medium text-[#273E8E] text-lg">{price ?? "—"}</p>
          {(oldPrice || discount) && (
            <div className="flex items-center gap-2 mt-1">
              {oldPrice && (
                <p className="text-gray-400 line-through text-[10px]">
                  {oldPrice}
                </p>
              )}
              {discount && (
                <span className="px-2 py-[2px] rounded-full text-[#FFA500] text-[9px] bg-[#FFA500]/20">
                  {discount}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="text-right space-y-2">
          <div className="flex items-center justify-end gap-1 text-sm text-gray-600">
            <img className="h-4 w-4" src={assets.solarProject} alt="" />
            <span>Investor</span>
          </div>
          {rating ? (
            <img
              src={rating}
              alt="Customer rating"
              className="w-[70px] object-contain"
            />
          ) : null}
        </div>
      </div>

      <hr className="border-gray-300" />

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button className="border border-[#273e8e] text-xs rounded-full text-[#273e8e]">
          Learn More
        </button>
        <button
          onClick={handleAddToCart}
          className="py-1.5 text-xs rounded-full bg-[#273e8e] text-white disabled:opacity-60"
          disabled={!id || adding}
          title={err || ""}
        >
          {adding ? "Adding…" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default Product;
