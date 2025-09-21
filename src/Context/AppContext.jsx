import { createContext, useState, useCallback, useEffect } from "react";
import { products } from "../assets/data";
import { solarBundleData } from "../assets/data";
import toast from "react-hot-toast";
import axios from "axios";
import API from "../config/api.config";

export const ContextApi = createContext();

export const ContextProvider = (props) => {
  const [filteredResults, setFilteredResults] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [cartCount, setCartCount] = useState(0);
  const [productCatalog, setProductCatalog] = useState({}); // ✅ global catalog (id -> minimal product)
  
  // Cart notification state
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [notificationProduct, setNotificationProduct] = useState(null);

  // Fetch cart count from API
  const fetchCartCount = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setCartCount(0);
      return;
    }

    try {
      const { data } = await axios.get(API.CART, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      const cartItems = Array.isArray(data?.data) ? data.data : [];
      const totalCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
      setCartCount(totalCount);
    } catch (error) {
      console.error("Failed to fetch cart count:", error);
      setCartCount(0);
    }
  }, []);

  // Load cart count on mount and when token changes
  useEffect(() => {
    fetchCartCount();
  }, [fetchCartCount]);

  // Cart notification functions
  const showCartNotificationModal = (productName, productImage) => {
    setNotificationProduct({ name: productName, image: productImage });
    setShowCartNotification(true);
  };

  const hideCartNotificationModal = () => {
    setShowCartNotification(false);
    setNotificationProduct(null);
  };

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
    cartCount,
    addToCart,
    removeToCart,
    fetchCartCount,

    // Cart notification
    showCartNotification,
    notificationProduct,
    showCartNotificationModal,
    hideCartNotificationModal,

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
