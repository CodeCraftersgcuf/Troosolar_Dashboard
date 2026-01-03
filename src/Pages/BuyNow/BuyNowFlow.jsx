import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Home, Building2, Factory, ArrowRight, ArrowLeft, Zap, Wrench, FileText, CheckCircle, Battery, Sun, Monitor, Shield, Calendar, Loader, CheckCircle2, XCircle, AlertCircle, CreditCard, Minus, Plus } from 'lucide-react';
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
    const [auditTypes, setAuditTypes] = useState([]);
    const [deliveryLocations, setDeliveryLocations] = useState([]);
    const [selectedStateId, setSelectedStateId] = useState(null);
    const [selectedAddOns, setSelectedAddOns] = useState([]);
    const [configLoading, setConfigLoading] = useState(false);
    const [auditRequestId, setAuditRequestId] = useState(null);
    const [auditRequests, setAuditRequests] = useState([]);
    const [auditRequestStatus, setAuditRequestStatus] = useState(null);
    
    // Custom order flow (from admin-created cart)
    const [searchParams] = useSearchParams();
    const [cartToken, setCartToken] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [cartOrderType, setCartOrderType] = useState(null);
    const [cartLoading, setCartLoading] = useState(false);
    const [cartError, setCartError] = useState(null);

    const [formData, setFormData] = useState({
        customerType: '',
        productCategory: '', // 'full-kit', 'inverter-battery', 'battery-only', 'inverter-only', 'panels-only'
        optionType: '', // 'choose-system', 'build-system', 'audit'
        auditType: '', // 'home-office', 'commercial'
        selectedProductPrice: 0,
        selectedBundleId: null,
        selectedBundle: null,
        selectedProductId: null,
        selectedProduct: null,
        selectedBundles: [], // Array of selected bundles [{id, bundle, price}, ...]
        selectedProducts: [], // Array of selected products [{id, product, price}, ...]
        singleItemQuantity: 1, // Quantity for single item (fallback case)
        installerChoice: '', // 'troosolar', 'own'
        includeInsurance: false,
        address: '',
        state: '',
        stateId: null,
        deliveryLocationId: null,
        houseNo: '',
        landmark: '',
        floors: '',
        rooms: '',
        isGatedEstate: false,
        estateName: '',
        estateAddress: '',
        streetName: '', // Street name for property address
    });

    // Bundles for selection
    const [bundles, setBundles] = useState([]);
    const [bundlesLoading, setBundlesLoading] = useState(false);

    // Categories and products for individual components
    const [categories, setCategories] = useState([]);
    const [categoryProducts, setCategoryProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);

    // Check for custom order flow (cart token) on mount
    React.useEffect(() => {
        const token = searchParams.get('token');
        const type = searchParams.get('type');
        
        if (token && (type === 'buy_now' || type === 'bnpl')) {
            setCartToken(token);
            setCartOrderType(type);
            verifyCartAccess(token);
        }
    }, [searchParams]);

    // Verify cart access and load cart items
    const verifyCartAccess = async (token) => {
        setCartLoading(true);
        setCartError(null);
        try {
            const userToken = localStorage.getItem('access_token');
            const response = await axios.get(API.CART_ACCESS(token), {
                headers: {
                    Accept: 'application/json',
                    ...(userToken ? { Authorization: `Bearer ${userToken}` } : {}),
                },
            });

            if (response.data.status === 'success') {
                const cartData = response.data.data;
                
                // Check if login is required
                if (cartData.requires_login) {
                    const returnUrl = `/buy-now?token=${token}&type=${cartOrderType || 'buy_now'}`;
                    alert('Please login to access your cart');
                    navigate(`/login?return=${encodeURIComponent(returnUrl)}`);
                    return;
                }

                // Store cart items
                setCartItems(cartData.cart_items || []);
                
                // Pre-populate form with cart items if available
                if (cartData.cart_items && cartData.cart_items.length > 0) {
                    const products = [];
                    const bundles = [];
                    
                    cartData.cart_items.forEach(item => {
                        if (item.itemable_type === 'App\\Models\\Product' && item.itemable) {
                            products.push({
                                id: item.itemable_id,
                                product: item.itemable,
                                price: Number(item.unit_price || item.itemable.discount_price || item.itemable.price || 0),
                                quantity: Number(item.quantity || 1)
                            });
                        } else if (item.itemable_type === 'App\\Models\\Bundle' && item.itemable) {
                            bundles.push({
                                id: item.itemable_id,
                                bundle: item.itemable,
                                price: Number(item.unit_price || item.itemable.discount_price || item.itemable.total_price || 0),
                                quantity: Number(item.quantity || 1)
                            });
                        }
                    });
                    
                    if (products.length > 0 || bundles.length > 0) {
                        const totalPrice = [...products, ...bundles].reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
                        setFormData(prev => ({
                            ...prev,
                            selectedProducts: products,
                            selectedBundles: bundles,
                            selectedProductPrice: totalPrice
                        }));
                    }
                }
            } else {
                setCartError(response.data.message || 'Failed to access cart');
            }
        } catch (error) {
            console.error('Cart access error:', error);
            setCartError(error.response?.data?.message || 'Invalid or expired cart link');
        } finally {
            setCartLoading(false);
        }
    };

    // Handle bundleId and editBundle parameters
    React.useEffect(() => {
        const bundleId = searchParams.get('bundleId');
        const editBundle = searchParams.get('editBundle');
        const stepParam = searchParams.get('step');
        
        if (bundleId && editBundle === 'true') {
            // Load bundle and its products for editing
            const loadBundleForEditing = async () => {
                try {
                    const token = localStorage.getItem('access_token');
                    const response = await axios.get(API.BUNDLE_BY_ID(bundleId), {
                        headers: {
                            Accept: 'application/json',
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                    });
                    
                    const bundleData = response.data?.data ?? response.data;
                    if (bundleData) {
                        // Extract products from bundle
                        const bundleItems = bundleData.bundleItems ?? bundleData.bundle_items ?? [];
                        const products = bundleItems
                            .filter(item => item?.product)
                            .map(item => ({
                                id: item.product.id,
                                product: item.product,
                                price: Number(item.product.discount_price || item.product.price || 0),
                                quantity: Number(item.quantity || 1)
                            }));
                        
                        if (products.length > 0) {
                            const totalPrice = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
                            setFormData(prev => ({
                                ...prev,
                                selectedProducts: products,
                                selectedBundleId: Number(bundleId),
                                selectedBundle: bundleData,
                                selectedProductPrice: totalPrice
                            }));
                        }
                        
                        // Navigate to step if provided, otherwise go to category selection
                        if (stepParam) {
                            setStep(Number(stepParam));
                        } else {
                            setStep(2); // Category selection
                        }
                    }
                } catch (error) {
                    console.error('Failed to load bundle for editing:', error);
                    alert('Failed to load bundle details. Please try again.');
                }
            };
            
            loadBundleForEditing();
        } else if (stepParam) {
            // Just navigate to the specified step if provided
            setStep(Number(stepParam));
        }
    }, [searchParams]);

    // Fetch categories and audit types on mount
    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const [categoriesRes, auditRes] = await Promise.all([
                    axios.get(API.CATEGORIES, {
                        headers: {
                            Accept: 'application/json',
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                    }).catch(() => ({ data: { status: 'error' }, status: 404 })),
                    axios.get(API.CONFIG_AUDIT_TYPES).catch(() => ({ data: { status: 'error' }, status: 404 }))
                ]);
                
                const catList = Array.isArray(categoriesRes.data?.data) ? categoriesRes.data.data : [];
                setCategories(catList);
                
                if (auditRes.status !== 404 && auditRes.data?.status === 'success') {
                    setAuditTypes(auditRes.data.data);
                } else {
                    // Fallback to defaults
                    setAuditTypes([
                        { id: 'home-office', label: 'Home / Office' },
                        { id: 'commercial', label: 'Commercial / Industrial' }
                    ]);
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
            }
        };
        fetchData();
    }, []);

    // Map predefined category groups to API category IDs (same as BNPL)
    const getCategoryIdsForGroup = (groupType) => {
        const categoryIds = {
            'full-kit': [], // Solar panels, inverter, and battery solution
            'inverter-battery': [], // Inverter and battery solution
            'battery-only': [], // Battery only
            'inverter-only': [], // Inverter only
            'panels-only': [], // Solar panels only
        };

        // Find matching categories from API
        categories.forEach(cat => {
            const name = (cat.title || cat.name || '').toLowerCase();
            
            // Full kit: Solar, Inverters, Batteries
            if (groupType === 'full-kit') {
                if (name.includes('solar') || name.includes('panel') || 
                    name.includes('inverter') || name.includes('battery') || name.includes('battries')) {
                    categoryIds['full-kit'].push(cat.id);
                }
            }
            // Inverter & Battery: Inverters, Batteries
            else if (groupType === 'inverter-battery') {
                if (name.includes('inverter') || name.includes('battery') || name.includes('battries')) {
                    categoryIds['inverter-battery'].push(cat.id);
                }
            }
            // Battery only
            else if (groupType === 'battery-only') {
                if (name.includes('battery') || name.includes('battries')) {
                    categoryIds['battery-only'].push(cat.id);
                }
            }
            // Inverter only
            else if (groupType === 'inverter-only') {
                if (name.includes('inverter')) {
                    categoryIds['inverter-only'].push(cat.id);
                }
            }
            // Panels only
            else if (groupType === 'panels-only') {
                if (name.includes('solar') || name.includes('panel')) {
                    categoryIds['panels-only'].push(cat.id);
                }
            }
        });

        return categoryIds[groupType] || [];
    };

    // Map product category string to category name/id (OLD - COMMENTED OUT BUT KEPT FOR REFERENCE)
    // const getCategoryIdFromProductCategory = (productCategory) => {
    //     const categoryMap = {
    //         'battery-only': ['battery', 'batteries'],
    //         'inverter-only': ['inverter', 'inverters'],
    //         'panels-only': ['solar panel', 'panels', 'solar panels'],
    //     };
    //     
    //     const searchTerms = categoryMap[productCategory] || [];
    //     if (searchTerms.length === 0) return null;
    //     
    //     // Find category by matching name (case-insensitive)
    //     const found = categories.find(cat => {
    //         const name = (cat.name || cat.title || '').toLowerCase();
    //         return searchTerms.some(term => name.includes(term));
    //     });
    //     
    //     return found?.id || null;
    // };

    // --- Handlers ---

    const handleCustomerTypeSelect = (type) => {
        setFormData({ ...formData, customerType: type });
        setStep(2); // Go to Solar Solution Selection (5 options)
    };

    // NEW: Handle solar solution group selection (5 predefined options)
    const handleCategorySelect = async (groupType) => {
        // groupType can be: 'full-kit', 'inverter-battery', 'battery-only', 'inverter-only', 'panels-only'
        setFormData({ ...formData, productCategory: groupType });

        // For full-kit and inverter-battery, go to Action Selection (Step 3)
        if (groupType === 'full-kit' || groupType === 'inverter-battery') {
            setStep(3); // Action Selection (Choose/Build/Audit)
        } else {
            // For individual components (battery-only, inverter-only, panels-only), fetch products
            const categoryIds = getCategoryIdsForGroup(groupType);
            
            if (categoryIds.length === 0) {
                alert("No matching categories found. Please try again.");
                return;
            }

            // If only one category matches, use it directly
            // If multiple categories match, we'll fetch products from all of them
            setSelectedCategoryId(categoryIds[0]); // Store first category ID for reference
            
            // Clear previous products and set loading state BEFORE navigating
            setCategoryProducts([]);
            setProductsLoading(true);
            setStep(2.5); // Navigate to Product Selection step first to show loading
            
            try {
                const token = localStorage.getItem('access_token');
                let allProducts = [];
                
                // Fetch products from all matching categories
                for (const categoryId of categoryIds) {
                    try {
                        const response = await axios.get(API.CATEGORY_PRODUCTS(categoryId), {
                            headers: {
                                Accept: 'application/json',
                                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                            },
                        });
                        const root = response.data?.data ?? response.data;
                        const products = Array.isArray(root) ? root : Array.isArray(root?.data) ? root.data : [];
                        allProducts = [...allProducts, ...products];
                    } catch (err) {
                        console.warn(`Failed to fetch products for category ${categoryId}:`, err);
                    }
                }
                
                // If no products found via category endpoint, try fetching all and filtering
                if (allProducts.length === 0) {
                    try {
                        const allProductsRes = await axios.get(API.PRODUCTS, {
                            headers: {
                                Accept: 'application/json',
                                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                            },
                        });
                        const allProductsList = Array.isArray(allProductsRes.data?.data) ? allProductsRes.data.data : [];
                        allProducts = allProductsList.filter(p => categoryIds.includes(Number(p.category_id)));
                    } catch (error) {
                        console.error("Failed to fetch all products:", error);
                    }
                }
                
                setCategoryProducts(allProducts);
            } catch (error) {
                console.error("Failed to fetch products:", error);
                alert("Failed to load products. Please try again.");
                setCategoryProducts([]); // Ensure empty array on error
            } finally {
                setProductsLoading(false);
            }
        }
    };

    // OLD: Handle API category selection (for "Build my solar system" path)
    // const handleCategorySelect = async (categoryId) => {
    //     // categoryId is now the actual category ID from the API
    //     const selectedCategory = categories.find(cat => cat.id === categoryId);
    //     if (!selectedCategory) {
    //         alert("Category not found. Please try again.");
    //         return;
    //     }

    //     setFormData({ ...formData, productCategory: selectedCategory.title || selectedCategory.name });
    //     setSelectedCategoryId(categoryId);
    //     
    //     // Clear previous products and set loading state BEFORE navigating
    //     setCategoryProducts([]);
    //     setProductsLoading(true);
    //     setStep(2.5); // Navigate to Product Selection step first to show loading
    //     
    //     try {
    //         const token = localStorage.getItem('access_token');
    //         // Try to fetch products by category
    //         let products = [];
    //         try {
    //             const response = await axios.get(API.CATEGORY_PRODUCTS(categoryId), {
    //                 headers: {
    //                     Accept: 'application/json',
    //                     ...(token ? { Authorization: `Bearer ${token}` } : {}),
    //                 },
    //             });
    //             const root = response.data?.data ?? response.data;
    //             products = Array.isArray(root) ? root : Array.isArray(root?.data) ? root.data : [];
    //         } catch (err) {
    //             // Fallback: fetch all products and filter by category
    //             const allProductsRes = await axios.get(API.PRODUCTS, {
    //                 headers: {
    //                     Accept: 'application/json',
    //                     ...(token ? { Authorization: `Bearer ${token}` } : {}),
    //                 },
    //             });
    //             const allProducts = Array.isArray(allProductsRes.data?.data) ? allProductsRes.data.data : [];
    //             products = allProducts.filter(p => String(p.category_id) === String(categoryId));
    //         }
    //         setCategoryProducts(products);
    //     } catch (error) {
    //         console.error("Failed to fetch products:", error);
    //         alert("Failed to load products. Please try again.");
    //         setCategoryProducts([]); // Ensure empty array on error
    //     } finally {
    //         setProductsLoading(false);
    //     }
    // };

    // NEW: Handle API category selection for "Build my solar system" path
    const handleBuildSystemCategorySelect = async (categoryId) => {
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

    // Audit handlers (same as BNPL)
    const handleAuditTypeSelect = async (type) => {
        setFormData({ ...formData, auditType: type });
        if (type === 'commercial') {
            // Submit commercial audit request immediately
            await submitCommercialAuditRequest();
        } else {
            setStep(5); // Home/Office Details Form
        }
    };

    const submitCommercialAuditRequest = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                alert("Please login to continue");
                navigate('/login');
                return;
            }

            // Submit commercial audit request (all fields optional for commercial)
            const auditRequestPayload = {
                audit_type: 'commercial',
                customer_type: formData.customerType || 'commercial',
                // All property fields are optional for commercial audits
                property_state: null,
                property_address: null,
            };

            // Add cart token if this is a custom order flow
            const cartToken = searchParams.get('cart_token');
            if (cartToken) {
                auditRequestPayload.cart_token = cartToken;
            }

            const auditRequestResponse = await axios.post(API.AUDIT_REQUEST, auditRequestPayload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                }
            });

            if (auditRequestResponse.data.status === 'success') {
                const newAuditRequestId = auditRequestResponse.data.data.id;
                setAuditRequestId(newAuditRequestId);
                setFormData(prev => ({ ...prev, auditRequestId: newAuditRequestId }));
                
                // Fetch audit requests to check status
                await fetchAuditRequests();
                
                // Navigate to commercial notification
                setStep(6);
            } else {
                alert("Failed to submit commercial audit request. Please try again.");
            }
        } catch (error) {
            console.error("Commercial audit request submission error:", error);
            const errorMessage = error.response?.data?.message || 
                                (error.response?.data?.errors ? JSON.stringify(error.response.data.errors) : null) ||
                                "Failed to submit commercial audit request. Please try again.";
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const fetchAuditRequests = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            const response = await axios.get(API.AUDIT_REQUESTS, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json'
                }
            });

            if (response.data.status === 'success') {
                const requests = Array.isArray(response.data.data) ? response.data.data : [];
                setAuditRequests(requests);
                
                // Find the current audit request and set its status
                if (auditRequestId) {
                    const currentRequest = requests.find(req => req.id === auditRequestId);
                    if (currentRequest) {
                        setAuditRequestStatus(currentRequest.status || currentRequest.audit_status);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching audit requests:", error);
        }
    };

    const handleAuditAddressSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                alert("Please login to continue");
                navigate('/login');
                return;
            }

            // Submit audit request before proceeding
            // Build full address from components
            const fullAddress = [
                formData.houseNo,
                formData.streetName,
                formData.landmark
            ].filter(Boolean).join(', ');
            
            const auditRequestPayload = {
                audit_type: formData.auditType,
                customer_type: formData.customerType,
                property_state: formData.state,
                property_address: fullAddress || formData.address, // Use full address or fallback to address field
                property_landmark: formData.landmark || '',
                property_floors: formData.floors ? Number(formData.floors) : null,
                property_rooms: formData.rooms ? Number(formData.rooms) : null,
                is_gated_estate: formData.isGatedEstate,
            };

            // Add estate fields if gated estate
            if (formData.isGatedEstate) {
                auditRequestPayload.estate_name = formData.estateName;
                auditRequestPayload.estate_address = formData.estateAddress;
            }

            // Add cart token if this is a custom order flow
            if (cartToken) {
                auditRequestPayload.cart_token = cartToken;
            }

            const auditRequestResponse = await axios.post(API.AUDIT_REQUEST, auditRequestPayload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                }
            });

            if (auditRequestResponse.data.status === 'success') {
                const auditRequestId = auditRequestResponse.data.data.id;
                setAuditRequestId(auditRequestId);
                setFormData(prev => ({ ...prev, auditRequestId }));
                
                // For commercial audits, show notification and wait for admin approval
                if (formData.auditType === 'commercial') {
                    setStep(6); // Commercial Notification
                } else {
                    // For home-office audits, proceed to checkout to get invoice
                    // Call checkout API to get invoice details
                    try {
                        const checkoutPayload = {
                            customer_type: formData.customerType,
                            product_category: 'audit',
                            audit_request_id: auditRequestId,
                            amount: 0 // Will be calculated by backend
                        };

                        // Add cart token if this is a custom order flow
                        if (cartToken) {
                            checkoutPayload.cart_token = cartToken;
                        }

                        const checkoutResponse = await axios.post(API.BUY_NOW_CHECKOUT, checkoutPayload, {
                            headers: { 
                                Authorization: `Bearer ${token}`,
                                'Content-Type': 'application/json',
                                Accept: 'application/json'
                            }
                        });

                        if (checkoutResponse.data.status === 'success') {
                            setInvoiceDetails(checkoutResponse.data.data);
                            setOrderId(checkoutResponse.data.data.order_id);
                            setStep(8); // Go to Order Summary with details, then invoice
                        } else {
                            // If checkout fails, still show order summary
                            setStep(7); // Order Summary (for audit) before invoice
                        }
                    } catch (checkoutError) {
                        console.error("Checkout Error for audit:", checkoutError);
                        // If checkout fails, still show order summary
                        setStep(7); // Order Summary (for audit) before invoice
                    }
                }
            } else {
                alert("Failed to submit audit request. Please try again.");
            }
        } catch (error) {
            console.error("Audit request submission error:", error);
            const errorMessage = error.response?.data?.message || 
                                (error.response?.data?.errors ? JSON.stringify(error.response.data.errors) : null) ||
                                "Failed to submit audit request. Please check all required fields.";
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = async (option) => {
        setFormData(prev => ({ ...prev, optionType: option }));
        if (option === 'choose-system') {
            // Clear previous bundles and set loading state BEFORE navigating
            setBundles([]);
            setBundlesLoading(true);
            setStep(3.5); // Navigate to Bundle Selection step first to show loading
            
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
                alert("Failed to load bundles. Please try again.");
                setBundles([]); // Ensure empty array on error
            } finally {
                setBundlesLoading(false);
            }
        } else if (option === 'build-system') {
            // Fetch all products for building a custom system
            setCategoryProducts([]);
            setProductsLoading(true);
            setStep(3.75); // Navigate to Build System Product Selection step
            
            try {
                const token = localStorage.getItem('access_token');
                let allProducts = [];
                
                // Fetch products from all categories
                if (categories.length > 0) {
                    for (const category of categories) {
                        try {
                            const response = await axios.get(API.CATEGORY_PRODUCTS(category.id), {
                                headers: {
                                    Accept: 'application/json',
                                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                                },
                            });
                            const root = response.data?.data ?? response.data;
                            const products = Array.isArray(root) ? root : Array.isArray(root?.data) ? root.data : [];
                            allProducts = [...allProducts, ...products];
                        } catch (err) {
                            console.warn(`Failed to fetch products for category ${category.id}:`, err);
                        }
                    }
                }
                
                // If no products found via category endpoint, try fetching all products
                if (allProducts.length === 0) {
                    try {
                        const allProductsRes = await axios.get(API.PRODUCTS, {
                            headers: {
                                Accept: 'application/json',
                                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                            },
                        });
                        const allProductsList = Array.isArray(allProductsRes.data?.data) ? allProductsRes.data.data : [];
                        allProducts = allProductsList;
                    } catch (error) {
                        console.error("Failed to fetch all products:", error);
                    }
                }
                
                setCategoryProducts(allProducts);
            } catch (error) {
                console.error("Failed to fetch products:", error);
                alert("Failed to load products. Please try again.");
                setCategoryProducts([]);
            } finally {
                setProductsLoading(false);
            }
        } else if (option === 'audit') {
            // Go to Audit Type Selection (same as BNPL)
            setStep(4); // Audit Type Selection
        }
    };

    const handleBundleSelect = (bundle) => {
        const price = Number(bundle.discount_price || bundle.total_price || 0);
        setFormData(prev => ({
            ...prev,
            selectedBundleId: bundle.id,
            selectedBundle: bundle,
            selectedProductPrice: price, // Store unit price
            singleItemQuantity: 1 // Reset quantity to 1 when selecting new bundle
        }));
        setStep(7); // Go to Order Summary (NEW STEP)
    };

    const handleProductSelect = (product) => {
        const price = Number(product.discount_price || product.price || 0);
        setFormData(prev => {
            // Check if product is already selected
            const isSelected = prev.selectedProducts.some(p => p.id === product.id);
            
            let updatedProducts;
            if (isSelected) {
                // Remove product if already selected
                updatedProducts = prev.selectedProducts.filter(p => p.id !== product.id);
            } else {
                // Add product if not selected
                updatedProducts = [...prev.selectedProducts, {
                    id: product.id,
                    product: product,
                    price: price,
                    quantity: 1
                }];
            }
            
            // Calculate total price from all selected bundles and products (accounting for quantity)
            const bundlesTotal = prev.selectedBundles.reduce((sum, b) => sum + (b.price * (b.quantity || 1)), 0);
            const productsTotal = updatedProducts.reduce((sum, p) => sum + (p.price * (p.quantity || 1)), 0);
            const totalPrice = bundlesTotal + productsTotal;
            
            return {
                ...prev,
                selectedProducts: updatedProducts,
                // Keep old fields for backward compatibility (use first selected if any)
                selectedProductId: updatedProducts.length > 0 ? updatedProducts[0].id : null,
                selectedProduct: updatedProducts.length > 0 ? updatedProducts[0].product : null,
                selectedProductPrice: totalPrice
            };
        });
        // Don't auto-navigate - let user select multiple items
    };

    // Update bundle quantity
    const updateBundleQuantity = (bundleId, newQuantity) => {
        if (newQuantity < 1) return; // Don't allow quantity less than 1
        
        setFormData(prev => {
            const updatedBundles = prev.selectedBundles.map(b => 
                b.id === bundleId ? { ...b, quantity: newQuantity } : b
            );
            
            // Calculate total price from all selected bundles and products (accounting for quantity)
            const bundlesTotal = updatedBundles.reduce((sum, b) => sum + (b.price * (b.quantity || 1)), 0);
            const productsTotal = prev.selectedProducts.reduce((sum, p) => sum + (p.price * (p.quantity || 1)), 0);
            const totalPrice = bundlesTotal + productsTotal;
            
            return {
                ...prev,
                selectedBundles: updatedBundles,
                selectedProductPrice: totalPrice
            };
        });
    };

    // Update product quantity
    const updateProductQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) return; // Don't allow quantity less than 1
        
        setFormData(prev => {
            const updatedProducts = prev.selectedProducts.map(p => 
                p.id === productId ? { ...p, quantity: newQuantity } : p
            );
            
            // Calculate total price from all selected bundles and products (accounting for quantity)
            const bundlesTotal = prev.selectedBundles.reduce((sum, b) => sum + (b.price * (b.quantity || 1)), 0);
            const productsTotal = updatedProducts.reduce((sum, p) => sum + (p.price * (p.quantity || 1)), 0);
            const totalPrice = bundlesTotal + productsTotal;
            
            return {
                ...prev,
                selectedProducts: updatedProducts,
                selectedProductPrice: totalPrice
            };
        });
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

    useEffect(() => {
        if (step === 5) {
            fetchCalendarSlots();
        }
    }, [step]);

    // Fetch bundles when step 3.5 is reached (only once)
    // Fetch audit requests when on step 6 (commercial audit notification)
    useEffect(() => {
        if (step === 6 && formData.optionType === 'audit' && formData.auditType === 'commercial' && auditRequestId) {
            fetchAuditRequests();
            // Poll for status updates every 30 seconds
            const interval = setInterval(() => {
                fetchAuditRequests();
            }, 30000);
            return () => clearInterval(interval);
        }
    }, [step, auditRequestId, formData.optionType, formData.auditType]);

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
            {/* Buy Now Badge */}
            <div className="flex justify-center mb-6">
                <span className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-bold bg-gradient-to-r from-[#E8A91D] to-[#d4991a] text-white shadow-lg">
                    <CreditCard size={16} className="mr-2" />
                    Buy Now
                </span>
            </div>
            <h2 className="text-3xl font-bold text-center mb-10 text-[#273e8e]">
                Who are you purchasing for?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                <button onClick={() => handleCustomerTypeSelect('residential')} className="group bg-white border-2 border-gray-200 hover:border-[#273e8e] rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden transform hover:-translate-y-1">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#273e8e] to-[#E8A91D]"></div>
                    <div className="bg-gradient-to-br from-[#273e8e]/10 to-[#E8A91D]/10 p-6 rounded-full mb-6 group-hover:from-[#273e8e]/20 group-hover:to-[#E8A91D]/20 transition-all duration-300">
                        <Home size={40} className="text-[#273e8e] group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-[#273e8e] transition-colors">For Residential</h3>
                </button>
                <button onClick={() => handleCustomerTypeSelect('sme')} className="group bg-white border-2 border-gray-200 hover:border-[#273e8e] rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden transform hover:-translate-y-1">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#273e8e] to-[#E8A91D]"></div>
                    <div className="bg-gradient-to-br from-[#273e8e]/10 to-[#E8A91D]/10 p-6 rounded-full mb-6 group-hover:from-[#273e8e]/20 group-hover:to-[#E8A91D]/20 transition-all duration-300">
                        <Building2 size={40} className="text-[#273e8e] group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-[#273e8e] transition-colors">For SMEs</h3>
                </button>
                <button onClick={() => handleCustomerTypeSelect('commercial')} className="group bg-white border-2 border-gray-200 hover:border-[#273e8e] rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden transform hover:-translate-y-1">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#273e8e] to-[#E8A91D]"></div>
                    <div className="bg-gradient-to-br from-[#273e8e]/10 to-[#E8A91D]/10 p-6 rounded-full mb-6 group-hover:from-[#273e8e]/20 group-hover:to-[#E8A91D]/20 transition-all duration-300">
                        <Factory size={40} className="text-[#273e8e] group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-[#273e8e] transition-colors">Commercial & Industrial</h3>
                </button>
            </div>
        </div>
    );

    // NEW: Render Step 2 - Solar Solution Selection (5 predefined options, same as BNPL)
    const renderStep2 = () => {
        // Predefined category groups that map to API categories
        const categoryGroups = [
            {
                id: 'full-kit',
                name: 'Solar panels, inverter, and battery solution',
                icon: Sun,
                description: 'Complete solar system solution'
            },
            {
                id: 'inverter-battery',
                name: 'Inverter and battery solution',
                icon: Zap,
                description: 'Power backup solution'
            },
            {
                id: 'battery-only',
                name: 'Battery only',
                icon: Battery,
                description: 'Choose battery capacity',
                subtitle: 'Choose battery capacity'
            },
            {
                id: 'inverter-only',
                name: 'Inverter only',
                icon: Monitor,
                description: 'Choose inverter capacity',
                subtitle: 'Choose inverter capacity'
            },
            {
                id: 'panels-only',
                name: 'Solar panels only',
                icon: Sun,
                description: 'Choose solar panel capacity',
                subtitle: 'Choose solar panel capacity'
            }
        ];

        return (
            <div className="animate-fade-in">
                <button onClick={() => navigate('/')} className="mb-6 flex items-center text-gray-500 hover:text-[#273e8e] transition-colors">
                    <ArrowLeft size={16} className="mr-2" /> Back
                </button>
                {/* Buy Now Badge */}
                <div className="flex justify-center mb-6">
                    <span className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-bold bg-gradient-to-r from-[#E8A91D] to-[#d4991a] text-white shadow-lg">
                        <CreditCard size={16} className="mr-2" />
                        Buy Now
                    </span>
                </div>
                <h2 className="text-3xl font-bold text-center mb-10 text-[#273e8e]">
                    Select Product Category
                </h2>
                {categories.length === 0 ? (
                    <div className="text-center py-12">
                        <Loader className="animate-spin mx-auto text-[#273e8e]" size={48} />
                        <p className="mt-4 text-gray-600">Loading categories...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {categoryGroups.map((group) => {
                            const IconComponent = group.icon;
                            const matchingCategoryIds = getCategoryIdsForGroup(group.id);
                            
                            return (
                                <button
                                    key={group.id}
                                    onClick={() => handleCategorySelect(group.id)}
                                    className="group bg-white border-2 border-gray-200 hover:border-[#273e8e] rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden transform hover:-translate-y-1"
                                >
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#273e8e] to-[#E8A91D]"></div>
                                    <div className="bg-gradient-to-br from-[#273e8e]/10 to-[#E8A91D]/10 p-5 rounded-full mb-4 group-hover:from-[#273e8e]/20 group-hover:to-[#E8A91D]/20 transition-all duration-300 flex items-center justify-center min-h-[72px] w-[72px]">
                                        <IconComponent size={36} className="text-[#273e8e] group-hover:scale-110 transition-transform" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-[#273e8e] transition-colors">{group.name}</h3>
                                    {group.subtitle && (
                                        <p className="text-sm text-gray-500 italic">{group.subtitle}</p>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    // OLD: Render Step 2 - API Category Selection (COMMENTED OUT - Used for "Build my solar system" path now as Step 2.75)
    // const renderStep2 = () => {
    //     // Helper to get category icon based on category name
    //     const getCategoryIcon = (categoryName) => {
    //         const name = (categoryName || '').toLowerCase();
    //         if (name.includes('battery')) return Battery;
    //         if (name.includes('inverter')) return Monitor;
    //         if (name.includes('solar') || name.includes('panel')) return Sun;
    //         return Zap; // Default icon
    //     };

    //     return (
    //         <div className="animate-fade-in">
    //             <button onClick={() => setStep(1)} className="mb-6 flex items-center text-gray-500 hover:text-[#273e8e]">
    //                 <ArrowLeft size={16} className="mr-2" /> Back
    //             </button>
    //             <h2 className="text-3xl font-bold text-center mb-8 text-[#273e8e]">
    //                 Select Product Category
    //             </h2>
    //             {categories.length === 0 ? (
    //                 <div className="text-center py-12">
    //                     <Loader className="animate-spin mx-auto text-[#273e8e]" size={48} />
    //                     <p className="mt-4 text-gray-600">Loading categories...</p>
    //                 </div>
    //             ) : (
    //                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
    //                     {categories.map((cat) => {
    //                         const IconComponent = getCategoryIcon(cat.title || cat.name);
    //                         const categoryName = cat.title || cat.name || `Category #${cat.id}`;
    //                         const categoryIcon = cat.icon ? toAbsolute(cat.icon) : null;
    //                         
    //                         return (
    //                             <button
    //                                 key={cat.id}
    //                                 onClick={() => handleCategorySelect(cat.id)}
    //                                 className="group bg-white border-2 border-gray-100 hover:border-[#273e8e] rounded-2xl p-6 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center"
    //                             >
    //                                 <div className="bg-blue-50 p-4 rounded-full mb-4 group-hover:bg-[#273e8e]/10 transition-colors flex items-center justify-center min-h-[64px] relative">
    //                                     <IconComponent size={32} className="text-[#273e8e]" />
    //                                     {categoryIcon && (
    //                                         <img 
    //                                             src={categoryIcon} 
    //                                             alt={categoryName}
    //                                             className="w-8 h-8 object-contain absolute"
    //                                             onError={(e) => {
    //                                                 e.target.style.display = 'none';
    //                                             }}
    //                                         />
    //                                     )}
    //                                 </div>
    //                                 <h3 className="text-lg font-bold text-gray-800">{categoryName}</h3>
    //                             </button>
    //                         );
    //                     })}
    //                 </div>
    //             )}
    //         </div>
    //     );
    // };

    // NEW: Render Step 2.75 - API Category Selection (for "Build my solar system" path)
    const renderStep2_75 = () => {
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
                <button onClick={() => setStep(3)} className="mb-6 flex items-center text-gray-500 hover:text-[#273e8e]">
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
                                    onClick={() => handleBuildSystemCategorySelect(cat.id)}
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
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                            {categoryProducts.map((product) => {
                                const price = Number(product.discount_price || product.price || 0);
                                const oldPrice = product.discount_price && product.price && product.discount_price < product.price 
                                    ? Number(product.price) 
                                    : null;
                                const discount = oldPrice && price < oldPrice
                                    ? Math.round(((oldPrice - price) / oldPrice) * 100)
                                    : 0;
                                // Check if product is selected
                                const isSelected = formData.selectedProducts.some(p => p.id === product.id);
                                
                                return (
                                    <div
                                        key={product.id}
                                        className={`group bg-white border-2 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 ${
                                            isSelected 
                                                ? 'border-[#273e8e] bg-blue-50 ring-2 ring-[#273e8e]' 
                                                : 'border-gray-100 hover:border-[#273e8e]'
                                        }`}
                                    >
                                        <div className="mb-3">
                                            <div className="aspect-square w-full mb-4 rounded-lg overflow-hidden bg-gray-100 relative">
                                                <img
                                                    src={getProductImage(product)}
                                                    alt={product.title || product.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    onError={(e) => {
                                                        if (e.target.src && !e.target.src.includes('placeholder-product.png') && !e.target.src.includes('data:image')) {
                                                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f3f4f6" width="400" height="400"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                                                        }
                                                    }}
                                                />
                                                {isSelected && (
                                                    <div className="absolute top-2 right-2 bg-[#273e8e] text-white rounded-full p-2">
                                                        <CheckCircle size={20} />
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="font-bold text-lg mb-2 text-gray-800">
                                                {product.title || product.name || `Product #${product.id}`}
                                            </h3>
                                            <div className="flex items-center justify-between mb-3">
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
                                                {discount > 0 && (
                                                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-[#FFA500] text-white">
                                                        -{discount}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleProductSelect(product);
                                            }}
                                            className={`w-full py-2 rounded-lg font-semibold transition-colors mt-2 ${
                                                isSelected
                                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                                    : 'bg-[#273e8e] text-white hover:bg-[#1a2b6b]'
                                            }`}
                                        >
                                            {isSelected ? 'Remove from Selection' : 'Add to Selection'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Continue Button - Show when at least one product is selected */}
                        {formData.selectedProducts.length > 0 && (
                            <div className="mt-8 flex justify-center">
                                <button
                                    onClick={() => setStep(7)}
                                    className="bg-[#273e8e] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#1a2b6b] transition-colors flex items-center"
                                >
                                    Continue with {formData.selectedProducts.length} {formData.selectedProducts.length !== 1 ? 'Items' : 'Item'} Selected
                                    <ArrowRight size={20} className="ml-2" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    };

    const renderStep3_75 = () => {
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
            return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f3f4f6" width="400" height="400"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
        };

        return (
            <div className="animate-fade-in">
                <button 
                    onClick={() => {
                        // Clear products when going back
                        setCategoryProducts([]);
                        setProductsLoading(false);
                        setStep(3);
                    }} 
                    className="mb-6 flex items-center text-gray-500 hover:text-[#273e8e]"
                >
                    <ArrowLeft size={16} className="mr-2" /> Back
                </button>
                <h2 className="text-3xl font-bold text-center mb-4 text-[#273e8e]">
                    Build Your Solar System
                </h2>
                <p className="text-center text-gray-600 mb-2">
                    Select multiple products to create your custom bundle
                </p>
                <p className="text-center text-sm text-orange-600 mb-8 font-semibold">
                    * You must select at least one product to continue
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
                        <p className="text-gray-600">No products available at the moment.</p>
                        <button
                            onClick={() => setStep(3)}
                            className="mt-4 text-[#273e8e] hover:underline"
                        >
                            Go back
                        </button>
                    </div>
                ) : (
                    <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {categoryProducts.map((product) => {
                            const price = Number(product.discount_price || product.price || 0);
                            const oldPrice = product.discount_price && product.price && product.discount_price < product.price 
                                ? Number(product.price) 
                                : null;
                            const discount = oldPrice && price < oldPrice
                                ? Math.round(((oldPrice - price) / oldPrice) * 100)
                                : 0;
                            
                            // Check if product is selected
                            const isSelected = formData.selectedProducts.some(p => p.id === product.id);
                            
                            return (
                                <div
                                    key={product.id}
                                    className={`group bg-white border-2 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 ${
                                        isSelected 
                                            ? 'border-[#273e8e] bg-blue-50 ring-2 ring-[#273e8e]' 
                                            : 'border-gray-100 hover:border-[#273e8e]'
                                    }`}
                                >
                                    <div className="mb-3">
                                        <div className="aspect-square w-full mb-4 rounded-lg overflow-hidden bg-gray-100 relative">
                                            <img
                                                src={getProductImage(product)}
                                                alt={product.title || product.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => {
                                                    if (e.target.src && !e.target.src.includes('placeholder-product.png') && !e.target.src.includes('data:image')) {
                                                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f3f4f6" width="400" height="400"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                                                    }
                                                }}
                                            />
                                            {isSelected && (
                                                <div className="absolute top-2 right-2 bg-[#273e8e] text-white rounded-full p-2">
                                                    <CheckCircle size={20} />
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-lg mb-2 text-gray-800">
                                            {product.title || product.name || `Product #${product.id}`}
                                        </h3>
                                        <div className="flex items-center justify-between mb-3">
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
                                            {discount > 0 && (
                                                <span className="px-2 py-1 rounded-full text-xs font-bold bg-[#FFA500] text-white">
                                                    -{discount}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleProductSelect(product);
                                        }}
                                        className={`w-full py-2 rounded-lg font-semibold transition-colors mt-2 ${
                                            isSelected
                                                ? 'bg-red-600 text-white hover:bg-red-700'
                                                : 'bg-[#273e8e] text-white hover:bg-[#1a2b6b]'
                                        }`}
                                    >
                                        {isSelected ? 'Remove from Bundle' : 'Add to Bundle'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* Continue Button - Show when at least one product is selected */}
                    {formData.selectedProducts.length > 0 && (
                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={() => setStep(7)}
                                className="bg-[#273e8e] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#1a2b6b] transition-colors flex items-center"
                            >
                                Continue with {formData.selectedProducts.length} Product{formData.selectedProducts.length !== 1 ? 's' : ''} in Bundle
                                <ArrowRight size={20} className="ml-2" />
                            </button>
                        </div>
                    )}
                    </>
                )}
            </div>
        );
    };

    // NEW: Render Step 3 - Action Selection (3 options, same as BNPL)
    const renderStep3 = () => (
        <div className="animate-fade-in">
            <button onClick={() => setStep(2)} className="mb-6 flex items-center text-gray-500 hover:text-[#273e8e] transition-colors">
                <ArrowLeft size={16} className="mr-2" /> Back
            </button>
            {/* Buy Now Badge */}
            <div className="flex justify-center mb-6">
                <span className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-bold bg-gradient-to-r from-[#E8A91D] to-[#d4991a] text-white shadow-lg">
                    <CreditCard size={16} className="mr-2" />
                    Buy Now
                </span>
            </div>
            <h2 className="text-3xl font-bold text-center mb-10 text-[#273e8e]">
                How would you like to proceed?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                <button onClick={() => handleOptionSelect('choose-system')} className="group bg-white border-2 border-gray-200 hover:border-[#273e8e] rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden transform hover:-translate-y-1">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#273e8e] to-[#E8A91D]"></div>
                    <div className="bg-gradient-to-br from-[#273e8e]/10 to-[#E8A91D]/10 p-6 rounded-full mb-6 group-hover:from-[#273e8e]/20 group-hover:to-[#E8A91D]/20 transition-all duration-300">
                        <Zap size={40} className="text-[#273e8e] group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-[#273e8e] transition-colors">Choose my solar system</h3>
                </button>
                <button onClick={() => handleOptionSelect('build-system')} className="group bg-white border-2 border-gray-200 hover:border-[#273e8e] rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden transform hover:-translate-y-1">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#273e8e] to-[#E8A91D]"></div>
                    <div className="bg-gradient-to-br from-[#273e8e]/10 to-[#E8A91D]/10 p-6 rounded-full mb-6 group-hover:from-[#273e8e]/20 group-hover:to-[#E8A91D]/20 transition-all duration-300">
                        <Wrench size={40} className="text-[#273e8e] group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-[#273e8e] transition-colors">Build My System</h3>
                </button>
                <button onClick={() => handleOptionSelect('audit')} className="group bg-white border-2 border-gray-200 hover:border-[#273e8e] rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden transform hover:-translate-y-1">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#273e8e] to-[#E8A91D]"></div>
                    <div className="bg-gradient-to-br from-[#273e8e]/10 to-[#E8A91D]/10 p-6 rounded-full mb-6 group-hover:from-[#273e8e]/20 group-hover:to-[#E8A91D]/20 transition-all duration-300">
                        <FileText size={40} className="text-[#273e8e] group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-[#273e8e] transition-colors">Request Professional Audit (Paid)</h3>
                </button>
            </div>
        </div>
    );

    // OLD: Render Step 3 - Action Selection (COMMENTED OUT - Now using new Step 3 above)
    // const renderStep3 = () => (
    //     <div className="animate-fade-in">
    //         <button onClick={() => setStep(2)} className="mb-6 flex items-center text-gray-500 hover:text-[#273e8e]">
    //             <ArrowLeft size={16} className="mr-2" /> Back
    //         </button>
    //         <h2 className="text-3xl font-bold text-center mb-8 text-[#273e8e]">
    //             How would you like to proceed?
    //         </h2>
    //         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
    //             <button onClick={() => handleOptionSelect('choose-system')} className="group bg-white border-2 border-gray-100 hover:border-[#273e8e] rounded-2xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center">
    //                 <div className="bg-yellow-50 p-6 rounded-full mb-6 group-hover:bg-[#273e8e]/10 transition-colors">
    //                     <Zap size={40} className="text-yellow-600" />
    //                 </div>
    //                 <h3 className="text-xl font-bold mb-2 text-gray-800">Choose my solar system</h3>
    //             </button>
    //             <button onClick={() => handleOptionSelect('build-system')} className="group bg-white border-2 border-gray-100 hover:border-[#273e8e] rounded-2xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center">
    //                 <div className="bg-purple-50 p-6 rounded-full mb-6 group-hover:bg-[#273e8e]/10 transition-colors">
    //                     <Wrench size={40} className="text-purple-600" />
    //                 </div>
    //                 <h3 className="text-xl font-bold mb-2 text-gray-800">Build My System</h3>
    //             </button>
    //             <button onClick={() => handleOptionSelect('audit')} className="group bg-white border-2 border-gray-100 hover:border-[#273e8e] rounded-2xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center">
    //                 <div className="bg-green-50 p-6 rounded-full mb-6 group-hover:bg-[#273e8e]/10 transition-colors">
    //                     <FileText size={40} className="text-green-600" />
    //                 </div>
    //                 <h3 className="text-xl font-bold mb-2 text-gray-800">Request Professional Audit</h3>
    //             </button>
    //         </div>
    //     </div>
    // );

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
        // If audit flow, show audit type selection (same as BNPL)
        if (formData.optionType === 'audit') {
            return (
                <div className="animate-fade-in">
                    <button onClick={() => setStep(3)} className="mb-6 flex items-center text-gray-500 hover:text-[#273e8e]">
                        <ArrowLeft size={16} className="mr-2" /> Back
                    </button>
                    <h2 className="text-3xl font-bold text-center mb-8 text-[#273e8e]">
                        Select Audit Type
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {(auditTypes.length > 0 ? auditTypes : [
                            { id: 'home-office', label: 'Home / Office' },
                            { id: 'commercial', label: 'Commercial / Industrial' }
                        ]).map((type) => (
                            <button
                                key={type.id}
                                onClick={() => handleAuditTypeSelect(type.id)}
                                className="group bg-white border-2 border-gray-100 hover:border-[#273e8e] rounded-2xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center"
                            >
                                <div className="bg-blue-50 p-6 rounded-full mb-6 group-hover:bg-[#273e8e]/10 transition-colors">
                                    <FileText size={40} className="text-[#273e8e]" />
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-gray-800">{type.label}</h3>
                            </button>
                        ))}
                    </div>
                </div>
            );
        }

        // Otherwise, show checkout options (OLD BEHAVIOR)
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
                        onClick={() => setFormData({ ...formData, installerChoice: 'own', includeInsurance: false })}
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
                    {/* Insurance Option - only available for TrooSolar installers */}
                    <label className={`flex items-start p-4 rounded-xl border-2 transition-all ${
                        formData.installerChoice === 'own' 
                            ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-60' 
                            : formData.includeInsurance 
                                ? 'border-[#273e8e] bg-blue-50 cursor-pointer' 
                                : 'border-gray-200 cursor-pointer'
                    }`}>
                        <input
                            type="checkbox"
                            className="mt-1 h-5 w-5 text-[#273e8e] focus:ring-[#273e8e] border-gray-300 rounded"
                            checked={formData.includeInsurance}
                            disabled={formData.installerChoice === 'own'}
                            onChange={(e) => setFormData({ ...formData, includeInsurance: e.target.checked })}
                        />
                        <div className="ml-3">
                            <span className={`font-bold flex items-center ${
                                formData.installerChoice === 'own' ? 'text-gray-500' : 'text-gray-800'
                            }`}>
                                <Shield size={18} className={`mr-2 ${
                                    formData.installerChoice === 'own' ? 'text-gray-400' : 'text-[#273e8e]'
                                }`} /> Include Insurance
                            </span>
                            <p className={`text-sm mt-1 ${
                                formData.installerChoice === 'own' ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                                {formData.installerChoice === 'own' 
                                    ? 'Insurance is only available with TrooSolar Certified Installer.' 
                                    : 'Protect your investment against damage and theft (0.5% of product price).'}
                            </p>
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
        // If audit flow, show audit order summary
        if (formData.optionType === 'audit') {
            return (
                <div className="animate-fade-in max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <button onClick={() => setStep(5)} className="mb-6 flex items-center text-gray-500 hover:text-[#273e8e]">
                        <ArrowLeft size={16} className="mr-2" /> Back
                    </button>
                    <h2 className="text-2xl font-bold mb-6 text-[#273e8e] border-b pb-4">Order Summary</h2>
                    
                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <div className="bg-gray-100 p-2 rounded-lg mr-4">
                                    <FileText size={24} className="text-gray-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800">Professional Energy Audit</p>
                                    <p className="text-sm text-gray-500">
                                        {formData.auditType === 'home-office' ? 'Home / Office Audit' : 'Commercial / Industrial Audit'}
                                    </p>
                                </div>
                            </div>
                            <span className="font-bold">Price will be calculated</span>
                        </div>

                        <div className="text-sm text-gray-600 pl-14 space-y-1">
                            <p><strong>Property Location:</strong> {formData.state}</p>
                            {formData.houseNo && formData.streetName && (
                                <p><strong>Address:</strong> {formData.houseNo}, {formData.streetName}</p>
                            )}
                            {formData.floors && <p><strong>Floors:</strong> {formData.floors}</p>}
                            {formData.rooms && <p><strong>Rooms:</strong> {formData.rooms}</p>}
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                        <p className="text-sm text-blue-700">
                            <strong>Note:</strong> Detailed invoice with all fees will be shown next.
                        </p>
                    </div>

                    <button
                        onClick={async () => {
                            // Proceed to checkout to get invoice
                            setLoading(true);
                            try {
                                const token = localStorage.getItem('access_token');
                                if (!token) {
                                    alert("Please login to continue");
                                    navigate('/login');
                                    return;
                                }

                                const checkoutPayload = {
                                    customer_type: formData.customerType,
                                    product_category: 'audit',
                                    audit_request_id: auditRequestId,
                                    amount: 0 // Will be calculated by backend
                                };

                                const checkoutResponse = await axios.post(API.BUY_NOW_CHECKOUT, checkoutPayload, {
                                    headers: { 
                                        Authorization: `Bearer ${token}`,
                                        'Content-Type': 'application/json',
                                        Accept: 'application/json'
                                    }
                                });

                                if (checkoutResponse.data.status === 'success') {
                                    setInvoiceDetails(checkoutResponse.data.data);
                                    setOrderId(checkoutResponse.data.data.order_id);
                                    setStep(8); // Go to Order Summary with details
                                } else {
                                    alert("Failed to process checkout. Please try again.");
                                }
                            } catch (error) {
                                console.error("Checkout Error:", error);
                                const errorMessage = error.response?.data?.message || 
                                                    (error.response?.data?.errors ? JSON.stringify(error.response.data.errors) : null) ||
                                                    "Failed to process checkout. Please try again.";
                                alert(errorMessage);
                            } finally {
                                setLoading(false);
                            }
                        }}
                        disabled={loading}
                        className="w-full bg-[#273e8e] text-white py-4 rounded-xl font-bold hover:bg-[#1a2b6b] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
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
                </div>
            );
        }

        // Otherwise, show regular product order summary
        // Calculate total from all selected items (accounting for quantity)
        const bundlesTotal = formData.selectedBundles.reduce((sum, b) => sum + (b.price * (b.quantity || 1)), 0);
        const productsTotal = formData.selectedProducts.reduce((sum, p) => sum + (p.price * (p.quantity || 1)), 0);
        const itemsSubtotal = bundlesTotal + productsTotal;
        // For single items, multiply by quantity
        const singleItemBasePrice = formData.selectedProductPrice * (formData.singleItemQuantity || 1);
        const basePrice = itemsSubtotal > 0 ? itemsSubtotal : singleItemBasePrice;

        // Get product details (for backward compatibility)
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
                <button onClick={() => {
                    if (formData.optionType === 'build-system') {
                        setStep(3.75);
                    } else if (formData.selectedBundleId) {
                        setStep(3.5);
                    } else if (formData.optionType) {
                        setStep(3);
                    } else {
                        setStep(2);
                    }
                }} className="mb-6 flex items-center text-gray-500 hover:text-[#273e8e]">
                    <ArrowLeft size={16} className="mr-2" /> Back
                </button>
                <h2 className="text-2xl font-bold mb-6 text-[#273e8e] border-b pb-4">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                    {/* Show selected bundles */}
                    {formData.selectedBundles.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="font-semibold text-gray-700 mb-2">Selected Bundles ({formData.selectedBundles.length})</h3>
                            {formData.selectedBundles.map((selectedBundle) => {
                                const quantity = selectedBundle.quantity || 1;
                                const unitPrice = selectedBundle.price || 0;
                                const totalPrice = unitPrice * quantity;
                                
                                return (
                                    <div key={selectedBundle.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center">
                                            <div className="bg-gray-100 p-2 rounded-lg mr-4">
                                                <Sun size={20} className="text-gray-600" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">
                                                    {selectedBundle.bundle.title || selectedBundle.bundle.name || `Bundle #${selectedBundle.id}`}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Solar System Bundle
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateBundleQuantity(selectedBundle.id, Math.max(1, quantity - 1))}
                                                    className="bg-[#273e8e] text-white rounded p-1.5 cursor-pointer hover:bg-[#1a2b6b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    disabled={quantity <= 1}
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="w-8 text-center font-medium">{quantity}</span>
                                                <button
                                                    onClick={() => updateBundleQuantity(selectedBundle.id, quantity + 1)}
                                                    className="bg-[#273e8e] text-white rounded p-1.5 cursor-pointer hover:bg-[#1a2b6b] transition-colors"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-bold block">₦{Number(totalPrice).toLocaleString()}</span>
                                                {quantity > 1 && (
                                                    <span className="text-xs text-gray-500">₦{Number(unitPrice).toLocaleString()} each</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    
                    {/* Show selected products */}
                    {formData.selectedProducts.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="font-semibold text-gray-700 mb-2">Selected Products ({formData.selectedProducts.length})</h3>
                            {formData.selectedProducts.map((selectedProduct) => {
                                const quantity = selectedProduct.quantity || 1;
                                const unitPrice = selectedProduct.price || 0;
                                const totalPrice = unitPrice * quantity;
                                
                                return (
                                    <div key={selectedProduct.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center">
                                            <div className="bg-gray-100 p-2 rounded-lg mr-4">
                                                <Battery size={20} className="text-gray-600" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">
                                                    {selectedProduct.product.title || selectedProduct.product.name || `Product #${selectedProduct.id}`}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Individual Component
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateProductQuantity(selectedProduct.id, Math.max(1, quantity - 1))}
                                                    className="bg-[#273e8e] text-white rounded p-1.5 cursor-pointer hover:bg-[#1a2b6b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    disabled={quantity <= 1}
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="w-8 text-center font-medium">{quantity}</span>
                                                <button
                                                    onClick={() => updateProductQuantity(selectedProduct.id, quantity + 1)}
                                                    className="bg-[#273e8e] text-white rounded p-1.5 cursor-pointer hover:bg-[#1a2b6b] transition-colors"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-bold block">₦{Number(totalPrice).toLocaleString()}</span>
                                                {quantity > 1 && (
                                                    <span className="text-xs text-gray-500">₦{Number(unitPrice).toLocaleString()} each</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    
                    {/* Fallback for single item (backward compatibility) */}
                    {formData.selectedBundles.length === 0 && formData.selectedProducts.length === 0 && (
                        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
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
                                        {(formData.singleItemQuantity || 1) > 1 && (
                                            <span className="ml-2 font-semibold">× {formData.singleItemQuantity || 1}</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {/* Quantity Controls */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setFormData(prev => ({
                                            ...prev,
                                            singleItemQuantity: Math.max(1, (prev.singleItemQuantity || 1) - 1)
                                        }))}
                                        className="bg-[#273e8e] text-white rounded p-1.5 cursor-pointer hover:bg-[#1a2b6b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={(formData.singleItemQuantity || 1) <= 1}
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="w-8 text-center font-medium">{formData.singleItemQuantity || 1}</span>
                                    <button
                                        onClick={() => setFormData(prev => ({
                                            ...prev,
                                            singleItemQuantity: (prev.singleItemQuantity || 1) + 1
                                        }))}
                                        className="bg-[#273e8e] text-white rounded p-1.5 cursor-pointer hover:bg-[#1a2b6b] transition-colors"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <div className="text-right">
                                    <span className="font-bold block">₦{Number((formData.selectedProductPrice || 0) * (formData.singleItemQuantity || 1)).toLocaleString()}</span>
                                    {(formData.singleItemQuantity || 1) > 1 && (
                                        <span className="text-xs text-gray-500">₦{Number(formData.selectedProductPrice || 0).toLocaleString()} each</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Subtotal for multiple items */}
                    {(formData.selectedBundles.length > 0 || formData.selectedProducts.length > 0) && (
                        <div className="border-t pt-3 mt-3">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-700">Items Subtotal:</span>
                                <span className="font-bold text-lg">₦{Number(basePrice || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    )}

                    {formData.selectedBundles.length === 0 && formData.selectedProducts.length === 0 && (
                        <div className="text-sm text-gray-600 pl-14 space-y-1 mt-4">
                            {(formData.productCategory === 'full-kit' || formData.productCategory === 'inverter-battery') && (
                                <>
                                    <p><strong>Appliances:</strong> Standard household appliances</p>
                                    <p><strong>Backup Time:</strong> 8-12 hours (depending on usage)</p>
                                </>
                            )}
                            <p><strong>Quantity:</strong> {formData.singleItemQuantity || 1} {formData.productCategory === 'full-kit' || formData.productCategory === 'inverter-battery' ? 'system' : 'item'}{(formData.singleItemQuantity || 1) > 1 ? 's' : ''}</p>
                            <p><strong>Unit Price:</strong> ₦{Number(formData.selectedProductPrice || 0).toLocaleString()}</p>
                            <p><strong>Total Price:</strong> ₦{Number((formData.selectedProductPrice || 0) * (formData.singleItemQuantity || 1)).toLocaleString()}</p>
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

        // If audit flow, show audit order summary
        if (formData.optionType === 'audit') {
            return (
                <div className="animate-fade-in max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <button onClick={() => setStep(7)} className="mb-6 flex items-center text-gray-500 hover:text-[#273e8e]">
                        <ArrowLeft size={16} className="mr-2" /> Back
                    </button>
                    <h2 className="text-2xl font-bold mb-6 text-[#273e8e] border-b pb-4">Order Summary</h2>
                    
                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <div className="bg-gray-100 p-2 rounded-lg mr-4">
                                    <FileText size={24} className="text-gray-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800">Professional Energy Audit</p>
                                    <p className="text-sm text-gray-500">
                                        {formData.auditType === 'home-office' ? 'Home / Office Audit' : 'Commercial / Industrial Audit'}
                                    </p>
                                </div>
                            </div>
                            <span className="font-bold">₦{Number(invoiceDetails.product_price || invoiceDetails.total || 0).toLocaleString()}</span>
                        </div>

                        <div className="text-sm text-gray-600 pl-14 space-y-1">
                            <p><strong>Property Location:</strong> {formData.state}</p>
                            {formData.houseNo && formData.streetName && (
                                <p><strong>Address:</strong> {formData.houseNo}, {formData.streetName}</p>
                            )}
                            {formData.floors && <p><strong>Floors:</strong> {formData.floors}</p>}
                            {formData.rooms && <p><strong>Rooms:</strong> {formData.rooms}</p>}
                        </div>
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
        }

        // Otherwise, show regular product order summary
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

                    {formData.selectedBundles.length === 0 && formData.selectedProducts.length === 0 && (formData.productCategory === 'full-kit' || formData.productCategory === 'inverter-battery') && (
                        <div className="text-sm text-gray-600 pl-14 space-y-1">
                            <p><strong>Appliances:</strong> Standard household appliances</p>
                            <p><strong>Backup Time:</strong> 8-12 hours (depending on usage)</p>
                            <p><strong>Quantity:</strong> {formData.singleItemQuantity || 1} system{(formData.singleItemQuantity || 1) > 1 ? 's' : ''}</p>
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

    const renderStep5 = () => {
        // If audit flow and home-office, show property details form ONLY if invoiceDetails is not set
        // If invoiceDetails exists, it means we've already submitted the form and should show invoice
        if (formData.optionType === 'audit' && formData.auditType === 'home-office' && !invoiceDetails) {
            return (
                <div className="animate-fade-in max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <button onClick={() => setStep(4)} className="mb-6 flex items-center text-gray-500 hover:text-[#273e8e]">
                        <ArrowLeft size={16} className="mr-2" /> Back
                    </button>
                    
                    {/* Custom Order Flow Indicator */}
                    {cartToken && cartItems.length > 0 && (
                        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <CheckCircle size={20} className="text-blue-600 mr-3 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-blue-800 mb-2">Custom Order Items Loaded</h3>
                                    <p className="text-sm text-blue-700 mb-3">
                                        Your cart contains {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} prepared by admin.
                                    </p>
                                    <div className="space-y-2">
                                        {cartItems.map((item, idx) => (
                                            <div key={idx} className="text-sm text-blue-600 bg-white p-2 rounded border border-blue-200">
                                                <span className="font-medium">
                                                    {item.itemable?.title || item.itemable?.name || `Item #${item.itemable_id}`}
                                                </span>
                                                <span className="ml-2">
                                                    (₦{Number(item.unit_price || 0).toLocaleString()})
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {cartLoading && (
                        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <Loader className="animate-spin text-yellow-600 mr-3" size={20} />
                                <p className="text-sm text-yellow-700">Loading cart items...</p>
                            </div>
                        </div>
                    )}
                    
                    {cartError && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <AlertCircle size={20} className="text-red-600 mr-3" />
                                <p className="text-sm text-red-700">{cartError}</p>
                            </div>
                        </div>
                    )}
                    
                    <h2 className="text-2xl font-bold mb-6 text-[#273e8e]">Property Details</h2>
                    <form onSubmit={handleAuditAddressSubmit} className="space-y-4">
                        {states.length > 0 ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                                <select
                                    required
                                    className="w-full p-3 border rounded-lg"
                                    onChange={e => {
                                        const stateId = e.target.value ? Number(e.target.value) : null;
                                        const selectedState = states.find(s => s.id === stateId);
                                        setFormData({ ...formData, state: selectedState?.name || '', stateId });
                                    }}
                                >
                                    <option value="">Select State</option>
                                    {states.filter(s => s.is_active).map((state) => (
                                        <option key={state.id} value={state.id}>{state.name}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                                <input type="text" placeholder="State" required className="w-full p-3 border rounded-lg" onChange={e => setFormData({ ...formData, state: e.target.value })} />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">House No *</label>
                            <input 
                                type="text" 
                                placeholder="House Number" 
                                required 
                                className="w-full p-3 border rounded-lg" 
                                value={formData.houseNo}
                                onChange={e => setFormData({ ...formData, houseNo: e.target.value })} 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Street Name *</label>
                            <input 
                                type="text" 
                                placeholder="Street Name" 
                                required 
                                className="w-full p-3 border rounded-lg" 
                                value={formData.streetName}
                                onChange={e => setFormData({ ...formData, streetName: e.target.value })} 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Landmark (Optional)</label>
                            <input 
                                type="text" 
                                placeholder="Landmark" 
                                className="w-full p-3 border rounded-lg" 
                                value={formData.landmark}
                                onChange={e => setFormData({ ...formData, landmark: e.target.value })} 
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Floors *</label>
                                <input 
                                    type="number" 
                                    placeholder="Floors" 
                                    required
                                    min="0"
                                    className="w-full p-3 border rounded-lg" 
                                    value={formData.floors}
                                    onChange={e => setFormData({ ...formData, floors: e.target.value })} 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Rooms *</label>
                                <input 
                                    type="number" 
                                    placeholder="Rooms" 
                                    required
                                    min="0"
                                    className="w-full p-3 border rounded-lg" 
                                    value={formData.rooms}
                                    onChange={e => setFormData({ ...formData, rooms: e.target.value })} 
                                />
                            </div>
                        </div>
                        
                        {/* Gated Estate Section */}
                        <div className="mt-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={formData.isGatedEstate} 
                                    onChange={e => setFormData({ ...formData, isGatedEstate: e.target.checked })} 
                                    className="h-5 w-5 text-[#273e8e] focus:ring-[#273e8e] border-gray-300 rounded"
                                />
                                <span className="text-gray-700">Is this property in a gated estate?</span>
                            </label>
                        </div>
                        
                        {formData.isGatedEstate && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <input 
                                    type="text" 
                                    placeholder="Estate Name *" 
                                    required={formData.isGatedEstate}
                                    className="p-3 border rounded-lg" 
                                    onChange={e => setFormData({ ...formData, estateName: e.target.value })} 
                                />
                                <input 
                                    type="text" 
                                    placeholder="Estate Address *" 
                                    required={formData.isGatedEstate}
                                    className="p-3 border rounded-lg" 
                                    onChange={e => setFormData({ ...formData, estateAddress: e.target.value })} 
                                />
                            </div>
                        )}
                        
                        <button 
                            type="submit" 
                            disabled={
                                loading || 
                                !formData.state || 
                                !formData.houseNo || 
                                !formData.streetName || 
                                !formData.floors || 
                                !formData.rooms ||
                                (formData.isGatedEstate && (!formData.estateName || !formData.estateAddress))
                            }
                            className={`w-full py-4 rounded-xl font-bold transition-colors ${
                                loading || 
                                !formData.state || 
                                !formData.houseNo || 
                                !formData.streetName || 
                                !formData.floors || 
                                !formData.rooms ||
                                (formData.isGatedEstate && (!formData.estateName || !formData.estateAddress))
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-[#273e8e] text-white hover:bg-[#1a2b6b]'
                            }`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <Loader className="animate-spin mr-2" size={20} />
                                    Submitting...
                                </span>
                            ) : (
                                'Continue'
                            )}
                        </button>
                    </form>
                </div>
            );
        }

        // Otherwise, show invoice
        // Calculate totals from selected items (accounting for quantity)
        const bundlesTotal = formData.selectedBundles.reduce((sum, b) => sum + (b.price * (b.quantity || 1)), 0);
        const productsTotal = formData.selectedProducts.reduce((sum, p) => sum + (p.price * (p.quantity || 1)), 0);
        const itemsSubtotal = bundlesTotal + productsTotal;
        // For single items, multiply unit price by quantity (selectedProductPrice is the unit price)
        const singleItemBasePrice = formData.selectedProductPrice * (formData.singleItemQuantity || 1);
        const basePrice = itemsSubtotal > 0 ? itemsSubtotal : singleItemBasePrice;
        
        // Installation fee: ₦50,000 if TrooSolar installer is selected
        const installationFee = formData.installerChoice === 'troosolar' ? 50000 : 0;
        
        // Get fees from invoiceDetails (from API) or use defaults
        const materialCost = invoiceDetails?.material_cost || 0;
        const deliveryFee = invoiceDetails?.delivery_fee || 0;
        const inspectionFee = invoiceDetails?.inspection_fee || 0;
        const insuranceFee = invoiceDetails?.insurance_fee || 0;
        
        // Calculate total
        const calculatedTotal = basePrice + materialCost + installationFee + deliveryFee + inspectionFee + insuranceFee;
        const invoiceTotal = invoiceDetails?.total || calculatedTotal;
        
        return (
        <div className="animate-fade-in max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <button onClick={() => setStep(8)} className="mb-6 flex items-center text-gray-500 hover:text-[#273e8e]">
                <ArrowLeft size={16} className="mr-2" /> Back
            </button>
            <h2 className="text-2xl font-bold mb-6 text-[#273e8e] border-b pb-4">Invoice #{orderId || 'Pending'}</h2>
            <div className="space-y-4 mb-8">
                <div className="border-b pb-4 mb-4">
                    <h3 className="font-bold text-gray-800 mb-3">Invoice Details</h3>
                </div>
                
                {/* Audit Request */}
                {formData.optionType === 'audit' && (
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-medium text-gray-800">Professional Energy Audit</p>
                            <p className="text-sm text-gray-500">
                                {formData.auditType === 'home-office' ? 'Home / Office Audit' : 'Commercial / Industrial Audit'}
                            </p>
                        </div>
                        <span className="font-bold">₦{Number(invoiceDetails?.audit_fee || invoiceDetails?.product_price || 0).toLocaleString()}</span>
                    </div>
                )}
                
                {/* Selected Bundles */}
                {formData.selectedBundles.length > 0 && (
                    <div className="space-y-2">
                        {formData.selectedBundles.map((selectedBundle) => {
                            const quantity = selectedBundle.quantity || 1;
                            const unitPrice = selectedBundle.price || 0;
                            const totalPrice = unitPrice * quantity;
                            
                            return (
                                <div key={selectedBundle.id} className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-gray-800">
                                            {selectedBundle.bundle?.title || selectedBundle.bundle?.name || `Bundle #${selectedBundle.id}`}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Solar System Bundle
                                            {quantity > 1 && <span className="ml-2">× {quantity}</span>}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold block">₦{Number(totalPrice).toLocaleString()}</span>
                                        {quantity > 1 && (
                                            <span className="text-xs text-gray-500">₦{Number(unitPrice).toLocaleString()} each</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                
                {/* Selected Products */}
                {formData.selectedProducts.length > 0 && (
                    <div className="space-y-2">
                        {formData.selectedProducts.map((selectedProduct) => {
                            const quantity = selectedProduct.quantity || 1;
                            const unitPrice = selectedProduct.price || 0;
                            const totalPrice = unitPrice * quantity;
                            
                            return (
                                <div key={selectedProduct.id} className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-gray-800">
                                            {selectedProduct.product?.title || selectedProduct.product?.name || `Product #${selectedProduct.id}`}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Individual Component
                                            {quantity > 1 && <span className="ml-2">× {quantity}</span>}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold block">₦{Number(totalPrice).toLocaleString()}</span>
                                        {quantity > 1 && (
                                            <span className="text-xs text-gray-500">₦{Number(unitPrice).toLocaleString()} each</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                
                {/* Fallback for single bundle/product (backward compatibility) */}
                {formData.selectedBundles.length === 0 && formData.selectedProducts.length === 0 && formData.optionType !== 'audit' && (
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-medium text-gray-800">
                                {formData.selectedBundle?.title || formData.selectedBundle?.name || 
                                 formData.productCategory === 'full-kit' 
                                    ? 'Solar Panels, Inverter & Battery'
                                    : formData.productCategory === 'inverter-battery'
                                        ? 'Inverter & Battery Solution'
                                        : formData.productCategory === 'battery-only'
                                            ? 'Battery Only'
                                            : formData.productCategory === 'inverter-only'
                                                ? 'Inverter Only'
                                                : 'Solar Panels Only'}
                            </p>
                            <p className="text-sm text-gray-500">
                                {formData.productCategory === 'full-kit' 
                                    ? 'Complete solar system solution'
                                    : formData.productCategory === 'inverter-battery'
                                        ? 'Inverter and battery backup'
                                        : 'Individual component'}
                                {(formData.singleItemQuantity || 1) > 1 && <span className="ml-2">× {formData.singleItemQuantity || 1}</span>}
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="font-bold block">₦{Number(basePrice || 0).toLocaleString()}</span>
                            {(formData.singleItemQuantity || 1) > 1 && (
                                <span className="text-xs text-gray-500">₦{Number(formData.selectedProductPrice).toLocaleString()} each</span>
                            )}
                        </div>
                    </div>
                )}
                
                {/* Items Subtotal if multiple items */}
                {(formData.selectedBundles.length > 0 || formData.selectedProducts.length > 0) && (
                    <div className="border-t pt-3 mt-3">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-700">Items Subtotal:</span>
                            <span className="font-bold">₦{Number(basePrice || 0).toLocaleString()}</span>
                        </div>
                    </div>
                )}
                
                {/* Material Cost - only if installation is selected */}
                {materialCost > 0 && (
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Material Cost (Cables, Breakers, Surge Protectors, Trunking, and Pipes)</span>
                        <span>₦{Number(materialCost).toLocaleString()}</span>
                    </div>
                )}
                
                {/* Installation Fee - only if TrooSolar installer is selected */}
                {installationFee > 0 && (
                    <div className="flex justify-between">
                        <span>Installation Fees</span>
                        <span>₦{Number(installationFee).toLocaleString()}</span>
                    </div>
                )}
                
                {/* Delivery/Logistics */}
                {deliveryFee > 0 && (
                    <div className="flex justify-between">
                        <span>Delivery/Logistics Fees</span>
                        <span>₦{Number(deliveryFee).toLocaleString()}</span>
                    </div>
                )}
                
                {/* Inspection Fee - optional */}
                {inspectionFee > 0 && (
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Inspection Fees (Optional)</span>
                        <span>₦{Number(inspectionFee).toLocaleString()}</span>
                    </div>
                )}
                
                {/* Insurance Fee - optional */}
                {insuranceFee > 0 && (
                    <div className="flex justify-between">
                        <span>Insurance Fee (Optional)</span>
                        <span>₦{Number(insuranceFee).toLocaleString()}</span>
                    </div>
                )}
                
                <div className="border-t pt-4 font-bold text-xl flex justify-between">
                    <span>Total</span>
                    <span className="text-[#273e8e]">₦{Number(invoiceTotal).toLocaleString()}</span>
                </div>
            </div>
            
            {/* Calendar Slots Section */}
            {calendarSlots.length > 0 && (() => {
                // Group slots by date to get unique dates only
                const uniqueDates = [];
                const dateMap = new Map();
                
                calendarSlots.forEach(slot => {
                    if (!dateMap.has(slot.date)) {
                        dateMap.set(slot.date, slot);
                        uniqueDates.push(slot);
                    }
                });

                return (
                    <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h3 className="font-bold text-[#273e8e] mb-3 flex items-center">
                            <Calendar size={20} className="mr-2" />
                            Available Installation Dates
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                            Installation slots are available starting 72 hours after payment confirmation. Select your preferred date:
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                            {uniqueDates.slice(0, 9).map((slot, idx) => {
                                const dateStr = new Date(slot.date).toLocaleDateString('en-NG', { 
                                    weekday: 'short', 
                                    month: 'short', 
                                    day: 'numeric' 
                                });
                                const isSelected = selectedSlot?.date === slot.date;
                                
                                return (
                                    <button
                                        key={idx}
                                        disabled={!slot.available}
                                        onClick={() => {
                                            if (slot.available) {
                                                // Select the first available slot for this date
                                                const firstSlotForDate = calendarSlots.find(s => 
                                                    s.date === slot.date && s.available
                                                );
                                                if (firstSlotForDate) {
                                                    setSelectedSlot(firstSlotForDate);
                                                }
                                            }
                                        }}
                                        className={`p-3 rounded-lg text-sm border transition-colors ${
                                            isSelected
                                                ? 'border-[#273e8e] bg-[#273e8e] text-white'
                                                : slot.available
                                                ? 'border-blue-300 hover:bg-blue-100 text-gray-800'
                                                : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        <div className="font-medium text-center">{dateStr}</div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })()}
            
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
    };

    const renderStep6 = () => {
        // If audit flow and commercial, show commercial notification (same as BNPL)
        if (formData.optionType === 'audit' && formData.auditType === 'commercial') {

            return (
                <div className="animate-fade-in max-w-3xl mx-auto text-center">
                    <div className="bg-yellow-50 border border-yellow-200 p-8 rounded-2xl">
                        <AlertCircle size={64} className="text-yellow-600 mx-auto mb-6" />
                        <h2 className="text-3xl font-bold mb-4 text-yellow-800">Commercial Audit Request</h2>
                        <p className="text-gray-700 mb-6 text-lg">
                            Your commercial audit request has been submitted successfully.
                        </p>
                        {auditRequestId && (
                            <div className="bg-white p-4 rounded-lg border border-yellow-300 mb-4">
                                <p className="text-sm text-gray-700">
                                    <strong>Request ID:</strong> #{auditRequestId}
                                </p>
                                {auditRequestStatus && (
                                    <p className="text-sm text-gray-700 mt-2">
                                        <strong>Status:</strong> <span className="capitalize">{auditRequestStatus}</span>
                                    </p>
                                )}
                            </div>
                        )}
                        <p className="text-gray-600 mb-8">
                            Our team will review your request and contact you within 24-48 hours with a customized quote.
                            Commercial audits require manual review to ensure accurate pricing based on your specific requirements.
                        </p>
                        <div className="bg-white p-6 rounded-lg border border-yellow-300 mb-6">
                            <p className="text-sm text-gray-700">
                                <strong>What happens next?</strong>
                            </p>
                            <ul className="text-left mt-3 space-y-2 text-sm text-gray-600">
                                <li>✓ Our audit team will review your property details</li>
                                <li>✓ We'll calculate a custom quote based on your requirements</li>
                                <li>✓ You'll receive an email with the quote and next steps</li>
                            </ul>
                        </div>
                        <button
                            onClick={() => setStep(7)}
                            className="w-full bg-[#273e8e] text-white py-4 rounded-xl font-bold hover:bg-[#1a2b6b] transition-colors"
                        >
                            View Order Summary
                        </button>
                    </div>
                </div>
            );
        }

        // Otherwise, show payment result (OLD BEHAVIOR)
        return (
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
                                    {new Date(selectedSlot.date).toLocaleDateString('en-NG', { weekday: 'long', month: 'long', day: 'numeric' })}
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
    };

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
                            <span className={step >= 3 && step < 4 ? "text-[#273e8e]" : ""}>Option</span>
                            <span className={step >= 7 ? "text-[#273e8e]" : ""}>Summary</span>
                            <span className={step === 4 ? "text-[#273e8e]" : ""}>Checkout</span>
                            <span className={step === 5 ? "text-[#273e8e]" : ""}>Payment</span>
                            <span className={step === 6 ? "text-[#273e8e]" : ""}>Complete</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#273e8e] transition-all duration-500 ease-out"
                                style={{ 
                                    width: `${(() => {
                                        // Map steps to progress percentage (7 stages total)
                                        // Type (1): ~14%
                                        if (step === 1) return 14;
                                        // Product (2, 2.5, 2.75): ~28%
                                        if (step >= 2 && step < 3) return 28;
                                        // Option (3, 3.5, 3.75): ~42%
                                        if (step >= 3 && step < 4) return 42;
                                        // Checkout (4): ~57%
                                        if (step === 4) return 57;
                                        // Payment (5): ~71%
                                        if (step === 5) return 71;
                                        // Complete (6): ~85%
                                        if (step === 6) return 85;
                                        // Summary (7, 8): ~100%
                                        if (step >= 7) return 100;
                                        return 0;
                                    })()}%` 
                                }}
                            />
                        </div>
                    </div>

                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 2.5 && renderStep2_5()}
                    {step === 2.75 && renderStep2_75()}
                    {step === 3 && renderStep3()}
                    {step === 3.5 && renderStep3_5()}
                    {step === 3.75 && renderStep3_75()}
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
