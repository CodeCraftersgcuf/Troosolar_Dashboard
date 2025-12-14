import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Home, Building2, Factory, ArrowRight, ArrowLeft, Zap, Wrench, FileText, CheckCircle, Battery, Sun, Monitor, Upload, CreditCard, Camera, Clock, Download, AlertCircle, Calendar, Loader, CheckCircle2, XCircle, X } from 'lucide-react';
import LoanCalculator from '../../Component/LoanCalculator';
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

// Mono Connect integration
const ensureMono = () =>
    new Promise((resolve, reject) => {
        // Check if already loaded
        if (window.MonoConnect) {
            console.log("Mono Connect already loaded");
            return resolve();
        }
        
        // Check if script is already in the page (from HTML head or previous load)
        const existingScript = document.querySelector('script[src*="connect.withmono.com"]');
        if (existingScript) {
            console.log("Mono Connect script found in page, waiting for class...");
            // Wait for MonoConnect to become available (polling)
            const checkInterval = setInterval(() => {
                if (window.MonoConnect) {
                    clearInterval(checkInterval);
                    console.log("MonoConnect class is now available");
                    resolve();
                }
            }, 100);
            
            // Timeout after 10 seconds
            setTimeout(() => {
                clearInterval(checkInterval);
                if (!window.MonoConnect) {
                    console.error("MonoConnect not available after waiting. Window keys:", Object.keys(window).filter(k => k.toLowerCase().includes('mono')));
                    reject(new Error("Mono Connect script is loaded but MonoConnect class is not available. Please refresh the page."));
                }
            }, 10000);
            return;
        }
        
        // Create and load script
        const s = document.createElement("script");
        s.src = "https://connect.withmono.com/connect.js";
        s.async = false; // Load synchronously to ensure it's available
        s.type = "text/javascript";
        s.crossOrigin = "anonymous"; // Handle CORS if needed
        
        // Poll for MonoConnect availability after script loads
        const checkForMonoConnect = () => {
            const maxAttempts = 100; // 10 seconds max (100 * 100ms)
            let attempts = 0;
            
            const checkInterval = setInterval(() => {
                attempts++;
                // Check for both MonoConnect and window.MonoConnect
                if (window.MonoConnect || window.Mono) {
                    clearInterval(checkInterval);
                    console.log("Mono Connect script loaded and MonoConnect class available");
                    resolve();
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    console.error("Window object after script load:", Object.keys(window).filter(k => k.toLowerCase().includes('mono')));
                    reject(new Error("Mono Connect script loaded but MonoConnect class is not available. The script may have failed to initialize. Please check the browser console for errors."));
                }
            }, 100); // Check every 100ms
        };
        
        s.onload = () => {
            console.log("Mono Connect script loaded, waiting for MonoConnect class...");
            console.log("Checking window object:", window.MonoConnect, window.Mono);
            // Start checking immediately
            checkForMonoConnect();
        };
        
        s.onerror = (error) => {
            console.error("Script load error:", error);
            reject(new Error("Failed to load Mono Connect script. Please check your internet connection and try again."));
        };
        
        // Set overall timeout to prevent hanging
        const timeoutId = setTimeout(() => {
            if (!window.MonoConnect && !window.Mono) {
                console.error("Timeout: Window object keys:", Object.keys(window).filter(k => k.toLowerCase().includes('mono')));
                reject(new Error("Mono Connect script loading timeout. Please refresh and try again."));
            }
        }, 15000); // 15 second timeout
        
        // Clear timeout on success
        const originalResolve = resolve;
        resolve = () => {
            clearTimeout(timeoutId);
            originalResolve();
        };
        
        document.head.appendChild(s); // Append to head instead of body
    });

const BNPLFlow = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [customerTypes, setCustomerTypes] = useState([]);
    const [auditTypes, setAuditTypes] = useState([]);
    const [loanConfig, setLoanConfig] = useState(null);
    const [addOns, setAddOns] = useState([]);
    const [states, setStates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [applicationId, setApplicationId] = useState(null);
    const [applicationStatus, setApplicationStatus] = useState('pending');
    const [guarantorId, setGuarantorId] = useState(null);
    const [invoiceData, setInvoiceData] = useState(null);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [paymentResult, setPaymentResult] = useState(null); // 'success' | 'failed' | null
    const [showCreditCheckFeeModal, setShowCreditCheckFeeModal] = useState(false);
    const [processingCreditCheckPayment, setProcessingCreditCheckPayment] = useState(false);
    const [monoConnectInstance, setMonoConnectInstance] = useState(null);
    const [auditOrderId, setAuditOrderId] = useState(null);
    const [auditCalendarSlots, setAuditCalendarSlots] = useState([]);
    const [selectedAuditSlot, setSelectedAuditSlot] = useState(null);
    
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
        address: '',
        state: '',
        stateId: null,
        houseNo: '',
        landmark: '',
        floors: '',
        rooms: '',
        selectedProductPrice: 0,
        selectedBundleId: null, // OLD: Single bundle ID (kept for backward compatibility)
        selectedBundle: null, // OLD: Single bundle object (kept for backward compatibility)
        selectedProductId: null, // OLD: Single product ID (kept for backward compatibility)
        selectedProduct: null, // OLD: Single product object (kept for backward compatibility)
        selectedBundles: [], // NEW: Array of selected bundles [{id, bundle, price}, ...]
        selectedProducts: [], // NEW: Array of selected products [{id, product, price}, ...]
        loanDetails: null,
        creditCheckMethod: '', // 'auto', 'manual'
        creditScore: null, // Credit score from Mono (0-100)
        creditReport: null, // Full credit report from Mono
        bvn: '',
        fullName: '',
        email: '',
        phone: '',
        socialMedia: '',
        isGatedEstate: false,
        estateName: '',
        estateAddress: '',
        bankStatement: null,
        livePhoto: null,
        auditRequestId: null, // Store audit request ID after submission
        streetName: '', // Street name for property address
    });

    // Categories and products for individual components
    const [categories, setCategories] = useState([]);
    const [categoryProducts, setCategoryProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);

    // Bundles for selection
    const [bundles, setBundles] = useState([]);
    const [bundlesLoading, setBundlesLoading] = useState(false);

    // Map predefined category groups to API category IDs
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

    // --- Effects ---
    
    // Auto-select automatic credit check method when step 10 is reached
    React.useEffect(() => {
        if (step === 10 && !formData.creditCheckMethod) {
            setFormData(prev => ({ ...prev, creditCheckMethod: 'auto' }));
        }
    }, [step]);
    
    // Check for custom order flow (cart token) or existing application on mount
    React.useEffect(() => {
        const token = searchParams.get('token');
        const type = searchParams.get('type');
        const applicationIdParam = searchParams.get('applicationId');
        
        if (token && (type === 'buy_now' || type === 'bnpl')) {
            setCartToken(token);
            setCartOrderType(type);
            verifyCartAccess(token);
        }
        
        // If applicationId is provided, load existing application and show summary/invoice
        if (applicationIdParam) {
            loadExistingApplication(Number(applicationIdParam));
        }
    }, [searchParams]);
    
    // Load existing application data
    const loadExistingApplication = async (appId) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                alert("Please login to continue");
                navigate('/login');
                return;
            }
            
            const response = await axios.get(API.BNPL_STATUS(appId), {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json'
                }
            });
            
            if (response.data.status === 'success' && response.data.data) {
                const app = response.data.data;
                
                // Set application ID
                setApplicationId(app.id);
                setApplicationStatus(app.status);
                
                // Populate form data from application
                setFormData(prev => ({
                    ...prev,
                    customerType: app.customer_type || prev.customerType,
                    productCategory: app.product_category || prev.productCategory,
                    state: app.property_state || prev.state,
                    address: app.property_address || prev.address,
                    houseNo: app.property_house_no || prev.houseNo,
                    streetName: app.property_street_name || prev.streetName,
                    landmark: app.property_landmark || prev.landmark,
                    floors: app.property_floors || prev.floors,
                    rooms: app.property_rooms || prev.rooms,
                    isGatedEstate: app.is_gated_estate || prev.isGatedEstate,
                    estateName: app.estate_name || prev.estateName,
                    estateAddress: app.estate_address || prev.estateAddress,
                    creditCheckMethod: app.credit_check_method || prev.creditCheckMethod,
                    fullName: app.full_name || prev.fullName,
                    email: app.email || prev.email,
                    phone: app.phone || prev.phone,
                    socialMedia: app.social_media_handle || prev.socialMedia,
                    selectedProductPrice: parseFloat((app.loan_amount || '0').replace(/,/g, '')) || prev.selectedProductPrice,
                    auditRequestId: app.audit_request_id || prev.auditRequestId
                }));
                
                // Set loan details if available
                if (app.loan_calculation) {
                    setFormData(prev => ({
                        ...prev,
                        loanDetails: {
                            depositAmount: parseFloat((app.loan_calculation.down_payment || '0').replace(/,/g, '')),
                            principal: parseFloat((app.loan_calculation.loan_amount || '0').replace(/,/g, '')),
                            totalInterest: parseFloat((app.loan_calculation.total_amount || '0').replace(/,/g, '')) - parseFloat((app.loan_calculation.loan_amount || '0').replace(/,/g, '')),
                            monthlyRepayment: parseFloat((app.loan_calculation.monthly_repayment || '0').replace(/,/g, '')),
                            totalRepayment: parseFloat((app.loan_calculation.total_amount || '0').replace(/,/g, '')),
                            duration: app.repayment_duration || 12,
                            interestRate: app.loan_calculation.interest_rate || 4.0
                        }
                    }));
                }
                
                // If approved, go directly to summary/invoice/payment flow
                if (app.status === 'approved') {
                    // Navigate to invoice (step 21) which shows summary, invoice, and upfront payment
                    setStep(21);
                } else {
                    // For other statuses, show application status
                    setStep(12);
                }
            } else {
                alert('Application not found');
                navigate('/bnpl-credit-check');
            }
        } catch (error) {
            console.error('Error loading application:', error);
            alert(error.response?.data?.message || 'Failed to load application');
            navigate('/bnpl-credit-check');
        } finally {
            setLoading(false);
        }
    };

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
                    const returnUrl = `/bnpl?token=${token}&type=${cartOrderType || 'bnpl'}`;
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
                                price: Number(item.unit_price || item.itemable.discount_price || item.itemable.price || 0)
                            });
                        } else if (item.itemable_type === 'App\\Models\\Bundle' && item.itemable) {
                            bundles.push({
                                id: item.itemable_id,
                                bundle: item.itemable,
                                price: Number(item.unit_price || item.itemable.discount_price || item.itemable.total_price || 0)
                            });
                        }
                    });
                    
                    if (products.length > 0 || bundles.length > 0) {
                        const totalPrice = [...products, ...bundles].reduce((sum, item) => sum + item.price, 0);
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

    React.useEffect(() => {
        const fetchConfig = async () => {
            try {
                const [custRes, auditRes, loanConfigRes, addOnsRes, statesRes, categoriesRes] = await Promise.all([
                    axios.get(API.CONFIG_CUSTOMER_TYPES).catch(() => ({ data: { status: 'error' }, status: 404 })),
                    axios.get(API.CONFIG_AUDIT_TYPES).catch(() => ({ data: { status: 'error' }, status: 404 })),
                    axios.get(API.CONFIG_LOAN_CONFIGURATION).catch(() => ({ data: { status: 'error' }, status: 404 })),
                    axios.get(API.CONFIG_ADD_ONS, { params: { type: 'bnpl' } }).catch(() => ({ data: { status: 'error' }, status: 404 })),
                    axios.get(API.CONFIG_STATES).catch(() => ({ data: { status: 'error' }, status: 404 })),
                    axios.get(API.CATEGORIES, {
                        headers: {
                            Accept: 'application/json',
                            ...(localStorage.getItem('access_token') ? { Authorization: `Bearer ${localStorage.getItem('access_token')}` } : {}),
                        },
                    }).catch(() => ({ data: { status: 'error' }, status: 404 }))
                ]);
                
                // Only set data if API call was successful (not 404)
                if (custRes.status !== 404 && custRes.data?.status === 'success') {
                    setCustomerTypes(custRes.data.data);
                }
                if (auditRes.status !== 404 && auditRes.data?.status === 'success') {
                    setAuditTypes(auditRes.data.data);
                }
                if (loanConfigRes.status !== 404 && loanConfigRes.data?.status === 'success') {
                    setLoanConfig(loanConfigRes.data.data);
                }
                if (addOnsRes.status !== 404 && addOnsRes.data?.status === 'success') {
                    setAddOns(addOnsRes.data.data || []);
                }
                if (statesRes.status !== 404 && statesRes.data?.status === 'success') {
                    setStates(statesRes.data.data || []);
                }
                if (categoriesRes.status !== 404 && categoriesRes.data?.data) {
                    setCategories(Array.isArray(categoriesRes.data.data) ? categoriesRes.data.data : []);
                }
            } catch (error) {
                // Silently fail - APIs may not be implemented yet
                console.log("Configuration APIs not available yet:", error.message);
            }
            
            // Fallback to defaults if APIs fail or return 404
            if (customerTypes.length === 0) {
                setCustomerTypes([
                    { id: 'residential', label: 'For Residential' },
                    { id: 'sme', label: 'For SMEs' },
                    { id: 'commercial', label: 'Commercial & Industrial' }
                ]);
            }
            if (auditTypes.length === 0) {
                setAuditTypes([
                    { id: 'home-office', label: 'Home / Office' },
                    { id: 'commercial', label: 'Commercial / Industrial' }
                ]);
            }
        };
        fetchConfig();
    }, []);

    // --- Handlers ---

    const handleCustomerTypeSelect = (type) => {
        setFormData({ ...formData, customerType: type });
        setStep(2); // Go to Product Category
    };

    const handleCategorySelect = async (groupType) => {
        // groupType can be: 'full-kit', 'inverter-battery', 'battery-only', 'inverter-only', 'panels-only'
        setFormData({ ...formData, productCategory: groupType });

        // For full-kit and inverter-battery, go to Method Selection (Step 3)
        if (groupType === 'full-kit' || groupType === 'inverter-battery') {
            setStep(3); // Method Selection (Choose/Build/Audit)
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

    const handleOptionSelect = async (option) => {
        setFormData({ ...formData, optionType: option });
        if (option === 'audit') {
            setStep(4); // Audit Type Selection
        } else if (option === 'choose-system') {
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
        }
    };

    const handleAuditTypeSelect = (type) => {
        setFormData({ ...formData, auditType: type });
        if (type === 'commercial') {
            setStep(6); // Commercial Notification
        } else {
            setStep(5); // Home/Office Details Form
        }
    };

    const handleAddressSubmit = async (e) => {
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
                setFormData(prev => ({ ...prev, auditRequestId }));
                
                // For commercial audits, show notification and wait for admin approval
                if (formData.auditType === 'commercial') {
                    setStep(6); // Commercial Notification
                } else {
                    // For home-office audits, proceed to order summary
        setStep(6.5); // Order Summary (for audit) before invoice
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

    const handleLoanConfirm = (loanDetails) => {
        setFormData({ ...formData, loanDetails });
        setStep(9); // Customer decides to proceed (NEW STEP)
    };

    const handleBundleSelect = (bundle) => {
        const price = Number(bundle.discount_price || bundle.total_price || 0);
        setFormData(prev => {
            // Check if bundle is already selected
            const isSelected = prev.selectedBundles.some(b => b.id === bundle.id);
            
            let updatedBundles;
            if (isSelected) {
                // Remove bundle if already selected
                updatedBundles = prev.selectedBundles.filter(b => b.id !== bundle.id);
            } else {
                // Add bundle if not selected
                updatedBundles = [...prev.selectedBundles, {
                    id: bundle.id,
                    bundle: bundle,
                    price: price
                }];
            }
            
            // Calculate total price from all selected bundles and products
            const bundlesTotal = updatedBundles.reduce((sum, b) => sum + b.price, 0);
            const productsTotal = prev.selectedProducts.reduce((sum, p) => sum + p.price, 0);
            const totalPrice = bundlesTotal + productsTotal;
            
            return {
                ...prev,
                selectedBundles: updatedBundles,
                // Keep old fields for backward compatibility (use first selected if any)
                selectedBundleId: updatedBundles.length > 0 ? updatedBundles[0].id : null,
                selectedBundle: updatedBundles.length > 0 ? updatedBundles[0].bundle : null,
                selectedProductPrice: totalPrice
            };
        });
        // Don't auto-navigate - let user select multiple items
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
                    price: price
                }];
            }
            
            // Calculate total price from all selected bundles and products
            const bundlesTotal = prev.selectedBundles.reduce((sum, b) => sum + b.price, 0);
            const productsTotal = updatedProducts.reduce((sum, p) => sum + p.price, 0);
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

    // --- Render Steps ---

    const renderStep1 = () => (
        <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-8 text-[#273e8e]">
                Who are you purchasing for?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {(customerTypes.length > 0 ? customerTypes : [
                    { id: 'residential', label: 'For Residential' },
                    { id: 'sme', label: 'For SMEs' },
                    { id: 'commercial', label: 'Commercial & Industrial' }
                ]).map((type) => (
                    <button
                        key={type.id}
                        onClick={() => handleCustomerTypeSelect(type.id)}
                        className="group bg-white border-2 border-gray-100 hover:border-[#273e8e] rounded-2xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center"
                    >
                        <div className="bg-blue-50 p-6 rounded-full mb-6 group-hover:bg-[#273e8e]/10 transition-colors">
                            {type.id === 'residential' && <Home size={40} className="text-[#273e8e]" />}
                            {type.id === 'sme' && <Building2 size={40} className="text-[#273e8e]" />}
                            {type.id === 'commercial' && <Factory size={40} className="text-[#273e8e]" />}
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-gray-800">{type.label}</h3>
                    </button>
                ))}
            </div>
        </div>
    );

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
                <button onClick={() => setStep(1)} className="mb-6 flex items-center text-gray-500 hover:text-emerald-600">
                <ArrowLeft size={16} className="mr-2" /> Back
            </button>
                {/* BNPL Badge */}
                <div className="flex justify-center mb-4">
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md">
                        <CreditCard size={16} className="mr-2" />
                        Buy Now Pay Later
                    </span>
                </div>
            <h2 className="text-3xl font-bold text-center mb-8 text-[#273e8e]">
                Select Product Category
            </h2>
                {categories.length === 0 ? (
                    <div className="text-center py-12">
                        <Loader className="animate-spin mx-auto text-emerald-600" size={48} />
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
                                    className="group bg-white border-2 border-gray-100 hover:border-emerald-500 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden"
                    >
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-600"></div>
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-full mb-4 group-hover:from-green-100 group-hover:to-emerald-100 transition-colors flex items-center justify-center min-h-[64px]">
                                        <IconComponent size={32} className="text-emerald-600" />
                        </div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-1">{group.name}</h3>
                                    {group.subtitle && (
                                        <p className="text-sm text-gray-500 italic">{group.subtitle}</p>
                                    )}
                                    {matchingCategoryIds.length > 0 && (
                                        <p className="text-xs text-gray-400 mt-2">
                                            {matchingCategoryIds.length} categor{matchingCategoryIds.length > 1 ? 'ies' : 'y'} available
                                        </p>
                                    )}
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
                                    <div className="aspect-square w-full mb-4 rounded-lg overflow-hidden bg-gray-100 relative">
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
                                    <button
                                        onClick={() => handleProductSelect(product)}
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
                                onClick={() => setStep(6.5)}
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
                                    <button
                                        onClick={() => handleProductSelect(product)}
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
                                onClick={() => setStep(6.5)}
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

    const renderStep3 = () => (
        <div className="animate-fade-in">
            <button onClick={() => setStep(2)} className="mb-6 flex items-center text-gray-500 hover:text-emerald-600">
                <ArrowLeft size={16} className="mr-2" /> Back
            </button>
            {/* BNPL Badge */}
            <div className="flex justify-center mb-4">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md">
                    <CreditCard size={16} className="mr-2" />
                    Buy Now Pay Later
                </span>
            </div>
            <h2 className="text-3xl font-bold text-center mb-8 text-[#273e8e]">
                How would you like to proceed?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                <button onClick={() => handleOptionSelect('choose-system')} className="group bg-white border-2 border-gray-100 hover:border-emerald-500 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-600"></div>
                    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-full mb-6 group-hover:from-yellow-100 group-hover:to-amber-100 transition-colors">
                        <Zap size={40} className="text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Choose my solar system</h3>
                </button>
                <button onClick={() => handleOptionSelect('build-system')} className="group bg-white border-2 border-gray-100 hover:border-emerald-500 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-600"></div>
                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-full mb-6 group-hover:from-purple-100 group-hover:to-violet-100 transition-colors">
                        <Wrench size={40} className="text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Build My System</h3>
                </button>
                <button onClick={() => handleOptionSelect('audit')} className="group bg-white border-2 border-gray-100 hover:border-emerald-500 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-600"></div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-full mb-6 group-hover:from-green-100 group-hover:to-emerald-100 transition-colors">
                        <FileText size={40} className="text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Request Professional Audit</h3>
                </button>
            </div>
        </div>
    );

    const renderStep3_5 = () => {
        const formatPrice = (price) => {
            return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(price);
        };

        const getBundleImage = (bundle) => {
            if (bundle.featured_image) {
                return toAbsolute(bundle.featured_image);
            }
            // Return a data URI SVG placeholder instead of a file path to prevent infinite loops
            return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f3f4f6" width="400" height="400"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
        };

        return (
            <div className="animate-fade-in">
                <button 
                    onClick={() => {
                        // Clear bundles when going back
                        setBundles([]);
                        setBundlesLoading(false);
                        setStep(3);
                    }} 
                    className="mb-6 flex items-center text-gray-500 hover:text-[#273e8e]"
                >
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
                        <p className="text-gray-600">No bundles available at the moment.</p>
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
                        {bundles.map((bundle) => {
                            const price = Number(bundle.discount_price || bundle.total_price || 0);
                            const oldPrice = bundle.discount_price && bundle.total_price && bundle.discount_price < bundle.total_price 
                                ? Number(bundle.total_price) 
                                : null;
                            const discount = oldPrice && price < oldPrice
                                ? Math.round(((oldPrice - price) / oldPrice) * 100)
                                : 0;
                            
                            // Check if bundle is selected
                            const isSelected = formData.selectedBundles.some(b => b.id === bundle.id);
                            
                            return (
                                <div
                                    key={bundle.id}
                                    className={`group bg-white border-2 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 ${
                                        isSelected 
                                            ? 'border-[#273e8e] bg-blue-50 ring-2 ring-[#273e8e]' 
                                            : 'border-gray-100 hover:border-[#273e8e]'
                                    }`}
                                >
                                    <div className="block">
                                        <div className="aspect-square w-full mb-4 rounded-lg overflow-hidden bg-gray-100 relative">
                                            <img
                                                src={getBundleImage(bundle)}
                                                alt={bundle.title || bundle.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => {
                                                    // Prevent infinite loop - only set placeholder if not already set
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
                                        <h3 className="font-bold text-lg mb-2 text-gray-800 group-hover:text-[#273e8e] transition-colors">
                                            {bundle.title || bundle.name || `Bundle #${bundle.id}`}
                                        </h3>
                                        {bundle.bundle_type && (
                                            <p className="text-sm text-gray-500 mb-2">{bundle.bundle_type}</p>
                                        )}
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
                                        onClick={() => handleBundleSelect(bundle)}
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
                    
                    {/* Continue Button - Show when at least one bundle is selected */}
                    {formData.selectedBundles.length > 0 && (
                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={() => setStep(6.5)}
                                className="bg-[#273e8e] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#1a2b6b] transition-colors flex items-center"
                            >
                                Continue with {formData.selectedBundles.length} {formData.selectedBundles.length !== 1 ? 'Items' : 'Item'} Selected
                                <ArrowRight size={20} className="ml-2" />
                            </button>
                        </div>
                    )}
                    </>
                )}
            </div>
        );
    };

    const renderStep4 = () => (
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

    const renderStep5 = () => (
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
            <form onSubmit={handleAddressSubmit} className="space-y-4">
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
                {(!formData.state || !formData.houseNo || !formData.streetName || !formData.floors || !formData.rooms) && (
                    <p className="text-sm text-red-600 text-center">
                        Please fill in all required fields (State, House No, Street Name, Floors, and Rooms)
                    </p>
                )}
                {formData.isGatedEstate && (!formData.estateName || !formData.estateAddress) && (
                    <p className="text-sm text-red-600 text-center">
                        Please fill in Estate Name and Estate Address
                    </p>
                )}
            </form>
        </div>
    );

    const renderStep6 = () => (
        <div className="animate-fade-in max-w-3xl mx-auto text-center">
            <div className="bg-yellow-50 border border-yellow-200 p-8 rounded-2xl">
                <AlertCircle size={64} className="text-yellow-600 mx-auto mb-6" />
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Commercial Audit Request Submitted</h2>
                <p className="text-gray-600 mb-4">
                    Your commercial audit request has been submitted successfully (Request ID: #{formData.auditRequestId}).
                </p>
                <p className="text-gray-600 mb-6">
                    Our team will contact you within 24 - 48 hours to discuss your energy audit.
                </p>
                <div className="space-y-3">
                    <button 
                        onClick={() => navigate('/')} 
                        className="w-full bg-[#273e8e] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#1a2b6b] transition-colors"
                    >
                    Return to Dashboard
                </button>
                    <button 
                        onClick={async () => {
                            // Check audit request status
                            if (!formData.auditRequestId) return;
                            try {
                                const token = localStorage.getItem('access_token');
                                const response = await axios.get(API.AUDIT_REQUEST_BY_ID(formData.auditRequestId), {
                                    headers: { Authorization: `Bearer ${token}` }
                                });
                                
                                if (response.data.status === 'success') {
                                    const status = response.data.data.status;
                                    if (status === 'approved') {
                                        // Proceed to order summary if approved
                                        setStep(6.5);
                                    } else {
                                        alert(`Your audit request is currently ${status}. Please wait for admin approval.`);
                                    }
                                }
                            } catch (error) {
                                console.error("Failed to check audit status:", error);
                                alert("Failed to check audit request status. Please try again later.");
                            }
                        }}
                        className="w-full border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                    >
                        Check Approval Status
                    </button>
                </div>
            </div>
        </div>
    );

    const renderStep6_5 = () => {
        // Calculate total amount for order summary
        // NEW: Calculate from all selected bundles and products
        const bundlesTotal = formData.selectedBundles.reduce((sum, b) => sum + b.price, 0);
        const productsTotal = formData.selectedProducts.reduce((sum, p) => sum + p.price, 0);
        const itemsSubtotal = bundlesTotal + productsTotal;
        
        // Use itemsSubtotal if available, otherwise fallback to selectedProductPrice (for backward compatibility)
        const basePrice = itemsSubtotal > 0 ? itemsSubtotal : formData.selectedProductPrice;
        
        const insuranceAddOn = addOns.find(a => a.is_compulsory_bnpl);
        const insuranceFee = insuranceAddOn && insuranceAddOn.calculation_type === 'percentage'
            ? (basePrice * insuranceAddOn.calculation_value) / 100
            : (insuranceAddOn?.price || basePrice * 0.005);
        
        const materialCost = 50000;
        const installationFee = 50000;
        const deliveryFee = 25000;
        const inspectionFee = 10000;
        const totalAmount = basePrice + insuranceFee + materialCost + installationFee + deliveryFee + inspectionFee;

        const formatPrice = (price) => {
            return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(price);
        };

        return (
            <div className="animate-fade-in max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <button onClick={() => setStep(formData.optionType === 'audit' ? 5 : (formData.optionType === 'choose-system' ? 3.5 : (formData.optionType ? 3 : 2)))} className="mb-6 flex items-center text-gray-500 hover:text-[#273e8e]">
                    <ArrowLeft size={16} className="mr-2" /> Back
                </button>
                <h2 className="text-2xl font-bold mb-6 text-[#273e8e] border-b pb-4">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                    {/* NEW: Show all selected bundles */}
                    {formData.selectedBundles.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="font-semibold text-gray-700 mb-2">Selected Bundles ({formData.selectedBundles.length})</h3>
                            {formData.selectedBundles.map((selectedBundle) => (
                                <div key={selectedBundle.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center">
                                        <div className="bg-gray-100 p-2 rounded-lg mr-4">
                                            <Sun size={20} className="text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">
                                                {selectedBundle.bundle.title || selectedBundle.bundle.name || `Bundle #${selectedBundle.id}`}
                                            </p>
                                            <p className="text-sm text-gray-500">Solar System Bundle</p>
                                        </div>
                                    </div>
                                    <span className="font-bold">₦{Number(selectedBundle.price || 0).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {/* NEW: Show all selected products */}
                    {formData.selectedProducts.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="font-semibold text-gray-700 mb-2">Selected Products ({formData.selectedProducts.length})</h3>
                            {formData.selectedProducts.map((selectedProduct) => (
                                <div key={selectedProduct.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center">
                                        <div className="bg-gray-100 p-2 rounded-lg mr-4">
                                            <Battery size={20} className="text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">
                                                {selectedProduct.product.title || selectedProduct.product.name || `Product #${selectedProduct.id}`}
                                            </p>
                                            <p className="text-sm text-gray-500">Individual Component</p>
                                        </div>
                                    </div>
                                    <span className="font-bold">₦{Number(selectedProduct.price || 0).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {/* OLD: Show single bundle/product (for backward compatibility) */}
                    {formData.selectedBundles.length === 0 && formData.selectedProducts.length === 0 && (
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <div className="bg-gray-100 p-2 rounded-lg mr-4">
                                <Sun size={24} className="text-gray-600" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-800">
                                        {formData.optionType === 'audit' ? 'Professional Energy Audit' : 
                                         formData.selectedBundle ? (formData.selectedBundle.title || 'Solar System Bundle') :
                                         formData.selectedProduct ? (formData.selectedProduct.title || formData.selectedProduct.name || 'Product') :
                                         'Solar System Bundle'}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {formData.optionType === 'audit' 
                                        ? 'Home/Office Audit Service' 
                                        : 'Inverter + Batteries + Panels'}
                                </p>
                            </div>
                        </div>
                            <span className="font-bold">₦{Number(basePrice || 0).toLocaleString()}</span>
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

                    {formData.optionType !== 'audit' && (formData.selectedBundles.length > 0 || formData.selectedProducts.length === 0) && (
                        <>
                            <div className="text-sm text-gray-600 pl-14 space-y-1">
                                <p><strong>Quantity:</strong> {formData.selectedBundles.length + formData.selectedProducts.length} item{formData.selectedBundles.length + formData.selectedProducts.length > 1 ? 's' : ''}</p>
                                {formData.selectedBundles.length > 0 && (
                                    <>
                                <p><strong>Appliances:</strong> Standard household appliances</p>
                                <p><strong>Backup Time:</strong> 8-12 hours (depending on usage)</p>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                    <p className="text-sm text-blue-700">
                        <strong>Note:</strong> This is a summary of your order. Detailed invoice with all fees will be shown after loan calculation.
                    </p>
                </div>

                <button
                    onClick={() => {
                        if (formData.optionType === 'audit') {
                            setStep(7); // Go to Audit Invoice
                        } else {
                            // Check minimum order value (N1.5m) before proceeding to invoice
                            const minOrderValue = 1500000;
                            if (totalAmount < minOrderValue) {
                                alert(`Your order total (₦${totalAmount.toLocaleString()}) does not meet the minimum ₦1,500,000 amount required for credit financing. To qualify for Buy Now, Pay Later, please add more items to your cart. Thank you.`);
                                return;
                            }
                            setStep(6.75); // Go to Invoice (before loan calculator)
                        }
                    }}
                    className="w-full bg-[#273e8e] text-white py-4 rounded-xl font-bold hover:bg-[#1a2b6b] transition-colors"
                >
                    {formData.optionType === 'audit' ? 'Proceed to Invoice' : 'Proceed to Invoice'}
                </button>
            </div>
        );
    };

    const handleUpfrontDepositPayment = async () => {
        if (!applicationId || !formData.loanDetails) {
            alert("Application details missing. Please try again.");
            return;
        }

        const depositAmount = formData.loanDetails.depositAmount;
        if (!depositAmount || depositAmount <= 0) {
            alert("Invalid deposit amount. Please contact support.");
            return;
        }

        setProcessingPayment(true);
        try {
            await ensureFlutterwave();

            const txRef = "deposit_" + applicationId + "_" + Date.now();
            const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
            const userEmail = userInfo.email || 'customer@troosolar.com';
            const userName = userInfo.name || userInfo.full_name || 'Customer';

            window.FlutterwaveCheckout({
                public_key: "FLWPUBK_TEST-dd1514f7562b1d623c4e63fb58b6aedb-X", // TODO: Move to env variable
                tx_ref: txRef,
                amount: depositAmount,
                currency: "NGN",
                payment_options: "card,ussd,banktransfer",
                customer: {
                    email: userEmail,
                    name: userName,
                },
                callback: async (response) => {
                    if (response?.status === "successful") {
                        try {
                            const token = localStorage.getItem('access_token');
                            // Confirm deposit payment
                            const confirmed = await confirmDepositPayment(
                                applicationId,
                                response.transaction_id,
                                depositAmount
                            );
                            
                            if (confirmed) {
                                setPaymentResult('success');
                                alert("Upfront deposit payment successful! Your application will proceed to the next step.");
                                // Navigate back to credit check status
                                navigate('/bnpl-credit-check');
                            } else {
                                alert("Payment verification failed. Please contact support if amount was debited.");
                                setPaymentResult('failed');
                            }
                        } catch (error) {
                            console.error("Payment confirmation error:", error);
                            alert("Payment successful but confirmation failed. Please contact support.");
                            setPaymentResult('failed');
                        }
                    } else {
                        setPaymentResult('failed');
                        alert("Payment was not successful. Please try again.");
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

    const confirmDepositPayment = async (applicationId, txId, amount) => {
        const token = localStorage.getItem('access_token');
        if (!token) return false;
        try {
            const { data } = await axios.post(
                API.Payment_Confirmation,
                {
                    amount: String(amount),
                    orderId: Number(applicationId),
                    txId: String(txId || ""),
                    type: "bnpl_deposit",
                    application_id: applicationId
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

    const confirmAuditPayment = async (orderId, txId, amount) => {
        const token = localStorage.getItem('access_token');
        if (!token) return false;
        try {
            const { data } = await axios.post(
                API.Payment_Confirmation,
                {
                    amount: String(amount),
                    orderId: Number(orderId),
                    txId: String(txId || ""),
                    type: "audit",
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

    const handleAuditPayment = async () => {
        const auditFee = 50000;
        setProcessingPayment(true);
        try {
            await ensureFlutterwave();

            const txRef = "audit_" + Date.now();
            const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
            const userEmail = userInfo.email || 'customer@troosolar.com';
            const userName = userInfo.name || userInfo.full_name || 'Customer';

            window.FlutterwaveCheckout({
                public_key: "FLWPUBK_TEST-dd1514f7562b1d623c4e63fb58b6aedb-X", // TODO: Move to env variable
                tx_ref: txRef,
                amount: auditFee,
                currency: "NGN",
                payment_options: "card,ussd,banktransfer",
                customer: {
                    email: userEmail,
                    name: userName,
                },
                callback: async (response) => {
                    if (response?.status === "successful") {
                        // Create audit order and confirm payment
                        try {
                            const token = localStorage.getItem('access_token');
                            // Create audit order with audit_request_id and property details
                            // Backend will generate invoice based on location, address, floors, and rooms
                            const checkoutPayload = {
                                    customer_type: formData.customerType,
                                    product_category: 'audit',
                                amount: auditFee, // Base amount, backend may adjust based on property details
                                    audit_type: formData.auditType,
                            };
                            
                            // Include audit_request_id if available (links order to audit request)
                            if (formData.auditRequestId) {
                                checkoutPayload.audit_request_id = formData.auditRequestId;
                            }
                            
                            // Include property details for invoice generation
                            // Backend will use these to calculate final invoice amount
                            if (formData.state) checkoutPayload.property_state = formData.state;
                            if (formData.address || (formData.houseNo && formData.streetName)) {
                                const fullAddress = [
                                    formData.houseNo,
                                    formData.streetName,
                                    formData.landmark
                                ].filter(Boolean).join(', ');
                                checkoutPayload.property_address = fullAddress || formData.address;
                            }
                            if (formData.floors) checkoutPayload.property_floors = Number(formData.floors);
                            if (formData.rooms) checkoutPayload.property_rooms = Number(formData.rooms);
                            
                            const orderResponse = await axios.post(
                                API.BUY_NOW_CHECKOUT,
                                checkoutPayload,
                                {
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                        'Content-Type': 'application/json',
                                        Accept: 'application/json'
                                    }
                                }
                            );

                            if (orderResponse.data.status === 'success') {
                                const orderId = orderResponse.data.data.order_id;
                                setAuditOrderId(orderId);
                                
                                const confirmed = await confirmAuditPayment(
                                    orderId,
                                    response.transaction_id,
                                    auditFee
                                );
                                
                                if (confirmed) {
                                    setPaymentResult('success');
                                    // Fetch calendar slots for audit (48 hours after payment confirmation)
                                    // Backend will filter to show only slots 48 hours after payment_date
                                    const paymentConfirmationDate = new Date().toISOString().split('T')[0];
                                    await fetchAuditCalendarSlots(paymentConfirmationDate);
                                    setStep(7.5); // Go to calendar selection step
                                } else {
                                    alert("Payment verification failed. Please contact support if amount was debited.");
                                    setPaymentResult('failed');
                                }
                            } else {
                                alert("Failed to create audit order. Please contact support.");
                                setPaymentResult('failed');
                            }
                        } catch (error) {
                            console.error("Order creation error:", error);
                            alert("Payment successful but failed to create order. Please contact support.");
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

    const fetchAuditCalendarSlots = async (paymentDate = null) => {
        try {
            const token = localStorage.getItem('access_token');
            // Use payment confirmation date (current date when payment is confirmed)
            // Backend will filter to show only slots 48 hours after this date
            const date = paymentDate || new Date().toISOString().split('T')[0];
            const response = await axios.get(`${API.CALENDAR_SLOTS}?type=audit&payment_date=${date}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.status === 'success') {
                setAuditCalendarSlots(response.data.data.slots || []);
            }
        } catch (error) {
            console.error("Calendar Error:", error);
            // Set empty slots if API fails
            setAuditCalendarSlots([]);
        }
    };

    const renderStep6_75 = () => {
        // Calculate total amount for invoice
        // Calculate from all selected bundles and products
        const bundlesTotal = formData.selectedBundles.reduce((sum, b) => sum + b.price, 0);
        const productsTotal = formData.selectedProducts.reduce((sum, p) => sum + p.price, 0);
        const itemsSubtotal = bundlesTotal + productsTotal;
        
        // Use itemsSubtotal if available, otherwise fallback to selectedProductPrice (for backward compatibility)
        const basePrice = itemsSubtotal > 0 ? itemsSubtotal : formData.selectedProductPrice;
        
        const insuranceAddOn = addOns.find(a => a.is_compulsory_bnpl);
        const insuranceFee = insuranceAddOn && insuranceAddOn.calculation_type === 'percentage'
            ? (basePrice * insuranceAddOn.calculation_value) / 100
            : (insuranceAddOn?.price || basePrice * 0.005);
        
        const materialCost = 50000;
        const installationFee = 50000;
        const deliveryFee = 25000;
        const inspectionFee = 10000;
        const totalAmount = basePrice + insuranceFee + materialCost + installationFee + deliveryFee + inspectionFee;

        const formatPrice = (price) => {
            return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(price);
        };

        return (
            <div className="animate-fade-in max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <button onClick={() => setStep(6.5)} className="mb-6 flex items-center text-gray-500 hover:text-[#273e8e]">
                    <ArrowLeft size={16} className="mr-2" /> Back
                </button>
                <h2 className="text-2xl font-bold mb-6 text-[#273e8e] border-b pb-4">Invoice</h2>
                
                <div className="space-y-4 mb-8">
                    <div className="border-b pb-4 mb-4">
                        <h3 className="font-bold text-gray-800 mb-3">Invoice Details</h3>
                    </div>

                    {/* Selected Bundles */}
                    {formData.selectedBundles.length > 0 && (
                        <div className="space-y-3 mb-4">
                            {formData.selectedBundles.map((selectedBundle) => (
                                <div key={selectedBundle.id} className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-gray-800">
                                            {selectedBundle.bundle.title || selectedBundle.bundle.name || `Bundle #${selectedBundle.id}`}
                                        </p>
                                        <p className="text-sm text-gray-500">Solar System Bundle</p>
                                    </div>
                                    <span className="font-bold">₦{Number(selectedBundle.price || 0).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {/* Selected Products */}
                    {formData.selectedProducts.length > 0 && (
                        <div className="space-y-3 mb-4">
                            {formData.selectedProducts.map((selectedProduct) => (
                                <div key={selectedProduct.id} className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-gray-800">
                                            {selectedProduct.product.title || selectedProduct.product.name || `Product #${selectedProduct.id}`}
                                        </p>
                                        <p className="text-sm text-gray-500">Individual Component</p>
                                    </div>
                                    <span className="font-bold">₦{Number(selectedProduct.price || 0).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Fallback for single item (backward compatibility) */}
                    {formData.selectedBundles.length === 0 && formData.selectedProducts.length === 0 && (
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <p className="font-medium text-gray-800">
                                    {formData.selectedBundle ? (formData.selectedBundle.title || 'Solar System Bundle') :
                                     formData.selectedProduct ? (formData.selectedProduct.title || formData.selectedProduct.name || 'Product') :
                                     'Solar System'}
                                </p>
                                <p className="text-sm text-gray-500">Product</p>
                            </div>
                            <span className="font-bold">₦{Number(basePrice || 0).toLocaleString()}</span>
                        </div>
                    )}

                    {/* Items Subtotal */}
                    {(formData.selectedBundles.length > 0 || formData.selectedProducts.length > 0) && (
                        <div className="border-t pt-3 mt-3 mb-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Items Subtotal:</span>
                                <span className="font-semibold">₦{Number(basePrice || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    )}

                    {/* Fees */}
                    <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Material Cost:</span>
                            <span>₦{Number(materialCost).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Installation Fee:</span>
                            <span>₦{Number(installationFee).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Delivery Fee:</span>
                            <span>₦{Number(deliveryFee).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Inspection Fee:</span>
                            <span>₦{Number(inspectionFee).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Insurance Fee:</span>
                            <span>₦{Number(insuranceFee).toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Total */}
                    <div className="border-t pt-4 font-bold text-xl flex justify-between">
                        <span>Total</span>
                        <span className="text-[#273e8e]">₦{Number(totalAmount).toLocaleString()}</span>
                    </div>
                </div>

                <button
                    onClick={() => {
                        // Check minimum order value (N1.5m) before proceeding to loan calculator
                        const minOrderValue = 1500000;
                        if (totalAmount < minOrderValue) {
                            alert(`Your order total (₦${totalAmount.toLocaleString()}) does not meet the minimum ₦1,500,000 amount required for credit financing. To qualify for Buy Now, Pay Later, please add more items to your cart. Thank you.`);
                            return;
                        }
                        setStep(8); // Go to Loan Calculator
                    }}
                    className="w-full bg-[#273e8e] text-white py-4 rounded-xl font-bold hover:bg-[#1a2b6b] transition-colors"
                >
                    Proceed to Loan Calculator
                </button>
            </div>
        );
    };

    const renderStep7 = () => (
        <div className="animate-fade-in max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <button onClick={() => setStep(6.5)} className="mb-6 flex items-center text-gray-500 hover:text-[#273e8e]">
                <ArrowLeft size={16} className="mr-2" /> Back
            </button>
            <h2 className="text-2xl font-bold mb-6 text-[#273e8e] border-b pb-4">Audit Invoice</h2>
            <div className="space-y-4 mb-8">
                <div className="flex justify-between">
                    <span>Audit Fee</span>
                    <span className="font-bold">₦50,000</span>
                </div>
                <div className="border-t pt-4 font-bold text-xl flex justify-between">
                    <span>Total</span>
                    <span className="text-[#273e8e]">₦50,000</span>
                </div>
            </div>
            <button 
                onClick={handleAuditPayment}
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

    const renderStep7_5 = () => (
        <div className="animate-fade-in max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            {paymentResult === 'success' ? (
                <>
                    <div className="mb-6">
                        <div className="flex items-center mb-4">
                            <CheckCircle2 size={32} className="text-green-600 mr-3" />
                            <h2 className="text-2xl font-bold text-green-700">Payment Successful!</h2>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Your audit payment has been confirmed. Please select your preferred audit date.
                        </p>
                    </div>

                    {/* Calendar Slots Section */}
                    {auditCalendarSlots.length > 0 ? (() => {
                        // Group slots by date to get unique dates only
                        const uniqueDates = [];
                        const dateMap = new Map();
                        
                        auditCalendarSlots.forEach(slot => {
                            if (!dateMap.has(slot.date)) {
                                dateMap.set(slot.date, slot);
                                uniqueDates.push(slot);
                            }
                        });

                        return (
                        <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h3 className="font-bold text-[#273e8e] mb-3 flex items-center">
                                <Calendar size={20} className="mr-2" />
                                Available Audit Dates
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">
                                    Audit slots are available starting 48 hours after payment confirmation. Select your preferred date:
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                                    {uniqueDates.slice(0, 9).map((slot, idx) => {
                                        const dateStr = new Date(slot.date).toLocaleDateString('en-NG', { 
                                            weekday: 'short', 
                                            month: 'short', 
                                            day: 'numeric' 
                                        });
                                        const isSelected = selectedAuditSlot?.date === slot.date;
                                        
                                        return (
                                    <button
                                        key={idx}
                                        disabled={!slot.available}
                                                onClick={() => {
                                                    if (slot.available) {
                                                        // Select the first available slot for this date
                                                        const firstSlotForDate = auditCalendarSlots.find(s => 
                                                            s.date === slot.date && s.available
                                                        );
                                                        if (firstSlotForDate) {
                                                            setSelectedAuditSlot(firstSlotForDate);
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
                    })() : (
                        <div className="mb-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <p className="text-sm text-yellow-700">
                                Calendar slots will be available soon. Our team will contact you within 24-48 hours to schedule your audit.
                            </p>
                        </div>
                    )}

                    <button
                        onClick={() => {
                            // After selecting audit slot, continue to loan calculator
                            // Set a mock product price for the loan calculator
                            setFormData(prev => ({ ...prev, selectedProductPrice: 2500000 }));
                            setStep(8); // Go to Loan Calculator
                        }}
                        className="w-full bg-[#273e8e] text-white py-4 rounded-xl font-bold hover:bg-[#1a2b6b] transition-colors"
                    >
                        Continue to Loan Calculator
                    </button>
                </>
            ) : (
                <div className="text-center">
                    <XCircle size={64} className="text-red-600 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold mb-4 text-red-700">Payment Failed</h2>
                    <p className="text-gray-600 mb-6">
                        Your payment could not be processed. Please try again.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={handleAuditPayment}
                            className="w-full bg-[#273e8e] text-white py-3 rounded-xl font-bold hover:bg-[#1a2b6b] transition-colors"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => setStep(7)}
                            className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                        >
                            Back to Invoice
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    const renderStep8 = () => {
        // Calculate total amount including compulsory add-ons (Insurance for BNPL)
        // NEW: Calculate from all selected bundles and products
        const bundlesTotal = formData.selectedBundles.reduce((sum, b) => sum + b.price, 0);
        const productsTotal = formData.selectedProducts.reduce((sum, p) => sum + p.price, 0);
        const itemsSubtotal = bundlesTotal + productsTotal;
        
        // Use itemsSubtotal if available, otherwise fallback to selectedProductPrice (for backward compatibility)
        const basePrice = itemsSubtotal > 0 ? itemsSubtotal : formData.selectedProductPrice;
        
        const insuranceAddOn = addOns.find(a => a.is_compulsory_bnpl);
        const insuranceFee = insuranceAddOn && insuranceAddOn.calculation_type === 'percentage'
            ? (basePrice * insuranceAddOn.calculation_value) / 100
            : (insuranceAddOn?.price || 0);
        
        // Use API data if available, otherwise use defaults
        // Material cost, installation fee, delivery fee, inspection fee should come from API
        // For now, using defaults but structure allows for API integration
        const materialCost = 50000; // Should come from API/state selection
        const installationFee = 50000; // Should come from API/state selection
        const deliveryFee = 25000; // Should come from API/state/delivery location selection
        const inspectionFee = 10000; // Should come from API
        
        const totalAmount = basePrice + insuranceFee + materialCost + installationFee + deliveryFee + inspectionFee;

        const handleStartOver = () => {
            // Clear all selections and reset to Step 2
            setFormData(prev => ({
                ...prev,
                selectedBundles: [],
                selectedProducts: [],
                selectedBundleId: null,
                selectedBundle: null,
                selectedProductId: null,
                selectedProduct: null,
                selectedProductPrice: 0,
                productCategory: '',
                optionType: ''
            }));
            setStep(2); // Go back to product category selection (5 options)
        };

        return (
            <div className="animate-fade-in max-w-4xl mx-auto">
                <button onClick={() => setStep(formData.optionType ? 3 : 2)} className="mb-6 flex items-center text-gray-500 hover:text-[#273e8e]">
                    <ArrowLeft size={16} className="mr-2" /> Back
                </button>
                <LoanCalculator 
                    totalAmount={totalAmount} 
                    onConfirm={handleLoanConfirm}
                    loanConfig={loanConfig}
                />
                <div className="mt-6 flex justify-center">
                    <button
                        onClick={handleStartOver}
                        className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center"
                    >
                        <ArrowLeft size={18} className="mr-2" />
                        Start Over - Change Selection
                    </button>
                </div>
            </div>
        );
    };

    const renderStep9 = () => (
        <div className="animate-fade-in max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <button onClick={() => setStep(8)} className="mb-6 flex items-center text-gray-500 hover:text-[#273e8e]">
                <ArrowLeft size={16} className="mr-2" /> Back
            </button>
            <h2 className="text-2xl font-bold mb-6 text-[#273e8e]">Review Your Loan Plan</h2>
            {formData.loanDetails && (
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-6">
                    <h3 className="font-bold text-gray-800 mb-4">Loan Summary</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Total Amount:</span>
                            <span className="font-bold">₦{Number(formData.loanDetails.totalAmount || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Deposit ({formData.loanDetails.depositPercent}%):</span>
                            <span className="font-bold">₦{Number(formData.loanDetails.depositAmount || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Loan Amount:</span>
                            <span className="font-bold">₦{Number(formData.loanDetails.principal || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Monthly Repayment:</span>
                            <span className="font-bold">₦{Number(formData.loanDetails.monthlyRepayment || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tenor:</span>
                            <span className="font-bold">{formData.loanDetails.tenor} months</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 mt-2">
                            <span>Total Repayment:</span>
                            <span className="font-bold text-[#273e8e]">₦{Number(formData.loanDetails.totalRepayment || 0).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            )}
            <p className="text-gray-600 mb-6">
                Do you want to proceed with this loan plan? You'll need to complete a credit check and provide additional information.
            </p>
            <div className="flex gap-4">
                <button
                    onClick={() => setStep(11)}
                    className="flex-1 bg-[#273e8e] text-white py-4 rounded-xl font-bold hover:bg-[#1a2b6b] transition-colors"
                >
                    Yes, Proceed
                </button>
                <button
                    onClick={() => setStep(8)}
                    className="flex-1 border-2 border-gray-300 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                    Adjust Plan
                </button>
            </div>
        </div>
    );

    // Open Mono Connect for credit check
    const openMonoConnect = async () => {
        try {
            // Load Mono Connect script
            await ensureMono();
            
            // Verify MonoConnect is available
            if (!window.MonoConnect) {
                throw new Error("Mono Connect script failed to load. Please refresh the page and try again.");
            }
            
            // Get Mono public key - using test key for now
            const token = localStorage.getItem('access_token');
            let monoPublicKey = 'test_pk_lvb3w2ez9zq6n3e8pdoc'; // Mono test public key
            
            // Try to get Mono public key from backend if available (for production)
            try {
                // You can add an API endpoint to get Mono config
                // const configResponse = await axios.get(API.MONO_CONFIG, {
                //     headers: { Authorization: `Bearer ${token}` }
                // });
                // monoPublicKey = configResponse.data.public_key;
            } catch (e) {
                console.warn("Could not fetch Mono config from backend, using configured key");
            }
            
            console.log("Initializing Mono Connect with public key:", monoPublicKey.substring(0, 15) + "...");

            // Validate public key
            if (!monoPublicKey || monoPublicKey.length < 10) {
                throw new Error("Invalid Mono public key. Please configure your Mono public key.");
            }

            // Wait a bit more to ensure MonoConnect is fully available
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Double check MonoConnect is available
            if (!window.MonoConnect) {
                console.error("MonoConnect still not available. Window keys:", Object.keys(window).filter(k => k.toLowerCase().includes('mono')));
                throw new Error("MonoConnect class is not available. Please refresh the page and try again.");
            }

            // Initialize Mono Connect with scopes for BVN verification and account data
            let monoConnect;
            try {
                console.log("Creating Mono Connect instance with key:", monoPublicKey.substring(0, 15) + "...");
                console.log("MonoConnect constructor:", typeof window.MonoConnect);
                
                // Create Mono Connect configuration
                const monoConfig = {
                    key: monoPublicKey, // Use 'key' as per Mono documentation
                    // Scopes needed for credit check: identity (BVN), accounts, transactions
                    scope: 'identity,accounts,transactions',
                    // Set environment to sandbox for test keys
                    env: 'sandbox', // Use 'production' for live keys
                    onSuccess: async (code) => {
                    // User successfully connected their bank account via Mono
                    // The code is used to exchange for account_id on the backend
                    console.log("Mono connection successful, code:", code);
                    
                    try {
                        // Show loading state
                        setProcessingCreditCheckPayment(true);
                        
                        // Send the Mono code to your backend to process credit check
                        // Backend will:
                        // 1. Exchange code for account_id
                        // 2. Fetch account data, transactions, and BVN info
                        // 3. Analyze the data to generate credit score (0-100)
                        const response = await axios.post(
                            API.BNPL_PROCESS_CREDIT_CHECK,
                            { 
                                mono_code: code,
                                application_data: {
                                    credit_check_method: formData.creditCheckMethod || 'auto',
                                    loan_amount: formData.loanDetails?.principal,
                                    bvn: formData.bvn // Include BVN for verification
                                }
                            },
                            {
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json'
                                }
                            }
                        );

                        // Backend processes the credit check and returns credit score (0-100)
                        const creditScore = response.data?.credit_score || 0;
                        const creditReport = response.data?.credit_report || {};
                        
                        console.log("Credit check completed. Score:", creditScore, "Report:", creditReport);
                        
                        // Store credit check results
                        setFormData(prev => ({
                            ...prev,
                            creditScore: creditScore,
                            creditReport: creditReport
                        }));

                        // Show success message
                        alert(`Credit check completed! Your credit score: ${creditScore}/100`);

                        // Reset processing state before submitting
                        setProcessingCreditCheckPayment(false);

                        // Now submit the application with credit check results
                        try {
                            const fakeEvent = { preventDefault: () => {} };
                            await submitApplication(fakeEvent);
                        } catch (submitError) {
                            console.error("Application submission error after credit check:", submitError);
                            alert("Credit check completed but failed to submit application. Please contact support.");
                        }
                        
                    } catch (error) {
                        console.error("Credit check processing error:", error);
                        const errorMsg = error.response?.data?.message || error.message || "Credit check processing failed";
                        alert(`Credit check completed but processing failed: ${errorMsg}. Please contact support.`);
                        setProcessingCreditCheckPayment(false);
                        
                        // Offer fallback to manual review
                        const useManual = confirm("Would you like to proceed with manual credit check review instead?");
                        if (useManual) {
                            setFormData(prev => ({ ...prev, creditCheckMethod: 'manual' }));
                            try {
                                const fakeEvent = { preventDefault: () => {} };
                                await submitApplication(fakeEvent);
                            } catch (submitError) {
                                console.error("Manual submission error:", submitError);
                                alert("Failed to submit application. Please contact support.");
                            }
                        }
                    }
                },
                onClose: () => {
                    // User closed the Mono widget without completing
                    console.log("Mono Connect closed by user");
                    alert("Credit check process was cancelled. Please complete the bank connection to proceed.");
                    setProcessingCreditCheckPayment(false);
                },
                onError: (error) => {
                    console.error("Mono Connect error:", error);
                    alert("Failed to connect bank account. Please try again or contact support if the issue persists.");
                    setProcessingCreditCheckPayment(false);
                }
                };
                
                // Create MonoConnect instance
                console.log("Creating MonoConnect with config:", { ...monoConfig, key: monoConfig.key.substring(0, 15) + "..." });
                
                try {
                    monoConnect = new window.MonoConnect(monoConfig);
                    console.log("MonoConnect instance created successfully");
                } catch (createError) {
                    console.error("Error creating MonoConnect with 'key' parameter:", createError);
                    // Try with publicKey instead
                    console.log("Trying with 'publicKey' parameter instead...");
                    monoConnect = new window.MonoConnect({
                        publicKey: monoPublicKey,
                        scope: monoConfig.scope,
                        env: monoConfig.env,
                        onSuccess: monoConfig.onSuccess,
                        onClose: monoConfig.onClose,
                        onError: monoConfig.onError
                    });
                    console.log("MonoConnect instance created with 'publicKey'");
                }

            setMonoConnectInstance(monoConnect);
            
            console.log("Opening Mono Connect widget...");
            
            // Open Mono Connect widget
            try {
                monoConnect.open();
                console.log("Mono Connect widget opened successfully");
            } catch (openError) {
                console.error("Error opening Mono Connect widget:", openError);
                throw new Error(`Failed to open Mono Connect widget: ${openError.message || 'Unknown error'}`);
            }
                
            } catch (initError) {
                console.error("Failed to create Mono Connect instance:", initError);
                throw new Error(`Failed to initialize Mono Connect: ${initError.message || 'Unknown error'}`);
            }
            
        } catch (error) {
            console.error("Failed to initialize Mono Connect:", error);
            const errorMessage = error.message || "Failed to initialize credit check";
            
            // Show user-friendly error message
            alert(`${errorMessage}. Please try again or contact support if the issue persists.`);
            
            // Reset processing state
            setProcessingCreditCheckPayment(false);
            
            // Optionally, you can proceed to submit application without Mono if needed
            // For now, we'll let the user retry
            // Uncomment below if you want to allow submission without Mono:
            // const proceedWithoutMono = confirm("Credit check initialization failed. Would you like to proceed with manual review?");
            // if (proceedWithoutMono) {
            //     setFormData(prev => ({ ...prev, creditCheckMethod: 'manual' }));
            //     const fakeEvent = { preventDefault: () => {} };
            //     await submitApplication(fakeEvent);
            // }
        }
    };

    const handleCreditCheckPayment = async () => {
        if (!formData.loanDetails?.principal) {
            alert("Loan details not found. Please go back and complete the loan calculator.");
            return;
        }

        const creditCheckFee = Math.round((formData.loanDetails.principal * 0.05)); // 5% of loan amount
        setProcessingCreditCheckPayment(true);
        
        try {
            await ensureFlutterwave();

            const txRef = "credit_check_" + Date.now();
            const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
            const userEmail = userInfo.email || 'customer@troosolar.com';
            const userName = userInfo.name || userInfo.full_name || 'Customer';

            window.FlutterwaveCheckout({
                public_key: "FLWPUBK_TEST-dd1514f7562b1d623c4e63fb58b6aedb-X", // TODO: Move to env variable
                tx_ref: txRef,
                amount: creditCheckFee,
                currency: "NGN",
                payment_options: "card,ussd,banktransfer",
                customer: {
                    email: userEmail,
                    name: userName,
                },
                callback: async (response) => {
                    console.log("Flutterwave payment callback:", response);
                    
                    if (response?.status === "successful") {
                        // Payment successful, now open Mono Connect for credit check
                        console.log("Payment successful, opening Mono Connect...");
                        try {
                            // Small delay to ensure payment is fully processed
                            await new Promise(resolve => setTimeout(resolve, 500));
                            await openMonoConnect();
                        } catch (error) {
                            console.error("Mono Connect error:", error);
                            const errorMsg = error.message || "Failed to open credit check";
                            alert(`Payment successful but ${errorMsg.toLowerCase()}. Please contact support or try again.`);
                            setProcessingCreditCheckPayment(false);
                            
                            // Option to proceed without Mono (manual review)
                            const proceedManual = confirm("Would you like to proceed with manual credit check review instead?");
                            if (proceedManual) {
                                setFormData(prev => ({ ...prev, creditCheckMethod: 'manual' }));
                                // Submit application with manual method
                                const fakeEvent = { preventDefault: () => {} };
                                await submitApplication(fakeEvent);
                            }
                        }
                    } else {
                        console.error("Payment failed:", response);
                        alert("Payment was not successful. Please try again.");
                        setProcessingCreditCheckPayment(false);
                    }
                },
                onclose: () => {
                    console.log("Flutterwave payment modal closed");
                    // Only reset if payment wasn't successful
                    // If payment was successful, we should proceed to Mono
                    setProcessingCreditCheckPayment(false);
                },
            });
        } catch (error) {
            console.error("Payment initialization error:", error);
            alert("Failed to initialize payment. Please try again.");
            setProcessingCreditCheckPayment(false);
        }
    };

    const renderStep10 = () => {
        return (
            <div className="animate-fade-in max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <button onClick={() => setStep(11)} className="mb-6 flex items-center text-gray-500 hover:text-[#273e8e]">
                    <ArrowLeft size={16} className="mr-2" /> Back
                </button>
                <h2 className="text-2xl font-bold mb-6 text-[#273e8e]">Credit Check Method</h2>
                <div className="space-y-4 mb-6">
                    <button
                        onClick={() => {
                            setFormData({ ...formData, creditCheckMethod: 'auto' });
                        }}
                        disabled={formData.creditCheckMethod === 'manual'}
                        className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
                            formData.creditCheckMethod === 'auto'
                                ? 'border-[#273e8e] bg-blue-50'
                                : formData.creditCheckMethod === 'manual'
                                ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                                : 'border-gray-200 hover:border-blue-200'
                        }`}
                    >
                        <div className="flex items-center mb-2">
                            <CheckCircle size={20} className={formData.creditCheckMethod === 'auto' ? 'text-[#273e8e]' : 'text-gray-300'} />
                            <span className={`ml-2 font-bold ${formData.creditCheckMethod === 'manual' ? 'text-gray-400' : 'text-gray-800'}`}>
                                Automatic (BVN Verification)
                            </span>
                        </div>
                        <p className={`text-sm ml-7 ${formData.creditCheckMethod === 'manual' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Fast and automated credit check using your BVN. You'll connect your bank account via Mono to complete the verification.
                        </p>
                    </button>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-yellow-800 font-medium">
                            <strong>Note:</strong> We will first use the automatic option. If unsuccessful, we will then request for manual upload and review.
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setFormData({ ...formData, creditCheckMethod: 'manual' });
                        }}
                        disabled={formData.creditCheckMethod === 'auto'}
                        className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
                            formData.creditCheckMethod === 'manual'
                                ? 'border-[#273e8e] bg-blue-50'
                                : formData.creditCheckMethod === 'auto'
                                ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                                : 'border-gray-200 hover:border-blue-200'
                        }`}
                    >
                        <div className="flex items-center mb-2">
                            <CheckCircle size={20} className={formData.creditCheckMethod === 'manual' ? 'text-[#273e8e]' : 'text-gray-300'} />
                            <span className={`ml-2 font-bold ${formData.creditCheckMethod === 'auto' ? 'text-gray-400' : 'text-gray-800'}`}>
                                Manual (Bank Statement Review)
                            </span>
                        </div>
                        <p className={`text-sm ml-7 ${formData.creditCheckMethod === 'auto' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Manual review of your bank statements (takes longer).
                        </p>
                    </button>
                </div>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        if (!formData.creditCheckMethod) {
                            alert("Please select a credit check method");
                            return;
                        }
                        // Show credit check fee popup
                        setShowCreditCheckFeeModal(true);
                    }}
                    disabled={loading || !formData.creditCheckMethod}
                    className={`w-full py-4 rounded-xl font-bold transition-colors ${
                        loading || !formData.creditCheckMethod
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-[#273e8e] text-white hover:bg-[#1a2b6b]'
                    }`}
                >
                    {loading ? 'Submitting Application...' : 'Proceed to Payment'}
                </button>
                
                {/* Credit Check Fee Modal */}
                {showCreditCheckFeeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowCreditCheckFeeModal(false)}>
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-bold text-[#273e8e]">Credit Check Fee</h3>
                            <button
                                onClick={() => setShowCreditCheckFeeModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-4 mb-6">
                            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                                <p className="text-sm text-gray-600 mb-2">Loan Amount:</p>
                                <p className="text-xl font-bold text-[#273e8e]">
                                    ₦{Number(formData.loanDetails?.principal || 0).toLocaleString()}
                                </p>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700">Credit Check Fee (5%):</span>
                                <span className="text-xl font-bold text-[#273e8e]">
                                    ₦{Number((formData.loanDetails?.principal || 0) * 0.05).toLocaleString()}
                                </span>
                            </div>
                            <div className="border-t pt-3">
                                <p className="text-sm text-gray-600">
                                    This fee covers the cost of processing your credit check. Payment is required before your application can be submitted.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowCreditCheckFeeModal(false)}
                                className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    setShowCreditCheckFeeModal(false);
                                    await handleCreditCheckPayment();
                                }}
                                disabled={processingCreditCheckPayment}
                                className={`flex-1 bg-[#273e8e] text-white py-3 rounded-xl font-bold hover:bg-[#1a2b6b] transition-colors ${
                                    processingCreditCheckPayment ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {processingCreditCheckPayment ? 'Processing...' : 'Proceed to Payment'}
                            </button>
                        </div>
                    </div>
                </div>
                )}
            </div>
        );
    };

    const submitApplication = async (e) => {
        if (e && e.preventDefault) {
        e.preventDefault();
        }
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                alert("Please login to continue");
                navigate('/login');
                return;
            }

            // Step 1: Create loan calculation first (required by backend)
            // NEW: Calculate total from all selected items
            const bundlesTotal = formData.selectedBundles.reduce((sum, b) => sum + b.price, 0);
            const productsTotal = formData.selectedProducts.reduce((sum, p) => sum + p.price, 0);
            const itemsSubtotal = bundlesTotal + productsTotal;
            const basePrice = itemsSubtotal > 0 ? itemsSubtotal : formData.selectedProductPrice;
            
            let loanCalculationId = null;
            if (formData.loanDetails) {
                try {
                    const loanCalcPayload = {
                        product_amount: basePrice, // NEW: Use total of all selected items
                        loan_amount: formData.loanDetails.totalRepayment,
                        repayment_duration: formData.loanDetails.tenor
                    };
                    
                    const loanCalcResponse = await axios.post(API.LOAN_CALCULATION, loanCalcPayload, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                            Accept: 'application/json'
                        }
                    });

                    if (loanCalcResponse.data?.data?.id) {
                        loanCalculationId = loanCalcResponse.data.data.id;
                    } else if (loanCalcResponse.data?.id) {
                        loanCalculationId = loanCalcResponse.data.id;
                    }
                } catch (calcError) {
                    console.error("Loan calculation error:", calcError);
                    // Continue anyway - backend might handle it differently
                }
            }

            // Step 2: Submit BNPL application
            const formDataToSend = new FormData();

            // Basic Fields
            formDataToSend.append('customer_type', formData.customerType);
            formDataToSend.append('product_category', formData.productCategory);
            formDataToSend.append('loan_amount', formData.loanDetails?.totalRepayment || formData.selectedProductPrice);
            formDataToSend.append('repayment_duration', formData.loanDetails?.tenor || 6);
            formDataToSend.append('credit_check_method', formData.creditCheckMethod || 'auto');
            
            // Add loan calculation ID if available
            if (loanCalculationId) {
                formDataToSend.append('loan_calculation_id', loanCalculationId);
            }

            // Personal Details
            formDataToSend.append('personal_details[full_name]', formData.fullName);
            formDataToSend.append('personal_details[bvn]', formData.bvn);
            formDataToSend.append('personal_details[phone]', formData.phone);
            formDataToSend.append('personal_details[email]', formData.email);
            formDataToSend.append('personal_details[social_media]', formData.socialMedia || '');

            // Property Details - Always send all fields (backend requires estate fields when property_details is present)
            formDataToSend.append('property_details[state]', formData.state || '');
            formDataToSend.append('property_details[address]', formData.address || '');
            formDataToSend.append('property_details[landmark]', formData.landmark || '');
            formDataToSend.append('property_details[floors]', formData.floors || '');
            formDataToSend.append('property_details[rooms]', formData.rooms || '');
            formDataToSend.append('property_details[is_gated_estate]', formData.isGatedEstate ? 1 : 0);
            // Always send estate fields (required by backend when property_details is present)
            formDataToSend.append('property_details[estate_name]', formData.isGatedEstate ? (formData.estateName || '') : '');
            formDataToSend.append('property_details[estate_address]', formData.isGatedEstate ? (formData.estateAddress || '') : '');
            
            // Add state_id and add_on_ids if available
            if (formData.stateId) formDataToSend.append('state_id', formData.stateId);
            
            // NEW: Add multiple bundle IDs if selected
            if (formData.selectedBundles.length > 0) {
                formData.selectedBundles.forEach(bundle => {
                    formDataToSend.append('bundle_ids[]', bundle.id);
                });
            } else if (formData.selectedBundleId) {
                // OLD: Fallback to single bundle ID for backward compatibility
                formDataToSend.append('bundle_id', formData.selectedBundleId);
            }
            
            // NEW: Add multiple product IDs if selected
            if (formData.selectedProducts.length > 0) {
                formData.selectedProducts.forEach(product => {
                    formDataToSend.append('product_ids[]', product.id);
                });
            } else if (formData.selectedProductId) {
                // OLD: Fallback to single product ID for backward compatibility
                formDataToSend.append('product_id', formData.selectedProductId);
            }
            
            // Add compulsory BNPL add-ons (Insurance)
            const compulsoryAddOns = addOns.filter(a => a.is_compulsory_bnpl).map(a => a.id);
            if (compulsoryAddOns.length > 0) {
                compulsoryAddOns.forEach(id => formDataToSend.append('add_on_ids[]', id));
            }

            // Files
            if (formData.bankStatement) formDataToSend.append('bank_statement', formData.bankStatement);
            if (formData.livePhoto) formDataToSend.append('live_photo', formData.livePhoto);

            const response = await axios.post(API.BNPL_APPLY, formDataToSend, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.status === 'success') {
                setApplicationId(response.data.data.loan_application.id);
                setApplicationStatus(response.data.data.loan_application.status);
                setStep(12); // Go to Status/Pending screen
            }
        } catch (error) {
            console.error("Application Submit Error:", error);
            const errorMessage = error.response?.data?.message || 
                                (error.response?.data?.errors ? JSON.stringify(error.response.data.errors) : null) ||
                                "Failed to submit application. Please check all required fields.";
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const renderStep11 = () => (
        <div className="animate-fade-in max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <button onClick={() => setStep(9)} className="mb-6 flex items-center text-gray-500 hover:text-[#273e8e]">
                <ArrowLeft size={16} className="mr-2" /> Back
            </button>
            <h2 className="text-2xl font-bold mb-6 text-[#273e8e]">Final Application</h2>
            <form onSubmit={(e) => {
                e.preventDefault();
                // Validate required fields before proceeding to credit check
                // Note: bankStatement and livePhoto removed - no longer required (handled via Mono)
                if (!formData.fullName || !formData.bvn || !formData.phone || !formData.email || !formData.socialMedia || 
                    !formData.state || !formData.address) {
                    alert("Please fill in all required fields");
                    return;
                }
                if (formData.isGatedEstate && (!formData.estateName || !formData.estateAddress)) {
                    alert("Please fill in Estate Name and Estate Address");
                    return;
                }
                setStep(10); // Go to credit check method selection
            }} className="space-y-6">
                {/* Personal Details Section */}
                <div>
                    <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Personal Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Full Name" required className="p-3 border rounded-lg" onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                        <input type="text" placeholder="BVN" required className="p-3 border rounded-lg" onChange={e => setFormData({ ...formData, bvn: e.target.value })} />
                        <input type="tel" placeholder="Phone Number" required className="p-3 border rounded-lg" onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        <input type="email" placeholder="Email Address" required className="p-3 border rounded-lg" onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        <div className="col-span-2">
                            <input 
                                type="text" 
                                placeholder="Social Media Handle *" 
                                required 
                                className="w-full p-3 border rounded-lg" 
                                value={formData.socialMedia}
                                onChange={e => setFormData({ ...formData, socialMedia: e.target.value })} 
                            />
                            <p className="text-xs text-gray-500 mt-1">* Social media handle is required for verification (e.g., @username or facebook.com/username)</p>
                            {formData.socialMedia && formData.socialMedia.trim().length === 0 && (
                                <p className="text-xs text-red-600 mt-1">Social media handle cannot be empty</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Property Details Section */}
                <div>
                    <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Property Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {states.length > 0 ? (
                            <select
                                required
                                className="p-3 border rounded-lg"
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
                        ) : (
                            <input type="text" placeholder="State" required className="p-3 border rounded-lg" onChange={e => setFormData({ ...formData, state: e.target.value })} />
                        )}
                        <input type="text" placeholder="Address" required className="p-3 border rounded-lg" onChange={e => setFormData({ ...formData, address: e.target.value })} />
                        <input type="text" placeholder="Landmark" className="p-3 border rounded-lg" onChange={e => setFormData({ ...formData, landmark: e.target.value })} />
                        <input type="number" placeholder="Floors" className="p-3 border rounded-lg" onChange={e => setFormData({ ...formData, floors: e.target.value })} />
                        <input type="number" placeholder="Rooms" className="p-3 border rounded-lg" onChange={e => setFormData({ ...formData, rooms: e.target.value })} />
                    </div>
                    <div className="mt-4">
                        <label className="flex items-center space-x-2">
                            <input type="checkbox" checked={formData.isGatedEstate} onChange={e => setFormData({ ...formData, isGatedEstate: e.target.checked })} />
                            <span>Is this in a gated estate?</span>
                        </label>
                    </div>
                    {formData.isGatedEstate && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
                </div>

                <button 
                    type="submit" 
                    disabled={loading || (formData.isGatedEstate && (!formData.estateName || !formData.estateAddress))} 
                    className={`w-full py-4 rounded-xl font-bold transition-colors ${
                        loading || (formData.isGatedEstate && (!formData.estateName || !formData.estateAddress))
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-[#273e8e] text-white hover:bg-[#1a2b6b]'
                    }`}
                >
                    Continue to Credit Check
                </button>
                {formData.isGatedEstate && (!formData.estateName || !formData.estateAddress) && (
                    <p className="text-sm text-red-600 mt-2 text-center">
                        Please fill in Estate Name and Estate Address
                    </p>
                )}
            </form>
        </div>
    );

    // Status polling effect for BNPL application
    React.useEffect(() => {
        if (step === 12 && applicationId) {
            const pollInterval = setInterval(async () => {
                try {
                    const token = localStorage.getItem('access_token');
                    const response = await axios.get(API.BNPL_STATUS(applicationId), {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    if (response.data.status === 'success' && response.data.data?.loan_application) {
                        const status = response.data.data.loan_application.status;
                        setApplicationStatus(status);
                        
                        if (status === 'approved') {
                            clearInterval(pollInterval);
                            setStep(13); // Go to approval screen
                        } else if (status === 'rejected') {
                            clearInterval(pollInterval);
                            setStep(14); // Go to rejection screen
                        } else if (status === 'counter_offer') {
                            clearInterval(pollInterval);
                            setStep(15); // Go to counter offer screen
                        }
                    }
                } catch (error) {
                    console.error("Status polling error:", error);
                }
            }, 30000); // Poll every 30 seconds
            
            return () => clearInterval(pollInterval);
        }
    }, [step, applicationId]);

    // Poll audit request status for commercial audits (Step 6)
    React.useEffect(() => {
        if (step === 6 && formData.auditRequestId && formData.auditType === 'commercial') {
            const pollInterval = setInterval(async () => {
                try {
                    const token = localStorage.getItem('access_token');
                    const response = await axios.get(API.AUDIT_REQUEST_BY_ID(formData.auditRequestId), {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    if (response.data.status === 'success') {
                        const status = response.data.data.status;
                        if (status === 'approved') {
                            clearInterval(pollInterval);
                            // Auto-proceed to order summary when approved
                            setStep(6.5);
                        } else if (status === 'rejected') {
                            clearInterval(pollInterval);
                            alert("Your audit request has been rejected. Please contact support for more information.");
                        }
                    }
                } catch (error) {
                    console.error("Audit status polling error:", error);
                }
            }, 60000); // Poll every 60 seconds for audit requests
            
            return () => clearInterval(pollInterval);
        }
    }, [step, formData.auditRequestId, formData.auditType]);

    const renderStep12 = () => (
        <div className="animate-fade-in max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 text-[#273e8e]">Application Submitted</h2>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-100">
                <Clock size={64} className="text-[#273e8e] mx-auto mb-6 animate-pulse" />
                <p className="text-xl font-medium text-gray-800 mb-4">Your application is under review.</p>
                <p className="text-gray-600 mb-4">We are processing your details. This usually takes 24-48 hours.</p>
                <p className="text-sm text-gray-500 mb-8">Status: <span className="font-bold text-[#273e8e]">{applicationStatus}</span></p>
                <div className="flex gap-4 justify-center">
                    <button 
                        onClick={async () => {
                            try {
                                const token = localStorage.getItem('access_token');
                                const response = await axios.get(API.BNPL_STATUS(applicationId), {
                                    headers: { Authorization: `Bearer ${token}` }
                                });
                                
                                if (response.data.status === 'success' && response.data.data?.loan_application) {
                                    const status = response.data.data.loan_application.status;
                                    setApplicationStatus(status);
                                    
                                    if (status === 'approved') {
                                        setStep(13);
                                    } else if (status === 'rejected') {
                                        setStep(14);
                                    } else if (status === 'counter_offer') {
                                        setStep(15);
                                    } else {
                                        alert(`Current status: ${status}. Please check again later.`);
                                    }
                                }
                            } catch (error) {
                                alert("Failed to check status. Please try again later.");
                            }
                        }} 
                        className="bg-[#273e8e] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#1a2b6b] transition-colors"
                    >
                        Check Status Now
                    </button>
                    <button onClick={() => navigate('/')} className="text-gray-600 px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                        Return to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );

    const renderStep13 = () => (
        <div className="animate-fade-in max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-[#273e8e]">
                Application Status
            </h2>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-green-200">
                <div className="flex items-center mb-6">
                    <CheckCircle size={32} className="text-green-600 mr-4" />
                    <h3 className="text-2xl font-bold text-green-700">Loan Approved!</h3>
                </div>
                <p className="text-gray-600 mb-8">
                    Congratulations! Your loan application has been approved. Please proceed to download the Guarantor Form.
                </p>
                <button
                    onClick={() => setStep(17)}
                    className="w-full bg-[#273e8e] text-white py-4 rounded-xl font-bold hover:bg-[#1a2b6b] transition-colors"
                >
                    Proceed to Guarantor Form
                </button>
            </div>
        </div>
    );

    const renderStep14 = () => (
        <div className="animate-fade-in max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-[#273e8e]">
                Application Status
            </h2>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-200">
                <div className="flex items-center mb-6">
                    <AlertCircle size={32} className="text-red-600 mr-4" />
                    <h3 className="text-2xl font-bold text-red-700">Loan Not Approved</h3>
                </div>
                <p className="text-gray-600 mb-6">
                    Unfortunately, your loan application was not approved at this time. However, you can improve your chances by:
                </p>
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
                    <h4 className="font-bold text-gray-800 mb-3">Options to Improve Your Application:</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li>• Increase your initial deposit</li>
                        <li>• Extend your repayment duration (if you chose less than 12 months)</li>
                        <li>• Reduce the system size you initially chose</li>
                    </ul>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => {
                            // Reset to loan calculator to adjust
                            setStep(8);
                        }}
                        className="flex-1 bg-[#273e8e] text-white py-3 rounded-xl font-bold hover:bg-[#1a2b6b] transition-colors"
                    >
                        Adjust Application
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );

    const renderStep15 = () => {
        // This would typically come from the API response
        const counterOffer = {
            minimum_deposit: formData.loanDetails?.depositAmount ? formData.loanDetails.depositAmount * 1.2 : 0,
            minimum_tenor: formData.loanDetails?.tenor ? Math.max(formData.loanDetails.tenor, 12) : 12
        };

        return (
            <div className="animate-fade-in max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-8 text-[#273e8e]">
                    Counter Offer Available
                </h2>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-yellow-200">
                    <div className="flex items-center mb-6">
                        <AlertCircle size={32} className="text-yellow-600 mr-4" />
                        <h3 className="text-2xl font-bold text-yellow-700">Partial Approval</h3>
                    </div>
                    <p className="text-gray-600 mb-6">
                        Your loan application has been partially approved with a counter offer. Please review the new terms:
                    </p>
                    <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-6">
                        <h4 className="font-bold text-gray-800 mb-4">Counter Offer Terms:</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Minimum Deposit:</span>
                                <span className="font-bold">₦{Number(counterOffer.minimum_deposit).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Minimum Tenor:</span>
                                <span className="font-bold">{counterOffer.minimum_tenor} months</span>
                            </div>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">
                        <strong>Note:</strong> If you accept the counteroffer or re-apply, you do not need to pay for credit checks again.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={async () => {
                                // Accept counteroffer - update loan details and proceed
                                const updatedLoanDetails = {
                                    ...formData.loanDetails,
                                    depositAmount: counterOffer.minimum_deposit,
                                    tenor: counterOffer.minimum_tenor
                                };
                                setFormData({ ...formData, loanDetails: updatedLoanDetails });
                                setStep(16); // Proceed to complete form with counteroffer
                            }}
                            className="w-full bg-[#273e8e] text-white py-4 rounded-xl font-bold hover:bg-[#1a2b6b] transition-colors"
                        >
                            Accept Counteroffer
                        </button>
                        <button
                            onClick={() => {
                                // Re-apply - go back to loan calculator
                                setStep(8);
                            }}
                            className="w-full border-2 border-gray-300 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                        >
                            Re-apply with Different Terms
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderStep16 = () => (
        <div className="animate-fade-in max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-[#273e8e]">
                Guarantor Credit Check
            </h2>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-200">
                <div className="flex items-center mb-6">
                    <Clock size={32} className="text-blue-600 mr-4" />
                    <h3 className="text-2xl font-bold text-blue-700">Under Review</h3>
                </div>
                <p className="text-gray-600 mb-6">
                    Your guarantor's credit check is currently under review. You will receive feedback within 24 hours.
                </p>
                <p className="text-sm text-gray-500 mb-6">
                    <strong>Important:</strong> If your guarantor does not qualify, your loan will not be disbursed.
                </p>
                <button
                    onClick={() => {
                        // Check status - this would typically poll or check API
                        setStep(19); // Proceed to agreement step
                    }}
                    className="w-full bg-[#273e8e] text-white py-4 rounded-xl font-bold hover:bg-[#1a2b6b] transition-colors"
                >
                    Continue
                </button>
            </div>
        </div>
    );

    const handleGuarantorInvite = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.post(API.BNPL_GUARANTOR_INVITE, {
                loan_application_id: applicationId,
                full_name: formData.guarantorName,
                phone: formData.guarantorPhone,
                email: formData.guarantorEmail,
                relationship: formData.guarantorRelationship
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.status === 'success') {
                setGuarantorId(response.data.data.id);
                alert("Guarantor details saved. You can now download the form.");
            }
        } catch (error) {
            console.error("Guarantor Invite Error:", error);
            alert("Failed to save guarantor details.");
        } finally {
            setLoading(false);
        }
    };

    const handleGuarantorUpload = async (file) => {
        if (!file) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const uploadData = new FormData();
            uploadData.append('guarantor_id', guarantorId);
            uploadData.append('signed_form', file);

            const response = await axios.post(API.BNPL_GUARANTOR_UPLOAD, uploadData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.status === 'success') {
                setStep(19); // Proceed to Agreement Step (NEW)
            }
        } catch (error) {
            console.error("Guarantor Upload Error:", error);
            alert("Failed to upload guarantor form.");
        } finally {
            setLoading(false);
        }
    };

    const renderStep19 = () => (
        <div className="animate-fade-in max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-[#273e8e]">Important Agreement</h2>
            <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg mb-6">
                <AlertCircle className="text-yellow-600 mb-3" size={24} />
                <p className="text-gray-700 leading-relaxed">
                    <strong>Your signed Guarantors, along with undated signed cheques will be received on the day of installation of your system as installation won't proceed without receiving them.</strong>
                </p>
            </div>
            <div className="mb-6">
                <label className="flex items-start cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.agreedToTerms || false}
                        onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                        className="mt-1 h-5 w-5 text-[#273e8e] focus:ring-[#273e8e] border-gray-300 rounded"
                    />
                    <span className="ml-3 text-gray-700">
                        I understand and agree to the terms above. I acknowledge that installation will not proceed without receiving the signed guarantor documents and undated cheques.
                    </span>
                </label>
            </div>
            <button
                onClick={() => setStep(20)}
                disabled={!formData.agreedToTerms}
                className={`w-full py-4 rounded-xl font-bold transition-colors ${
                    formData.agreedToTerms
                        ? 'bg-[#273e8e] text-white hover:bg-[#1a2b6b]'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
                I Agree and Continue
            </button>
        </div>
    );

    const renderStep20 = () => (
        <div className="animate-fade-in max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-green-200">
            <h2 className="text-2xl font-bold mb-6 text-[#273e8e]">Confirmation</h2>
            <div className="bg-green-50 border border-green-200 p-6 rounded-lg mb-6">
                <CheckCircle className="text-green-600 mb-3" size={32} />
                <p className="text-gray-700 mb-4">
                    Thank you for confirming your agreement. Your loan will be disbursed to your wallet to complete your purchase.
                </p>
                <p className="text-sm text-gray-600">
                    You can now proceed to view your order summary and invoice.
                </p>
            </div>
            <button
                onClick={() => setStep(21)}
                className="w-full bg-[#273e8e] text-white py-4 rounded-xl font-bold hover:bg-[#1a2b6b] transition-colors"
            >
                Proceed to Order Summary
            </button>
        </div>
    );

    const renderStep17 = () => (
        <div className="animate-fade-in max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-[#273e8e]">Guarantor Information</h2>

            {!guarantorId ? (
                <form onSubmit={handleGuarantorInvite} className="space-y-4">
                    <p className="text-gray-600 mb-4">Please provide details of your guarantor.</p>
                    <input
                        type="text"
                        placeholder="Guarantor Full Name"
                        required
                        className="w-full p-3 border rounded-lg"
                        onChange={(e) => setFormData({ ...formData, guarantorName: e.target.value })}
                    />
                    <input
                        type="tel"
                        placeholder="Guarantor Phone"
                        required
                        className="w-full p-3 border rounded-lg"
                        onChange={(e) => setFormData({ ...formData, guarantorPhone: e.target.value })}
                    />
                    <input
                        type="email"
                        placeholder="Guarantor Email (Optional)"
                        className="w-full p-3 border rounded-lg"
                        onChange={(e) => setFormData({ ...formData, guarantorEmail: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Relationship (e.g. Spouse, Colleague)"
                        className="w-full p-3 border rounded-lg"
                        onChange={(e) => setFormData({ ...formData, guarantorRelationship: e.target.value })}
                    />
                    <button type="submit" disabled={loading} className="w-full bg-[#273e8e] text-white py-3 rounded-xl font-bold">
                        {loading ? 'Saving...' : 'Save & Continue'}
                    </button>
                </form>
            ) : (
                <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex items-center">
                        <CheckCircle className="text-green-600 mr-3" size={20} />
                        <p className="text-sm text-green-700">Guarantor details saved successfully.</p>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="font-bold text-gray-800 mb-2">Step 1: Download Form</h3>
                        <button 
                            onClick={async () => {
                                try {
                                    const token = localStorage.getItem('access_token');
                                    if (!token) {
                                        alert("Please login to continue");
                                        navigate('/login');
                                        return;
                                    }
                                    
                                    // Fetch guarantor form PDF from API
                                    const response = await axios.get(`${API.BNPL_GUARANTOR_FORM}?loan_application_id=${applicationId}`, {
                                        headers: { Authorization: `Bearer ${token}` },
                                        responseType: 'blob'
                                    });
                                    
                                    // Create download link
                                    const url = window.URL.createObjectURL(new Blob([response.data]));
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.setAttribute('download', `guarantor-form-${applicationId}.pdf`);
                                    document.body.appendChild(link);
                                    link.click();
                                    link.remove();
                                    window.URL.revokeObjectURL(url);
                                } catch (error) {
                                    console.error("Download error:", error);
                                    if (error.response?.status === 404) {
                                        alert("Guarantor form is not available yet. Please contact support or try again later.");
                                    } else {
                                        alert("Failed to download guarantor form. Please contact support or try again later.");
                                    }
                                }
                            }}
                            className="w-full border-2 border-[#273e8e] text-[#273e8e] py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors flex items-center justify-center mb-4"
                        >
                            <Download size={20} className="mr-2" /> Download Guarantor Form
                        </button>
                        <p className="text-xs text-gray-500 text-center">
                            Download the form, have your guarantor sign it, then upload it below.
                        </p>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="font-bold text-gray-800 mb-2">Step 2: Upload Signed Form</h3>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#273e8e] transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => handleGuarantorUpload(e.target.files[0])}
                                accept=".pdf,.jpg,.png"
                            />
                            {loading ? (
                                <Loader className="animate-spin mx-auto text-[#273e8e]" />
                            ) : (
                                <>
                                    <Upload className="mx-auto text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500">Click to upload signed form</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    // Fetch invoice data when step 21 loads
    React.useEffect(() => {
        if (step === 21 && applicationId) {
            const fetchInvoice = async () => {
                try {
                    const token = localStorage.getItem('access_token');
                    if (!token) return;
                    
                    // Try to fetch invoice from API first
                    try {
                        const response = await axios.get(API.BNPL_INVOICE(applicationId), {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        
                        if (response.data.status === 'success' && response.data.data) {
                            setInvoiceData(response.data.data);
                            return; // Successfully fetched from API
                        }
                    } catch (apiError) {
                        // If API is not available (404), fall back to calculated values
                        console.log("Invoice API not available, using calculated values:", apiError.message);
                    }
                    
                    // Fallback: Calculate from formData if API is not available
                    const insuranceAddOn = addOns.find(a => a.is_compulsory_bnpl);
                    const insuranceFee = insuranceAddOn && insuranceAddOn.calculation_type === 'percentage'
                        ? (formData.selectedProductPrice * insuranceAddOn.calculation_value) / 100
                        : (insuranceAddOn?.price || formData.selectedProductPrice * 0.005);
                    
                    setInvoiceData({
                        product_price: formData.selectedProductPrice,
                        material_cost: 50000,
                        installation_fee: 50000,
                        delivery_fee: 25000,
                        inspection_fee: 10000,
                        insurance_fee: insuranceFee,
                        total: formData.selectedProductPrice + 50000 + 50000 + 25000 + 10000 + insuranceFee,
                        loan_details: formData.loanDetails ? {
                            deposit_amount: formData.loanDetails.depositAmount,
                            monthly_repayment: formData.loanDetails.monthlyRepayment,
                            total_repayment: formData.loanDetails.totalRepayment
                        } : null
                    });
                } catch (error) {
                    console.error("Failed to fetch invoice:", error);
                }
            };
            fetchInvoice();
        }
    }, [step, applicationId, formData.selectedProductPrice, formData.loanDetails, addOns]);

    const renderStep21 = () => {
        const invoice = invoiceData || {
            product_price: formData.selectedProductPrice,
            material_cost: 50000,
            installation_fee: 50000,
            delivery_fee: 25000,
            inspection_fee: 10000,
            insurance_fee: formData.selectedProductPrice * 0.005,
            total: formData.selectedProductPrice + 50000 + 50000 + 25000 + 10000 + (formData.selectedProductPrice * 0.005)
        };

        return (
        <div className="animate-fade-in max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-[#273e8e] border-b pb-4">Order Summary & Invoice</h2>

            <div className="space-y-4 mb-8">
                {/* Detailed Invoice Breakdown as per requirements */}
                <div className="border-b pb-4 mb-4">
                    <h3 className="font-bold text-gray-800 mb-3">Invoice Details</h3>
                </div>
                
                {/* Solar Inverter */}
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-medium text-gray-800">Solar Inverter</p>
                        <p className="text-sm text-gray-500">Quantity: 1</p>
                        </div>
                    <span className="font-bold">₦{Number((invoice.product_price || 0) * 0.4).toLocaleString()}</span>
                </div>
                
                {/* Solar Panels */}
                <div className="flex justify-between items-center">
                        <div>
                        <p className="font-medium text-gray-800">Solar Panels</p>
                        <p className="text-sm text-gray-500">Quantity: 1</p>
                        </div>
                    <span className="font-bold">₦{Number((invoice.product_price || 0) * 0.35).toLocaleString()}</span>
                    </div>
                
                {/* Batteries */}
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-medium text-gray-800">Batteries</p>
                        <p className="text-sm text-gray-500">Quantity: 1</p>
                    </div>
                    <span className="font-bold">₦{Number((invoice.product_price || 0) * 0.25).toLocaleString()}</span>
                </div>

                {/* Material Cost */}
                <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Material Cost (Cables, Breakers, Surge Protectors, Trunking, and Pipes)</span>
                    <span>₦{Number(invoice.material_cost || 0).toLocaleString()}</span>
                </div>
                
                {/* Installation Fee */}
                <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Installation Fees</span>
                    <span>₦{Number(invoice.installation_fee || 0).toLocaleString()}</span>
                </div>
                
                {/* Delivery/Logistics */}
                <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Delivery/Logistics Fees</span>
                    <span>₦{Number(invoice.delivery_fee || 0).toLocaleString()}</span>
                </div>
                
                {/* Inspection Fee */}
                <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Inspection Fees</span>
                    <span>₦{Number(invoice.inspection_fee || 0).toLocaleString()}</span>
                </div>
                
                {/* Insurance Fee */}
                <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Insurance Fee</span>
                    <span>₦{Number(invoice.insurance_fee || 0).toLocaleString()}</span>
                </div>

                <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center text-xl font-bold">
                        <span>Total</span>
                        <span className="text-[#273e8e]">₦{Number(invoice.total || 0).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6 flex items-start">
                <AlertCircle className="text-yellow-600 mr-3 mt-1" size={20} />
                <p className="text-sm text-yellow-700">
                    Installation fees may change after site inspection. Any difference will be updated and shared with you for a one-off payment before installation.
                </p>
            </div>

            {(invoice.loan_details || formData.loanDetails) && (
                <div className="bg-blue-50 p-4 rounded-lg mb-8">
                    <h4 className="font-bold text-[#273e8e] mb-2">Payment Schedule</h4>
                    <div className="flex justify-between text-sm mb-1">
                        <span>Initial Deposit</span>
                        <span className="font-bold">₦{Number(invoice.loan_details?.deposit_amount || formData.loanDetails?.depositAmount || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                        <span>Monthly Repayment</span>
                        <span className="font-bold">₦{Number(invoice.loan_details?.monthly_repayment || formData.loanDetails?.monthlyRepayment || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>Total Repayment</span>
                        <span className="font-bold">₦{Number(invoice.loan_details?.total_repayment || formData.loanDetails?.totalRepayment || 0).toLocaleString()}</span>
                    </div>
                </div>
            )}

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6 flex items-start">
                <Calendar className="text-blue-600 mr-3 mt-1" size={20} />
                <p className="text-sm text-blue-700">
                    Within 24 – 48 hours, our team will contact you to schedule your installation date.
                </p>
            </div>

            <button 
                onClick={async () => {
                    // Handle upfront deposit payment for approved applications
                    if (applicationId && formData.loanDetails) {
                        await handleUpfrontDepositPayment();
                    } else {
                        // For new applications, proceed to loan calculator
                        setStep(8);
                    }
                }}
                disabled={processingPayment || (applicationId && !formData.loanDetails)}
                className={`w-full py-4 rounded-xl font-bold transition-colors flex items-center justify-center ${
                    processingPayment || (applicationId && !formData.loanDetails)
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
                    applicationId && formData.loanDetails 
                        ? `Pay Upfront Deposit (₦${Number(formData.loanDetails.depositAmount || 0).toLocaleString()})`
                        : 'Proceed to Loan Calculator'
                )}
            </button>
        </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col" >
            {/* Navbar Placeholder */}
            < div className="bg-white shadow-sm p-4 sticky top-0 z-50" >
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="font-bold text-xl text-[#273e8e]">TrooSolar</div>
                    <button onClick={() => navigate('/')} className="text-gray-600 hover:text-[#273e8e]">
                        Exit Application
                    </button>
                </div>
            </div >

            {/* Main Content */}
            < div className="flex-grow flex items-center justify-center p-6" >
                <div className="w-full max-w-6xl">
                    {/* Progress Bar */}
                    <div className="mb-12 max-w-xl mx-auto">
                        <div className="flex justify-between text-sm font-medium text-gray-400 mb-2">
                            <span className={step >= 1 ? "text-[#273e8e]" : ""}>Type</span>
                            <span className={step >= 2 ? "text-[#273e8e]" : ""}>Product</span>
                            <span className={step >= 11 ? "text-[#273e8e]" : ""}>Apply</span>
                            <span className={step >= 12 ? "text-[#273e8e]" : ""}>Approval</span>
                            <span className={step >= 21 ? "text-[#273e8e]" : ""}>Finish</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#273e8e] transition-all duration-500 ease-out"
                                style={{ width: `${(step / 21) * 100}%` }}
                            />
                        </div>
                    </div>

                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 2.5 && renderStep2_5()}
                    {step === 3 && renderStep3()}
                    {step === 3.5 && renderStep3_5()}
                    {step === 3.75 && renderStep3_75()}
                    {step === 4 && renderStep4()}
                    {step === 5 && renderStep5()}
                    {step === 6 && renderStep6()}
                    {step === 6.5 && renderStep6_5()}
                    {step === 6.75 && renderStep6_75()}
                    {step === 7 && renderStep7()}
                    {step === 7.5 && renderStep7_5()}
                    {step === 8 && renderStep8()}
                    {step === 9 && renderStep9()}
                    {step === 10 && renderStep10()}
                    {step === 11 && renderStep11()}
                    {step === 12 && renderStep12()}
                    {step === 13 && renderStep13()}
                    {step === 14 && renderStep14()}
                    {step === 15 && renderStep15()}
                    {step === 16 && renderStep16()}
                    {step === 17 && renderStep17()}
                    {step === 19 && renderStep19()}
                    {step === 20 && renderStep20()}
                    {step === 21 && renderStep21()}
                </div>
            </div >
        </div >
    );
};

export default BNPLFlow;
