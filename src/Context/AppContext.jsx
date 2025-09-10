// import { createContext, useState } from "react";
// import { products } from "../assets/data";
// import { solarBundleData } from "../assets/data";

// import toast from "react-hot-toast";

// export const ContextApi = createContext();

// export const ContextProvider = (props) => {
//   const [filteredResults, setFilteredResults] = useState([]);
//   const [cartItems, setCartItems] = useState({});

//   // const addToCart = (itemId) => {
//   //   const cartData = structuredClone(cartItems);
//   //   try {
//   //     cartData[itemId] = (cartData[itemId] || 0) + 1;
//   //     setCartItems(cartData);
//   //     toast.success("Added to Cart");
//   //   } catch (error) {
//   //     toast.error("Error adding to Cart");
//   //   }
//   // };

//   // const removeToCart = (itemId) => {
//   //   const cartData = structuredClone(cartItems);
//   //   try {
//   //     if (!cartData[itemId]) {
//   //       toast.error("Item not in cart");
//   //       return;
//   //     }
//   //     cartData[itemId] -= 1;
//   //     if (cartData[itemId] === 0) {
//   //       delete cartData[itemId];
//   //     }
//   //     setCartItems(cartData);
//   //     toast.success("Removed from Cart");
//   //   } catch (error) {
//   //     toast.error("Error removing from Cart");
//   //   }
//   // };

//   const addToCart = (itemId) => {
//   const id = String(itemId);           // ✅ normalize key
//   const cartData = structuredClone(cartItems);
//   try {
//     cartData[id] = (cartData[id] || 0) + 1;
//     setCartItems(cartData);
//     toast.success("Added to Cart");
//   } catch (error) {
//     toast.error("Error adding to Cart");
//   }
// };

// const removeToCart = (itemId) => {
//   const id = String(itemId);           // ✅ normalize key
//   const cartData = structuredClone(cartItems);
//   try {
//     if (!cartData[id]) {
//       toast.error("Item not in cart");
//       return;
//     }
//     cartData[id] -= 1;
//     if (cartData[id] === 0) {
//       delete cartData[id];
//     }
//     setCartItems(cartData);
//     toast.success("Removed from Cart");
//   } catch (error) {
//     toast.error("Error removing from Cart");
//   }
// };

//   const getCartTotal = () => {
//     let total = 0;
//     for(let cart in cartItems){
//       total +=cartItems[cart];
//     }
//     return total;
//   }
  
//   const getCartAmountTotal = () => {
//   let total = 0;
//   for (let id in cartItems) {
//     const product = products.find((p) => String(p.id) === String(id));
//     if (!product) continue;

//     const numericPrice =
//       typeof product.price === "number"
//         ? product.price
//         : Number(String(product.price).replace(/[^\d.]/g, "")) || 0;

//     total += numericPrice * cartItems[id];
//   }
//   return total;
// };

//   const value = {
//     products,solarBundleData,
//     cartItems,
//     addToCart,
//     removeToCart,
//     filteredResults,
//     setFilteredResults,
//     getCartTotal,
//     getCartAmountTotal,
//   };

//   return (
//     <ContextApi.Provider value={value}>{props.children}</ContextApi.Provider>
//   );
// };
import { createContext, useState, useCallback } from "react";
import { products } from "../assets/data";
import { solarBundleData } from "../assets/data";
import toast from "react-hot-toast";

export const ContextApi = createContext();

export const ContextProvider = (props) => {
  const [filteredResults, setFilteredResults] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [productCatalog, setProductCatalog] = useState({}); // ✅ global catalog (id -> minimal product)

  const addToCart = (itemId) => {
    const id = String(itemId);
    const cartData = structuredClone(cartItems);
    try {
      cartData[id] = (cartData[id] || 0) + 1;
      setCartItems(cartData);
      toast.success("Added to Cart");
    } catch (error) {
      toast.error("Error adding to Cart");
    }
  };

  const removeToCart = (itemId) => {
    const id = String(itemId);
    const cartData = structuredClone(cartItems);
    try {
      if (!cartData[id]) {
        toast.error("Item not in cart");
        return;
      }
      cartData[id] -= 1;
      if (cartData[id] === 0) delete cartData[id];
      setCartItems(cartData);
      toast.success("Removed from Cart");
    } catch (error) {
      toast.error("Error removing from Cart");
    }
  };

  const getCartTotal = () => {
    let total = 0;
    for (let id in cartItems) total += cartItems[id];
    return total;
  };

  // ✅ helper: normalize any price to a number
  const toNumber = (val) =>
    typeof val === "number" ? val : Number(String(val ?? "").replace(/[^\d.]/g, "")) || 0;

  // ✅ register (or upsert) products into global catalog
  const registerProducts = useCallback((list) => {
    if (!Array.isArray(list)) list = [list];
    setProductCatalog((prev) => {
      const next = { ...prev };
      for (const p of list) {
        if (!p) continue;
        const id = String(p.id ?? p._id ?? "");
        if (!id) continue;

        const image =
          p.image ||
          p.featured_image ||
          p?.images?.[0]?.image ||
          "/placeholder-product.png";

        const heading =
          p.heading || p.name || p.title || p.product_name || `Product #${p.id ?? ""}`;

        // accept raw numeric or any string (₦1,000 etc.)
        const rawPrice = p._price_raw ?? p.price ?? p.amount ?? p.sale_price ?? p.product_price;
        const price = toNumber(rawPrice);

        next[id] = {
          id,
          image,
          heading,
          price, // keep numeric in catalog
        };
      }
      return next;
    });
  }, []);

  // ✅ read from catalog first; fallback to static products
  const getProductFromCatalog = useCallback(
    (id) => {
      const key = String(id);
      if (productCatalog[key]) return productCatalog[key];

      const p = products.find((x) => String(x.id) === key);
      if (!p) return null;

      return {
        id: key,
        image: p.image,
        heading: p.heading || p.name || `Product #${key}`,
        price: toNumber(p.price),
      };
    },
    [productCatalog]
  );

  const getCartAmountTotal = () => {
    let total = 0;
    for (let id in cartItems) {
      const p = getProductFromCatalog(id);
      if (!p) continue;
      total += toNumber(p.price) * cartItems[id];
    }
    return total;
  };

  const value = {
    products,
    solarBundleData,

    cartItems,
    addToCart,
    removeToCart,

    filteredResults,
    setFilteredResults,

    // new catalog APIs
    registerProducts,
    getProductFromCatalog,

    getCartTotal,
    getCartAmountTotal,
  };

  return <ContextApi.Provider value={value}>{props.children}</ContextApi.Provider>;
};
