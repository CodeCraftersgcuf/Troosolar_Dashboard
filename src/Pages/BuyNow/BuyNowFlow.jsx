import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Building2, Factory, ArrowRight, ArrowLeft, Zap, Wrench, FileText, CheckCircle, Battery, Sun, Monitor, Shield, Calendar, Loader, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import API, { BASE_URL } from '../../config/api.config';

// Helper function to convert storage paths to absolute URLs (same as SolarBundle.jsx)
const toAbsolute = (path) => {
    if (!path) return '';
    // Extract base URL from API config (remove /api)
    const API_BASE = BASE_URL || 'http://127.0.0.1:8000/api';
    const API_ORIGIN = API_BASE.replace(/\/api\/?$/, '') || 'http://127.0.0.1:8000';
    
    // Already absolute URL
    if (/^https?:\/\//i.test(path)) return path;
    
    // Path starts with / (e.g., "/storage/products/xyz.jpg")
    if (path.startsWith('/')) return `${API_ORIGIN}${path}`;
    
    // Path without leading slash (e.g., "bundles/xyz.jpg" or "public/bundles/xyz.jpg")
    // Remove "public/" prefix if present, then prepend /storage/
    const cleaned = path.replace(/^public\//, '');
    return `${API_ORIGIN}/storage/${cleaned}`;
};

// Flutterwave integration
const ensureFlutterwave = () =>
    new Promise((resolve, reject) => {
        if (window.FlutterwaveCheckout) return resolve();
        const s = document.createElement("script");
        s.src = "https://checkout.flutterwave.com/v3.js";
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("Failed to load Flutterwave script"));
        document.body.appendChild(s);
    });

const BuyNowFlow = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [invoiceDetails, setInvoiceDetails] = useState(null);
    const [orderId, setOrderId] = useState(null);
    const [calendarSlots, setCalendarSlots] = useState([]);
    const [paymentResult, setPaymentResult] = useState(null); // 'success' | 'failed' | null
    const [selectedSlot, setSelectedSlot] = useState(null);
    
    // Configuration data from API
    const [addOns, setAddOns] = useState([]);
    const [states, setStates] = useState([]);
    const [deliveryLocations, setDeliveryLocations] = useState([]);
    const [selectedStateId, setSelectedStateId] = useState(null);
    const [selectedAddOns, setSelectedAddOns] = useState([]);
    const [configLoading, setConfigLoading] = useState(false);

    const [formData, setFormData] = useState({
        customerType: '',
        productCategory: '', // 'full-kit', 'inverter-battery', 'battery-only', 'inverter-only', 'panels-only'
        optionType: '', // 'choose-system', 'build-system', 'audit'
        selectedProductPrice: 0,
        selectedBundleId: null,
        selectedBundle: null,
        selectedProductId: null,
        selectedProduct: null,
        installerChoice: '', // 'troosolar', 'own'
        includeInsurance: false,
        address: '',
        state: '',
        stateId: null,
        deliveryLocationId: null,
    });

    // Bundles for selection
    const [bundles, setBundles] = useState([]);
    const [bundlesLoading, setBundlesLoading] = useState(false);

    // Categories and products for individual components
    const [categories, setCategories] = useState([]);
    const [categoryProducts, setCategoryProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);

    // Fetch categories on mount
    React.useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const response = await axios.get(API.CATEGORIES, {
                    headers: {
                        Accept: 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });
                const catList = Array.isArray(response.data?.data) ? response.data.data : [];
                setCategories(catList);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };
        fetchCategories();
    }, []);

    // Map product category string to category name/id
    const getCategoryIdFromProductCategory = (productCategory) => {
        const categoryMap = {
            'battery-only': ['battery', 'batteries'],
            'inverter-only': ['inverter', 'inverters'],
            'panels-only': ['solar panel', 'panels', 'solar panels'],
        };
        
        const searchTerms = categoryMap[productCategory] || [];
        if (searchTerms.length === 0) return null;
        
        // Find category by matching name (case-insensitive)
        const found = categories.find(cat => {
            const name = (cat.name || cat.title || '').toLowerCase();
            return searchTerms.some(term => name.includes(term));
        });
        
        return found?.id || null;
    };

    // --- Handlers ---

    const handleCustomerTypeSelect = (type) => {
        setFormData({ ...formData, customerType: type });
        setStep(2); // Go to Product Category
    };

    const handleCategorySelect = async (categoryId) => {
        // categoryId is now the actual category ID from the API
        const selectedCategory = categories.find(cat => cat.id === categoryId);
        if (!selectedCategory) {
            alert("Category not found. Please try again.");
            return;
        }

        setFormData({ ...formData, productCategory: selectedCategory.title || selectedCategory.name });
        setSelectedCategoryId(categoryId);
        
        // Clear previous products and set loading state BEFORE navigating
        setCategoryProducts([]);
        setProductsLoading(true);
        setStep(2.5); // Navigate to Product Selection step first to show loading
        
        try {
            const token = localStorage.getItem('access_token');
            // Try to fetch products by category
            let products = [];
            try {
                const response = await axios.get(API.CATEGORY_PRODUCTS(categoryId), {
                    headers: {
                        Accept: 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });
                const root = response.data?.data ?? response.data;
                products = Array.isArray(root) ? root : Array.isArray(root?.data) ? root.data : [];
            } catch (err) {
                // Fallback: fetch all products and filter by category
                const allProductsRes = await axios.get(API.PRODUCTS, {
                    headers: {
                        Accept: 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });
                const allProducts = Array.isArray(allProductsRes.data?.data) ? allProductsRes.data.data : [];
                products = allProducts.filter(p => String(p.category_id) === String(categoryId));
            }
            setCategoryProducts(products);
        } catch (error) {
            console.error("Failed to fetch products:", error);
            alert("Failed to load products. Please try again.");
            setCategoryProducts([]); // Ensure empty array on error
        } finally {
            setProductsLoading(false);
        }
    };

    const bundlesFetchedRef = useRef(false);

    const handleOptionSelect = (option) => {
        setFormData(prev => ({ ...prev, optionType: option }));
        if (option === 'choose-system') {
            // Reset the fetched flag when user chooses this option
            bundlesFetchedRef.current = false;
            setStep(3.5); // Go to Bundle Selection step - bundles will be fetched by useEffect
        } else if (option === 'build-system') {
            // Redirect to Solar Builder page
            navigate('/solar-builder');
        } else if (option === 'audit') {
            // For Buy Now, audit requests should redirect to BNPL flow for audit
            // According to documentation, audit flow is part of BNPL
            if (window.confirm("Audit requests are handled through the BNPL flow. Would you like to proceed to BNPL?")) {
                navigate('/bnpl');
            }
        }
    };

    const handleBundleSelect = (bundle) => {
        const price = Number(bundle.discount_price || bundle.total_price || 0);
        setFormData(prev => ({
            ...prev,
            selectedBundleId: bundle.id,
            selectedBundle: bundle,
            selectedProductPrice: price
        }));
        setStep(7); // Go to Order Summary (NEW STEP)
    };

    const handleProductSelect = (product) => {
        const price = Number(product.discount_price || product.price || 0);
        setFormData(prev => ({
            ...prev,
            selectedProductId: product.id,
            selectedProduct: product,
            selectedProductPrice: price
        }));
        setStep(7); // Go to Order Summary (NEW STEP)
    };

    const handleCheckoutSubmit = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                alert("Please login to continue");
                navigate('/login');
                return;
            }

            const payload = {
                customer_type: formData.customerType,
                product_category: formData.productCategory,
                installer_choice: formData.installerChoice,
                include_insurance: formData.includeInsurance,
                amount: formData.selectedProductPrice
            };

            // Add bundle/product ID if selected
            if (formData.selectedBundleId) {
                payload.bundle_id = formData.selectedBundleId;
            }
            if (formData.selectedProductId) {
                payload.product_id = formData.selectedProductId;
            }

            // Add optional fields if available (only if they exist)
            if (formData.stateId) payload.state_id = formData.stateId;
            if (formData.deliveryLocationId) payload.delivery_location_id = formData.deliveryLocationId;
            if (selectedAddOns.length > 0) payload.add_on_ids = selectedAddOns;

            const response = await axios.post(API.BUY_NOW_CHECKOUT, payload, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                }
            });

            if (response.data.status === 'success') {
                setInvoiceDetails(response.data.data);
                setOrderId(response.data.data.order_id);
                setStep(8); // Go to Order Summary with details (NEW STEP)
            }
        } catch (error) {
            console.error("Checkout Error:", error);
            const errorMessage = error.response?.data?.message || 
                                (error.response?.data?.errors ? JSON.stringify(error.response.data.errors) : null) ||
                                "Failed to process checkout. Please check all required fields.";
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const fetchCalendarSlots = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const date = new Date().toISOString().split('T')[0];
            const response = await axios.get(`${API.CALENDAR_SLOTS}?type=installation&payment_date=${date}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.status === 'success') {
                setCalendarSlots(response.data.data.slots);
            }
        } catch (error) {
            console.error("Calendar Error:", error);
        }
    };

    const confirmPayment = async (orderId, txId, amount) => {
        const token = localStorage.getItem('access_token');
        if (!token) return false;
        try {
            const { data } = await axios.post(
                API.Payment_Confirmation,
                {
                    amount: String(amount),
                    orderId: Number(orderId),
                    txId: String(txId || ""),
                    type: "direct",
                },
                {
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return data?.status === "success";
        } catch (e) {
            console.error("Payment confirmation failed:", e);
            return false;
        }
    };

    const handleProceedToPayment = async () => {
        if (!invoiceDetails || !orderId) {
            alert("Invoice details missing. Please try again.");
            return;
        }

        setProcessingPayment(true);
        try {
            await ensureFlutterwave();

            const amount = Number(invoiceDetails.total || 0);
            const txRef = "buynow_" + Date.now() + "_" + orderId;

            // Get user info from localStorage or API
            const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
            const userEmail = userInfo.email || 'customer@troosolar.com';
            const userName = userInfo.name || userInfo.full_name || 'Customer';

            window.FlutterwaveCheckout({
                public_key: "FLWPUBK_TEST-dd1514f7562b1d623c4e63fb58b6aedb-X", // TODO: Move to env variable
                tx_ref: txRef,
                amount: amount,
                currency: "NGN",
                payment_options: "card,ussd,banktransfer",
                customer: {
                    email: userEmail,
                    name: userName,
                },
                callback: async (response) => {
                    if (response?.status === "successful") {
                        const confirmed = await confirmPayment(
                            orderId,
                            response.transaction_id,
                            amount
                        );
                        if (confirmed) {
                            setPaymentResult('success');
                            setStep(6); // Go to success step
                        } else {
                            alert("Payment verification failed. Please contact support if amount was debited.");
                            setPaymentResult('failed');
                        }
                    } else {
                        setPaymentResult('failed');
                    }
                    setProcessingPayment(false);
                },
                onclose: () => {
                    setProcessingPayment(false);
                },
            });
        } catch (error) {
            console.error("Payment initialization error:", error);
            alert("Failed to initialize payment. Please try again.");
            setProcessingPayment(false);
        }
    };

    // Fetch configuration data when component mounts or before Step 4
    React.useEffect(() => {
        const fetchConfig = async () => {
            setConfigLoading(true);
            try {
                const [addOnsRes, statesRes] = await Promise.all([
                    axios.get(API.CONFIG_ADD_ONS, { params: { type: 'buy_now' } }).catch(() => ({ data: { status: 'error' }, status: 404 })),
                    axios.get(API.CONFIG_STATES).catch(() => ({ data: { status: 'error' }, status: 404 }))
                ]);

                // Only set data if API call was successful (not 404)
                if (addOnsRes.status !== 404 && addOnsRes.data?.status === 'success') {
                    setAddOns(addOnsRes.data.data || []);
                }
                if (statesRes.status !== 404 && statesRes.data?.status === 'success') {
                    setStates(statesRes.data.data || []);
                }
            } catch (error) {
                // Silently fail - APIs may not be implemented yet
                console.log("Configuration APIs not available yet:", error.message);
            } finally {
                setConfigLoading(false);
            }
        };
        fetchConfig();
    }, []);

    // Fetch delivery locations when state is selected
    React.useEffect(() => {
        if (selectedStateId) {
            const fetchDeliveryLocations = async () => {
                try {
                    const response = await axios.get(API.CONFIG_DELIVERY_LOCATIONS(selectedStateId));
                    if (response.data.status === 'success') {
                        setDeliveryLocations(response.data.data || []);
                    }
                } catch (error) {
                    console.error("Failed to fetch delivery locations:", error);
                }
            };
            fetchDeliveryLocations();
        }
    }, [selectedStateId]);

    React.useEffect(() => {
        if (step === 5) {
            fetchCalendarSlots();
        }
    }, [step]);

    // Fetch bundles when step 3.5 is reached (only once)
    useEffect(() => {
        if (step === 3.5 && !bundlesFetchedRef.current && !bundlesLoading) {
            bundlesFetchedRef.current = true;
            // Clear previous bundles before fetching
            setBundles([]);
            const fetchBundles = async () => {
                setBundlesLoading(true);
                try {
                    const token = localStorage.getItem('access_token');
                    const response = await axios.get(API.BUNDLES, {
                        headers: {
                            Accept: 'application/json',
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                    });
                    
                    const root = response.data?.data ?? response.data;
                    const arr = Array.isArray(root) ? root : Array.isArray(root?.data) ? root.data : [];
                    setBundles(arr);
                } catch (error) {
                    console.error("Failed to fetch bundles:", error);
                    setBundles([]); // Set empty array on error
                } finally {
                    setBundlesLoading(false);
                }
            };
            fetchBundles();
        }
        // Reset when leaving step 3.5
        if (step !== 3.5) {
            bundlesFetchedRef.current = false;
            setBundles([]); // Clear bundles when navigating away
        }
    }, [step, bundlesLoading]);

    // --- Render Steps ---

    const renderStep1 = () => (
        <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-8 text-[#273e8e]">
                Who are you purchasing for?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                <button onClick={() => handleCustomerTypeSelect('residential')} className="group bg-white border-2 border-gray-100 hover:border-[#273e8e] rounded-2xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center">
                    <div className="bg-blue-50 p-6 rounded-full mb-6 group-hover:bg-[#273e8e]/10 transition-colors">
                        <Home size={40} className="text-[#273e8e]" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">For Residential</h3>
                </button>
                <button onClick={() => handleCustomerTypeSelect('sme')} className="group bg-white border-2 border-gray-100 hover:border-[#273e8e] rounded-2xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center">
                    <div className="bg-blue-50 p-6 rounded-full mb-6 group-hover:bg-[#273e8e]/10 transition-colors">
                        <Building2 size={40} className="text-[#273e8e]" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">For SMEs</h3>
                </button>
                <button onClick={() => handleCustomerTypeSelect('commercial')} className="group bg-white border-2 border-gray-100 hover:border-[#273e8e] rounded-2xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center">
                    <div className="bg-blue-50 p-6 rounded-full mb-6 group-hover:bg-[#273e8e]/10 transition-colors">
                        <Factory size={40} className="text-[#273e8e]" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Commercial & Industrial</h3>
                </button>
            </div>
        </div>
    );

    const renderStep2 = () => {
        // Helper to get category icon based on category name
        const getCategoryIcon = (categoryName) => {
            const name = (categoryName || '').toLowerCase();
            if (name.includes('battery')) return Battery;
            if (name.includes('inverter')) return Monitor;
            if (name.includes('solar') || name.includes('panel')) return Sun;
            return Zap; // Default icon
        };

        return (
            <div className="animate-fade-in">
                <button onClick={() => setStep(1)} className="mb-6 flex items-center text-gray-500 hover:text-[#273e8e]">
                    <ArrowLeft size={16} className="mr-2" /> Back
                </button>
                <h2 className="text-3xl font-bold text-center mb-8 text-[#273e8e]">
                    Select Product Category
                </h2>
                {categories.length === 0 ? (
                    <div className="text-center py-12">
                        <Loader className="animate-spin mx-auto text-[#273e8e]" size={48} />
                        <p className="mt-4 text-gray-600">Loading categories...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {categories.map((cat) => {
                            const IconComponent = getCategoryIcon(cat.title || cat.name);
                            const categoryName = cat.title || cat.name || `Category #${cat.id}`;
                            const categoryIcon = cat.icon ? toAbsolute(cat.icon) : null;
                            
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategorySelect(cat.id)}
                                    className="group bg-white border-2 border-gray-100 hover:border-[#273e8e] rounded-2xl p-6 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center"
                                >
                                    <div className="bg-blue-50 p-4 rounded-full mb-4 group-hover:bg-[#273e8e]/10 transition-colors flex items-center justify-center min-h-[64px] relative">
                                        <IconComponent size={32} className="text-[#273e8e]" />
                                        {categoryIcon && (
                                            <img 
                                                src={categoryIcon} 
                                                alt={categoryName}
                                                className="w-8 h-8 object-contain absolute"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800">{categoryName}</h3>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    const renderStep2_5 = () => {
        const formatPrice = (price) => {
            return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(price);
        };

        const getProductImage = (product) => {
            if (product.featured_image_url) {
                return toAbsolute(product.featured_image_url);
            }
            if (product.featured_image) {
                return toAbsolute(product.featured_image);
            }
            if (product.images && product.images[0] && product.images[0].image) {
                return toAbsolute(product.images[0].image);
            }
            // Return a data URI SVG placeholder instead of a file path to prevent infinite loops
            return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f3f4f6" width="400" height="400"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
        };

        return (
            <div className="animate-fade-in">
                <button 
                    onClick={() => {
                        // Clear products when going back
                        setCategoryProducts([]);
                        setProductsLoading(false);
                        setStep(2);
                    }} 
                    className="mb-6 flex items-center text-gray-500 hover:text-[#273e8e]"
                >
                    <ArrowLeft size={16} className="mr-2" /> Back
                </button>
                <h2 className="text-3xl font-bold text-center mb-4 text-[#273e8e]">
                    Select Product
                </h2>
                <p className="text-center text-gray-600 mb-8">
                    Choose from available products in this category
                </p>

                {productsLoading ? (
                    <div className="text-center py-16">
                        <div className="flex flex-col items-center justify-center">
                            <Loader className="animate-spin mx-auto text-[#273e8e]" size={48} />
                            <p className="mt-6 text-lg font-medium text-gray-700">Loading products...</p>
                            <p className="mt-2 text-sm text-gray-500">Please wait while we fetch available products</p>
                        </div>
                    </div>
                ) : categoryProducts.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                        <p className="text-gray-600">No products available in this category.</p>
                        <button
                            onClick={() => setStep(2)}
                            className="mt-4 text-[#273e8e] hover:underline"
                        >
                            Go back to categories
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {categoryProducts.map((product) => {
                            const price = Number(product.discount_price || product.price || 0);
                            const oldPrice = product.discount_price && product.price && product.discount_price < product.price 
                                ? Number(product.price) 
                                : null;
                            return (
                                <button
                                    key={product.id}
                                    onClick={() => handleProductSelect(product)}
                                    className="group bg-white border-2 border-gray-100 hover:border-[#273e8e] rounded-2xl p-6 hover:shadow-xl transition-all duration-300 text-left"
                                >
                                    <div className="aspect-square w-full mb-4 rounded-lg overflow-hidden bg-gray-100">
                                        <img
                                            src={getProductImage(product)}
                                            alt={product.title || product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            onError={(e) => {
                                                // Prevent infinite loop - only set placeholder if not already set
                                                if (e.target.src && !e.target.src.includes('placeholder-product.png') && !e.target.src.includes('data:image')) {
                                                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f3f4f6" width="400" height="400"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                                                }
                                            }}
                                        />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2 text-gray-800 group-hover:text-[#273e8e] transition-colors">
                                        {product.title || product.name || `Product #${product.id}`}
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-[#273e8e] text-lg">
                                                {formatPrice(price)}
                                            </p>
                                            {oldPrice && (
                                                <p className="text-sm text-gray-500 line-through">
                                                    {formatPrice(oldPrice)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    const renderStep3 = () => (
        <div className="animate-fade-in">
            <button onClick={() => setStep(2)} className="mb-6 flex items-center text-gray-500 hover:text-[#273e8e]">
                <ArrowLeft size={16} className="mr-2" /> Back
            </button>
            <h2 className="text-3xl font-bold text-center mb-8 text-[#273e8e]">
                How would you like to proceed?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                <button onClick={() => handleOptionSelect('choose-system')} className="group bg-white border-2 border-gray-100 hover:border-[#273e8e] rounded-2xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center">
                    <div className="bg-yellow-50 p-6 rounded-full mb-6 group-hover:bg-[#273e8e]/10 transition-colors">
                        <Zap size={40} className="text-yellow-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Choose my solar system</h3>
                </button>
                <button onClick={() => handleOptionSelect('build-system')} className="group bg-white border-2 border-gray-100 hover:border-[#273e8e] rounded-2xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center">
                    <div className="bg-purple-50 p-6 rounded-full mb-6 group-hover:bg-[#273e8e]/10 transition-colors">
                        <Wrench size={40} className="text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Build My System</h3>
                </button>
                <button onClick={() => handleOptionSelect('audit')} className="group bg-white border-2 border-gray-100 hover:border-[#273e8e] rounded-2xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center">
                    <div className="bg-green-50 p-6 rounded-full mb-6 group-hover:bg-[#273e8e]/10 transition-colors">
                        <FileText size={40} className="text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Request Professional Audit</h3>
                </button>
            </div>
        </div>
    );

    const renderStep3_5 = () => {
        // Helper to format price
        const formatPrice = (price) => {
            return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(price);
        };

        // Helper to get bundle image
        const getBundleImage = (bundle) => {
            if (bundle.featured_image) {
                return toAbsolute(bundle.featured_image);
            }
            // Return a data URI SVG placeholder instead of a file path to prevent infinite loops
            return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f3f4f6" width="400" height="400"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
        };

        return (
            <div className="animate-fade-in">
                <button onClick={() => {
                    bundlesFetchedRef.current = false;
                    setBundles([]);
                    setStep(3);
                }} className="mb-6 flex items-center text-gray-500 hover:text-[#273e8e]">
                    <ArrowLeft size={16} className="mr-2" /> Back
                </button>
                <h2 className="text-3xl font-bold text-center mb-4 text-[#273e8e]">
                    Choose Your Solar System
                </h2>
                <p className="text-center text-gray-600 mb-8">
                    Select from our pre-configured solar bundles
                </p>

                {bundlesLoading ? (
                    <div className="text-center py-16">
                        <div className="flex flex-col items-center justify-center">
                            <Loader className="animate-spin mx-auto text-[#273e8e]" size={48} />
                            <p className="mt-6 text-lg font-medium text-gray-700">Loading bundles...</p>
                            <p className="mt-2 text-sm text-gray-500">Please wait while we fetch available solar bundles</p>
                        </div>
                    </div>
                ) : bundles.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                        <p className="text-gray-600 mb-4">No bundles available at the moment.</p>
                        <button
                            onClick={() => setStep(3)}
                            className="mt-4 text-[#273e8e] hover:underline font-semibold"
                        >
                            Go back
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                        {bundles.map((bundle) => {
                            const price = Number(bundle.discount_price || bundle.total_price || 0);
                            const oldPrice = bundle.discount_price && bundle.total_price && bundle.discount_price < bundle.total_price
                                ? Number(bundle.total_price)
                                : null;
                            const discount = oldPrice && price < oldPrice
                                ? Math.round(((oldPrice - price) / oldPrice) * 100)
                                : 0;
                            const isSelected = formData.selectedBundleId === bundle.id;

                            return (
                                <button
                                    key={bundle.id}
                                    onClick={() => handleBundleSelect(bundle)}
                                    className={`group bg-white border-2 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 text-left ${
                                        isSelected
                                            ? 'border-[#273e8e] bg-blue-50 ring-2 ring-[#273e8e]'
                                            : 'border-gray-100 hover:border-[#273e8e]'
                                    }`}
                                >
                                    <div className="relative mb-4 rounded-lg overflow-hidden">
                                        <img
                                            src={getBundleImage(bundle)}
                                            alt={bundle.title || 'Solar Bundle'}
                                            className="w-full h-48 object-cover"
                                            onError={(e) => {
                                                // Prevent infinite loop - only set placeholder if not already set
                                                if (e.target.src && !e.target.src.includes('placeholder-product.png') && !e.target.src.includes('data:image')) {
                                                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f3f4f6" width="400" height="400"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                                                }
                                            }}
                                        />
                                        {discount > 0 && (
                                            <div className="absolute top-2 right-2 bg-[#FFA500] text-white px-3 py-1 rounded-full text-sm font-bold">
                                                -{discount}%
                                            </div>
                                        )}
                                        {isSelected && (
                                            <div className="absolute inset-0 bg-[#273e8e]/20 flex items-center justify-center">
                                                <CheckCircle size={48} className="text-[#273e8e]" />
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 text-gray-800">
                                        {bundle.title || `Bundle #${bundle.id}`}
                                    </h3>
                                    {bundle.bundle_type && (
                                        <p className="text-sm text-gray-500 mb-3">{bundle.bundle_type}</p>
                                    )}
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-[#273e8e]">
                                            {formatPrice(price)}
                                        </span>
                                        {oldPrice && (
                                            <span className="text-gray-400 line-through text-sm">
                                                {formatPrice(oldPrice)}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    const renderStep4 = () => {
        // Determine which step to go back to
        const getBackStep = () => {
            if (formData.optionType === 'choose-system' && formData.selectedBundleId) {
                return 3.5; // Go back to bundle selection
            } else if (formData.optionType) {
                return 3; // Go back to method selection
            } else {
                return 2; // Go back to category selection
            }
        };

        return (
        <div className="animate-fade-in max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <button onClick={() => setStep(getBackStep())} className="mb-6 flex items-center text-gray-500 hover:text-[#273e8e]">
                <ArrowLeft size={16} className="mr-2" /> Back
            </button>
            <h2 className="text-2xl font-bold mb-6 text-[#273e8e]">Checkout Options</h2>

            {/* Installer Choice */}
            <div className="mb-8">
                <h3 className="text-lg font-bold mb-4 text-gray-800">Installation Preference</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => setFormData({ ...formData, installerChoice: 'troosolar' })}
                        className={`p-6 rounded-xl border-2 text-left transition-all ${formData.installerChoice === 'troosolar'
                            ? 'border-[#273e8e] bg-blue-50'
                            : 'border-gray-200 hover:border-blue-200'
                            }`}
                    >
                        <div className="flex items-center mb-2">
                            <CheckCircle size={20} className={formData.installerChoice === 'troosolar' ? 'text-[#273e8e]' : 'text-gray-300'} />
                            <span className="ml-2 font-bold text-gray-800">Use TrooSolar Certified Installer</span>
                        </div>
                        <p className="text-sm text-gray-500 ml-7">Recommended. Includes 1-Year Installation Warranty.</p>
                    </button>

                    <button
                        onClick={() => setFormData({ ...formData, installerChoice: 'own' })}
                        className={`p-6 rounded-xl border-2 text-left transition-all ${formData.installerChoice === 'own'
                            ? 'border-[#273e8e] bg-blue-50'
                            : 'border-gray-200 hover:border-blue-200'
                            }`}
                    >
                        <div className="flex items-center mb-2">
                            <CheckCircle size={20} className={formData.installerChoice === 'own' ? 'text-[#273e8e]' : 'text-gray-300'} />
                            <span className="ml-2 font-bold text-gray-800">Use My Own Installer</span>
                        </div>
                        <p className="text-sm text-gray-500 ml-7">TrooSolar does not guarantee third-party installation.</p>
                    </button>
                </div>
            </div>

            {/* Add-Ons Section */}
            <div className="mb-8">
                <h3 className="text-lg font-bold mb-4 text-gray-800">Additional Services</h3>
                <div className="space-y-3">
                    {/* Insurance Option (always show) */}
                    <label className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.includeInsurance ? 'border-[#273e8e] bg-blue-50' : 'border-gray-200'
                        }`}>
                        <input
                            type="checkbox"
                            className="mt-1 h-5 w-5 text-[#273e8e] focus:ring-[#273e8e] border-gray-300 rounded"
                            checked={formData.includeInsurance}
                            onChange={(e) => setFormData({ ...formData, includeInsurance: e.target.checked })}
                        />
                        <div className="ml-3">
                            <span className="font-bold text-gray-800 flex items-center">
                                <Shield size={18} className="mr-2 text-[#273e8e]" /> Include Insurance
                            </span>
                            <p className="text-sm text-gray-500 mt-1">Protect your investment against damage and theft (0.5% of product price).</p>
                        </div>
                    </label>

                    {/* Other Add-Ons from API */}
                    {addOns.filter(addon => !addon.is_compulsory_buy_now).map((addon) => (
                        <label
                            key={addon.id}
                            className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddOns.includes(addon.id) ? 'border-[#273e8e] bg-blue-50' : 'border-gray-200'
                                }`}
                        >
                            <input
                                type="checkbox"
                                className="mt-1 h-5 w-5 text-[#273e8e] focus:ring-[#273e8e] border-gray-300 rounded"
                                checked={selectedAddOns.includes(addon.id)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedAddOns([...selectedAddOns, addon.id]);
                                    } else {
                                        setSelectedAddOns(selectedAddOns.filter(id => id !== addon.id));
                                    }
                                }}
                            />
                            <div className="ml-3 flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="font-bold text-gray-800">{addon.title}</span>
                                        <p className="text-sm text-gray-500 mt-1">{addon.description}</p>
                                    </div>
                                    <span className="font-bold text-[#273e8e] ml-4">
                                        {addon.calculation_type === 'percentage' 
                                            ? `${addon.calculation_value}%`
                                            : `₦${Number(addon.price || 0).toLocaleString()}`
                                        }
                                    </span>
                                </div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* State and Delivery Location Selection */}
            {states.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-lg font-bold mb-4 text-gray-800">Delivery Location</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                            <select
                                value={formData.stateId || ''}
                                onChange={(e) => {
                                    const stateId = e.target.value ? Number(e.target.value) : null;
                                    setFormData({ ...formData, stateId, deliveryLocationId: null });
                                    setSelectedStateId(stateId);
                                }}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#273e8e] focus:border-[#273e8e]"
                            >
                                <option value="">Select State</option>
                                {states.filter(s => s.is_active).map((state) => (
                                    <option key={state.id} value={state.id}>
                                        {state.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {selectedStateId && deliveryLocations.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Location</label>
                                <select
                                    value={formData.deliveryLocationId || ''}
                                    onChange={(e) => setFormData({ ...formData, deliveryLocationId: e.target.value ? Number(e.target.value) : null })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#273e8e] focus:border-[#273e8e]"
                                >
                                    <option value="">Select Location</option>
                                    {deliveryLocations.filter(loc => loc.is_active).map((location) => (
                                        <option key={location.id} value={location.id}>
                                            {location.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <button
                onClick={handleCheckoutSubmit}
                disabled={!formData.installerChoice || loading}
                className={`w-full py-4 rounded-xl font-bold transition-colors ${formData.installerChoice && !loading
                    ? 'bg-[#273e8e] text-white hover:bg-[#1a2b6b]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
            >
                {loading ? (
                    <span className="flex items-center justify-center">
                        <Loader className="animate-spin mr-2" size={20} />
                        Processing...
                    </span>
                ) : (
                    'Proceed to Invoice'
                )}
            </button>
            {!formData.installerChoice && (
                <p className="text-sm text-red-600 mt-2 text-center">
                    Please select an installation preference to continue
                </p>
            )}
        </div>
        );
    };

    const renderStep7 = () => {
        // Get product details
        const productName = formData.selectedBundle 
            ? formData.selectedBundle.title || 'Solar System Bundle'
            : formData.productCategory === 'full-kit' 
                ? 'Solar Panels, Inverter & Battery'
                : formData.productCategory === 'inverter-battery'
                    ? 'Inverter & Battery Solution'
                    : formData.productCategory === 'battery-only'
                        ? 'Battery Only'
                        : formData.productCategory === 'inverter-only'
                            ? 'Inverter Only'
                            : 'Solar Panels Only';

        return (
            <div className="animate-fade-in max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <button onClick={() => setStep(formData.selectedBundleId ? 3.5 : (formData.optionType ? 3 : 2))} className="mb-6 flex items-center text-gray-500 hover:text-[#273e8e]">
                    <ArrowLeft size={16} className="mr-2" /> Back
                </button>
                <h2 className="text-2xl font-bold mb-6 text-[#273e8e] border-b pb-4">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <div className="bg-gray-100 p-2 rounded-lg mr-4">
                                <Sun size={24} className="text-gray-600" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-800">{productName}</p>
                                <p className="text-sm text-gray-500">
                                    {formData.productCategory === 'full-kit' 
                                        ? 'Complete solar system solution'
                                        : formData.productCategory === 'inverter-battery'
                                            ? 'Inverter and battery backup'
                                            : 'Individual component'}
                                </p>
                            </div>
                        </div>
                        <span className="font-bold">₦{Number(formData.selectedProductPrice || 0).toLocaleString()}</span>
                    </div>

                    {(formData.productCategory === 'full-kit' || formData.productCategory === 'inverter-battery') && (
                        <div className="text-sm text-gray-600 pl-14 space-y-1">
                            <p><strong>Appliances:</strong> Standard household appliances</p>
                            <p><strong>Backup Time:</strong> 8-12 hours (depending on usage)</p>
                            <p><strong>Quantity:</strong> 1 system</p>
                        </div>
                    )}
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                    <p className="text-sm text-blue-700">
                        <strong>Note:</strong> Detailed invoice with all fees will be shown after checkout options.
                    </p>
                </div>

                <button
                    onClick={() => setStep(4)}
                    className="w-full bg-[#273e8e] text-white py-4 rounded-xl font-bold hover:bg-[#1a2b6b] transition-colors"
                >
                    Proceed to Checkout Options
                </button>
            </div>
        );
    };

    const renderStep8 = () => {
        if (!invoiceDetails) {
            return (
                <div className="animate-fade-in max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                    <Loader className="animate-spin mx-auto text-[#273e8e]" size={40} />
                    <p className="text-gray-600 mt-4">Loading order details...</p>
                </div>
            );
        }

        // Get product details
        const productName = formData.selectedBundle 
            ? formData.selectedBundle.title || 'Solar System Bundle'
            : formData.productCategory === 'full-kit' 
                ? 'Solar Panels, Inverter & Battery'
                : formData.productCategory === 'inverter-battery'
                    ? 'Inverter & Battery Solution'
                    : formData.productCategory === 'battery-only'
                        ? 'Battery Only'
                        : formData.productCategory === 'inverter-only'
                            ? 'Inverter Only'
                            : 'Solar Panels Only';

        return (
            <div className="animate-fade-in max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <button onClick={() => setStep(4)} className="mb-6 flex items-center text-gray-500 hover:text-[#273e8e]">
                    <ArrowLeft size={16} className="mr-2" /> Back
                </button>
                <h2 className="text-2xl font-bold mb-6 text-[#273e8e] border-b pb-4">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <div className="bg-gray-100 p-2 rounded-lg mr-4">
                                <Sun size={24} className="text-gray-600" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-800">{productName}</p>
                                <p className="text-sm text-gray-500">
                                    {formData.productCategory === 'full-kit' 
                                        ? 'Complete solar system solution'
                                        : formData.productCategory === 'inverter-battery'
                                            ? 'Inverter and battery backup'
                                            : 'Individual component'}
                                </p>
                            </div>
                        </div>
                        <span className="font-bold">₦{Number(invoiceDetails.product_price || formData.selectedProductPrice || 0).toLocaleString()}</span>
                    </div>

                    {(formData.productCategory === 'full-kit' || formData.productCategory === 'inverter-battery') && (
                        <div className="text-sm text-gray-600 pl-14 space-y-1">
                            <p><strong>Appliances:</strong> Standard household appliances</p>
                            <p><strong>Backup Time:</strong> 8-12 hours (depending on usage)</p>
                            <p><strong>Quantity:</strong> 1 system</p>
                        </div>
                    )}
                </div>

                <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
                    <p className="text-sm text-green-700">
                        <strong>✓ Order confirmed!</strong> Please review the detailed invoice below and proceed to payment.
                    </p>
                </div>

                <button
                    onClick={() => setStep(5)}
                    className="w-full bg-[#273e8e] text-white py-4 rounded-xl font-bold hover:bg-[#1a2b6b] transition-colors"
                >
                    View Detailed Invoice
                </button>
            </div>
        );
    };

    const renderStep5 = () => (
        <div className="animate-fade-in max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-[#273e8e] border-b pb-4">Invoice #{orderId}</h2>
            {invoiceDetails && (
                <div className="space-y-4 mb-8">
                    <div className="border-b pb-4 mb-4">
                        <h3 className="font-bold text-gray-800 mb-3">Invoice Details</h3>
                    </div>
                    
                    {/* Solar Inverter */}
                    {(formData.productCategory === 'full-kit' || formData.productCategory === 'inverter-battery' || formData.productCategory === 'inverter-only') && (
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-medium text-gray-800">Solar Inverter</p>
                                <p className="text-sm text-gray-500">Quantity: 1</p>
                            </div>
                            <span className="font-bold">₦{Number((invoiceDetails.product_price || 0) * 0.4).toLocaleString()}</span>
                        </div>
                    )}
                    
                    {/* Solar Panels */}
                    {(formData.productCategory === 'full-kit' || formData.productCategory === 'panels-only') && (
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-medium text-gray-800">Solar Panels</p>
                                <p className="text-sm text-gray-500">Quantity: 1</p>
                            </div>
                            <span className="font-bold">₦{Number((invoiceDetails.product_price || 0) * 0.35).toLocaleString()}</span>
                        </div>
                    )}
                    
                    {/* Batteries */}
                    {(formData.productCategory === 'full-kit' || formData.productCategory === 'inverter-battery' || formData.productCategory === 'battery-only') && (
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-medium text-gray-800">Batteries</p>
                                <p className="text-sm text-gray-500">Quantity: 1</p>
                            </div>
                            <span className="font-bold">₦{Number((invoiceDetails.product_price || 0) * 0.25).toLocaleString()}</span>
                        </div>
                    )}
                    
                    {/* Material Cost - only if installation is selected */}
                    {invoiceDetails.material_cost > 0 && (
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Material Cost (Cables, Breakers, Surge Protectors, Trunking, and Pipes)</span>
                            <span>₦{Number(invoiceDetails.material_cost || 0).toLocaleString()}</span>
                        </div>
                    )}
                    
                    {/* Installation Fee - only if TrooSolar installer is selected */}
                    {invoiceDetails.installation_fee > 0 && (
                        <div className="flex justify-between">
                            <span>Installation Fees</span>
                            <span>₦{Number(invoiceDetails.installation_fee || 0).toLocaleString()}</span>
                        </div>
                    )}
                    
                    {/* Delivery/Logistics */}
                    <div className="flex justify-between">
                        <span>Delivery/Logistics Fees</span>
                        <span>₦{Number(invoiceDetails.delivery_fee || 0).toLocaleString()}</span>
                    </div>
                    
                    {/* Inspection Fee - optional */}
                    {invoiceDetails.inspection_fee > 0 && (
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Inspection Fees (Optional)</span>
                            <span>₦{Number(invoiceDetails.inspection_fee || 0).toLocaleString()}</span>
                        </div>
                    )}
                    
                    {/* Insurance Fee - optional */}
                    {invoiceDetails.insurance_fee > 0 && (
                        <div className="flex justify-between">
                            <span>Insurance Fee (Optional)</span>
                            <span>₦{Number(invoiceDetails.insurance_fee || 0).toLocaleString()}</span>
                        </div>
                    )}
                    
                    <div className="border-t pt-4 font-bold text-xl flex justify-between">
                        <span>Total</span>
                        <span className="text-[#273e8e]">₦{Number(invoiceDetails.total || 0).toLocaleString()}</span>
                    </div>
                </div>
            )}
            
            {/* Calendar Slots Section */}
            {calendarSlots.length > 0 && (
                <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-bold text-[#273e8e] mb-3 flex items-center">
                        <Calendar size={20} className="mr-2" />
                        Available Installation Dates
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                        Installation slots are available starting 72 hours after payment confirmation. Select your preferred date:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                        {calendarSlots.slice(0, 9).map((slot, idx) => (
                            <button
                                key={idx}
                                disabled={!slot.available}
                                onClick={() => slot.available && setSelectedSlot(slot)}
                                className={`p-2 rounded-lg text-sm border transition-colors ${
                                    selectedSlot?.date === slot.date && selectedSlot?.time === slot.time
                                        ? 'border-[#273e8e] bg-[#273e8e] text-white'
                                        : slot.available
                                        ? 'border-blue-300 hover:bg-blue-100 text-gray-800'
                                        : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                <div className="font-medium">{new Date(slot.date).toLocaleDateString('en-NG', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                                <div className="text-xs">{slot.time}</div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Installation fee note - only show if TrooSolar installer is selected */}
            {formData.installerChoice === 'troosolar' && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6 flex items-start">
                    <AlertCircle className="text-yellow-600 mr-3 mt-1" size={20} />
                    <p className="text-sm text-yellow-700">
                        Installation fees may change after site inspection. Any difference will be updated and shared with you for a one-off payment before installation.
                    </p>
                </div>
            )}
            
            <button 
                onClick={handleProceedToPayment}
                disabled={processingPayment}
                className={`w-full py-4 rounded-xl font-bold transition-colors flex items-center justify-center ${
                    processingPayment
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-[#273e8e] text-white hover:bg-[#1a2b6b]'
                }`}
            >
                {processingPayment ? (
                    <>
                        <Loader className="animate-spin mr-2" size={20} />
                        Processing Payment...
                    </>
                ) : (
                    'Proceed to Payment'
                )}
            </button>
        </div>
    );

    const renderStep6 = () => (
        <div className="animate-fade-in max-w-3xl mx-auto text-center">
            {paymentResult === 'success' ? (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-green-200">
                    <CheckCircle2 size={64} className="text-green-600 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold mb-4 text-green-700">Payment Successful!</h2>
                    <p className="text-gray-600 mb-6">
                        Your order has been confirmed. Order ID: <span className="font-bold text-[#273e8e]">#{orderId}</span>
                    </p>
                    {selectedSlot && (
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                            <p className="text-sm text-blue-700">
                                <Calendar size={16} className="inline mr-2" />
                                Installation scheduled for: <span className="font-bold">
                                    {new Date(selectedSlot.date).toLocaleDateString('en-NG', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedSlot.time}
                                </span>
                            </p>
                        </div>
                    )}
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate(`/order/details/${orderId}`)}
                            className="w-full bg-[#273e8e] text-white py-3 rounded-xl font-bold hover:bg-[#1a2b6b] transition-colors"
                        >
                            View Order Details
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-200">
                    <XCircle size={64} className="text-red-600 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold mb-4 text-red-700">Payment Failed</h2>
                    <p className="text-gray-600 mb-6">
                        Your payment could not be processed. Please try again.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={handleProceedToPayment}
                            className="w-full bg-[#273e8e] text-white py-3 rounded-xl font-bold hover:bg-[#1a2b6b] transition-colors"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => setStep(5)}
                            className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                        >
                            Back to Invoice
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navbar Placeholder */}
            <div className="bg-white shadow-sm p-4 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="font-bold text-xl text-[#273e8e]">TrooSolar</div>
                    <button onClick={() => navigate('/')} className="text-gray-600 hover:text-[#273e8e]">
                        Exit Application
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow flex items-center justify-center p-6">
                <div className="w-full max-w-6xl">
                    {/* Progress Bar */}
                    <div className="mb-12 max-w-xl mx-auto">
                        <div className="flex justify-between text-sm font-medium text-gray-400 mb-2">
                            <span className={step >= 1 ? "text-[#273e8e]" : ""}>Type</span>
                            <span className={step >= 2 ? "text-[#273e8e]" : ""}>Product</span>
                            <span className={step >= 3 ? "text-[#273e8e]" : ""}>Option</span>
                            <span className={step >= 7 ? "text-[#273e8e]" : ""}>Summary</span>
                            <span className={step >= 4 ? "text-[#273e8e]" : ""}>Checkout</span>
                            <span className={step >= 5 ? "text-[#273e8e]" : ""}>Payment</span>
                            <span className={step >= 6 ? "text-[#273e8e]" : ""}>Complete</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#273e8e] transition-all duration-500 ease-out"
                                style={{ width: `${Math.min((step / 8) * 100, 100)}%` }}
                            />
                        </div>
                    </div>

                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 2.5 && renderStep2_5()}
                    {step === 3 && renderStep3()}
                    {step === 3.5 && renderStep3_5()}
                    {step === 4 && renderStep4()}
                    {step === 7 && renderStep7()}
                    {step === 8 && renderStep8()}
                    {step === 5 && renderStep5()}
                    {step === 6 && renderStep6()}
                </div>
            </div>
        </div>
    );
};

export default BuyNowFlow;
