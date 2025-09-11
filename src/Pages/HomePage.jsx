
// // src/Pages/HomePage.jsx
// import React, { useContext, useEffect, useMemo, useState } from "react";
// import axios from "axios";
// import SideBar from "../Component/SideBar";
// import SearchBar from "../Component/SearchBar";
// import Items from "../Component/Items";
// import Product from "../Component/Product";
// import { Link } from "react-router-dom";
// import { ContextApi } from "../Context/AppContext";
// import TopNavbar from "../Component/TopNavbar";
// import HrLine from "../Component/MobileSectionResponsive/HrLine";
// import { ShoppingCart } from "lucide-react";
// import API from "../config/api.config";
// import { assets } from "../assets/data";

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

// const mapApiProductToCard = (p) => {
//   const image =
//     p?.featured_image ||
//     p?.images?.[0]?.image ||
//     assets?.placeholderProduct ||
//     "/placeholder-product.png";

//   // Try common field names; fallback to id
//   const heading =
//     p?.name || p?.title || p?.product_name || `Product #${p?.id ?? ""}`;

//   const priceRaw = p?.price ?? p?.amount ?? p?.sale_price ?? p?.product_price;
//   const oldRaw = p?.compare_at_price ?? p?.old_price;

//   const price = formatNGN(priceRaw);
//   const oldPrice = oldRaw != null ? formatNGN(oldRaw) : "";

//   // Optional discount calc if both prices exist
//   let discount = "";
//   if (Number(oldRaw) > Number(priceRaw)) {
//     const pct = Math.round(((oldRaw - priceRaw) / oldRaw) * 100);
//     discount = `-${pct}%`;
//   }

//   return {
//     id: p?.id,
//     image,
//     heading,
//     price,
//     oldPrice,
//     discount,
//     rating: assets?.rating || assets?.fiveStars || "", // safe placeholder
//   };
// };

// const HomePage = () => {
//   const { registerProducts } = useContext(ContextApi);


//   const [categories, setCategories] = useState([]);
//   const [catLoading, setCatLoading] = useState(false);
//   const [catError, setCatError] = useState("");

//   const [apiProducts, setApiProducts] = useState([]);
//   const [prodLoading, setProdLoading] = useState(false);
//   const [prodError, setProdError] = useState("");

//   // fetch categories
//   useEffect(() => {
//     const fetchCategories = async () => {
//       setCatLoading(true);
//       setCatError("");
//       try {
//         const token = localStorage.getItem("access_token");
//         const { data } = await axios.get(API.CATEGORIES, {
//           headers: {
//             Accept: "application/json",
//             ...(token ? { Authorization: `Bearer ${token}` } : {}),
//           },
//         });
//         setCategories(Array.isArray(data?.data) ? data.data : []);
//       } catch (err) {
//         setCatError(
//           err?.response?.data?.message ||
//             err?.message ||
//             "Failed to load categories."
//         );
//       } finally {
//         setCatLoading(false);
//       }
//     };
//     fetchCategories();
//   }, []);

//   // fetch products
//   useEffect(() => {
//     const fetchProducts = async () => {
//       setProdLoading(true);
//       setProdError("");
//       try {
//          const token = localStorage.getItem("access_token");
//         const { data } = await axios.get(API.PRODUCTS, {
//           headers: { Accept: "application/json",
//             ...(token ? { Authorization: `Bearer ${token}` } : {}),
//            },
            
//         });
//           const list = Array.isArray(data?.data) ? data.data : [];
//         setApiProducts(list.map(mapApiProductToCard));
//         // ✅ make them available to the cart via catalog
//         registerProducts(list);
//       } catch (err) {
//         setProdError(
//           err?.response?.data?.message ||
//             err?.message ||
//             "Failed to load products."
//         );
//       } finally {
//         setProdLoading(false);
//       }
//     };
//     fetchProducts();
//   }, [registerProducts]);

//   // what to render in the grid: prefer API products
//   const gridProducts = useMemo(() => apiProducts, [apiProducts]);

//   return (
//     <>
//       {/* Desktop view */}
//       <div className="sm:flex hidden w-full min-h-screen bg-gray-100">
//         <div className="w-auto">
//           <SideBar />
//         </div>

//         <div className="flex-1 flex flex-col overflow-y-auto">
//           <TopNavbar />

//           <div className="bg-[#273e8e] px-6 py-6">
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-6">
//               <div>
//                 <h1 className="text-2xl text-white">Solar Store</h1>
//                 <p className="text-white font-light">Welcome to the dashboard</p>
//               </div>

//               {/* Pass categories to SearchBar (it still filters your context list) */}
//               <SearchBar categories={categories} />
//             </div>

//             {catError && <p className="text-red-200 text-sm mb-2">{catError}</p>}
//             <Items categories={categories} loading={catLoading} />
//           </div>

//           <div className="px-6 py-6 w-full overflow-scroll">
//             <h1 className="text-2xl text-gray-800 mb-4">All Products</h1>

//             {prodError && (
//               <p className="text-red-600 text-sm mb-3">{prodError}</p>
//             )}
//             {prodLoading && <p className="text-gray-600 text-sm">Loading…</p>}

//             <div className="grid xl:grid-cols-4 lg:grid-cols-4 md:grid-cols-2 grid-cols-1 space-y-4 gap-4">
//               {gridProducts.map((item) => (
//                 <Link key={item.id} to={`/homePage/product/${item.id}`}>
//                   <Product
//                     id={item.id}
//                     image={item.image}
//                     heading={item.heading}
//                     price={item.price}
//                     oldPrice={item.oldPrice}
//                     discount={item.discount}
//                     rating={item.rating}
//                   />
//                 </Link>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Mobile View */}
//       <div className="flex sm:hidden w-full min-h-screen bg-gray-100">
//         <div className="flex-1 flex flex-col overflow-y-auto pb-20">
//           <div className="bg-[#273e8e] border-l-2 pt-12 rounded-bl-2xl rounded-br-2xl border-gray-500 px-6 py-6">
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
//               <div className="flex justify-between items-center w-full">
//                 <div>
//                   <h1 className="text-2xl font-semibold text-white">
//                     Solar Store
//                   </h1>
//                   <p className="text-white">Welcome to the dashboard</p>
//                 </div>
//                 <div className="h-10 w-10 flex justify-center items-center rounded-lg bg-[#1D3073]">
//                   <ShoppingCart color="white" size={18} />
//                 </div>
//               </div>
//               <SearchBar categories={categories} />
//             </div>
//           </div>

//           <div className="px-5 pt-5">
//             <HrLine text={"Categories"} />
//           </div>

//           <Items categories={categories} loading={catLoading} />

//           <div className="px-6 py-6 w-full overflow-scroll">
//             <h1 className="text-2xl font-semibold text-gray-800 mb-4">
//               <HrLine text={"All Products"} />
//             </h1>

//             {prodError && (
//               <p className="text-red-600 text-sm mb-3">{prodError}</p>
//             )}
//             {prodLoading && <p className="text-gray-600 text-sm">Loading…</p>}

//             <div className="grid grid-cols-2 place-items-center gap-5 space-y-4">
//               {gridProducts.map((item) => (
//                 <Link key={item.id} to={`/homePage/product/${item.id}`}>
//                   <Product
//                     id={item.id}
//                     image={item.image}
//                     heading={item.heading}
//                     price={item.price}
//                     oldPrice={item.oldPrice}
//                     discount={item.discount}
//                     rating={item.rating}
//                   />
//                 </Link>
//               ))}
//             </div>
//           </div>
//         </div>
        
//         {/* Mobile Bottom Navigation */}
//         <SideBar />
//       </div>
//     </>
//   );
// };

// export default HomePage;
// import React, { useContext, useEffect, useMemo, useState } from "react";
// import axios from "axios";
// import SideBar from "../Component/SideBar";
// import SearchBar from "../Component/SearchBar";
// import Items from "../Component/Items";
// import Product from "../Component/Product";
// import { Link } from "react-router-dom";
// import { ContextApi } from "../Context/AppContext";
// import TopNavbar from "../Component/TopNavbar";
// import HrLine from "../Component/MobileSectionResponsive/HrLine";
// import { ShoppingCart } from "lucide-react";
// import API from "../config/api.config";
// import { assets } from "../assets/data";

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

// const mapApiProductToCard = (p) => {
//   const image =
//     p?.featured_image ||
//     p?.images?.[0]?.image ||
//     assets?.placeholderProduct ||
//     "/placeholder-product.png";

//   const heading =
//     p?.name || p?.title || p?.product_name || `Product #${p?.id ?? ""}`;

//   const priceRaw = p?.price ?? p?.amount ?? p?.sale_price ?? p?.product_price;
//   const oldRaw = p?.compare_at_price ?? p?.old_price;

//   const price = formatNGN(priceRaw);
//   const oldPrice = oldRaw != null ? formatNGN(oldRaw) : "";

//   let discount = "";
//   if (Number(oldRaw) > Number(priceRaw)) {
//     const pct = Math.round(((oldRaw - priceRaw) / oldRaw) * 100);
//     discount = `-${pct}%`;
//   }

//   return {
//     id: p?.id,
//     image,
//     heading,
//     price,
//     oldPrice,
//     discount,
//     rating: assets?.rating || assets?.fiveStars || "",
//   };
// };

// const HomePage = () => {
//   const { registerProducts } = useContext(ContextApi);

//   const [categories, setCategories] = useState([]);
//   const [catLoading, setCatLoading] = useState(false);
//   const [catError, setCatError] = useState("");

//   const [apiProducts, setApiProducts] = useState([]);
//   const [prodLoading, setProdLoading] = useState(false);
//   const [prodError, setProdError] = useState("");

//   useEffect(() => {
//     const fetchCategories = async () => {
//       setCatLoading(true);
//       setCatError("");
//       try {
//         const token = localStorage.getItem("access_token");
//         const { data } = await axios.get(API.CATEGORIES, {
//           headers: {
//             Accept: "application/json",
//             ...(token ? { Authorization: `Bearer ${token}` } : {}),
//           },
//         });
//         setCategories(Array.isArray(data?.data) ? data.data : []);
//       } catch (err) {
//         setCatError(
//           err?.response?.data?.message ||
//             err?.message ||
//             "Failed to load categories."
//         );
//       } finally {
//         setCatLoading(false);
//       }
//     };
//     fetchCategories();
//   }, []);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       setProdLoading(true);
//       setProdError("");
//       try {
//         const token = localStorage.getItem("access_token");
//         const { data } = await axios.get(API.PRODUCTS, {
//           headers: {
//             Accept: "application/json",
//             ...(token ? { Authorization: `Bearer ${token}` } : {}),
//           },
//         });
//         const list = Array.isArray(data?.data) ? data.data : [];
//         setApiProducts(list.map(mapApiProductToCard));
//         registerProducts(list);
//       } catch (err) {
//         setProdError(
//           err?.response?.data?.message ||
//             err?.message ||
//             "Failed to load products."
//         );
//       } finally {
//         setProdLoading(false);
//       }
//     };
//     fetchProducts();
//   }, [registerProducts]);

//   const gridProducts = useMemo(() => apiProducts, [apiProducts]);

//   return (
//     <>
//       {/* Desktop view */}
//       <div className="sm:flex hidden w-full min-h-screen bg-gray-100">
//         <div className="w-auto">
//           <SideBar />
//         </div>

//         <div className="flex-1 flex flex-col overflow-y-auto">
//           <TopNavbar />

//           <div className="bg-[#273e8e] px-6 py-6">
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-6">
//               <div>
//                 <h1 className="text-2xl text-white">Solar Store</h1>
//                 <p className="text-white font-light">Welcome to your dashboard</p>
//               </div>

//               {/* SearchBar gets full width 841px on desktop via the component */}
//               <SearchBar categories={categories} />
//             </div>

//             {catError && <p className="text-red-200 text-sm mb-2">{catError}</p>}
//             <Items categories={categories} loading={catLoading} />
//           </div>

//           <div className="px-6 py-6 w-full overflow-x-hidden">
//             <h1 className="text-2xl text-gray-800 mb-4">All Products</h1>

//             {prodError && (
//               <p className="text-red-600 text-sm mb-3">{prodError}</p>
//             )}
//             {prodLoading && <p className="text-gray-600 text-sm">Loading…</p>}

//             <div className="grid xl:grid-cols-4 lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
//               {gridProducts.map((item) => (
//                 <Link key={item.id} to={`/homePage/product/${item.id}`} className="w-full">
//                   <Product
//                     id={item.id}
//                     image={item.image}
//                     heading={item.heading}
//                     price={item.price}
//                     oldPrice={item.oldPrice}
//                     discount={item.discount}
//                     rating={item.rating}
//                   />
//                 </Link>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Mobile View */}
//       <div className="flex sm:hidden w-full min-h-screen bg-gray-100">
//         <div className="flex-1 flex flex-col overflow-y-auto pb-20">
//           {/* Top banner */}
//           <div className="bg-[#273e8e] pt-8 rounded-b-2xl px-5 pb-5">
//             <div className="flex items-start justify-between">
//               <div>
//                 <h1 className="text-white text-[20px] font-semibold">Solar Store</h1>
//                 <p className="text-white/90 text-[12px]">Shop the latest solar products</p>
//               </div>
//               <Link
//                 to="/cart"
//                 className="h-10 w-10 flex justify-center items-center rounded-lg bg-[#1D3073] border border-white/10"
//                 aria-label="Cart"
//               >
//                 <ShoppingCart color="white" size={18} />
//               </Link>
//             </div>

//             {/* Search */}
//             <div className="mt-4">
//               <SearchBar categories={categories} />
//             </div>
//           </div>

//           {/* Categories */}
//           <div className="px-5 pt-5">
//             <HrLine text={"Categories"} />
//           </div>
//           <Items categories={categories} loading={catLoading} />

//           {/* Products */}
//           <div className="px-5 py-6 w-full">
//             <h1 className="text-[16px] font-semibold text-gray-800 mb-3">
//               <HrLine text={"All Products"} />
//             </h1>

//             {prodError && (
//               <p className="text-red-600 text-sm mb-3">{prodError}</p>
//             )}
//             {prodLoading && <p className="text-gray-600 text-sm">Loading…</p>}

//             {/* Clean 2-col grid. Remove space-y to avoid extra vertical gaps */}
//             <div className="grid grid-cols-2 gap-4">
//               {gridProducts.map((item) => (
//                 <Link key={item.id} to={`/homePage/product/${item.id}`} className="w-full">
//                   <Product
//                     id={item.id}
//                     image={item.image}
//                     heading={item.heading}
//                     price={item.price}
//                     oldPrice={item.oldPrice}
//                     discount={item.discount}
//                     rating={item.rating}
//                   />
//                 </Link>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Bottom nav (your existing mobile sidebar component) */}
//         <SideBar />
//       </div>
//     </>
//   );
// };

// export default HomePage;
// src/Pages/HomePage.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import SideBar from "../Component/SideBar";
import SearchBar from "../Component/SearchBar";
import Items from "../Component/Items";
import Product from "../Component/Product";
import { Link } from "react-router-dom";
import { ContextApi } from "../Context/AppContext";
import TopNavbar from "../Component/TopNavbar";
import HrLine from "../Component/MobileSectionResponsive/HrLine";
import { ShoppingCart } from "lucide-react";
import API from "../config/api.config";
import { assets } from "../assets/data";

// ₦ formatter
const formatNGN = (n) => {
  if (n == null || n === "") return "—";
  const num = Number(n);
  if (Number.isNaN(num)) return String(n);
  try {
    return `₦${new Intl.NumberFormat("en-NG").format(num)}`;
  } catch {
    return `₦${num}`;
  }
};

// Map API product -> card props the Product component expects
const mapApiProductToCard = (p) => {
  const image =
    p?.featured_image_url ||
    p?.featured_image ||
    p?.images?.[0]?.image ||
    assets?.placeholderProduct ||
    "/placeholder-product.png";

  const heading = p?.title || p?.name || `Product #${p?.id ?? ""}`;

  const priceRaw = Number(p?.price ?? 0);
  const discountRaw =
    p?.discount_price != null ? Number(p.discount_price) : null;

  let isDiscountActive = false;
  if (discountRaw != null && discountRaw < priceRaw) {
    if (p?.discount_end_date) {
      isDiscountActive = new Date(p.discount_end_date) > new Date();
    } else {
      isDiscountActive = true;
    }
  }

  const effectiveRaw = isDiscountActive ? discountRaw : priceRaw;
  const oldRaw = isDiscountActive ? priceRaw : null;

  const price = formatNGN(effectiveRaw);
  const oldPrice = oldRaw != null ? formatNGN(oldRaw) : "";

  let discount = "";
  if (isDiscountActive && priceRaw > 0) {
    const pct = Math.round(((priceRaw - discountRaw) / priceRaw) * 100);
    discount = `-${pct}%`;
  }

  // average rating from reviews[]
  const reviews = Array.isArray(p?.reviews) ? p.reviews : [];
  const ratingAvg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + Number(r?.rating ?? 0), 0) / reviews.length
      : 0;

  return {
    id: p?.id,
    image,
    heading,
    price,
    oldPrice,
    discount,
    ratingAvg,
    ratingCount: reviews.length,
    categoryId: p?.category_id,
    stock: p?.stock,
    isHotDeal: !!p?.top_deal,
  };
};

const HomePage = () => {
  const { registerProducts } = useContext(ContextApi);

  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState("");

  const [apiProducts, setApiProducts] = useState([]);
  const [prodLoading, setProdLoading] = useState(false);
  const [prodError, setProdError] = useState("");

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setCatLoading(true);
      setCatError("");
      try {
        const token = localStorage.getItem("access_token");
        const { data } = await axios.get(API.CATEGORIES, {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        setCategories(Array.isArray(data?.data) ? data.data : []);
      } catch (err) {
        setCatError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load categories."
        );
      } finally {
        setCatLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setProdLoading(true);
      setProdError("");
      try {
        const token = localStorage.getItem("access_token");
        const { data } = await axios.get(API.PRODUCTS, {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const list = Array.isArray(data?.data) ? data.data : [];
        setApiProducts(list.map(mapApiProductToCard));
        // keep raw list in context if you use it elsewhere
        registerProducts?.(list);
      } catch (err) {
        setProdError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load products."
        );
      } finally {
        setProdLoading(false);
      }
    };
    fetchProducts();
  }, [registerProducts]);

  // Build a quick id->name map for categories
  const catMap = useMemo(() => {
    const map = {};
    for (const c of categories || []) {
      const name = c?.name || c?.title || c?.category_name || "";
      if (c?.id) map[c.id] = name || "";
    }
    return map;
  }, [categories]);

  // Enrich cards with category name
  const gridProducts = useMemo(
    () =>
      (apiProducts || []).map((p) => ({
        ...p,
        categoryName: catMap[p.categoryId] || "Inverter",
      })),
    [apiProducts, catMap]
  );

  return (
    <>
      {/* Desktop view */}
      <div className="sm:flex hidden w-full min-h-screen bg-gray-100">
        <div className="w-auto">
          <SideBar />
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto">
          <TopNavbar />

          <div className="bg-[#273e8e] px-6 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-6">
              <div>
                <h1 className="text-2xl text-white">Solar Store</h1>
                <p className="text-white font-light">Welcome to your dashboard</p>
              </div>

              {/* SearchBar gets full width 841px on desktop via the component */}
              <SearchBar categories={categories} />
            </div>

            {catError && <p className="text-red-200 text-sm mb-2">{catError}</p>}
            <Items categories={categories} loading={catLoading} />
          </div>

          <div className="px-6 py-6 w-full overflow-x-hidden">
            <h1 className="text-2xl text-gray-800 mb-4">All Products</h1>

            {prodError && (
              <p className="text-red-600 text-sm mb-3">{prodError}</p>
            )}
            {prodLoading && <p className="text-gray-600 text-sm">Loading…</p>}

            <div className="grid xl:grid-cols-4 lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
              {gridProducts.map((item) => (
                <Link
                  key={item.id}
                  to={`/homePage/product/${item.id}`}
                  className="w-full"
                >
                  <Product
                    id={item.id}
                    image={item.image}
                    heading={item.heading}
                    price={item.price}
                    oldPrice={item.oldPrice}
                    discount={item.discount}
                    ratingAvg={item.ratingAvg}
                    ratingCount={item.ratingCount}
                    categoryName={item.categoryName}
                    isHotDeal={item.isHotDeal}
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="flex sm:hidden w-full min-h-screen bg-gray-100">
        <div className="flex-1 flex flex-col overflow-y-auto pb-20">
          {/* Top banner */}
          <div className="bg-[#273e8e] pt-8 rounded-b-2xl px-5 pb-5">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-white text-[20px] font-semibold">Solar Store</h1>
                <p className="text-white/90 text-[12px]">
                  Shop the latest solar products
                </p>
              </div>
              <Link
                to="/cart"
                className="h-10 w-10 flex justify-center items-center rounded-lg bg-[#1D3073] border border-white/10"
                aria-label="Cart"
              >
                <ShoppingCart color="white" size={18} />
              </Link>
            </div>

            {/* Search */}
            <div className="mt-4">
              <SearchBar categories={categories} />
            </div>
          </div>

          {/* Categories */}
          <div className="px-5 pt-5">
            <HrLine text={"Categories"} />
          </div>
          <Items categories={categories} loading={catLoading} />

          {/* Products */}
          <div className="px-5 py-6 w-full">
            <h1 className="text-[16px] font-semibold text-gray-800 mb-3">
              <HrLine text={"All Products"} />
            </h1>

            {prodError && (
              <p className="text-red-600 text-sm mb-3">{prodError}</p>
            )}
            {prodLoading && <p className="text-gray-600 text-sm">Loading…</p>}

            <div className="grid grid-cols-2 gap-4 max-sm:gap-5 max-sm:ml-[-10px]">
              {gridProducts.map((item) => (
                <Link
                  key={item.id}
                  to={`/homePage/product/${item.id}`}
                  className="w-full max-sm:w-[190px] "
                >
                  <Product
                    id={item.id}
                    image={item.image}
                    heading={item.heading}
                    price={item.price}
                    oldPrice={item.oldPrice}
                    discount={item.discount}
                    ratingAvg={item.ratingAvg}
                    ratingCount={item.ratingCount}
                    categoryName={item.categoryName}
                    isHotDeal={item.isHotDeal}
                   
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom nav (mobile sidebar) */}
        <SideBar />
      </div>
    </>
  );
};

export default HomePage;
