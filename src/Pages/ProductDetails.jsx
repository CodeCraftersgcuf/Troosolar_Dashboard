
// // ProductDetails.jsx
// import React, { useContext, useEffect, useMemo, useState } from "react";
// import { Link, useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import toast from "react-hot-toast";
// import { assets, starsArr } from "../assets/data";
// import SideBar from "../Component/SideBar";
// import TopNavbar from "../Component/TopNavbar";
// import LoanPopUp from "../Component/LoanPopUp";
// import { BsExclamationTriangle } from "react-icons/bs";
// import { Minus, Plus } from "lucide-react";
// import { ContextApi } from "../Context/AppContext";
// import API, { BASE_URL } from "../config/api.config";

// // helpers
// const formatNGN = (n) => {
//   if (n == null || n === "") return "—";
//   const num = Number(n);
//   if (Number.isNaN(num)) return String(n);
//   try {
//     return `₦${new Intl.NumberFormat("en-NG").format(num)}`;
//   } catch {
//     return `₦${num}`;
//   }
// };

// const mapApiProductToDetails = (p) => {
//   if (!p) return null;

//   const image =
//     p.featured_image ||
//     p?.images?.[0]?.image ||
//     assets?.placeholderProduct ||
//     "/placeholder-product.png";

//   const heading = p.name || p.title || p.product_name || `Product #${p.id ?? ""}`;

//   const priceRaw = p.price ?? p.amount ?? p.sale_price ?? p.product_price;
//   const oldRaw = p.compare_at_price ?? p.old_price;

//   const price = formatNGN(priceRaw);
//   const oldPrice = oldRaw != null ? formatNGN(oldRaw) : "";

//   let discount = "";
//   if (Number(oldRaw) > Number(priceRaw)) {
//     const pct = Math.round(((Number(oldRaw) - Number(priceRaw)) / Number(oldRaw)) * 100);
//     discount = `-${pct}%`;
//   }

//   const categoryLabel =
//     p?.category?.name || p?.category_name || p?.category || "Category";

//   return {
//     id: p.id,
//     image,
//     heading,
//     price,
//     oldPrice,
//     discount,
//     rating: assets?.fiveStars || assets?.rating || "",
//     progressBar: assets?.progressBar || "",
//     soldText: p?.sold_text || "Popular",
//     category: categoryLabel,
//     _price_raw: priceRaw,
//   };
// };

// // ---- Reviews helpers
// const PRODUCT_REVIEWS_URL =
//   (API && API.PRODUCT_REVIEWS) ? API.PRODUCT_REVIEWS : `${BASE_URL}/product-reviews`;

// const safeArray = (v) => (Array.isArray(v) ? v : []);
// const toNum = (v, d = 0) => {
//   const n = Number(v);
//   return Number.isFinite(n) ? n : d;
// };
// const avgRating = (list) => {
//   if (!list.length) return 0;
//   const sum = list.reduce((s, r) => s + toNum(r.rating, 0), 0);
//   return +(sum / list.length).toFixed(1);
// };
// const initials = (name = "") => {
//   const parts = String(name).trim().split(/\s+/);
//   if (!parts.length) return "U";
//   return (parts[0][0] || "U").toUpperCase() + (parts[1]?.[0]?.toUpperCase() || "");
// };
// const fmtDate = (s) => {
//   const d = new Date((s || "").replace(" ", "T"));
//   if (isNaN(d.getTime())) return "—";
//   const dd = d.getDate().toString().padStart(2, "0");
//   const mm = (d.getMonth() + 1).toString().padStart(2, "0");
//   const yy = String(d.getFullYear()).slice(-2);
//   return `${dd}-${mm}-${yy}`;
// };

// export default function ProductDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { addToCart, removeToCart, cartItems, registerProducts } = useContext(ContextApi);
//   const [installUnit, setInstallUnit] = useState(0);

//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");
//   const [showReview, setShowReview] = useState(true);
//   const [balance, setBalance] = useState(false);

//   // ---- Reviews state
//   const [reviews, setReviews] = useState([]);
//   const [submitting, setSubmitting] = useState(false);
//   const [newRating, setNewRating] = useState(5);
//   const [newText, setNewText] = useState("");

//   const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

//   useEffect(() => {
//     let isMounted = true;
//     (async () => {
//       setLoading(true);
//       setErr("");
//       try {
//         const t = localStorage.getItem("access_token");
//         const { data } = await axios.get(API.PRODUCT_BY_ID(id), {
//           headers: {
//             Accept: "application/json",
//             ...(t ? { Authorization: `Bearer ${t}` } : {}),
//           },
//         });
//         const raw = data?.data ?? data;
//         registerProducts(raw); // keep your cart rendering compatible
//         setInstallUnit(
//           Number(raw?.installation_price ?? raw?.install_price ?? raw?.installation_cost ?? 0)
//         );

//         const mapped = mapApiProductToDetails(raw);
//         if (isMounted) {
//           if (!mapped?.id) setErr("Product not found.");
//           else {
//             setProduct(mapped);
//             // pull reviews if present
//             const serverReviews = safeArray(raw?.reviews).map((r) => ({
//               id: r.id,
//               product_id: r.product_id,
//               user_id: r.user_id,
//               name: r.user?.name || r.user?.first_name || "User",
//               rating: toNum(r.rating, 0),
//               review: r.review || "",
//               created_at: r.created_at,
//             }));
//             setReviews(serverReviews);
//           }
//         }
//       } catch (e) {
//         if (isMounted) {
//           setErr(e?.response?.data?.message || e?.message || "Failed to load product.");
//         }
//       } finally {
//         isMounted && setLoading(false);
//       }
//     })();
//     return () => {
//       isMounted = false;
//     };
//   }, [id, registerProducts]);

//   const qtyInCart = useMemo(() => {
//     if (!product?.id) return 0;
//     return cartItems[String(product.id)] || 0;
//   }, [cartItems, product]);

//   const rememberInstallPrice = (productId, unit) => {
//     try {
//       const key = "install_price_map";
//       const cur = JSON.parse(localStorage.getItem(key) || "{}");
//       cur[String(productId)] = Number(unit) || 0;
//       localStorage.setItem(key, JSON.stringify(cur));
//     } catch {}
//   };

//   // ───────────────────────────────────────────────────────────
//   // Helpers to work with API cart for THIS product
//   // ───────────────────────────────────────────────────────────
//   const isProductType = (t) => /Product/i.test(t || "");

//   const fetchCartAndFindLine = async (tok, productId) => {
//     const res = await axios.get(API.CART, {
//       headers: { Accept: "application/json", Authorization: `Bearer ${tok}` },
//     });
//     const payload = res?.data;
//     const items = Array.isArray(payload?.data)
//       ? payload.data
//       : Array.isArray(payload)
//       ? payload
//       : [];
//     const pid = String(productId);
//     return items.find((x) => {
//       const a = String(x?.itemable_id ?? "");
//       const b = String(x?.itemable?.id ?? "");
//       return a === pid || b === pid;
//     });
//   };

//   const syncLocalQty = (productId, serverQty) => {
//     const localQty = cartItems[String(productId)] || 0;
//     if (serverQty === localQty) return;
//     if (serverQty > localQty) {
//       const inc = Math.min(serverQty - localQty, 50);
//       for (let i = 0; i < inc; i++) addToCart(productId);
//     } else {
//       const dec = Math.min(localQty - serverQty, 50);
//       for (let i = 0; i < dec; i++) removeToCart(productId);
//     }
//   };

//   const handleAddToCart = async () => {
//     if (!product?.id) return;
//     const tok = localStorage.getItem("access_token");
//     if (!tok) {
//       toast.error("Please log in to add items to cart.");
//       return;
//     }

//     try {
//       await axios.post(
//         API.CART,
//         {
//           itemable_type: "product",
//           itemable_id: Number(product.id),
//           quantity: 1,
//         },
//         {
//           headers: {
//             Accept: "application/json",
//             Authorization: `Bearer ${tok}`,
//           },
//         }
//       );
//       const line = await fetchCartAndFindLine(tok, product.id);
//       const serverQty = Number(line?.quantity || 1);
//       rememberInstallPrice(product.id, installUnit);
//       syncLocalQty(product.id, serverQty);
//       toast.success("Added to cart");
//     } catch (e) {
//       if (e?.response?.status === 409) {
//         try {
//           const line = await fetchCartAndFindLine(tok, product.id);
//           if (!line) {
//             toast.error("Item already in cart, but couldn't locate it to update.");
//             return;
//           }
//           const newQty = Number(line.quantity || 0) + 1;
//           await axios.put(
//             API.CART_ITEM(line.id),
//             { quantity: newQty },
//             {
//               headers: {
//                 Accept: "application/json",
//                 Authorization: `Bearer ${tok}`,
//               },
//             }
//           );
//           rememberInstallPrice(product.id, installUnit);
//           syncLocalQty(product.id, newQty);
//           toast.success("Cart updated");
//         } catch (e2) {
//           toast.error(e2?.response?.data?.message || e2.message || "Failed to update cart");
//         }
//       } else {
//         toast.error(e?.response?.data?.message || e.message || "Failed to add to cart");
//       }
//     }
//   };

//   const handleDecrease = async () => {
//     if (!product?.id) return;
//     const tok = localStorage.getItem("access_token");
//     if (!tok) {
//       toast.error("Please log in to update cart.");
//       return;
//     }

//     try {
//       const line = await fetchCartAndFindLine(tok, product.id);
//       const current = Number(line?.quantity || 0);
//       if (!line || current <= 0) {
//         syncLocalQty(product.id, 0);
//         return;
//       }

//       if (current > 1) {
//         const newQty = current - 1;
//         await axios.put(
//           API.CART_ITEM(line.id),
//           { quantity: newQty },
//           {
//             headers: {
//               Accept: "application/json",
//               Authorization: `Bearer ${tok}`,
//             },
//           }
//         );
//         syncLocalQty(product.id, newQty);
//       } else {
//         await axios.delete(API.CART_ITEM(line.id), {
//           headers: { Accept: "application/json", Authorization: `Bearer ${tok}` },
//         });
//         syncLocalQty(product.id, 0);
//       }
//     } catch (e) {
//       toast.error(e?.response?.data?.message || e.message || "Failed to update cart");
//     }
//   };

//   // ───────────────────────────────────────────────────────────
//   // Submit Review
//   // ───────────────────────────────────────────────────────────
//   const handleSubmitReview = async () => {
//     if (!product?.id) return;
//     if (!token) {
//       toast.error("Please log in to add a review.");
//       return;
//     }
//     if (!newText.trim()) {
//       toast.error("Please enter your review text.");
//       return;
//     }
//     setSubmitting(true);
//     try {
//       const payload = {
//         product_id: Number(product.id),
//         review: newText.trim(),
//         rating: String(newRating), // backend accepts string number
//       };
//       const { data } = await axios.post(PRODUCT_REVIEWS_URL, payload, {
//         headers: {
//           Accept: "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const saved = (data && data.data) || null;
//       if (saved) {
//         // append to local list for instant feedback
//         setReviews((prev) => [
//           ...prev,
//           {
//             id: saved.id,
//             product_id: saved.product_id,
//             user_id: saved.user_id,
//             name: "You",
//             rating: toNum(saved.rating, toNum(newRating, 0)),
//             review: saved.review || newText.trim(),
//             created_at: saved.created_at || new Date().toISOString(),
//           },
//         ]);
//         setNewText("");
//         setNewRating(5);
//         toast.success("Review submitted");
//       } else {
//         toast.success("Review submitted");
//         setNewText("");
//         setNewRating(5);
//       }
//     } catch (e) {
//       toast.error(e?.response?.data?.message || e.message || "Failed to submit review");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#F5F7FF] flex items-center justify-center">
//         <div className="animate-pulse text-gray-600">Loading product…</div>
//       </div>
//     );
//   }

//   if (err) {
//     return (
//       <div className="min-h-screen bg-[#F5F7FF] flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-red-600 mb-4">{err}</p>
//           <button
//             onClick={() => navigate(-1)}
//             className="px-4 py-2 rounded-full bg-[#273e8e] text-white"
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!product) return null;

//   const average = avgRating(reviews);
//   const totalReviews = reviews.length;

//   return (
//     <>
//       {/* Desktop */}
//       <div className="sm:flex hidden  min-h-screen w-full bg-[#F5F7FF]">
//         <SideBar />

//         {balance && (
//           <LoanPopUp
//             icon={<BsExclamationTriangle color="white" size={26} />}
//             text="Your loan balance is low, kindly apply for one to proceed"
//             link="/"
//             link2="/loan"
//             link1Text="Back"
//             link2Text="Appy for loan"
//             imgBg="bg-[#FFA500]"
//           />
//         )}

//         <div className="flex-1">
//           <TopNavbar />

//           <div className="p-4 sm:p-6">
//             <div className="flex items-center justify-between mb-4">
//               <h1 className="text-xl sm:text-2xl font-medium">
//                 {product.category}
//               </h1>
//               <Link
//                 to="/homePage"
//                 className="text-blue-600 hover:underline text-sm sm:text-base"
//               >
//                 Go Back
//               </Link>
//             </div>

//             <div className="flex flex-col lg:flex-row gap-6">
//               {/* Left */}
//               <div className="w-full lg:w-1/2">
//                 <div className="h-[400px] sm:h-[500px] w-full border border-gray-200 flex justify-center items-center bg-white rounded-xl p-4">
//                   <img
//                     src={product.image}
//                     alt={product.heading}
//                     className="h-full w-full object-contain"
//                     loading="eager"
//                   />
//                 </div>

//                 <div className="mt-6 space-y-4">
//                   {balance ? (
//                     <>
//                       <button className="w-full py-3 bg-[#273e8e] text-white rounded-full hover:bg-[#273e8e]/90 transition">
//                         Buy With Loan
//                       </button>
//                       <div className="grid grid-cols-2 gap-4">
//                         <button
//                           onClick={handleAddToCart}
//                           className="py-3 border border-[#273e8e] rounded-full hover:bg-[#273e8e]/10 transition"
//                         >
//                           Add To Cart
//                         </button>
//                         <Link
//                           to="/cart"
//                           className="py-3 bg-black text-white rounded-full text-center hover:bg-[#273e8e]/90 transition"
//                         >
//                           Buy Now
//                         </Link>
//                       </div>
//                     </>
//                   ) : (
//                     <>
//                       <div className="grid grid-cols-2 gap-4">
//                         <button
//                           onClick={handleAddToCart}
//                           className="py-4 border border-[#273e8e] rounded-full hover:bg-[#273e8e]/10 transition"
//                         >
//                           Add To Cart
//                         </button>
//                         <Link
//                           to="/cart"
//                           className="py-4 bg-[#273e8e] text-white rounded-full text-center hover:bg-[#273e8e]/90 transition"
//                         >
//                           Buy Now
//                         </Link>
//                       </div>
//                       <div className="p-4 mt-6 bg-yellow-50 rounded-lg">
//                         <p className="text-yellow-600 text-sm pb-5 sm:text-base">
//                           Don't have the finances to proceed? Take a loan and repay at your convenience
//                         </p>
//                         <Link
//                           to="/loan"
//                           className="bg-[#E8A91D] py-2 px-6 text-white rounded-full text-sm hover:bg-[#E8A91D]/90 transition"
//                         >
//                           Apply
//                         </Link>
//                       </div>
//                     </>
//                   )}
//                 </div>
//               </div>

//               {/* Right */}
//               <div className="w-full lg:w-1/2">
//                 <div className="border-2 border-[#273e8e] bg-white p-4 rounded-xl">
//                   <h1 className="text-lg sm:text-xl font-medium">
//                     {product.heading}
//                   </h1>
//                   <div className="mt-3">
//                     <h2 className="text-xl sm:text-2xl text-[#273e8e] font-bold">
//                       {product.price}
//                     </h2>
//                     <div className="flex items-center gap-2 mt-1">
//                       {product.oldPrice && (
//                         <p className="text-gray-400 line-through text-sm">
//                           {product.oldPrice}
//                         </p>
//                       )}
//                       {product.discount && (
//                         <span className="px-2 py-1 rounded-full text-orange-500 text-xs bg-orange-100">
//                           {product.discount}
//                         </span>
//                       )}
//                     </div>
//                     <div className="flex justify-between items-center mt-3">
//                       <div className="flex items-center">
//                         {product.progressBar ? (
//                           <img
//                             src={product.progressBar}
//                             alt="Progress"
//                             className="w-20 h-2 object-contain"
//                           />
//                         ) : null}
//                         <p className="text-xs text-gray-500 ml-2">
//                           {product.soldText}
//                         </p>
//                       </div>
//                       {product.rating ? (
//                         <img
//                           src={product.rating}
//                           alt="Rating"
//                           className="w-20 object-contain"
//                         />
//                       ) : null}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-white border mt-4 rounded-full w-[167px] h-[57px] sm:w-[60%] flex py-1 px-1">
//                   {["Details", "Reviews"].map((tab, i) => (
//                     <button
//                       key={tab}
//                       onClick={() => setShowReview(i === 0)}
//                       className={`flex-1 w-[66] h-[55] rounded-[100px] text-sm ${
//                         (showReview && i === 0) || (!showReview && i === 1)
//                           ? "bg-[#273e8e] text-white"
//                           : "text-gray-500"
//                       }`}
//                     >
//                       {tab}
//                     </button>
//                   ))}
//                 </div>

//                 <h2 className="text-lg font-medium mt-4 text-gray-800">
//                   {showReview ? "Product Details" : "Reviews"}
//                 </h2>

//                 <div className="mt-4">
//                   {showReview ? (
//                     <div className="border border-[#ccc] bg-white p-4 rounded-xl space-y-3">
//                       {[...Array(6)].map((_, i) => (
//                         <React.Fragment key={i}>
//                           <div className="flex items-center gap-3">
//                             <img src={assets.light} className="h-5 w-5" alt="Feature" />
//                             <p className="text-sm sm:text-base">Premium quality</p>
//                           </div>
//                           {i < 5 && <hr className="border-gray-200" />}
//                         </React.Fragment>
//                       ))}
//                     </div>
//                   ) : (
//                     <div className="space-y-6">
//                       {/* Summary (kept same look, with real numbers) */}
//                       <div className="p-4 border border-gray-200 rounded-xl">
//                         <div className="flex items-center gap-2">
//                           {starsArr.map((star, i) => (
//                             <img key={i} src={star} alt="Star" className="h-4 w-4" />
//                           ))}
//                         </div>
//                         <div className="flex justify-between items-center mt-2 text-sm">
//                           <span>{average || 0}</span>
//                           <span>{totalReviews} Reviews</span>
//                         </div>
//                       </div>

//                       {/* Reviews list (styled like your sample) */}
//                       {reviews.map((r) => (
//                         <div key={r.id || `${r.user_id}-${r.created_at}`} className="border border-gray-300 rounded-xl p-4">
//                           <div className="flex justify-between items-center">
//                             <div className="flex items-center gap-3">
//                               <div className="h-12 w-12 flex justify-center items-center rounded-full bg-gray-100 text-gray-500 text-sm">
//                                 {initials(r.name)}
//                               </div>
//                               <div>
//                                 <p className="font-medium">{r.name || "User"}</p>
//                                 <div className="flex items-center gap-1">
//                                   {Array.from({ length: Math.max(0, Math.min(5, Math.round(r.rating || 0))) }).map((_, i) => (
//                                     <img key={i} src={starsArr[i]} alt="Star" className="h-3 w-3" />
//                                   ))}
//                                 </div>
//                               </div>
//                             </div>
//                             <p className="text-sm text-gray-500">{fmtDate(r.created_at)}</p>
//                           </div>
//                           <p className="mt-3 text-sm sm:text-base">{r.review}</p>
//                         </div>
//                       ))}

//                       {/* Add Review (compact, consistent with your styles) */}
//                       <div className="border border-gray-200 rounded-xl p-4">
//                         <p className="font-medium mb-3 text-gray-800">Add your review</p>
//                         <div className="flex items-center gap-3 mb-3">
//                           <label className="text-sm text-gray-600">Rating</label>
//                           <select
//                             value={newRating}
//                             onChange={(e) => setNewRating(Number(e.target.value))}
//                             className="border rounded-md px-2 py-1 text-sm"
//                           >
//                             {[5,4,3,2,1].map((n) => (
//                               <option key={n} value={n}>{n}</option>
//                             ))}
//                           </select>
//                         </div>
//                         <textarea
//                           rows={4}
//                           value={newText}
//                           onChange={(e) => setNewText(e.target.value)}
//                           placeholder="Write your experience with this product…"
//                           className="w-full border rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         />
//                         <button
//                           onClick={handleSubmitReview}
//                           disabled={submitting}
//                           className="mt-3 px-5 py-2 rounded-full bg-[#273e8e] text-white text-sm disabled:opacity-60"
//                         >
//                           {submitting ? "Submitting…" : "Submit Review"}
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* Quantity Control */}
//                 <div className="h-[70px] p-4 border bg-white border-[#ccc] mt-4 rounded-2xl flex justify-between items-center">
//                   Quantity
//                   <div className="flex gap-4 items-center">
//                     <button
//                       onClick={handleDecrease}
//                       className="h-10 flex justify-center items-center w-10 bg-[#273e8e] rounded-md text-white"
//                     >
//                       <Minus size={20} color="white" />
//                     </button>
//                     <div className="px-7">
//                     {qtyInCart}
//                     </div>
//                     <button
//                       onClick={handleAddToCart}
//                       className="h-10 flex justify-center items-center w-10 bg-[#273e8e] rounded-md text-white"
//                     >
//                       <Plus size={20} color="white" />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//               {/* /Right */}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Mobile (kept your original layout; if you want mobile reviews too, I can wire similarly) */}
//       <div className="sm:hidden flex  min-h-screen w-full bg-[#F5F7FF]">
//         {balance && (
//           <LoanPopUp
//             icon={<BsExclamationTriangle color="white" size={26} />}
//             text="Your loan balance is low, kindly apply for one to proceed"
//             link="/"
//             link2="/loan"
//             link1Text="Back"
//             link2Text="Appy for loan"
//             imgBg="bg-[#FFA500]"
//           />
//         )}

//         <div className="flex-1">
//           <div className="p-4 sm:p-6">
//             <div className="flex items-center justify-between mb-4">
//               <h1 className="text-xl sm:text-2xl font-medium">
//                 {product.category}
//               </h1>
//               <Link
//                 to="/homePage"
//                 className="text-blue-600 hover:underline text-sm sm:text-base"
//               >
//                 Go Back
//               </Link>
//             </div>

//             <div className="flex flex-col lg:flex-row gap-6">
//               {/* Left */}
//               <div className="w-full lg:w-1/2">
//                 <div className="h-[400px] sm:h-[500px] w-full border border-gray-200 flex justify-center items-center bg-white rounded-xl p-4">
//                   <img
//                     src={product.image}
//                     alt={product.heading}
//                     className="h-full w-full object-contain"
//                   />
//                 </div>
//               </div>

//               {/* Right */}
//               <div className="w-full lg:w-1/2">
//                 <div className="border-2 border-[#273e8e] p-4 rounded-xl">
//                   <h1 className="text-lg sm:text-xl font-medium">
//                     {product.heading}
//                   </h1>
//                   <div className="mt-3">
//                     <h2 className="text-xl sm:text-2xl text-[#273e8e] font-bold">
//                       {product.price}
//                     </h2>
//                     <div className="flex items-center gap-2 mt-1">
//                       {product.oldPrice && (
//                         <p className="text-gray-400 line-through text-sm">
//                           {product.oldPrice}
//                         </p>
//                       )}
//                       {product.discount && (
//                         <span className="px-2 py-1 rounded-full text-orange-500 text-xs bg-orange-100">
//                           {product.discount}
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Tabs */}
//                 <div className="bg-white border mt-4 rounded-full w-full sm:w-[60%] flex py-1 px-1">
//                   {["Details", "Reviews"].map((tab, i) => (
//                     <button
//                       key={tab}
//                       onClick={() => setShowReview(i === 0)}
//                       className={`flex-1 py-2 rounded-full text-sm ${
//                         (showReview && i === 0) || (!showReview && i === 1)
//                           ? "bg-[#273e8e] text-white"
//                           : "text-gray-500"
//                       }`}
//                     >
//                       {tab}
//                     </button>
//                   ))}
//                 </div>

//                 {/* Quantity Control */}
//                 <div className="h-[70px] p-4 border mt-4 rounded-2xl flex justify-between items-center">
//                   Quantity
//                   <div className="flex gap-4 items-center">
//                     <button
//                       onClick={handleDecrease}
//                       className="h-10 flex justify-center items-center w-10 bg-[#273e8e] rounded-md text-white"
//                     >
//                       <Minus size={20} color="white" />
//                     </button>
//                     {qtyInCart}
//                     <button
//                       onClick={handleAddToCart}
//                       className="h-10 flex justify-center items-center w-10 bg-[#273e8e] rounded-md text-white"
//                     >
//                       <Plus size={20} color="white" />
//                     </button>
//                   </div>
//                 </div>

//                 <div className="mt-6 space-y-4">
//                   <div className="grid grid-cols-2 gap-4">
//                     <button
//                       onClick={handleAddToCart}
//                       className="py-3 border border-[#273e8e] rounded-full hover:bg-[#273e8e]/10 transition"
//                     >
//                       Add To Cart
//                     </button>
//                     <Link
//                       to="/cart"
//                       className="py-3 bg-[#273e8e] text-white rounded-full text-center hover:bg-[#273e8e]/90 transition"
//                     >
//                       Buy Now
//                     </Link>
//                   </div>
//                 </div>

//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// ProductDetails.jsx
// import React, { useContext, useEffect, useMemo, useState } from "react";
// import { Link, useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import toast from "react-hot-toast";
// import { assets } from "../assets/data";
// import SideBar from "../Component/SideBar";
// import TopNavbar from "../Component/TopNavbar";
// import LoanPopUp from "../Component/LoanPopUp";
// import { BsExclamationTriangle } from "react-icons/bs";
// import { Minus, Plus, Star } from "lucide-react";
// import { ContextApi } from "../Context/AppContext";
// import API from "../config/api.config";

// // helpers
// const formatNGN = (n) => {
//   if (n == null || n === "") return "—";
//   const num = Number(n);
//   if (Number.isNaN(num)) return String(n);
//   try {
//     return `₦${new Intl.NumberFormat("en-NG").format(num)}`;
//   } catch {
//     return `₦${num}`;
//   }
// };

// const mapApiProductToDetails = (p) => {
//   if (!p) return null;

//   const image =
//     p.featured_image ||
//     p?.images?.[0]?.image ||
//     assets?.placeholderProduct ||
//     "/placeholder-product.png";

//   const heading = p.name || p.title || p.product_name || `Product #${p.id ?? ""}`;

//   const priceRaw = p.price ?? p.amount ?? p.sale_price ?? p.product_price;
//   const oldRaw = p.compare_at_price ?? p.old_price;

//   const price = formatNGN(priceRaw);
//   const oldPrice = oldRaw != null ? formatNGN(oldRaw) : "";

//   let discount = "";
//   if (Number(oldRaw) > Number(priceRaw)) {
//     const pct = Math.round(((Number(oldRaw) - Number(priceRaw)) / Number(oldRaw)) * 100);
//     discount = `-${pct}%`;
//   }

//   const categoryLabel =
//     p?.category?.name || p?.category_name || p?.category || "Category";

//   return {
//     id: p.id,
//     image,
//     heading,
//     price,
//     oldPrice,
//     discount,
//     rating: assets?.fiveStars || assets?.rating || "",
//     progressBar: assets?.progressBar || "",
//     soldText: p?.sold_text || "Popular",
//     category: categoryLabel,
//     _price_raw: priceRaw,
//   };
// };

// // ---- Reviews helpers
// const safeArray = (v) => (Array.isArray(v) ? v : []);
// const toNum = (v, d = 0) => {
//   const n = Number(v);
//   return Number.isFinite(n) ? n : d;
// };
// const avgRating = (list) => {
//   if (!list.length) return 0;
//   const sum = list.reduce((s, r) => s + toNum(r.rating, 0), 0);
//   return +(sum / list.length).toFixed(1);
// };
// const initials = (name = "") => {
//   const parts = String(name).trim().split(/\s+/);
//   if (!parts.length) return "U";
//   return (parts[0][0] || "U").toUpperCase() + (parts[1]?.[0]?.toUpperCase() || "");
// };
// const fmtDate = (s) => {
//   const d = new Date((s || "").replace(" ", "T"));
//   if (isNaN(d.getTime())) return "—";
//   const dd = d.getDate().toString().padStart(2, "0");
//   const mm = (d.getMonth() + 1).toString().padStart(2, "0");
//   const yy = String(d.getFullYear()).slice(-2);
//   return `${dd}-${mm}-${yy}`;
// };

// // Small star renderer (filled up to rating)
// const renderStars = (rating = 0, size = 24) => {
//   const full = Math.floor(Number(rating) || 0);
//   return (
//     <div className="flex items-center gap-1">
//       {Array.from({ length: 5 }).map((_, i) => (
//         <Star
//           key={i}
//           size={size}
//           className={i < full ? "fill-[#273e8e] text-[#273e8e]" : "text-gray-300"}
//         />
//       ))}
//     </div>
//   );
// };

// export default function ProductDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { addToCart, removeToCart, cartItems, registerProducts } = useContext(ContextApi);
//   const [installUnit, setInstallUnit] = useState(0);

//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");
//   const [showReview, setShowReview] = useState(true);
//   const [balance, setBalance] = useState(false);

//   // ---- Reviews state
//   const [reviews, setReviews] = useState([]);

//   useEffect(() => {
//     let isMounted = true;
//     (async () => {
//       setLoading(true);
//       setErr("");
//       try {
//         const t = localStorage.getItem("access_token");
//         const { data } = await axios.get(API.PRODUCT_BY_ID(id), {
//           headers: {
//             Accept: "application/json",
//             ...(t ? { Authorization: `Bearer ${t}` } : {}),
//           },
//         });
//         const raw = data?.data ?? data;
//         registerProducts(raw); // keep your cart rendering compatible
//         setInstallUnit(
//           Number(raw?.installation_price ?? raw?.install_price ?? raw?.installation_cost ?? 0)
//         );

//         const mapped = mapApiProductToDetails(raw);
//         if (isMounted) {
//           if (!mapped?.id) setErr("Product not found.");
//           else {
//             setProduct(mapped);
//             // pull reviews if present
//             const serverReviews = safeArray(raw?.reviews).map((r) => ({
//               id: r.id,
//               product_id: r.product_id,
//               user_id: r.user_id,
//               name: r.user?.name || r.user?.first_name || "User",
//               rating: toNum(r.rating, 0),
//               review: r.review || "",
//               created_at: r.created_at,
//             }));
//             setReviews(serverReviews);
//           }
//         }
//       } catch (e) {
//         if (isMounted) {
//           setErr(e?.response?.data?.message || e?.message || "Failed to load product.");
//         }
//       } finally {
//         isMounted && setLoading(false);
//       }
//     })();
//     return () => {
//       isMounted = false;
//     };
//   }, [id, registerProducts]);

//   const qtyInCart = useMemo(() => {
//     if (!product?.id) return 0;
//     return cartItems[String(product.id)] || 0;
//   }, [cartItems, product]);

//   const rememberInstallPrice = (productId, unit) => {
//     try {
//       const key = "install_price_map";
//       const cur = JSON.parse(localStorage.getItem(key) || "{}");
//       cur[String(productId)] = Number(unit) || 0;
//       localStorage.setItem(key, JSON.stringify(cur));
//     } catch {}
//   };

//   // ───────────────────────────────────────────────────────────
//   // Helpers to work with API cart for THIS product
//   // ───────────────────────────────────────────────────────────
//   const fetchCartAndFindLine = async (tok, productId) => {
//     const res = await axios.get(API.CART, {
//       headers: { Accept: "application/json", Authorization: `Bearer ${tok}` },
//     });
//     const payload = res?.data;
//     const items = Array.isArray(payload?.data)
//       ? payload.data
//       : Array.isArray(payload)
//       ? payload
//       : [];
//     const pid = String(productId);
//     return items.find((x) => {
//       const a = String(x?.itemable_id ?? "");
//       const b = String(x?.itemable?.id ?? "");
//       return a === pid || b === pid;
//     });
//   };

//   const syncLocalQty = (productId, serverQty) => {
//     const localQty = cartItems[String(productId)] || 0;
//     if (serverQty === localQty) return;
//     if (serverQty > localQty) {
//       const inc = Math.min(serverQty - localQty, 50);
//       for (let i = 0; i < inc; i++) addToCart(productId);
//     } else {
//       const dec = Math.min(localQty - serverQty, 50);
//       for (let i = 0; i < dec; i++) removeToCart(productId);
//     }
//   };

//   const handleAddToCart = async () => {
//     if (!product?.id) return;
//     const tok = localStorage.getItem("access_token");
//     if (!tok) {
//       toast.error("Please log in to add items to cart.");
//       return;
//     }

//     try {
//       await axios.post(
//         API.CART,
//         {
//           itemable_type: "product",
//           itemable_id: Number(product.id),
//           quantity: 1,
//         },
//         {
//           headers: {
//             Accept: "application/json",
//             Authorization: `Bearer ${tok}`,
//           },
//         }
//       );
//       const line = await fetchCartAndFindLine(tok, product.id);
//       const serverQty = Number(line?.quantity || 1);
//       rememberInstallPrice(product.id, installUnit);
//       syncLocalQty(product.id, serverQty);
//       toast.success("Added to cart");
//     } catch (e) {
//       if (e?.response?.status === 409) {
//         try {
//           const line = await fetchCartAndFindLine(tok, product.id);
//           if (!line) {
//             toast.error("Item already in cart, but couldn't locate it to update.");
//             return;
//           }
//           const newQty = Number(line.quantity || 0) + 1;
//           await axios.put(
//             API.CART_ITEM(line.id),
//             { quantity: newQty },
//             {
//               headers: {
//                 Accept: "application/json",
//                 Authorization: `Bearer ${tok}`,
//               },
//             }
//           );
//           rememberInstallPrice(product.id, installUnit);
//           syncLocalQty(product.id, newQty);
//           toast.success("Cart updated");
//         } catch (e2) {
//           toast.error(e2?.response?.data?.message || e2.message || "Failed to update cart");
//         }
//       } else {
//         toast.error(e?.response?.data?.message || e.message || "Failed to add to cart");
//       }
//     }
//   };

//   const handleDecrease = async () => {
//     if (!product?.id) return;
//     const tok = localStorage.getItem("access_token");
//     if (!tok) {
//       toast.error("Please log in to update cart.");
//       return;
//     }

//     try {
//       const line = await fetchCartAndFindLine(tok, product.id);
//       const current = Number(line?.quantity || 0);
//       if (!line || current <= 0) {
//         syncLocalQty(product.id, 0);
//         return;
//       }

//       if (current > 1) {
//         const newQty = current - 1;
//         await axios.put(
//           API.CART_ITEM(line.id),
//           { quantity: newQty },
//           {
//             headers: {
//               Accept: "application/json",
//               Authorization: `Bearer ${tok}`,
//             },
//           }
//         );
//         syncLocalQty(product.id, newQty);
//       } else {
//         await axios.delete(API.CART_ITEM(line.id), {
//           headers: { Accept: "application/json", Authorization: `Bearer ${tok}` },
//         });
//         syncLocalQty(product.id, 0);
//       }
//     } catch (e) {
//       toast.error(e?.response?.data?.message || e.message || "Failed to update cart");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#F5F7FF] flex items-center justify-center">
//         <div className="animate-pulse text-gray-600">Loading product…</div>
//       </div>
//     );
//   }

//   if (err) {
//     return (
//       <div className="min-h-screen bg-[#F5F7FF] flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-red-600 mb-4">{err}</p>
//           <button
//             onClick={() => navigate(-1)}
//             className="px-4 py-2 rounded-full bg-[#273e8e] text-white"
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!product) return null;

//   const average = avgRating(reviews);
//   const totalReviews = reviews.length;

//   return (
//     <>
//       {/* Desktop */}
//       <div className="sm:flex hidden  min-h-screen w-full bg-[#F5F7FF]">
//         <SideBar />

//         {balance && (
//           <LoanPopUp
//             icon={<BsExclamationTriangle color="white" size={26} />}
//             text="Your loan balance is low, kindly apply for one to proceed"
//             link="/"
//             link2="/loan"
//             link1Text="Back"
//             link2Text="Appy for loan"
//             imgBg="bg-[#FFA500]"
//           />
//         )}

//         <div className="flex-1">
//           <TopNavbar />

//           <div className="p-4 sm:p-6">
//             <div className="flex items-center justify-between mb-4">
//               <h1 className="text-xl sm:text-2xl font-medium">
//                 {product.category}
//               </h1>
//               <Link
//                 to="/homePage"
//                 className="text-blue-600 hover:underline text-sm sm:text-base"
//               >
//                 Go Back
//               </Link>
//             </div>

//             <div className="flex flex-col lg:flex-row gap-6">
//               {/* Left */}
//               <div className="w-full lg:w-1/2">
//                 <div className="h-[400px] sm:h-[500px] w-full border border-gray-200 flex justify-center items-center bg-white rounded-xl p-4">
//                   <img
//                     src={product.image}
//                     alt={product.heading}
//                     className="h-full w-full object-contain"
//                     loading="eager"
//                   />
//                 </div>

//                 <div className="mt-6 space-y-4">
//                   {balance ? (
//                     <>
//                       <button className="w-full py-3 bg-[#273e8e] text-white rounded-full hover:bg-[#273e8e]/90 transition">
//                         Buy With Loan
//                       </button>
//                       <div className="grid grid-cols-2 gap-4">
//                         <button
//                           onClick={handleAddToCart}
//                           className="py-3 border border-[#273e8e] rounded-full hover:bg-[#273e8e]/10 transition"
//                         >
//                           Add To Cart
//                         </button>
//                         <Link
//                           to="/cart"
//                           className="py-3 bg-black text-white rounded-full text-center hover:bg-[#273e8e]/90 transition"
//                         >
//                           Buy Now
//                         </Link>
//                       </div>
//                     </>
//                   ) : (
//                     <>
//                       <div className="grid grid-cols-2 gap-4">
//                         <button
//                           onClick={handleAddToCart}
//                           className="py-4 border border-[#273e8e] rounded-full hover:bg-[#273e8e]/10 transition"
//                         >
//                           Add To Cart
//                         </button>
//                         <Link
//                           to="/cart"
//                           className="py-4 bg-[#273e8e] text-white rounded-full text-center hover:bg-[#273e8e]/90 transition"
//                         >
//                           Buy Now
//                         </Link>
//                       </div>
//                       <div className="p-4 mt-6 bg-yellow-50 rounded-lg">
//                         <p className="text-yellow-600 text-sm pb-5 sm:text-base">
//                           Don't have the finances to proceed? Take a loan and repay at your convenience
//                         </p>
//                         <Link
//                           to="/loan"
//                           className="bg-[#E8A91D] py-2 px-6 text-white rounded-full text-sm hover:bg-[#E8A91D]/90 transition"
//                         >
//                           Apply
//                         </Link>
//                       </div>
//                     </>
//                   )}
//                 </div>
//               </div>

//               {/* Right */}
//               <div className="w-full lg:w-1/2">
//                 <div className="border-2 border-[#273e8e] bg-white p-4 rounded-xl">
//                   <h1 className="text-lg sm:text-xl font-medium">
//                     {product.heading}
//                   </h1>
//                   <div className="mt-3">
//                     <h2 className="text-xl sm:text-2xl text-[#273e8e] font-bold">
//                       {product.price}
//                     </h2>
//                     <div className="flex items-center gap-2 mt-1">
//                       {product.oldPrice && (
//                         <p className="text-gray-400 line-through text-sm">
//                           {product.oldPrice}
//                         </p>
//                       )}
//                       {product.discount && (
//                         <span className="px-2 py-1 rounded-full text-orange-500 text-xs bg-orange-100">
//                           {product.discount}
//                         </span>
//                       )}
//                     </div>
//                     <div className="flex justify-between items-center mt-3">
//                       <div className="flex items-center">
//                         {product.progressBar ? (
//                           <img
//                             src={product.progressBar}
//                             alt="Progress"
//                             className="w-20 h-2 object-contain"
//                           />
//                         ) : null}
//                         <p className="text-xs text-gray-500 ml-2">
//                           {product.soldText}
//                         </p>
//                       </div>
//                       {product.rating ? (
//                         <img
//                           src={product.rating}
//                           alt="Rating"
//                           className="w-20 object-contain"
//                         />
//                       ) : null}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-white border mt-4 rounded-full w-[167px] h-[57px] sm:w-[60%] flex py-1 px-1">
//                   {["Details", "Reviews"].map((tab, i) => (
//                     <button
//                       key={tab}
//                       onClick={() => setShowReview(i === 0)}
//                       className={`flex-1 w-[66] h-[55] rounded-[100px] text-sm ${
//                         (showReview && i === 0) || (!showReview && i === 1)
//                           ? "bg-[#273e8e] text-white"
//                           : "text-gray-500"
//                       }`}
//                     >
//                       {tab}
//                     </button>
//                   ))}
//                 </div>

//                 <h2 className="text-lg font-medium mt-4 text-gray-800">
//                   {showReview ? "Product Details" : "Reviews"}
//                 </h2>

//                 <div className="mt-4">
//                   {showReview ? (
//                     <div className="border border-[#ccc] bg-white p-4 rounded-xl space-y-3">
//                       {[...Array(6)].map((_, i) => (
//                         <React.Fragment key={i}>
//                           <div className="flex items-center gap-3">
//                             <img src={assets.light} className="h-5 w-5" alt="Feature" />
//                             <p className="text-sm sm:text-base">Premium quality</p>
//                           </div>
//                           {i < 5 && <hr className="border-gray-200" />}
//                         </React.Fragment>
//                       ))}
//                     </div>
//                   ) : (
//                     <div className="space-y-6">
//                       {/* Summary pill */}
//                       <div className="rounded-2xl border border-gray-300 bg-white p-4">
//                         {renderStars(average, 28)}
//                         <div className="flex justify-between items-center mt-2 text-sm text-gray-800">
//                           <span>{Number.isFinite(average) ? average.toFixed(1) : "0.0"}</span>
//                           <span>{totalReviews} Reviews</span>
//                         </div>
//                       </div>

//                       {/* Reviews list with separators */}
//                       <div className="rounded-2xl border border-gray-300 bg-white">
//                         {reviews.length ? (
//                           reviews.map((r, idx) => (
//                             <div
//                               key={r.id || `${r.user_id}-${r.created_at}-${idx}`}
//                               className="p-4"
//                             >
//                               <div className="flex justify-between items-center">
//                                 <div className="flex items-center gap-3">
//                                   <div className="h-12 w-12 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm font-medium">
//                                     {initials(r.name)}
//                                   </div>
//                                   <div>
//                                     <p className="font-medium text-gray-900">{r.name || "User"}</p>
//                                     <div className="mt-0.5">{renderStars(r.rating, 16)}</div>
//                                   </div>
//                                 </div>
//                                 <span className="text-xs text-gray-500">{fmtDate(r.created_at)}</span>
//                               </div>

//                               <p className="mt-3 text-sm sm:text-base text-gray-800">
//                                 {r.review}
//                               </p>

//                               {idx < reviews.length - 1 && (
//                                 <div className="h-px bg-gray-200 mt-4 mx-2" />
//                               )}
//                             </div>
//                           ))
//                         ) : (
//                           <div className="p-6 text-sm text-gray-500">No reviews yet.</div>
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* Quantity Control */}
//                 <div className="h-[70px] p-4 border bg-white border-[#ccc] mt-4 rounded-2xl flex justify-between items-center">
//                   Quantity
//                   <div className="flex gap-4 items-center">
//                     <button
//                       onClick={handleDecrease}
//                       className="h-10 flex justify-center items-center w-10 bg-[#273e8e] rounded-md text-white"
//                     >
//                       <Minus size={20} color="white" />
//                     </button>
//                     <div className="px-7">
//                       {qtyInCart}
//                     </div>
//                     <button
//                       onClick={handleAddToCart}
//                       className="h-10 flex justify-center items-center w-10 bg-[#273e8e] rounded-md text-white"
//                     >
//                       <Plus size={20} color="white" />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//               {/* /Right */}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Mobile */}
//       <div className="sm:hidden flex  min-h-screen w-full bg-[#F5F7FF]">
//         {balance && (
//           <LoanPopUp
//             icon={<BsExclamationTriangle color="white" size={26} />}
//             text="Your loan balance is low, kindly apply for one to proceed"
//             link="/"
//             link2="/loan"
//             link1Text="Back"
//             link2Text="Appy for loan"
//             imgBg="bg-[#FFA500]"
//           />
//         )}

//         <div className="flex-1">
//           <div className="p-4 sm:p-6">
//             <div className="flex items-center justify-between mb-4">
//               <h1 className="text-xl sm:text-2xl font-medium">
//                 {product.category}
//               </h1>
//               <Link
//                 to="/homePage"
//                 className="text-blue-600 hover:underline text-sm sm:text-base"
//               >
//                 Go Back
//               </Link>
//             </div>

//             <div className="flex flex-col lg:flex-row gap-6">
//               {/* Left */}
//               <div className="w-full lg:w-1/2">
//                 <div className="h-[400px] sm:h-[500px] w-full border border-gray-200 flex justify-center items-center bg-white rounded-xl p-4">
//                   <img
//                     src={product.image}
//                     alt={product.heading}
//                     className="h-full w-full object-contain"
//                   />
//                 </div>
//               </div>

//               {/* Right */}
//               <div className="w-full lg:w-1/2">
//                 <div className="border-2 border-[#273e8e] p-4 rounded-xl">
//                   <h1 className="text-lg sm:text-xl font-medium">
//                     {product.heading}
//                   </h1>
//                   <div className="mt-3">
//                     <h2 className="text-xl sm:text-2xl text-[#273e8e] font-bold">
//                       {product.price}
//                     </h2>
//                     <div className="flex items-center gap-2 mt-1">
//                       {product.oldPrice && (
//                         <p className="text-gray-400 line-through text-sm">
//                           {product.oldPrice}
//                         </p>
//                       )}
//                       {product.discount && (
//                         <span className="px-2 py-1 rounded-full text-orange-500 text-xs bg-orange-100">
//                           {product.discount}
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Tabs */}
//                 <div className="bg-white border mt-4 rounded-full w-full sm:w-[60%] flex py-1 px-1">
//                   {["Details", "Reviews"].map((tab, i) => (
//                     <button
//                       key={tab}
//                       onClick={() => setShowReview(i === 0)}
//                       className={`flex-1 py-2 rounded-full text-sm ${
//                         (showReview && i === 0) || (!showReview && i === 1)
//                           ? "bg-[#273e8e] text-white"
//                           : "text-gray-500"
//                       }`}
//                     >
//                       {tab}
//                     </button>
//                   ))}
//                 </div>

//                 {/* Mobile tab content */}
//                 <div className="mt-4">
//                   {showReview ? (
//                     <div className="border border-[#ccc] bg-white p-4 rounded-xl space-y-3">
//                       {[...Array(6)].map((_, i) => (
//                         <React.Fragment key={i}>
//                           <div className="flex items-center gap-3">
//                             <img src={assets.light} className="h-5 w-5" alt="Feature" />
//                             <p className="text-sm sm:text-base">Premium quality</p>
//                           </div>
//                           {i < 5 && <hr className="border-gray-200" />}
//                         </React.Fragment>
//                       ))}
//                     </div>
//                   ) : (
//                     <div className="space-y-6">
//                       <div className="rounded-2xl border border-gray-300 bg-white p-4">
//                         {renderStars(average, 24)}
//                         <div className="flex justify-between items-center mt-2 text-sm text-gray-800">
//                           <span>{Number.isFinite(average) ? average.toFixed(1) : "0.0"}</span>
//                           <span>{totalReviews} Reviews</span>
//                         </div>
//                       </div>
//                       <div className="rounded-2xl border border-gray-300 bg-white">
//                         {reviews.length ? (
//                           reviews.map((r, idx) => (
//                             <div
//                               key={r.id || `${r.user_id}-${r.created_at}-${idx}`}
//                               className="p-4"
//                             >
//                               <div className="flex justify-between items-center">
//                                 <div className="flex items-center gap-3">
//                                   <div className="h-12 w-12 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm font-medium">
//                                     {initials(r.name)}
//                                   </div>
//                                   <div>
//                                     <p className="font-medium text-gray-900">{r.name || "User"}</p>
//                                     <div className="mt-0.5">{renderStars(r.rating, 16)}</div>
//                                   </div>
//                                 </div>
//                                 <span className="text-xs text-gray-500">{fmtDate(r.created_at)}</span>
//                               </div>
//                               <p className="mt-3 text-sm sm:text-base text-gray-800">
//                                 {r.review}
//                               </p>
//                               {idx < reviews.length - 1 && (
//                                 <div className="h-px bg-gray-200 mt-4 mx-2" />
//                               )}
//                             </div>
//                           ))
//                         ) : (
//                           <div className="p-6 text-sm text-gray-500">No reviews yet.</div>
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* Quantity Control */}
//                 <div className="h-[70px] p-4 border mt-4 rounded-2xl flex justify-between items-center bg-white">
//                   Quantity
//                   <div className="flex gap-4 items-center">
//                     <button
//                       onClick={handleDecrease}
//                       className="h-10 flex justify-center items-center w-10 bg-[#273e8e] rounded-md text-white"
//                     >
//                       <Minus size={20} color="white" />
//                     </button>
//                     {qtyInCart}
//                     <button
//                       onClick={handleAddToCart}
//                       className="h-10 flex justify-center items-center w-10 bg-[#273e8e] rounded-md text-white"
//                     >
//                       <Plus size={20} color="white" />
//                     </button>
//                   </div>
//                 </div>

//                 <div className="mt-6 space-y-4">
//                   <div className="grid grid-cols-2 gap-4">
//                     <button
//                       onClick={handleAddToCart}
//                       className="py-3 border border-[#273e8e] rounded-full hover:bg-[#273e8e]/10 transition"
//                     >
//                       Add To Cart
//                     </button>
//                     <Link
//                       to="/cart"
//                       className="py-3 bg-[#273e8e] text-white rounded-full text-center hover:bg-[#273e8e]/90 transition"
//                     >
//                       Buy Now
//                     </Link>
//                   </div>
//                 </div>

//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }


import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { assets } from "../assets/data";
import SideBar from "../Component/SideBar";
import TopNavbar from "../Component/TopNavbar";
import LoanPopUp from "../Component/LoanPopUp";
import { BsExclamationTriangle } from "react-icons/bs";
import { Minus, Plus, Star } from "lucide-react";
import { ContextApi } from "../Context/AppContext";
import API from "../config/api.config";

/* ---------------- helpers ---------------- */
const formatNGN = (n) => {
  if (n == null || n === "") return "—";
  const num = Number(n);
  if (!Number.isFinite(num)) return String(n);
  try {
    return `₦${new Intl.NumberFormat("en-NG").format(num)}`;
  } catch {
    return `₦${num}`;
  }
};
const clamp = (n, a=0, b=100) => Math.max(a, Math.min(b, n));
const safeArray = (v) => (Array.isArray(v) ? v : []);
const toNum = (v, d=0) => (Number.isFinite(Number(v)) ? Number(v) : d);
const avgRating = (list) => {
  if (!list.length) return 0;
  const sum = list.reduce((s, r) => s + toNum(r.rating), 0);
  return +(sum / list.length).toFixed(1);
};
const initials = (name = "") => {
  const parts = String(name).trim().split(/\s+/);
  return [(parts[0]||"U")[0], (parts[1]||"")[0]].join("").toUpperCase();
};
const fmtDate = (s) => {
  const d = new Date((s || "").replace(" ", "T"));
  if (isNaN(d)) return "—";
  const dd = String(d.getDate()).padStart(2,"0");
  const mm = String(d.getMonth()+1).padStart(2,"0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}-${mm}-${yy}`;
};

// tiny star component (keeps your UI spacing)
const Stars = ({ value=0, size=20 }) => {
  const full = Math.floor(value);
  const hasHalf = value - full >= 0.5;
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full || (i === full && hasHalf);
        return (
          <Star
            key={i}
            size={size}
            className={filled ? "fill-[#273e8e] text-[#273e8e]" : "text-gray-300"}
          />
        );
      })}
    </div>
  );
};

/* shape mapper for new API */
const mapApiProductToDetails = (p) => {
  if (!p) return null;

  const image =
    p?.featured_image_url ||
    p?.featured_image ||
    p?.images?.[0]?.image ||
    assets?.placeholderProduct ||
    "/placeholder-product.png";

  // pricing
  const priceRaw = toNum(p?.price, 0);
  const discountRaw = p?.discount_price != null ? toNum(p.discount_price, null) : null;
  let isDiscountActive = false;
  if (discountRaw != null && discountRaw < priceRaw) {
    isDiscountActive = p?.discount_end_date
      ? new Date(p.discount_end_date) > new Date()
      : true;
  }
  const effectiveRaw = isDiscountActive ? discountRaw : priceRaw;
  const oldRaw = isDiscountActive ? priceRaw : null;

  // stock bar
  const current = toNum(p?.stock, 0);
  const total = Math.max(current, toNum(p?.old_quantity, current));
  const stockPct = total ? clamp(Math.round((current / total) * 100)) : 0;

  return {
    id: p?.id,
    image,
    heading: p?.title || `Product #${p?.id ?? ""}`,
    price: formatNGN(effectiveRaw),
    oldPrice: oldRaw != null ? formatNGN(oldRaw) : "",
    discount:
      isDiscountActive && priceRaw > 0
        ? `-${Math.round(((priceRaw - discountRaw) / priceRaw) * 100)}%`
        : "",
    categoryId: p?.category_id,
    details: safeArray(p?.details).map((d) => d?.detail).filter(Boolean),
    gallery: safeArray(p?.images).map((i) => i?.image).filter(Boolean),
    stockText: `${current}/${total}`,
    stockPct,
    topDeal: !!p?.top_deal,
  };
};

/* ---------------- component ---------------- */
export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, removeToCart, cartItems, registerProducts } = useContext(ContextApi);

  const [installUnit, setInstallUnit] = useState(0);
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [showReview, setShowReview] = useState(true);
  const [balance, setBalance] = useState(false);

  // categories (for name)
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const t = localStorage.getItem("access_token");
        const { data } = await axios.get(API.CATEGORIES, {
          headers: { Accept: "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
        });
        setCategories(Array.isArray(data?.data) ? data.data : []);
      } catch {}
    })();
  }, []);
  const catMap = useMemo(() => {
    const m = {};
    for (const c of categories) if (c?.id) m[c.id] = c?.name || c?.title || c?.category_name || "";
    return m;
  }, [categories]);

  // product fetch
  useEffect(() => {
    let on = true;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const t = localStorage.getItem("access_token");
        const { data } = await axios.get(API.PRODUCT_BY_ID(id), {
          headers: { Accept: "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
        });
        const raw = data?.data ?? data;

        registerProducts?.(raw);
        setInstallUnit(toNum(raw?.installation_price, 0));

        const mapped = mapApiProductToDetails(raw);
        if (on) {
          if (!mapped?.id) setErr("Product not found.");
          else setProduct(mapped);

          const serverReviews = safeArray(raw?.reviews).map((r) => ({
            id: r.id,
            product_id: r.product_id,
            user_id: r.user_id,
            name: r.user?.name || r.user?.first_name || "User",
            rating: toNum(r.rating, 0),
            review: r.review || "",
            created_at: r.created_at,
          }));
          setReviews(serverReviews);
        }
      } catch (e) {
        if (on) setErr(e?.response?.data?.message || e?.message || "Failed to load product.");
      } finally {
        on && setLoading(false);
      }
    })();
    return () => { on = false; };
  }, [id, registerProducts]);

  const qtyInCart = useMemo(() => {
    if (!product?.id) return 0;
    return cartItems[String(product.id)] || 0;
  }, [cartItems, product]);

  const rememberInstallPrice = (productId, unit) => {
    try {
      const key = "install_price_map";
      const cur = JSON.parse(localStorage.getItem(key) || "{}");
      cur[String(productId)] = Number(unit) || 0;
      localStorage.setItem(key, JSON.stringify(cur));
    } catch {}
  };

  // cart sync helpers (same UI)
  const fetchCartAndFindLine = async (tok, productId) => {
    const res = await axios.get(API.CART, {
      headers: { Accept: "application/json", Authorization: `Bearer ${tok}` },
    });
    const payload = res?.data;
    const items = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
    const pid = String(productId);
    return items.find((x) => {
      const a = String(x?.itemable_id ?? "");
      const b = String(x?.itemable?.id ?? "");
      return a === pid || b === pid;
    });
  };
  const syncLocalQty = (productId, serverQty) => {
    const localQty = cartItems[String(productId)] || 0;
    if (serverQty === localQty) return;
    if (serverQty > localQty) {
      const inc = Math.min(serverQty - localQty, 50);
      for (let i = 0; i < inc; i++) addToCart(productId);
    } else {
      const dec = Math.min(localQty - serverQty, 50);
      for (let i = 0; i < dec; i++) removeToCart(productId);
    }
  };

  const handleAddToCart = async () => {
    if (!product?.id) return;
    const tok = localStorage.getItem("access_token");
    if (!tok) return toast.error("Please log in to add items to cart.");

    try {
      await axios.post(
        API.CART,
        { itemable_type: "product", itemable_id: Number(product.id), quantity: 1 },
        { headers: { Accept: "application/json", Authorization: `Bearer ${tok}` } }
      );
      const line = await fetchCartAndFindLine(tok, product.id);
      const serverQty = Number(line?.quantity || 1);
      rememberInstallPrice(product.id, installUnit);
      syncLocalQty(product.id, serverQty);
      toast.success("Added to cart");
    } catch (e) {
      if (e?.response?.status === 409) {
        try {
          const line = await fetchCartAndFindLine(tok, product.id);
          if (!line) return toast.error("Item in cart, but couldn't locate to update.");
          const newQty = Number(line.quantity || 0) + 1;
          await axios.put(
            API.CART_ITEM(line.id),
            { quantity: newQty },
            { headers: { Accept: "application/json", Authorization: `Bearer ${tok}` } }
          );
          rememberInstallPrice(product.id, installUnit);
          syncLocalQty(product.id, newQty);
          toast.success("Cart updated");
        } catch (e2) {
          toast.error(e2?.response?.data?.message || e2.message || "Failed to update cart");
        }
      } else {
        toast.error(e?.response?.data?.message || e.message || "Failed to add to cart");
      }
    }
  };

  const handleDecrease = async () => {
    if (!product?.id) return;
    const tok = localStorage.getItem("access_token");
    if (!tok) return toast.error("Please log in to update cart.");
    try {
      const line = await fetchCartAndFindLine(tok, product.id);
      const current = Number(line?.quantity || 0);
      if (!line || current <= 0) return syncLocalQty(product.id, 0);

      if (current > 1) {
        const newQty = current - 1;
        await axios.put(
          API.CART_ITEM(line.id),
          { quantity: newQty },
          { headers: { Accept: "application/json", Authorization: `Bearer ${tok}` } }
        );
        syncLocalQty(product.id, newQty);
      } else {
        await axios.delete(API.CART_ITEM(line.id), {
          headers: { Accept: "application/json", Authorization: `Bearer ${tok}` },
        });
        syncLocalQty(product.id, 0);
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Failed to update cart");
    }
  };

  /* --------- loading / error ---------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FF] flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading product…</div>
      </div>
    );
  }
  if (err || !product) {
    return (
      <div className="min-h-screen bg-[#F5F7FF] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{err || "Product not found."}</p>
          <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-full bg-[#273e8e] text-white">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const average = avgRating(reviews);
  const totalReviews = reviews.length;
  const categoryName = catMap[product.categoryId] || "Solar Inverter";

  /* ---------------- UI (unchanged structure; just filled with live data) ---------------- */
  return (
    <>
      {/* Desktop */}
      <div className="sm:flex hidden  min-h-screen w-full bg-[#F5F7FF]">
        <SideBar />

        {balance && (
          <LoanPopUp
            icon={<BsExclamationTriangle color="white" size={26} />}
            text="Your loan balance is low, kindly apply for one to proceed"
            link="/"
            link2="/loan"
            link1Text="Back"
            link2Text="Appy for loan"
            imgBg="bg-[#FFA500]"
          />
        )}

        <div className="flex-1">
          <TopNavbar />

          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl sm:text-2xl font-medium">{categoryName}</h1>
              <Link to="/homePage" className="text-blue-600 hover:underline text-sm sm:text-base">
                Go Back
              </Link>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left */}
              <div className="w-full lg:w-1/2">
                <div className="h-[400px] sm:h-[500px] w-full border border-gray-200 flex justify-center items-center bg-white rounded-xl p-4">
                  <img src={product.image} alt={product.heading} className="h-full w-full object-contain" />
                </div>

                <div className="mt-6 space-y-4">
                  {balance ? (
                    <>
                      <button className="w-full py-3 bg-[#273e8e] text-white rounded-full hover:bg-[#273e8e]/90 transition">
                        Buy With Loan
                      </button>
                      <div className="grid grid-cols-2 gap-4">
                        <button onClick={handleAddToCart} className="py-3 border border-[#273e8e] rounded-full hover:bg-[#273e8e]/10 transition">
                          Add To Cart
                        </button>
                        <Link to="/cart" className="py-3 bg-black text-white rounded-full text-center hover:bg-[#273e8e]/90 transition">
                          Buy Now
                        </Link>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <button onClick={handleAddToCart} className="py-4 border border-[#273e8e] rounded-full hover:bg-[#273e8e]/10 transition">
                          Add To Cart
                        </button>
                        <Link to="/cart" className="py-4 bg-[#273e8e] text-white rounded-full text-center hover:bg-[#273e8e]/90 transition">
                          Buy Now
                        </Link>
                      </div>
                      <div className="p-4 mt-6 bg-yellow-50 rounded-lg">
                        <p className="text-yellow-600 text-sm pb-5 sm:text-base">
                          Don't have the finances to proceed? Take a loan and repay at your convenience
                        </p>
                        <Link to="/loan" className="bg-[#E8A91D] py-2 px-6 text-white rounded-full text-sm hover:bg-[#E8A91D]/90 transition">
                          Apply
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Right */}
              <div className="w-full lg:w-1/2">
                <div className="border-2 border-[#273e8e] bg-white p-4 rounded-xl">
                  <h1 className="text-lg sm:text-xl font-medium">{product.heading}</h1>

                  <div className="mt-3">
                    <h2 className="text-xl sm:text-2xl text-[#273e8e] font-bold">{product.price}</h2>

                    <div className="flex items-center gap-2 mt-1">
                      {product.oldPrice && <p className="text-gray-400 line-through text-sm">{product.oldPrice}</p>}
                      {product.discount && (
                        <span className="px-2 py-1 rounded-full text-orange-500 text-xs bg-orange-100">
                          {product.discount}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      {/* stock bar + text (keeps your left block) */}
                      <div className="flex items-center">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500"
                            style={{ width: `${product.stockPct}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 ml-2">{product.stockText}</p>
                      </div>

                      {/* dynamic rating stars on the right */}
                      <div className="flex items-center gap-2">
                        <Stars value={average} size={18} />
                        <span className="text-xs text-gray-500">{totalReviews ? `${totalReviews}` : ""}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="bg-white border mt-4 rounded-full w-[167px] h-[57px] sm:w-[60%] flex py-1 px-1">
                  {["Details", "Reviews"].map((tab, i) => (
                    <button
                      key={tab}
                      onClick={() => setShowReview(i === 0)}
                      className={`flex-1 w-[66] h-[55] rounded-[100px] text-sm ${
                        (showReview && i === 0) || (!showReview && i === 1) ? "bg-[#273e8e] text-white" : "text-gray-500"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <h2 className="text-lg font-medium mt-4 text-gray-800">
                  {showReview ? "Product Details" : "Reviews"}
                </h2>

                <div className="mt-4">
                  {showReview ? (
                    // details from API (keeps your list UI)
                    <div className="border border-[#ccc] bg-white p-4 rounded-xl space-y-3">
                      {(product.details?.length ? product.details : Array(6).fill("Premium quality")).map((txt, i, arr) => (
                        <React.Fragment key={i}>
                          <div className="flex items-center gap-3">
                            <img src={assets.light} className="h-5 w-5" alt="Feature" />
                            <p className="text-sm sm:text-base">{txt}</p>
                          </div>
                          {i < arr.length - 1 && <hr className="border-gray-200" />}
                        </React.Fragment>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* summary pill */}
                      <div className="rounded-2xl border border-gray-300 bg-white p-4">
                        <Stars value={average} size={28} />
                        <div className="flex justify-between items-center mt-2 text-sm text-gray-800">
                          <span>{Number.isFinite(average) ? average.toFixed(1) : "0.0"}</span>
                          <span>{totalReviews} Reviews</span>
                        </div>
                      </div>

                      {/* reviews list */}
                      <div className="rounded-2xl border border-gray-300 bg-white">
                        {reviews.length ? (
                          reviews.map((r, idx) => (
                            <div key={r.id || `${r.user_id}-${r.created_at}-${idx}`} className="p-4">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  <div className="h-12 w-12 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm font-medium">
                                    {initials(r.name)}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{r.name || "User"}</p>
                                    <div className="mt-0.5"><Stars value={toNum(r.rating,0)} size={16} /></div>
                                  </div>
                                </div>
                                <span className="text-xs text-gray-500">{fmtDate(r.created_at)}</span>
                              </div>
                              <p className="mt-3 text-sm sm:text-base text-gray-800">{r.review}</p>
                              {idx < reviews.length - 1 && <div className="h-px bg-gray-200 mt-4 mx-2" />}
                            </div>
                          ))
                        ) : (
                          <div className="p-6 text-sm text-gray-500">No reviews yet.</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Quantity */}
                <div className="h-[70px] p-4 border bg-white border-[#ccc] mt-4 rounded-2xl flex justify-between items-center">
                  Quantity
                  <div className="flex gap-4 items-center">
                    <button onClick={handleDecrease} className="h-10 flex justify-center items-center w-10 bg-[#273e8e] rounded-md text-white">
                      <Minus size={20} color="white" />
                    </button>
                    <div className="px-7">{qtyInCart}</div>
                    <button onClick={handleAddToCart} className="h-10 flex justify-center items-center w-10 bg-[#273e8e] rounded-md text-white">
                      <Plus size={20} color="white" />
                    </button>
                  </div>
                </div>
              </div>
              {/* /Right */}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile (kept same structure; now shows live price/discount and review summary when tabbed) */}
      <div className="sm:hidden flex  min-h-screen w-full bg-[#F5F7FF]">
        {balance && (
          <LoanPopUp
            icon={<BsExclamationTriangle color="white" size={26} />}
            text="Your loan balance is low, kindly apply for one to proceed"
            link="/"
            link2="/loan"
            link1Text="Back"
            link2Text="Appy for loan"
            imgBg="bg-[#FFA500]"
          />
        )}

        <div className="flex-1">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl sm:text-2xl font-medium">{categoryName}</h1>
              <Link to="/homePage" className="text-blue-600 hover:underline text-sm sm:text-base">
                Go Back
              </Link>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left */}
              <div className="w-full lg:w-1/2">
                <div className="h-[400px] sm:h-[500px] w-full border border-gray-200 flex justify-center items-center bg-white rounded-xl p-4">
                  <img src={product.image} alt={product.heading} className="h-full w-full object-contain" />
                </div>
              </div>

              {/* Right */}
              <div className="w-full lg:w-1/2">
                <div className="border-2 border-[#273e8e] p-4 rounded-xl">
                  <h1 className="text-lg sm:text-xl font-medium">{product.heading}</h1>
                  <div className="mt-3">
                    <h2 className="text-xl sm:text-2xl text-[#273e8e] font-bold">{product.price}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      {product.oldPrice && <p className="text-gray-400 line-through text-sm">{product.oldPrice}</p>}
                      {product.discount && (
                        <span className="px-2 py-1 rounded-full text-orange-500 text-xs bg-orange-100">
                          {product.discount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="bg-white border mt-4 rounded-full w-full sm:w-[60%] flex py-1 px-1">
                  {["Details", "Reviews"].map((tab, i) => (
                    <button
                      key={tab}
                      onClick={() => setShowReview(i === 0)}
                      className={`flex-1 py-2 rounded-full text-sm ${
                        (showReview && i === 0) || (!showReview && i === 1) ? "bg-[#273e8e] text-white" : "text-gray-500"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div className="mt-4">
                  {showReview ? (
                    <div className="border border-[#ccc] bg-white p-4 rounded-xl space-y-3">
                      {(product.details?.length ? product.details : Array(6).fill("Premium quality")).map((txt, i, arr) => (
                        <React.Fragment key={i}>
                          <div className="flex items-center gap-3">
                            <img src={assets.light} className="h-5 w-5" alt="Feature" />
                            <p className="text-sm sm:text-base">{txt}</p>
                          </div>
                          {i < arr.length - 1 && <hr className="border-gray-200" />}
                        </React.Fragment>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="rounded-2xl border border-gray-300 bg-white p-4">
                        <Stars value={average} size={24} />
                        <div className="flex justify-between items-center mt-2 text-sm text-gray-800">
                          <span>{Number.isFinite(average) ? average.toFixed(1) : "0.0"}</span>
                          <span>{totalReviews} Reviews</span>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-gray-300 bg-white">
                        {reviews.length ? (
                          reviews.map((r, idx) => (
                            <div key={r.id || `${r.user_id}-${r.created_at}-${idx}`} className="p-4">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  <div className="h-12 w-12 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm font-medium">
                                    {initials(r.name)}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{r.name || "User"}</p>
                                    <div className="mt-0.5"><Stars value={toNum(r.rating,0)} size={16} /></div>
                                  </div>
                                </div>
                                <span className="text-xs text-gray-500">{fmtDate(r.created_at)}</span>
                              </div>
                              <p className="mt-3 text-sm sm:text-base text-gray-800">{r.review}</p>
                              {idx < reviews.length - 1 && <div className="h-px bg-gray-200 mt-4 mx-2" />}
                            </div>
                          ))
                        ) : (
                          <div className="p-6 text-sm text-gray-500">No reviews yet.</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Quantity */}
                <div className="h-[70px] p-4 border mt-4 rounded-2xl flex justify-between items-center bg-white">
                  Quantity
                  <div className="flex gap-4 items-center">
                    <button onClick={handleDecrease} className="h-10 flex justify-center items-center w-10 bg-[#273e8e] rounded-md text-white">
                      <Minus size={20} color="white" />
                    </button>
                    {qtyInCart}
                    <button onClick={handleAddToCart} className="h-10 flex justify-center items-center w-10 bg-[#273e8e] rounded-md text-white">
                      <Plus size={20} color="white" />
                    </button>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={handleAddToCart} className="py-3 border border-[#273e8e] rounded-full hover:bg-[#273e8e]/10 transition">
                      Add To Cart
                    </button>
                    <Link to="/cart" className="py-3 bg-[#273e8e] text-white rounded-full text-center hover:bg-[#273e8e]/90 transition">
                      Buy Now
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
