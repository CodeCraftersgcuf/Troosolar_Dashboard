// import React, { useContext, useEffect, useState } from "react";
// import { ContextApi } from "../Context/AppContext";
// import { Link, useParams } from "react-router-dom";
// import SideBar from "../Component/SideBar";
// import TopNavbar from "../Component/TopNavbar";
// import { assets } from "../assets/data";

// const ProductBundle = () => {
//   const { solarBundleData } = useContext(ContextApi);
//   const { id } = useParams();
//   const [productData, setProductData] = useState({});

//   useEffect(() => {
//     const findProduct = solarBundleData.find((item) => item.id === id);
//     if (findProduct) {
//       setProductData(findProduct);
//     }
//   }, [id, solarBundleData]);

//   if (!productData || !productData.id) return <div>Loading...</div>;

//   return (
//     <div className="flex min-h-screen w-full relative">
//       <SideBar />
//       <div className="w-full sm:w-[calc(100%-250px)]">
//         {/* Top Navbar */}
//         <div className="sm:block hidden">
//           <TopNavbar />
//         </div>

//         <div className="bg-[#F5F7FF] p-5 relative">
//           <div className="p-6 bg-[#F6F8FF] min-h-screen gap-6 rounded-lg">
//             <h1 className="text-2xl font-semibold mb-2">Recommended Bundle</h1>
//             <Link to="/" className="text-blue-500 underline mb-3 block">
//               Back
//             </Link>

//             <div className="flex justify-between items-start gap-4">
//               {/* Left Column */}
//               <div className="min-w-[66%]">
//                 <div className="bg-white w-full border border-[#800080] rounded-lg mt-3">
//                   {/* Image Section */}
//                   <div className="relative h-[350px] bg-[#F3F3F3] m-2 rounded-lg flex justify-center items-center">
//                     {/* Label */}
//                     {productData.label && (
//                       <div className="absolute top-4 right-4 bg-[#800080] text-white text-xs px-3 py-1 rounded-full shadow">
//                         {productData.label}
//                       </div>
//                     )}

//                     <img
//                       className="w-[160px] h-[160px]"
//                       src={assets.inverter}
//                       alt="Inverter"
//                     />
//                     <img
//                       src={assets.solar}
//                       className="w-[171px] h-[171px] absolute right-40 bottom-24"
//                       alt="Solar"
//                     />
//                   </div>

//                   {/* Title, Price, Backup Info */}
//                   <div className="p-4">
//                     <h2 className="text-xl font-semibold">
//                       {productData.bundleTitle}
//                     </h2>
//                     <p className="text-sm text-gray-500 pt-1">
//                       {productData.backupInfo}
//                     </p>

//                     <hr className="my-3 text-gray-300" />

//                     <div className="flex justify-between items-start">
//                       {/* Left */}
//                       <div className="flex flex-col items-start">
//                         <p className="text-xl font-bold text-[#273E8E]">
//                           {productData.price}
//                         </p>
//                         <div className="flex gap-2 mt-1">
//                           <span className="text-sm text-gray-500 line-through">
//                             {productData.oldPrice}
//                           </span>
//                           <span className="text-xs px-2 py-[2px] bg-[#FFA500]/20 text-[#FFA500] rounded-full">
//                             {productData.discount}
//                           </span>
//                         </div>
//                       </div>

//                       {/* Stars */}
//                       <img
//                         src={assets.stars}
//                         alt="Rating"
//                         className="w-20 h-auto"
//                       />
//                     </div>
//                   </div>

//                   <hr className="my-2 text-gray-300" />

//                   {/* What's in the Bundle */}
//                   <div className="p-4">
//                     <h3 className="text-lg font-medium mb-3">
//                       What is inside the bundle?
//                     </h3>
//                     <div className="space-y-2">
//                       {productData.itemsIncluded.map((item, index) => (
//                         <div
//                           key={index}
//                           className="flex justify-between items-center bg-gray-100 h-[80px] px-3 py-2 rounded-md"
//                         >
//                           <div className="flex items-center gap-3">
//                             <div className="bg-[#B0B7D0] rounded-md w-[60px] h-[60px] flex items-center justify-center">
//                               <img
//                                 src={item.icon}
//                                 alt={item.title}
//                                 className="w-[60%] h-[60%]"
//                               />
//                             </div>
//                             <div>
//                               <div className="text-[#273E8E] text-base font-semibold">
//                                 {item.title}
//                               </div>
//                               <div className="text-sm text-[#273E8E]">
//                                 N{item.price}
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="flex gap-4 mt-6 px-2">
//                   <button className="flex-1 text-sm border border-[#273E8E] text-[#273E8E] py-4 rounded-full">
//                     Edit Bundle
//                   </button>
//                   <button className="flex-1 text-sm bg-[#273E8E] text-white py-4 rounded-full">
//                     Buy Now
//                   </button>
//                 </div>
//               </div>

//               {/* Right Column */}
//               <div className="w-[34%]">
//                 <div className="flex flex-col gap-3 rounded-2xl">
//                   {/* Total Load & Inverter Rating */}
//                   <div className="grid grid-cols-2 h-[110px] rounded-2xl overflow-hidden">
//                     <div className="bg-[#273E8E] text-white px-4 py-2 flex flex-col justify-between">
//                       <div className="text-sm text-left">Total Load</div>
//                       <div className="text-3xl bg-white text-[#273E8E] font-semibold rounded-lg flex justify-center items-center h-[60%] mt-1">
//                         {productData.totalLoad}
//                         <span className="text-xs ml-1 mt-2">Watt</span>
//                       </div>
//                     </div>

//                     <div className="bg-[#273E8E] text-white px-4 py-2 flex flex-col justify-between">
//                       <div className="text-sm text-left">Inverter Rating</div>
//                       <div className="text-3xl bg-white text-[#273E8E] font-semibold rounded-lg flex justify-center items-center h-[60%] mt-1">
//                         {productData.inverterRating}
//                         <span className="text-xs ml-1 mt-2">VA</span>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Total Output */}
//                   <div className="bg-[#273E8E] text-white px-4 py-3 h-[110px] rounded-2xl flex justify-between items-center">
//                     <div className="text-lg font-bold">Total Output</div>
//                     <div className="text-3xl bg-white text-[#273E8E] font-semibold rounded-lg flex justify-center items-center w-[50%] h-[60%] mt-1">
//                       {productData.totalOutput}
//                       <span className="text-xs ml-1 mt-2">Watt</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>  
//     </div>
//   );
// };

// export default ProductBundle;
// src/pages/ProductBundle.jsx
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Link, useParams } from "react-router-dom";

// import SideBar from "../Component/SideBar";
// import TopNavbar from "../Component/TopNavbar";
// import { assets } from "../assets/data";
// import API, { BASE_URL } from "../config/api.config";

// // Turn BASE_URL (http://localhost:8000/api) into origin (http://localhost:8000)
// const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, "");

// // currency formatter
// const toNumber = (v) =>
//   typeof v === "number" ? v : Number(String(v ?? "").replace(/[^\d.]/g, "")) || 0;

// const formatNGN = (n) => {
//   const num = toNumber(n);
//   try {
//     return `₦${new Intl.NumberFormat("en-NG").format(num)}`;
//   } catch {
//     return `₦${num}`;
//   }
// };

// // make image path absolute
// const toAbsolute = (path) => {
//   if (!path) return "";
//   if (/^https?:\/\//i.test(path)) return path;               // already absolute
//   if (path.startsWith("/")) return `${API_ORIGIN}${path}`;   // "/storage/..."
//   const cleaned = path.replace(/^public\//, "");
//   // e.g. "bundles/xyz.jpg" -> "/storage/bundles/xyz.jpg"
//   return `${API_ORIGIN}/storage/${cleaned}`;
// };

// // robustly read {data: {...}} or plain {...}
// const extractObject = (payload) => payload?.data ?? payload ?? null;

// // Map API bundle -> the props your page expects
// const mapBundleDetail = (b) => {
//   if (!b) return null;

//   const id = b.id;
//   const title = b.title || `Bundle #${id}`;
//   const label = b.bundle_type || ""; // purple pill in your UI
//   const image = b.featured_image ? toAbsolute(b.featured_image) : null;

//   const total = toNumber(b.total_price);
//   const discount = toNumber(b.discount_price);
//   const showDiscount = discount > 0 && discount < total;

//   const price = formatNGN(showDiscount ? discount : total);
//   const oldPrice = showDiscount ? formatNGN(total) : "";
//   const pct = showDiscount ? Math.round((1 - discount / total) * 100) : 0;
//   const discountBadge = showDiscount ? `-${pct}%` : "";

//   // Bundle items: relation may serialize as bundleItems or bundle_items
//   const relItems = b.bundleItems ?? b.bundle_items ?? [];
//   const relServices = b.customServices ?? b.custom_services ?? [];

//   // Compose "What's inside the bundle?" list
//   const itemsIncluded = [
//     // products inside the bundle
//     ...relItems
//       .map((bi) => {
//         const p = bi?.product;
//         if (!p) return null;
//         return {
//           icon: p?.featured_image ? toAbsolute(p.featured_image) : assets?.inverter, // fallback icon
//           title: p?.title || p?.name || `Product #${p?.id ?? ""}`,
//           price: toNumber(p?.price),
//         };
//       })
//       .filter(Boolean),
//     // custom services
//     ...relServices.map((s) => ({
//       icon: assets?.serviceIcon || assets?.light,   // choose a placeholder icon you have
//       title: s?.title || "Custom service",
//       price: toNumber(s?.service_amount),
//     })),
//   ];

//   // Optional metrics (if you later add them to the bundle model)
//   const totalLoad = b.total_load ?? "";           // e.g., 1200
//   const inverterRating = b.inverter_rating ?? ""; // e.g., 1600
//   const totalOutput = b.total_output ?? "";       // e.g., 800

//   return {
//     id,
//     // header area
//     label,                       // purple rounded label
//     bundleTitle: title,          // main title
//     backupInfo: b.backup_info ?? "",

//     // prices
//     price,
//     oldPrice,
//     discount: discountBadge,

//     // hero images (keep your assets look, the API image is optional)
//     heroImage: image,            // if you want to show the real bundle image
//     // right column metrics
//     totalLoad,
//     inverterRating,
//     totalOutput,

//     // list
//     itemsIncluded,
//   };
// };

// const ProductBundle = () => {
//   const { id } = useParams();
//   const [productData, setProductData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");

//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       setLoading(true);
//       setErr("");
//       try {
//         const token = localStorage.getItem("access_token");
//         const { data } = await axios.get(API.BUNDLE_BY_ID(id), {
//           headers: {
//             Accept: "application/json",
//             ...(token ? { Authorization: `Bearer ${token}` } : {}),
//           },
//         });
//         const obj = extractObject(data);
//         const mapped = mapBundleDetail(obj);
//         if (mounted) setProductData(mapped);
//       } catch (e) {
//         if (mounted) {
//           setErr(e?.response?.data?.message || e?.message || "Failed to load bundle.");
//           setProductData(null);
//         }
//       } finally {
//         mounted && setLoading(false);
//       }
//     })();
//     return () => {
//       mounted = false;
//     };
//   }, [id]);

//   if (loading) return <div className="p-6 text-gray-600">Loading…</div>;
//   if (err) return <div className="p-6 text-red-600">{err}</div>;
//   if (!productData) return <div className="p-6">Not found.</div>;

//   return (
//     <div className="flex min-h-screen w-full relative">
//       <SideBar />
//       <div className="w-full sm:w-[calc(100%-250px)]">
//         {/* Top Navbar */}
//         <div className="sm:block hidden">
//           <TopNavbar />
//         </div>

//         <div className="bg-[#F5F7FF] p-5 relative">
//           <div className="p-6 bg-[#F6F8FF] min-h-screen gap-6 rounded-lg">
//             <h1 className="text-2xl font-semibold mb-2">Recommended Bundle</h1>
//             <Link to="/productBundle" className="text-blue-500 underline mb-3 block">
//               Back
//             </Link>

//             <div className="flex justify-between items-start gap-4">
//               {/* Left Column */}
//               <div className="min-w-[66%]">
//                 <div className="bg-white w-full border border-[#800080] rounded-lg mt-3">
//                   {/* Image Section */}
//                   <div className="relative h-[350px] bg-[#F3F3F3] m-2 rounded-lg flex justify-center items-center">
//                     {/* Label */}
//                     {productData.label && (
//                       <div className="absolute top-4 right-4 bg-[#800080] text-white text-xs px-3 py-1 rounded-full shadow">
//                         {productData.label}
//                       </div>
//                     )}

//                     {/* If you want to display the real bundle image, uncomment: */}
//                     {/* {productData.heroImage ? (
//                       <img
//                         className="max-h-[80%] max-w-[80%] object-contain"
//                         src={productData.heroImage}
//                         alt={productData.bundleTitle}
//                       />
//                     ) : ( */}
//                       <>
//                         <img
//                           className="w-[160px] h-[160px]"
//                           src={assets.inverter}
//                           alt="Inverter"
//                         />
//                         <img
//                           src={assets.solar}
//                           className="w-[171px] h-[171px] absolute right-40 bottom-24"
//                           alt="Solar"
//                         />
//                       </>
//                     {/* )} */}
//                   </div>

//                   {/* Title, Price, Backup Info */}
//                   <div className="p-4">
//                     <h2 className="text-xl font-semibold">
//                       {productData.bundleTitle}
//                     </h2>
//                     {productData.backupInfo && (
//                       <p className="text-sm text-gray-500 pt-1">
//                         {productData.backupInfo}
//                       </p>
//                     )}

//                     <hr className="my-3 text-gray-300" />

//                     <div className="flex justify-between items-start">
//                       {/* Left */}
//                       <div className="flex flex-col items-start">
//                         <p className="text-xl font-bold text-[#273E8E]">
//                           {productData.price}
//                         </p>
//                         <div className="flex gap-2 mt-1">
//                           {productData.oldPrice && (
//                             <span className="text-sm text-gray-500 line-through">
//                               {productData.oldPrice}
//                             </span>
//                           )}
//                           {productData.discount && (
//                             <span className="text-xs px-2 py-[2px] bg-[#FFA500]/20 text-[#FFA500] rounded-full">
//                               {productData.discount}
//                             </span>
//                           )}
//                         </div>
//                       </div>

//                       {/* Stars */}
//                       <img
//                         src={assets.stars}
//                         alt="Rating"
//                         className="w-20 h-auto"
//                       />
//                     </div>
//                   </div>

//                   <hr className="my-2 text-gray-300" />

//                   {/* What's in the Bundle */}
//                   <div className="p-4">
//                     <h3 className="text-lg font-medium mb-3">
//                       What is inside the bundle?
//                     </h3>
//                     <div className="space-y-2">
//                       {(productData.itemsIncluded || []).map((item, index) => (
//                         <div
//                           key={index}
//                           className="flex justify-between items-center bg-gray-100 h-[80px] px-3 py-2 rounded-md"
//                         >
//                           <div className="flex items-center gap-3">
//                             <div className="bg-[#B0B7D0] rounded-md w-[60px] h-[60px] flex items-center justify-center overflow-hidden">
//                               {item.icon ? (
//                                 <img
//                                   src={item.icon}
//                                   alt={item.title}
//                                   className="max-w-[60%] max-h-[60%] object-contain"
//                                 />
//                               ) : (
//                                 <span className="text-xs text-white">IMG</span>
//                               )}
//                             </div>
//                             <div>
//                               <div className="text-[#273E8E] text-base font-semibold">
//                                 {item.title}
//                               </div>
//                               <div className="text-sm text-[#273E8E]">
//                                 {formatNGN(item.price)}
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       ))}

//                       {!productData.itemsIncluded?.length && (
//                         <div className="text-gray-500 bg-white border rounded-xl p-4">
//                           No items attached to this bundle.
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="flex gap-4 mt-6 px-2">
//                   <button className="flex-1 text-sm border border-[#273E8E] text-[#273E8E] py-4 rounded-full">
//                     Edit Bundle
//                   </button>
//                   <button className="flex-1 text-sm bg-[#273E8E] text-white py-4 rounded-full">
//                     Buy Now
//                   </button>
//                 </div>
//               </div>

//               {/* Right Column */}
//               <div className="w-[34%]">
//                 <div className="flex flex-col gap-3 rounded-2xl">
//                   {/* Total Load & Inverter Rating */}
//                   {(productData.totalLoad || productData.inverterRating) && (
//                     <div className="grid grid-cols-2 h-[110px] rounded-2xl overflow-hidden">
//                       <div className="bg-[#273E8E] text-white px-4 py-2 flex flex-col justify-between">
//                         <div className="text-sm text-left">Total Load</div>
//                         <div className="text-3xl bg-white text-[#273E8E] font-semibold rounded-lg flex justify-center items-center h-[60%] mt-1">
//                           {productData.totalLoad || "—"}
//                           <span className="text-xs ml-1 mt-2">Watt</span>
//                         </div>
//                       </div>

//                       <div className="bg-[#273E8E] text-white px-4 py-2 flex flex-col justify-between">
//                         <div className="text-sm text-left">Inverter Rating</div>
//                         <div className="text-3xl bg-white text-[#273E8E] font-semibold rounded-lg flex justify-center items-center h-[60%] mt-1">
//                           {productData.inverterRating || "—"}
//                           <span className="text-xs ml-1 mt-2">VA</span>
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   {/* Total Output */}
//                   {productData.totalOutput && (
//                     <div className="bg-[#273E8E] text-white px-4 py-3 h-[110px] rounded-2xl flex justify-between items-center">
//                       <div className="text-lg font-bold">Total Output</div>
//                       <div className="text-3xl bg-white text-[#273E8E] font-semibold rounded-lg flex justify-center items-center w-[50%] h-[60%] mt-1">
//                         {productData.totalOutput}
//                         <span className="text-xs ml-1 mt-2">Watt</span>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//               {/* /Right */}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductBundle;


// src/pages/ProductBundle.jsx
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Link, useParams } from "react-router-dom";

// import SideBar from "../Component/SideBar";
// import TopNavbar from "../Component/TopNavbar";
// import { assets } from "../assets/data";
// import API, { BASE_URL } from "../config/api.config";

// // Turn BASE_URL (http://localhost:8000/api) into origin (http://localhost:8000)
// const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, "");

// // currency formatter
// const toNumber = (v) =>
//   typeof v === "number" ? v : Number(String(v ?? "").replace(/[^\d.]/g, "")) || 0;

// const formatNGN = (n) => {
//   const num = toNumber(n);
//   try {
//     return `₦${new Intl.NumberFormat("en-NG").format(num)}`;
//   } catch {
//     return `₦${num}`;
//   }
// };

// // make image path absolute
// const toAbsolute = (path) => {
//   if (!path) return "";
//   if (/^https?:\/\//i.test(path)) return path;
//   if (path.startsWith("/")) return `${API_ORIGIN}${path}`;
//   const cleaned = path.replace(/^public\//, "");
//   return `${API_ORIGIN}/storage/${cleaned}`;
// };

// // robustly read {data: {...}} or plain {...}
// const extractObject = (payload) => payload?.data ?? payload ?? null;

// // Map API bundle -> the props your page expects
// const mapBundleDetail = (b) => {
//   if (!b) return null;

//   const id = b.id;
//   const title = b.title || `Bundle #${id}`;
//   const label = b.bundle_type || "";
//   const image = b.featured_image ? toAbsolute(b.featured_image) : null;

//   const total = toNumber(b.total_price);
//   const discount = toNumber(b.discount_price);
//   const showDiscount = discount > 0 && discount < total;

//   const price = formatNGN(showDiscount ? discount : total);
//   const oldPrice = showDiscount ? formatNGN(total) : "";
//   const pct = showDiscount ? Math.round((1 - discount / total) * 100) : 0;
//   const discountBadge = showDiscount ? `-${pct}%` : "";

//   const relItems = b.bundleItems ?? b.bundle_items ?? [];
//   const relServices = b.customServices ?? b.custom_services ?? [];

//   const itemsIncluded = [
//     ...relItems
//       .map((bi) => {
//         const p = bi?.product;
//         if (!p) return null;
//         return {
//           icon: p?.featured_image ? toAbsolute(p.featured_image) : assets?.inverter,
//           title: p?.title || p?.name || `Product #${p?.id ?? ""}`,
//           price: toNumber(p?.price),
//         };
//       })
//       .filter(Boolean),
//     ...relServices.map((s) => ({
//       icon: assets?.serviceIcon || assets?.light,
//       title: s?.title || "Custom service",
//       price: toNumber(s?.service_amount),
//     })),
//   ];

//   // These fields don't exist in your bundle; keep fallbacks so UI always shows.
//   const totalLoad = b.total_load ?? "";
//   const inverterRating = b.inverter_rating ?? "";
//   const totalOutput = b.total_output ?? "";

//   return {
//     id,
//     label,
//     bundleTitle: title,
//     backupInfo: b.backup_info ?? "",
//     price,
//     oldPrice,
//     discount: discountBadge,
//     heroImage: image,
//     totalLoad,
//     inverterRating,
//     totalOutput,
//     itemsIncluded,
//   };
// };

// const ProductBundle = () => {
//   const { id } = useParams();
//   const [productData, setProductData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");

//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       setLoading(true);
//       setErr("");
//       try {
//         const token = localStorage.getItem("access_token");
//         const { data } = await axios.get(API.BUNDLE_BY_ID(id), {
//           headers: {
//             Accept: "application/json",
//             ...(token ? { Authorization: `Bearer ${token}` } : {}),
//           },
//         });
//         const obj = extractObject(data);
//         const mapped = mapBundleDetail(obj);
//         if (mounted) setProductData(mapped);
//       } catch (e) {
//         if (mounted) {
//           setErr(e?.response?.data?.message || e?.message || "Failed to load bundle.");
//           setProductData(null);
//         }
//       } finally {
//         mounted && setLoading(false);
//       }
//     })();
//     return () => {
//       mounted = false;
//     };
//   }, [id]);

//   if (loading) return <div className="p-6 text-gray-600">Loading…</div>;
//   if (err) return <div className="p-6 text-red-600">{err}</div>;
//   if (!productData) return <div className="p-6">Not found.</div>;

//   return (
//     <div className="flex min-h-screen w-full relative">
//       <SideBar />
//       <div className="w-full sm:w-[calc(100%-250px)]">
//         {/* Top Navbar */}
//         <div className="sm:block hidden">
//           <TopNavbar />
//         </div>

//         <div className="bg-[#F5F7FF] p-5 relative">
//           <div className="p-6 bg-[#F6F8FF] min-h-screen gap-6 rounded-lg">
//             <h1 className="text-2xl font-semibold mb-2">Recommended Bundle</h1>
//             <Link to="/productBundle" className="text-blue-500 underline mb-3 block">
//               Back
//             </Link>

//             <div className="flex justify-between items-start gap-4">
//               {/* Left Column */}
//               <div className="min-w-[66%]">
//                 <div className="bg-white w-full border border-[#800080] rounded-lg mt-3">
//                   {/* Image Section */}
//                   <div className="relative h-[350px] bg-[#F3F3F3] m-2 rounded-lg flex justify-center items-center">
//                     {productData.label && (
//                       <div className="absolute top-4 right-4 bg-[#800080] text-white text-xs px-3 py-1 rounded-full shadow">
//                         {productData.label}
//                       </div>
//                     )}

//                     {/* Use your decorative assets (or swap to productData.heroImage if you like) */}
//                     <img className="w-[160px] h-[160px]" src={assets.inverter} alt="Inverter" />
//                     <img src={assets.solar} className="w-[171px] h-[171px] absolute right-40 bottom-24" alt="Solar" />
//                   </div>

//                   {/* Title, Price, Backup Info */}
//                   <div className="p-4">
//                     <h2 className="text-xl font-semibold">{productData.bundleTitle}</h2>
//                     {productData.backupInfo && (
//                       <p className="text-sm text-gray-500 pt-1">{productData.backupInfo}</p>
//                     )}

//                     <hr className="my-3 text-gray-300" />

//                     <div className="flex justify-between items-start">
//                       <div className="flex flex-col items-start">
//                         <p className="text-xl font-bold text-[#273E8E]">{productData.price}</p>
//                         <div className="flex gap-2 mt-1">
//                           {productData.oldPrice && (
//                             <span className="text-sm text-gray-500 line-through">{productData.oldPrice}</span>
//                           )}
//                           {productData.discount && (
//                             <span className="text-xs px-2 py-[2px] bg-[#FFA500]/20 text-[#FFA500] rounded-full">
//                               {productData.discount}
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                       <img src={assets.stars} alt="Rating" className="w-20 h-auto" />
//                     </div>
//                   </div>

//                   <hr className="my-2 text-gray-300" />

//                   {/* What's in the Bundle */}
//                   <div className="p-4">
//                     <h3 className="text-lg font-medium mb-3">What is inside the bundle?</h3>
//                     <div className="space-y-2">
//                       {(productData.itemsIncluded || []).map((item, index) => (
//                         <div
//                           key={index}
//                           className="flex justify-between items-center bg-gray-100 h-[80px] px-3 py-2 rounded-md"
//                         >
//                           <div className="flex items-center gap-3">
//                             <div className="bg-[#B0B7D0] rounded-md w-[60px] h-[60px] flex items-center justify-center overflow-hidden">
//                               {item.icon ? (
//                                 <img src={item.icon} alt={item.title} className="max-w-[60%] max-h-[60%] object-contain" />
//                               ) : (
//                                 <span className="text-xs text-white">IMG</span>
//                               )}
//                             </div>
//                             <div>
//                               <div className="text-[#273E8E] text-base font-semibold">{item.title}</div>
//                               <div className="text-sm text-[#273E8E]">{formatNGN(item.price)}</div>
//                             </div>
//                           </div>
//                         </div>
//                       ))}

//                       {!productData.itemsIncluded?.length && (
//                         <div className="text-gray-500 bg-white border rounded-xl p-4">
//                           No items attached to this bundle.
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="flex gap-4 mt-6 px-2">
//                   <button className="flex-1 text-sm border border-[#273E8E] text-[#273E8E] py-4 rounded-full">
//                     Edit Bundle
//                   </button>
//                   <button className="flex-1 text-sm bg-[#273E8E] text-white py-4 rounded-full">
//                     Buy Now
//                   </button>
//                 </div>
//               </div>

//               {/* Right Column */}
//               <div className="w-[34%]">
//                 <div className="flex flex-col gap-3 rounded-2xl">
//                   {/* ✅ Always render these cards; show "—" when field missing */}
//                   <div className="grid grid-cols-2 h-[110px] rounded-2xl overflow-hidden">
//                     <div className="bg-[#273E8E] text-white px-4 py-2 flex flex-col justify-between">
//                       <div className="text-sm text-left">Total Load</div>
//                       <div className="text-3xl bg-white text-[#273E8E] font-semibold rounded-lg flex justify-center items-center h-[60%] mt-1">
//                         {productData.totalLoad || "—"}
//                         <span className="text-xs ml-1 mt-2">Watt</span>
//                       </div>
//                     </div>

//                     <div className="bg-[#273E8E] text-white px-4 py-2 flex flex-col justify-between">
//                       <div className="text-sm text-left">Inverter Rating</div>
//                       <div className="text-3xl bg-white text-[#273E8E] font-semibold rounded-lg flex justify-center items-center h-[60%] mt-1">
//                         {productData.inverterRating || "—"}
//                         <span className="text-xs ml-1 mt-2">VA</span>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="bg-[#273E8E] text-white px-4 py-3 h-[110px] rounded-2xl flex justify-between items-center">
//                     <div className="text-lg font-bold">Total Output</div>
//                     <div className="text-3xl bg-white text-[#273E8E] font-semibold rounded-lg flex justify-center items-center w-[50%] h-[60%] mt-1">
//                       {productData.totalOutput || "—"}
//                       <span className="text-xs ml-1 mt-2">Watt</span>
//                     </div>
//                   </div>

//                   {/* (Optional) Summary box so the column is useful even without metrics */}
//                   <div className="bg-white border rounded-2xl p-4">
//                     <div className="flex justify-between text-sm mb-2">
//                       <span>Items</span>
//                       <span>{productData.itemsIncluded?.length ?? 0}</span>
//                     </div>
//                     <div className="flex justify-between text-sm">
//                       <span>Bundle Price</span>
//                       <span>{productData.price}</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               {/* /Right */}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductBundle;

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Link, useParams, useNavigate } from "react-router-dom";

// import SideBar from "../Component/SideBar";
// import TopNavbar from "../Component/TopNavbar";
// import { assets } from "../assets/data";
// import API, { BASE_URL } from "../config/api.config";

// // Turn BASE_URL (http://localhost:8000/api) into origin (http://localhost:8000)
// const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, "");

// // currency formatter
// const toNumber = (v) =>
//   typeof v === "number" ? v : Number(String(v ?? "").replace(/[^\d.]/g, "")) || 0;

// const formatNGN = (n) => {
//   const num = toNumber(n);
//   try {
//     return `₦${new Intl.NumberFormat("en-NG").format(num)}`;
//   } catch {
//     return `₦${num}`;
//   }
// };

// // make image path absolute
// const toAbsolute = (path) => {
//   if (!path) return "";
//   if (/^https?:\/\//i.test(path)) return path;
//   if (path.startsWith("/")) return `${API_ORIGIN}${path}`;
//   const cleaned = path.replace(/^public\//, "");
//   return `${API_ORIGIN}/storage/${cleaned}`;
// };

// // robustly read {data: {...}} or plain {...}
// const extractObject = (payload) => payload?.data ?? payload ?? null;

// // Map API bundle -> the props your page expects
// const mapBundleDetail = (b) => {
//   if (!b) return null;

//   const id = b.id;
//   const title = b.title || `Bundle #${id}`;
//   const label = b.bundle_type || "";
//   const image = b.featured_image ? toAbsolute(b.featured_image) : null;

//   const total = toNumber(b.total_price);
//   const discount = toNumber(b.discount_price);
//   const showDiscount = discount > 0 && discount < total;

//   const price = formatNGN(showDiscount ? discount : total);
//   const oldPrice = showDiscount ? formatNGN(total) : "";
//   const pct = showDiscount ? Math.round((1 - discount / total) * 100) : 0;
//   const discountBadge = showDiscount ? `-${pct}%` : "";

//   const relItems = b.bundleItems ?? b.bundle_items ?? [];
//   const relServices = b.customServices ?? b.custom_services ?? [];

//   const itemsIncluded = [
//     ...relItems
//       .map((bi) => {
//         const p = bi?.product;
//         if (!p) return null;
//         return {
//           icon: p?.featured_image ? toAbsolute(p.featured_image) : assets?.inverter,
//           title: p?.title || p?.name || `Product #${p?.id ?? ""}`,
//           price: toNumber(p?.price),
//         };
//       })
//       .filter(Boolean),
//     ...relServices.map((s) => ({
//       icon: assets?.serviceIcon || assets?.light,
//       title: s?.title || "Custom service",
//       price: toNumber(s?.service_amount),
//     })),
//   ];

//   // These fields may not exist in your bundle; keep fallbacks so UI always shows.
//   const totalLoad = b.total_load ?? "";
//   const inverterRating = b.inverter_rating ?? "";
//   const totalOutput = b.total_output ?? "";

//   return {
//     id,
//     label,
//     bundleTitle: title,
//     backupInfo: b.backup_info ?? "",
//     price,
//     oldPrice,
//     discount: discountBadge,
//     heroImage: image,
//     totalLoad,
//     inverterRating,
//     totalOutput,
//     itemsIncluded,
//   };
// };

// const ProductBundle = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [productData, setProductData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");

//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       setLoading(true);
//       setErr("");
//       try {
//         const token = localStorage.getItem("access_token");
//         const { data } = await axios.get(API.BUNDLE_BY_ID(id), {
//           headers: {
//             Accept: "application/json",
//             ...(token ? { Authorization: `Bearer ${token}` } : {}),
//           },
//         });
//         const obj = extractObject(data);
//         const mapped = mapBundleDetail(obj);
//         if (mounted) setProductData(mapped);
//       } catch (e) {
//         if (mounted) {
//           setErr(e?.response?.data?.message || e?.message || "Failed to load bundle.");
//           setProductData(null);
//         }
//       } finally {
//         mounted && setLoading(false);
//       }
//     })();
//     return () => {
//       mounted = false;
//     };
//   }, [id]);

//   // Add to cart via API on Buy Now
//   const handleBuyNow = async () => {
//     const token = localStorage.getItem("access_token");
//     try {
//       await axios.post(
//         API.CART, // http://127.0.0.1:8000/api/cart
//         {
//           itemable_type: "bundle",
//           itemable_id: Number(id),
//           quantity: 1,
//         },
//         {
//           headers: {
//             Accept: "application/json",
//             ...(token ? { Authorization: `Bearer ${token}` } : {}),
//           },
//         }
//       );
//       navigate("/cart");
//     } catch (e) {
//       if (e?.response?.status === 409) {
//         // already in cart
//         navigate("/cart");
//         return;
//       }
//       if (e?.response?.status === 401) {
//         alert("Please log in to add items to your cart.");
//         return;
//       }
//       alert(e?.response?.data?.message || e?.message || "Failed to add to cart.");
//     }
//   };

//   if (loading) return <div className="p-6 text-gray-600">Loading…</div>;
//   if (err) return <div className="p-6 text-red-600">{err}</div>;
//   if (!productData) return <div className="p-6">Not found.</div>;

//   return (
//     <div className="flex min-h-screen w-full relative">
//       <SideBar />
//       <div className="w-full sm:w-[calc(100%-250px)]">
//         {/* Top Navbar */}
//         <div className="sm:block hidden">
//           <TopNavbar />
//         </div>

//         <div className="bg-[#F5F7FF] p-5 relative">
//           <div className="p-6 bg-[#F6F8FF] min-h-screen gap-6 rounded-lg">
//             <h1 className="text-2xl font-semibold mb-2">Recommended Bundle</h1>
//             <Link to="/productBundle" className="text-blue-500 underline mb-3 block">
//               Back
//             </Link>

//             <div className="flex justify-between items-start gap-4">
//               {/* Left Column */}
//               <div className="min-w-[66%]">
//                 <div className="bg-white w-full border border-[#800080] rounded-lg mt-3">
//                   {/* Image Section */}
//                   <div className="relative h-[350px] bg-[#F3F3F3] m-2 rounded-lg flex justify-center items-center">
//                     {productData.label && (
//                       <div className="absolute top-4 right-4 bg-[#800080] text-white text-xs px-3 py-1 rounded-full shadow">
//                         {productData.label}
//                       </div>
//                     )}

//                     {/* Decorative assets (or swap to productData.heroImage if preferred) */}
//                     <img className="w-[160px] h-[160px]" src={assets.inverter} alt="Inverter" />
//                     <img src={assets.solar} className="w-[171px] h-[171px] absolute right-40 bottom-24" alt="Solar" />
//                   </div>

//                   {/* Title, Price, Backup Info */}
//                   <div className="p-4">
//                     <h2 className="text-xl font-semibold">{productData.bundleTitle}</h2>
//                     {productData.backupInfo && (
//                       <p className="text-sm text-gray-500 pt-1">{productData.backupInfo}</p>
//                     )}

//                     <hr className="my-3 text-gray-300" />

//                     <div className="flex justify-between items-start">
//                       <div className="flex flex-col items-start">
//                         <p className="text-xl font-bold text-[#273E8E]">{productData.price}</p>
//                         <div className="flex gap-2 mt-1">
//                           {productData.oldPrice && (
//                             <span className="text-sm text-gray-500 line-through">{productData.oldPrice}</span>
//                           )}
//                           {productData.discount && (
//                             <span className="text-xs px-2 py-[2px] bg-[#FFA500]/20 text-[#FFA500] rounded-full">
//                               {productData.discount}
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                       <img src={assets.stars} alt="Rating" className="w-20 h-auto" />
//                     </div>
//                   </div>

//                   <hr className="my-2 text-gray-300" />

//                   {/* What's in the Bundle */}
//                   <div className="p-4">
//                     <h3 className="text-lg font-medium mb-3">What is inside the bundle?</h3>
//                     <div className="space-y-2">
//                       {(productData.itemsIncluded || []).map((item, index) => (
//                         <div
//                           key={index}
//                           className="flex justify-between items-center bg-gray-100 h-[80px] px-3 py-2 rounded-md"
//                         >
//                           <div className="flex items-center gap-3">
//                             <div className="bg-[#B0B7D0] rounded-md w-[60px] h-[60px] flex items-center justify-center overflow-hidden">
//                               {item.icon ? (
//                                 <img
//                                   src={item.icon}
//                                   alt={item.title}
//                                   className="max-w-[60%] max-h-[60%] object-contain"
//                                 />
//                               ) : (
//                                 <span className="text-xs text-white">IMG</span>
//                               )}
//                             </div>
//                             <div>
//                               <div className="text-[#273E8E] text-base font-semibold">{item.title}</div>
//                               <div className="text-sm text-[#273E8E]">{formatNGN(item.price)}</div>
//                             </div>
//                           </div>
//                         </div>
//                       ))}

//                       {!productData.itemsIncluded?.length && (
//                         <div className="text-gray-500 bg-white border rounded-xl p-4">
//                           No items attached to this bundle.
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="flex gap-4 mt-6 px-2">
//                   <button className="flex-1 text-sm border border-[#273E8E] text-[#273E8E] py-4 rounded-full">
//                     Edit Bundle
//                   </button>
//                   <button
//                     onClick={handleBuyNow}
//                     className="flex-1 text-sm bg-[#273E8E] text-white py-4 rounded-full"
//                   >
//                     Buy Now
//                   </button>
//                 </div>
//               </div>

//               {/* Right Column */}
//               <div className="w-[34%]">
//                 <div className="flex flex-col gap-3 rounded-2xl">
//                   {/* Always render these cards; show "—" when field missing */}
//                   <div className="grid grid-cols-2 h-[110px] rounded-2xl overflow-hidden">
//                     <div className="bg-[#273E8E] text-white px-4 py-2 flex flex-col justify-between">
//                       <div className="text-sm text-left">Total Load</div>
//                       <div className="text-3xl bg-white text-[#273E8E] font-semibold rounded-lg flex justify-center items-center h-[60%] mt-1">
//                         {productData.totalLoad || "—"}
//                         <span className="text-xs ml-1 mt-2">Watt</span>
//                       </div>
//                     </div>

//                     <div className="bg-[#273E8E] text-white px-4 py-2 flex flex-col justify-between">
//                       <div className="text-sm text-left">Inverter Rating</div>
//                       <div className="text-3xl bg-white text-[#273E8E] font-semibold rounded-lg flex justify-center items-center h-[60%] mt-1">
//                         {productData.inverterRating || "—"}
//                         <span className="text-xs ml-1 mt-2">VA</span>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="bg-[#273E8E] text-white px-4 py-3 h-[110px] rounded-2xl flex justify-between items-center">
//                     <div className="text-lg font-bold">Total Output</div>
//                     <div className="text-3xl bg-white text-[#273E8E] font-semibold rounded-lg flex justify-center items-center w-[50%] h-[60%] mt-1">
//                       {productData.totalOutput || "—"}
//                       <span className="text-xs ml-1 mt-2">Watt</span>
//                     </div>
//                   </div>

//                   {/* (Optional) Summary box so the column is useful even without metrics) */}
//                   <div className="bg-white border rounded-2xl p-4">
//                     <div className="flex justify-between text-sm mb-2">
//                       <span>Items</span>
//                       <span>{productData.itemsIncluded?.length ?? 0}</span>
//                     </div>
//                     <div className="flex justify-between text-sm">
//                       <span>Bundle Price</span>
//                       <span>{productData.price}</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               {/* /Right */}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductBundle;


// ProductBundle.jsx
// ProductBundle.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams, useNavigate } from "react-router-dom";

import SideBar from "../Component/SideBar";
import TopNavbar from "../Component/TopNavbar";
import { assets } from "../assets/data";
import API, { BASE_URL } from "../config/api.config";
import { ChevronLeft, ShoppingCart } from "lucide-react"; // ← chevron back

// Turn BASE_URL (http://localhost:8000/api) into origin (http://localhost:8000)
const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, "");

// currency helpers
const toNumber = (v) =>
  typeof v === "number" ? v : Number(String(v ?? "").replace(/[^\d.]/g, "")) || 0;

const formatNGN = (n) => {
  const num = toNumber(n);
  try {
    return `₦${new Intl.NumberFormat("en-NG").format(num)}`;
  } catch {
    return `₦${num}`;
  }
};

// make image path absolute
const toAbsolute = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/")) return `${API_ORIGIN}${path}`;
  const cleaned = path.replace(/^public\//, "");
  return `${API_ORIGIN}/storage/${cleaned}`;
};

// robustly read {data: {...}} or plain {...}
const extractObject = (payload) => payload?.data ?? payload ?? null;

// Map API bundle -> props
const mapBundleDetail = (b) => {
  if (!b) return null;

  const id = b.id;
  const title = b.title || `Bundle #${id}`;
  const label = b.bundle_type || "";
  const image = b.featured_image ? toAbsolute(b.featured_image) : null;

  const total = toNumber(b.total_price);
  const discount = toNumber(b.discount_price);
  const showDiscount = discount > 0 && discount < total;

  const price = formatNGN(showDiscount ? discount : total);
  const oldPrice = showDiscount ? formatNGN(total) : "";
  const pct = showDiscount ? Math.round((1 - discount / total) * 100) : 0;
  const discountBadge = showDiscount ? `-${pct}%` : "";

  const relItems = b.bundleItems ?? b.bundle_items ?? [];
  const relServices = b.customServices ?? b.custom_services ?? [];

  const itemsIncluded = [
    ...relItems
      .map((bi) => {
        const p = bi?.product;
        if (!p) return null;
        return {
          icon: p?.featured_image ? toAbsolute(p.featured_image) : assets?.inverter,
          title: p?.title || p?.name || `Product #${p?.id ?? ""}`,
          price: toNumber(p?.price),
        };
      })
      .filter(Boolean),
    ...relServices.map((s) => ({
      icon: assets?.serviceIcon || assets?.light,
      title: s?.title || "Custom service",
      price: toNumber(s?.service_amount),
    })),
  ];

  const totalLoad = b.total_load ?? "";
  const inverterRating = b.inverter_rating ?? "";
  const totalOutput = b.total_output ?? "";

  return {
    id,
    label,
    bundleTitle: title,
    backupInfo: b.backup_info ?? "",
    price,
    oldPrice,
    discount: discountBadge,
    heroImage: image,
    totalLoad,
    inverterRating,
    totalOutput,
    itemsIncluded,
  };
};

const ProductBundle = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const token = localStorage.getItem("access_token");
        const { data } = await axios.get(API.BUNDLE_BY_ID(id), {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const obj = extractObject(data);
        const mapped = mapBundleDetail(obj);
        if (mounted) setProductData(mapped);
      } catch (e) {
        if (mounted) {
          setErr(e?.response?.data?.message || e?.message || "Failed to load bundle.");
          setProductData(null);
        }
      } finally {
        mounted && setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleBuyNow = async () => {
    const token = localStorage.getItem("access_token");
    try {
      await axios.post(
        API.CART,
        { itemable_type: "bundle", itemable_id: Number(id), quantity: 1 },
        { headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) } }
      );
      navigate("/cart");
    } catch (e) {
      if (e?.response?.status === 409) return navigate("/cart");
      if (e?.response?.status === 401) return alert("Please log in to add items to your cart.");
      alert(e?.response?.data?.message || e?.message || "Failed to add to cart.");
    }
  };

  if (loading) return <div className="p-6 text-gray-600">Loading…</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!productData) return <div className="p-6">Not found.</div>;

  console.log("productData Imagesss", productData.heroImage);

  return (
    <div className="flex min-h-screen w-full relative bg-[#F5F7FF]">
      {/* DESKTOP */}
      <SideBar />
      <div className="w-full sm:w-[calc(100%-250px)]">
        <div className="sm:block hidden">
          <TopNavbar />
        </div>

        {/* ↓ smaller padding on mobile */}
        <div className="p-3 sm:p-5">
          <div className="bg-[#F6F8FF] min-h-screen rounded-lg p-3 sm:p-6">
            {/* Desktop Title + Back */}
            <div className="hidden sm:block">
              <h1 className="text-2xl font-semibold mb-2">Recommended Bundles</h1>
              <Link to="/productBundle" className="text-blue-500 underline mb-3 block">
                Back
              </Link>
            </div>

            {/* Desktop two-column layout */}
            <div className="hidden sm:flex justify-between items-start gap-4">
              {/* Left column */}
              <div className="min-w-[66%]">
                <div className="bg-white w-full border border-[#800080] rounded-lg mt-3">
                  {/* Image */}
                  <div className="relative h-[350px] bg-[#F3F3F3] m-2 rounded-lg flex justify-center items-center overflow-hidden">
                    {productData.label && (
                      <div className="absolute top-4 right-4 bg-[#800080] text-white text-xs px-3 py-1 rounded-full shadow">
                        {productData.label}
                      </div>
                    )}
                    {productData.heroImage ? (
                      <img src={productData.heroImage} alt="Bundle" className="max-h-[80%] object-contain" />
                    ) : (
                      <>
                        <img className="w-[160px] h-[160px]" src={assets.inverter} alt="Inverter" />
                        <img src={assets.solar} className="w-[171px] h-[171px] absolute right-40 bottom-24" alt="Solar" />
                      </>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h2 className="text-xl font-semibold">{productData.bundleTitle}</h2>
                    {productData.backupInfo && (
                      <p className="text-sm text-gray-500 pt-1">{productData.backupInfo}</p>
                    )}

                    <hr className="my-3 text-gray-300" />

                    <div className="flex justify-between items-start">
                      <div className="flex flex-col items-start">
                        <p className="text-xl font-bold text-[#273E8E]">{productData.price}</p>
                        <div className="flex gap-2 mt-1">
                          {productData.oldPrice && (
                            <span className="text-sm text-gray-500 line-through">{productData.oldPrice}</span>
                          )}
                          {productData.discount && (
                            <span className="text-xs px-2 py-[2px] bg-[#FFA500]/20 text-[#FFA500] rounded-full">
                              {productData.discount}
                            </span>
                          )}
                        </div>
                      </div>
                      <img src={assets.stars} alt="Rating" className="w-20 h-auto" />
                    </div>
                  </div>

                  <hr className="my-2 text-gray-300" />

                  {/* What's in the bundle */}
                  <div className="p-4">
                    <h3 className="text-lg font-medium mb-3">What is inside the bundle ?</h3>
                    <div className="space-y-2">
                      {(productData.itemsIncluded || []).map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center bg-gray-100 h-[80px] px-3 py-2 rounded-md"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-[#B0B7D0] rounded-md w-[60px] h-[60px] flex items-center justify-center overflow-hidden">
                              {item.icon ? (
                                <img
                                  src={item.icon}
                                  alt={item.title}
                                  className="max-w-[60%] max-h-[60%] object-contain"
                                />
                              ) : (
                                <span className="text-xs text-white">IMG</span>
                              )}
                            </div>
                            <div>
                              <div className="text-[#273E8E] text-base font-semibold">{item.title}</div>
                              <div className="text-sm text-[#273E8E]">{formatNGN(item.price)}</div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {!productData.itemsIncluded?.length && (
                        <div className="text-gray-500 bg-white border rounded-xl p-4">
                          No items attached to this bundle.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 mt-6 px-2">
                  <button className="flex-1 text-sm border border-[#273E8E] text-[#273E8E] py-4 rounded-full">
                    Edit Bundle
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 text-sm bg-[#273E8E] text-white py-4 rounded-full"
                  >
                    Buy Now
                  </button>
                </div>
              </div>

              {/* Right column (stats) */}
              <div className="w-[34%]">
                <div className="flex flex-col gap-3 rounded-2xl">
                  <div className="grid grid-cols-2 h-[110px] rounded-2xl overflow-hidden">
                    <div className="bg-[#273E8E] text-white px-4 py-2 flex flex-col justify-between">
                      <div className="text-sm text-left">Total Load</div>
                      <div className="text-3xl bg-white text-[#273E8E] font-semibold rounded-lg flex justify-center items-center h-[60%] mt-1">
                        {productData.totalLoad || "—"}
                        <span className="text-xs ml-1 mt-2">Watts</span>
                      </div>
                    </div>

                    <div className="bg-[#273E8E] text-white px-4 py-2 flex flex-col justify-between">
                      <div className="text-sm text-left">Inverter Rating</div>
                      <div className="text-3xl bg-white text-[#273E8E] font-semibold rounded-lg flex justify-center items-center h-[60%] mt-1">
                        {productData.inverterRating || "—"}
                        <span className="text-xs ml-1 mt-2">VA</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#273E8E] text-white px-4 py-3 h-[110px] rounded-2xl flex justify-between items-center">
                    <div className="text-lg font-bold">Total Output</div>
                    <div className="text-3xl bg-white text-[#273E8E] font-semibold rounded-lg flex justify-center items-center w-[50%] h-[60%] mt-1">
                      {productData.totalOutput || "—"}
                      <span className="text-xs ml-1 mt-2">Watts</span>
                    </div>
                  </div>

                  <div className="bg-white border rounded-2xl p-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Items</span>
                      <span>{productData.itemsIncluded?.length ?? 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Bundle Price</span>
                      <span>{productData.price}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MOBILE */}
            <div className="sm:hidden">
              {/* Top bar — less vertical space */}
              <div className="px-3 pt-2 pb-2 flex items-center justify-between">
                <button
                  onClick={() => navigate(-1)}
                  aria-label="Back"
                  className="h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm"
                >
                  <ChevronLeft size={20} /> {/* ← chevron */}
                </button>
                <p className="text-[15px] font-medium text-[#0F172A]">Recommended bundles</p>
                <Link
                  to="/cart"
                  aria-label="Cart"
                  className="h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm"
                >
                  <ShoppingCart size={20} />
                </Link>
              </div>

              {/* Bundle card — tighter outer spacing */}
              <div className="mx-3 mb-4 rounded-[18px] border border-[#800080] bg-white p-3 sm:p-4">
                {/* Image area */}
                <div className="relative h-[190px] rounded-[14px] bg-[#F3F3F3] flex items-center justify-center overflow-hidden">
                  {productData.label && (
                    <div className="absolute top-3 right-3 bg-[#800080] text-white text-[11px] px-3 py-[6px] rounded-full shadow">
                      {productData.label}
                    </div>
                  )}
                  {productData.heroImage ? (
                    <img src={productData.heroImage} alt="Bundle" className="max-h-[80%] object-contain" />
                  ) : (
                    <>
                      <img src={assets.inverter} alt="Inverter" className="w-[140px] h-[140px]" />
                      <img src={assets.solar} alt="Solar" className="w-[150px] h-[150px] absolute right-10 bottom-6" />
                    </>
                  )}
                </div>

                {/* Title + price block */}
                <div className="pt-3">
                  <h2 className="text-[16px] font-semibold text-[#0F172A]">
                    {productData.bundleTitle}
                  </h2>
                  {productData.backupInfo && (
                    <p className="text-[12px] text-gray-500 mt-[2px]">{productData.backupInfo}</p>
                  )}

                  <div className="mt-2 flex items-start justify-between">
                    <div>
                      <div className="text-[18px] font-bold text-[#273E8E] leading-5">
                        {productData.price}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        {productData.oldPrice && (
                          <span className="text-[12px] text-gray-400 line-through">
                            {productData.oldPrice}
                          </span>
                        )}
                        {productData.discount && (
                          <span className="px-2 py-[2px] rounded-full text-[11px] text-orange-600 bg-orange-100">
                            {productData.discount}
                          </span>
                        )}
                      </div>
                    </div>
                    <img src={assets.stars} alt="Rating" className="w-[76px]" />
                  </div>
                </div>

                {/* What's inside */}
                <div className="mt-3">
                  <p className="text-[14px] font-medium mb-2">What is inside the bundle ?</p>

                  <div className="space-y-2">
                    {(productData.itemsIncluded || []).map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-[#E8EDF8] rounded-[12px] px-3 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-[44px] h-[44px] rounded-md bg-[#C9D0E6] flex items-center justify-center overflow-hidden">
                            {item.icon ? (
                              <img src={item.icon} alt={item.title} className="max-w-[70%] max-h-[70%] object-contain" />
                            ) : (
                              <span className="text-[10px] text-white">IMG</span>
                            )}
                          </div>
                          <div className="text-[13px] text-[#273E8E]">
                            <div className="font-medium leading-4">{item.title}</div>
                            <div className="font-semibold mt-[2px]">{formatNGN(item.price)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {!productData.itemsIncluded?.length && (
                      <div className="text-gray-500 bg-white border rounded-xl p-4 text-sm">
                        No items attached to this bundle.
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button className="h-11 rounded-full border border-[#273E8E] text-[#273E8E] text-[14px]">
                    Edit Bundle
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="h-11 rounded-full bg-[#273E8E] text-white text-[14px]"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
            {/* /MOBILE */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductBundle;
