import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SideBar from '../Component/SideBar';
import TopNavbar from '../Component/TopNavbar';
import axios from 'axios';
import API from '../config/api.config';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  ChevronLeft,
  Calendar,
  DollarSign,
  CreditCard,
  Home,
  User,
  MapPin,
  Phone,
  Mail,
  Building,
  Package,
  TrendingUp,
  Receipt,
  ArrowRight,
  CheckCircle2,
  X
} from 'lucide-react';
import Loading from '../Component/Loading';
import BNPLPaymentModal from '../Component/BNPLPaymentModal';
import RepaymentCalendar from '../Component/RepaymentCalendar';

/* Flutterwave script for down payment */
const ensureFlutterwave = () =>
  new Promise((resolve, reject) => {
    if (window.FlutterwaveCheckout) return resolve();
    const s = document.createElement('script');
    s.src = 'https://checkout.flutterwave.com/v3.js';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load Flutterwave script'));
    document.body.appendChild(s);
  });

const BNPLLoanDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Get order ID from URL
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0
    });
    const [selectedInstallment, setSelectedInstallment] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [installmentsWithHistory, setInstallmentsWithHistory] = useState(null);
    const [processingDownPayment, setProcessingDownPayment] = useState(false);

    useEffect(() => {
        if (id) {
            // Check if ID is an application ID (prefixed with 'app-')
            if (id.startsWith('app-')) {
                const applicationId = id.replace('app-', '');
                fetchApplicationDetails(applicationId);
            } else {
                fetchOrderDetails(id);
            }
        } else {
            fetchAllOrders();
        }
    }, [id]);

    const fetchOrderDetails = async (orderId) => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                setError('Please login to view loan details');
                setLoading(false);
                return;
            }

            const response = await axios.get(API.BNPL_ORDER_DETAILS(orderId), {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json'
                }
            });

            if (response.data.status === 'success' && response.data.data) {
                const orderDetails = response.data.data;
                
                // If repayment schedule is missing, try to fetch it
                if (!orderDetails.repayment_schedule || orderDetails.repayment_schedule.length === 0) {
                    const loanAppId = orderDetails.loan_application?.id || orderDetails.application?.id;
                    if (loanAppId) {
                        try {
                            const scheduleResponse = await axios.get(API.BNPL_REPAYMENT_SCHEDULE(loanAppId), {
                                headers: { 
                                    Authorization: `Bearer ${token}`,
                                    Accept: 'application/json'
                                }
                            });
                            
                            if (scheduleResponse.data.status === 'success' && scheduleResponse.data.data) {
                                orderDetails.repayment_schedule = scheduleResponse.data.data.installments || scheduleResponse.data.data || scheduleResponse.data.data.schedule;
                            }
                        } catch (scheduleErr) {
                            console.log('Could not fetch repayment schedule:', scheduleErr);
                        }
                    }
                }
                
                // Also fetch installments with history for additional data
                try {
                    const historyResponse = await axios.get(API.Loan_Payment_Relate, {
                        headers: { 
                            Authorization: `Bearer ${token}`,
                            Accept: 'application/json'
                        }
                    });
                    
                    if (historyResponse.data.status === 'success' && historyResponse.data.data) {
                        setInstallmentsWithHistory(historyResponse.data.data);
                    }
                } catch (historyErr) {
                    console.log('Could not fetch installments with history:', historyErr);
                }
                
                setOrderData(orderDetails);
            } else {
                setError(response.data.message || 'Failed to fetch order details');
            }
        } catch (err) {
            console.error('Error fetching order details:', err);
            // If order not found, try to fetch as application
            if (err.response?.status === 404) {
                console.log('Order not found, trying to fetch as application...');
                // Could try fetching application details here if needed
            }
            setError(err.response?.data?.message || 'Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const fetchApplicationDetails = async (applicationId) => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                setError('Please login to view loan details');
                setLoading(false);
                return;
            }

            const response = await axios.get(API.BNPL_STATUS(applicationId), {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json'
                }
            });

            if (response.data.status === 'success' && response.data.data) {
                // Transform application data to match order data structure
                const appData = response.data.data;
                
                // If down payment is done, an order exists – redirect to order view so user sees correct repayment summary
                if (appData.order_id && appData.down_payment_completed) {
                    navigate(`/bnpl-loans/${appData.order_id}`, { replace: true });
                    setLoading(false);
                    return;
                }
                
                // Try to fetch repayment schedule for the application
                let repaymentSchedule = [];
                try {
                    const scheduleResponse = await axios.get(API.BNPL_REPAYMENT_SCHEDULE(applicationId), {
                        headers: { 
                            Authorization: `Bearer ${token}`,
                            Accept: 'application/json'
                        }
                    });
                    
                    if (scheduleResponse.data.status === 'success' && scheduleResponse.data.data) {
                        repaymentSchedule = scheduleResponse.data.data.installments || scheduleResponse.data.data.schedule || scheduleResponse.data.data || [];
                    }
                } catch (scheduleErr) {
                    console.log('Could not fetch repayment schedule:', scheduleErr);
                }
                
                // Also fetch installments with history for additional data
                try {
                    const historyResponse = await axios.get(API.Loan_Payment_Relate, {
                        headers: { 
                            Authorization: `Bearer ${token}`,
                            Accept: 'application/json'
                        }
                    });
                    
                    if (historyResponse.data.status === 'success' && historyResponse.data.data) {
                        setInstallmentsWithHistory(historyResponse.data.data);
                        // If repayment schedule is empty, use current_month and history from installments
                        if (repaymentSchedule.length === 0) {
                            const currentMonth = historyResponse.data.data.current_month || [];
                            const history = historyResponse.data.data.history || [];
                            repaymentSchedule = [...currentMonth, ...history].sort((a, b) => {
                                const dateA = new Date(a.payment_date || a.due_date);
                                const dateB = new Date(b.payment_date || b.due_date);
                                return dateA - dateB;
                            });
                        }
                    }
                } catch (historyErr) {
                    console.log('Could not fetch installments with history:', historyErr);
                }
                
                setOrderData({
                    ...appData,
                    id: appData.id,
                    status: appData.status,
                    created_at: appData.created_at,
                    loan_application: appData,
                    application: appData,
                    repayment_schedule: repaymentSchedule,
                    isApplication: true,
                    loan_calculation: appData.loan_calculation,
                    order_id: appData.order_id,
                    order_number: appData.order_number,
                    down_payment_completed: appData.down_payment_completed
                });
            } else {
                setError(response.data.message || 'Failed to fetch application details');
            }
        } catch (err) {
            console.error('Error fetching application details:', err);
            setError(err.response?.data?.message || 'Failed to load application details');
        } finally {
            setLoading(false);
        }
    };

    const fetchAllOrders = async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                setError('Please login to view loan details');
                setLoading(false);
                return;
            }

            // Try to fetch orders first
            let orders = [];
            let ordersPagination = null;
            try {
                const ordersResponse = await axios.get(API.BNPL_ORDERS, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json'
                    },
                    params: {
                        per_page: pagination.per_page,
                        page: page
                    }
                });

                console.log('BNPL Orders API Response:', ordersResponse.data);
                
                if (ordersResponse.data.status === 'success') {
                    // Handle different response structures
                    if (ordersResponse.data.data) {
                        if (Array.isArray(ordersResponse.data.data)) {
                            orders = ordersResponse.data.data;
                        } else if (ordersResponse.data.data.data) {
                            orders = ordersResponse.data.data.data;
                            ordersPagination = ordersResponse.data.data.pagination;
                        } else {
                            orders = [];
                        }
                    }
                }
            } catch (ordersErr) {
                console.log('No orders found or error fetching orders:', ordersErr);
                // Continue to fetch applications
            }

            // Always fetch applications to show all BNPL loans/applications
            let applications = [];
            let applicationsPagination = null;
            try {
                const appsResponse = await axios.get(API.BNPL_APPLICATIONS, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json'
                    },
                    params: {
                        per_page: pagination.per_page,
                        page: page
                    }
                });

                console.log('BNPL Applications API Response:', appsResponse.data);

                if (appsResponse.data.status === 'success') {
                    // Handle different response structures
                    if (appsResponse.data.data) {
                        if (Array.isArray(appsResponse.data.data)) {
                            applications = appsResponse.data.data;
                        } else if (appsResponse.data.data.data) {
                            applications = appsResponse.data.data.data;
                            applicationsPagination = appsResponse.data.data.pagination;
                        } else {
                            applications = [];
                        }
                    }
                }
            } catch (appsErr) {
                console.log('Error fetching applications:', appsErr);
            }

            // Show all applications as the main list (so every BNPL application is visible).
            // If there are no applications, fall back to showing orders only.
            const allItems = applications.length > 0 ? applications : orders;
            const finalPagination = (applications.length > 0 ? applicationsPagination : ordersPagination) || {
                current_page: 1,
                last_page: 1,
                per_page: 15,
                total: applications.length || orders.length || 0
            };

            console.log('Combined items:', { orders: orders.length, applications: applications.length, allItems: allItems.length });

            setOrderData({ 
                orders: allItems, 
                isList: true,
                isApplications: applications.length > 0 // Treat as applications so labels and navigation use application ID
            });
            setPagination(finalPagination);
        } catch (err) {
            console.error('Error fetching orders/applications:', err);
            setError(err.response?.data?.message || 'Failed to load loan information');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved':
            case 'completed':
            case 'paid':
                return <CheckCircle size={24} className="text-green-600" />;
            case 'rejected':
            case 'cancelled':
                return <XCircle size={24} className="text-red-600" />;
            case 'pending':
            case 'processing':
                return <Clock size={24} className="text-blue-600" />;
            default:
                return <AlertCircle size={24} className="text-yellow-600" />;
        }
    };

    const getStatusBadge = (status) => {
        const statusLower = status?.toLowerCase() || 'pending';
        const badges = {
            approved: 'bg-green-100 text-green-800 border-green-300',
            completed: 'bg-green-100 text-green-800 border-green-300',
            paid: 'bg-green-100 text-green-800 border-green-300',
            rejected: 'bg-red-100 text-red-800 border-red-300',
            cancelled: 'bg-red-100 text-red-800 border-red-300',
            pending: 'bg-blue-100 text-blue-800 border-blue-300',
            processing: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            overdue: 'bg-red-100 text-red-800 border-red-300'
        };
        return badges[statusLower] || badges.pending;
    };

    const confirmDownPayment = async (applicationId, txId, amount) => {
        const token = localStorage.getItem('access_token');
        if (!token) return null;
        try {
            const payload = {
                amount_paid: amount,
            };
            if (txId != null && txId !== '') {
                payload.transaction_reference = String(txId);
            }
            const { data } = await axios.post(
                API.BNPL_CONFIRM_DOWN_PAYMENT(applicationId),
                payload,
                {
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (data?.status !== 'success') return null;
            return data?.data || data;
        } catch (e) {
            console.error('Down payment confirmation failed:', e);
            return null;
        }
    };

    const handlePayDownPayment = async () => {
        if (!id || !id.startsWith('app-')) return;
        const applicationId = id.replace('app-', '');
        const order = orderData;
        if (!order?.loan_calculation?.down_payment) return;
        const downPaymentAmount = parseAmount(order.loan_calculation.down_payment);
        if (downPaymentAmount <= 0) return;

        setProcessingDownPayment(true);
        try {
            await ensureFlutterwave();
            const txRef = 'deposit_' + applicationId + '_' + Date.now();
            const CANDIDATE_KEYS = ['user', 'user_info', 'auth_user', 'current_user', 'profile', 'logged_in_user'];
            let userInfo = null;
            for (const key of CANDIDATE_KEYS) {
                try {
                    const raw = localStorage.getItem(key);
                    if (raw) {
                        const parsed = JSON.parse(raw);
                        if (parsed && typeof parsed === 'object') {
                            userInfo = parsed;
                            break;
                        }
                    }
                } catch (e) {}
            }
            const userEmail = userInfo?.email || userInfo?.user_email || 'customer@troosolar.com';
            const userName = userInfo?.name || userInfo?.full_name
                || (userInfo?.first_name && userInfo?.sur_name ? `${userInfo.first_name} ${userInfo.sur_name}` : null)
                || (userInfo?.first_name && userInfo?.last_name ? `${userInfo.first_name} ${userInfo.last_name}` : null)
                || 'Customer';
            const userPhone = userInfo?.phone || userInfo?.phone_number || '';

            window.FlutterwaveCheckout({
                public_key: 'FLWPUBK_TEST-dd1514f7562b1d623c4e63fb58b6aedb-X',
                tx_ref: txRef,
                amount: downPaymentAmount,
                currency: 'NGN',
                payment_options: 'card,ussd,banktransfer',
                customer: {
                    email: userEmail,
                    name: userName,
                    ...(userPhone ? { phone_number: userPhone } : {}),
                },
                callback: async (response) => {
                    if (response?.status === 'successful') {
                        try {
                            const txId = response?.transaction_id || response?.id || response?.flw_ref || txRef;
                            const result = await confirmDownPayment(applicationId, txId, downPaymentAmount);
                            if (result) {
                                alert('Down payment successful! Your order will proceed.');
                                if (result.order_id) {
                                    setProcessingDownPayment(false);
                                    navigate(`/bnpl-loans/${result.order_id}`, { replace: true });
                                    return;
                                }
                                fetchApplicationDetails(applicationId);
                            } else {
                                alert('Payment verification failed. Please contact support if amount was debited.');
                            }
                        } catch (err) {
                            console.error('Down payment confirmation error:', err);
                            alert('Payment successful but confirmation failed. Please contact support.');
                        }
                    } else {
                        alert('Payment was not completed. Please try again.');
                    }
                    setProcessingDownPayment(false);
                },
                onclose: () => setProcessingDownPayment(false),
                customizations: {
                    title: 'BNPL Down Payment',
                    description: `Down payment for Application #${applicationId}`,
                    logo: 'https://yourdomain.com/logo.png',
                },
            });
        } catch (err) {
            console.error('Down payment init failed:', err);
            alert('Failed to initialize payment. Please try again.');
            setProcessingDownPayment(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-NG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return '₦0.00';
        const numAmount = typeof amount === 'string' 
            ? parseFloat(amount.replace(/,/g, '')) 
            : amount;
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(numAmount || 0);
    };

    const renderOrderList = () => {
        if (!orderData?.orders || orderData.orders.length === 0) {
            return (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <FileText size={64} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        No BNPL Loans Found
                    </h3>
                    <p className="text-gray-600 mb-6">
                        You don't have any BNPL applications or orders yet.
                    </p>
                    <button
                        onClick={() => navigate('/bnpl')}
                        className="px-6 py-3 bg-[#273e8e] text-white rounded-lg font-semibold hover:bg-[#1a2b6b] transition-colors"
                    >
                        Apply for BNPL
                    </button>
                </div>
            );
        }

        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Your BNPL {orderData.isApplications ? 'Applications' : 'Orders'} ({pagination.total})
                    </h2>
                </div>
                <div className="divide-y divide-gray-200">
                    {orderData.orders.map((item) => {
                        // Handle both orders and applications
                        const isApplication = orderData.isApplications || !item.order_id;
                        const itemId = item.id;
                        const itemStatus = item.status;
                        const loanAmount = item.loan_amount || item.loan_summary?.loan_amount || item.loan_summary?.total_amount;
                        const repaymentDuration = item.repayment_duration || item.loan_summary?.repayment_duration || item.loan_summary?.duration;
                        const displayId = isApplication ? `Application #${itemId}` : `Order #${itemId}`;
                        
                        return (
                            <div
                                key={itemId}
                                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                                onClick={() => {
                                    // If it's an application, navigate using application ID, otherwise use order ID
                                    if (isApplication) {
                                        // For applications, we can show details using the application status endpoint
                                        navigate(`/bnpl-loans/app-${itemId}`);
                                    } else {
                                        navigate(`/bnpl-loans/${itemId}`);
                                    }
                                }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        {getStatusIcon(itemStatus)}
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800">
                                                {displayId}
                                            </p>
                                            {loanAmount && (
                                                <p className="text-sm text-gray-500">
                                                    {formatCurrency(loanAmount)} • {repaymentDuration || 'N/A'} months
                                                </p>
                                            )}
                                            {item.property_address && (
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {item.property_address}, {item.property_state || ''}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(itemStatus)}`}>
                                            {itemStatus?.toUpperCase().replace(/_/g, ' ') || 'PENDING'}
                                        </span>
                                        <ArrowRight className="text-gray-400" size={20} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Showing {pagination.current_page} of {pagination.last_page} pages
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => fetchAllOrders(pagination.current_page - 1)}
                                disabled={pagination.current_page === 1}
                                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="px-4 py-2 text-sm font-medium text-gray-700">
                                Page {pagination.current_page} of {pagination.last_page}
                            </span>
                            <button
                                onClick={() => fetchAllOrders(pagination.current_page + 1)}
                                disabled={pagination.current_page === pagination.last_page}
                                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={20} className="rotate-180" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Helper function to parse amount (handles strings with commas)
    const parseAmount = (amount) => {
        if (!amount) return 0;
        if (typeof amount === 'number') return amount;
        // Remove commas and parse
        return parseFloat(String(amount).replace(/,/g, '')) || 0;
    };

    // Calculate repayment summary from loan calculation and schedule
    const calculateRepaymentSummary = (loanCalc, repaymentSchedule, installmentsWithHistory) => {
        if (!loanCalc) return null;
        
        const totalAmount = parseAmount(loanCalc.total_amount || loanCalc.loan_amount);
        
        // Calculate paid amount from installments with history
        let paidAmount = 0;
        if (installmentsWithHistory?.history) {
            paidAmount = installmentsWithHistory.history.reduce((sum, inst) => {
                if (inst.status === 'paid' || inst.payment_status === 'paid') {
                    return sum + parseAmount(inst.amount || inst.payment_amount);
                }
                return sum;
            }, 0);
        } else if (repaymentSchedule && repaymentSchedule.length > 0) {
            paidAmount = repaymentSchedule.reduce((sum, inst) => {
                if (inst.status === 'paid' || inst.payment_status === 'paid') {
                    return sum + parseAmount(inst.amount || inst.payment_amount);
                }
                return sum;
            }, 0);
        }
        
        const pendingAmount = totalAmount - paidAmount;
        
        // Calculate overdue amount
        let overdueAmount = 0;
        if (installmentsWithHistory?.history) {
            overdueAmount = installmentsWithHistory.history.reduce((sum, inst) => {
                const dueDate = new Date(inst.due_date || inst.payment_date);
                const today = new Date();
                if ((inst.status === 'pending' || inst.payment_status === 'pending') && dueDate < today) {
                    return sum + parseAmount(inst.amount || inst.payment_amount);
                }
                return sum;
            }, 0);
        } else if (repaymentSchedule && repaymentSchedule.length > 0) {
            overdueAmount = repaymentSchedule.reduce((sum, inst) => {
                const dueDate = new Date(inst.due_date || inst.payment_date);
                const today = new Date();
                if ((inst.status === 'pending' || inst.payment_status === 'pending') && dueDate < today) {
                    return sum + parseAmount(inst.amount || inst.payment_amount);
                }
                return sum;
            }, 0);
        }
        
        return {
            total_amount: totalAmount,
            paid_amount: paidAmount,
            pending_amount: pendingAmount,
            overdue_amount: overdueAmount
        };
    };

    const renderOrderDetails = () => {
        if (!orderData || orderData.isList) return null;

        const order = orderData;
        const isApplication = order.isApplication;
        const loanApp = order.loan_application || order.application || (isApplication ? order : null);
        const loanCalc = order.loan_calculation || loanApp?.loan_calculation;
        const repaymentSchedule = order.repayment_schedule || [];
        const repaymentHistory = order.repayment_history || [];
        
        // Calculate repayment summary if not provided
        const repaymentSummary = order.repayment_summary || calculateRepaymentSummary(
            loanCalc, 
            repaymentSchedule, 
            installmentsWithHistory
        );

        return (
            <div className="space-y-6">
                {/* Header Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            {getStatusIcon(order.status)}
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {isApplication ? `BNPL Application #${order.id}` : `BNPL Order #${order.id}`}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {isApplication ? 'Application' : 'Order'} created on {formatDate(order.created_at)}
                                </p>
                            </div>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusBadge(order.status)}`}>
                            {order.status?.toUpperCase().replace(/_/g, ' ') || 'PENDING'}
                        </span>
                    </div>
                </div>

                {/* Down payment completed – show order link when application has an order */}
                {isApplication && (order.order_id || order.down_payment_completed) && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="text-green-600" size={28} />
                                <div>
                                    <h3 className="text-lg font-semibold text-green-800">Down payment completed</h3>
                                    <p className="text-sm text-green-700">Your BNPL order has been placed. View your order for repayment schedule and installments.</p>
                                    {order.order_number && <p className="text-sm text-green-600 mt-1">Order #{order.order_number}</p>}
                                </div>
                            </div>
                            {order.order_id && (
                                <button
                                    type="button"
                                    onClick={() => navigate(`/bnpl-loans/${order.order_id}`)}
                                    className="px-6 py-3 bg-[#273e8e] text-white font-semibold rounded-lg hover:bg-[#1a2b6b] transition-colors whitespace-nowrap"
                                >
                                    View order
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Repayment Summary */}
                {repaymentSummary && Object.keys(repaymentSummary).length > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <TrendingUp className="text-[#273e8e]" size={24} />
                            <h3 className="text-xl font-semibold text-gray-800">Repayment Summary</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white rounded-lg p-4 border border-blue-100">
                                <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                                <p className="text-xl font-bold text-gray-800">
                                    {formatCurrency(repaymentSummary.total_amount || repaymentSummary.total || 0)}
                                </p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-blue-100">
                                <p className="text-sm text-gray-500 mb-1">Amount Paid</p>
                                <p className="text-xl font-bold text-green-600">
                                    {formatCurrency(repaymentSummary.paid_amount || repaymentSummary.paid || 0)}
                                </p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-blue-100">
                                <p className="text-sm text-gray-500 mb-1">Pending Amount</p>
                                <p className="text-xl font-bold text-yellow-600">
                                    {formatCurrency(repaymentSummary.pending_amount || repaymentSummary.pending || 0)}
                                </p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-blue-100">
                                <p className="text-sm text-gray-500 mb-1">Overdue Amount</p>
                                <p className="text-xl font-bold text-red-600">
                                    {formatCurrency(repaymentSummary.overdue_amount || repaymentSummary.overdue || 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loan Calculation Summary */}
                {loanCalc && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <DollarSign className="text-[#273e8e]" size={24} />
                            <h3 className="text-xl font-semibold text-gray-800">Loan Calculation</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white rounded-lg p-4 border border-green-100">
                                <p className="text-sm text-gray-500 mb-1">Loan Amount</p>
                                <p className="text-xl font-bold text-gray-800">
                                    {formatCurrency(loanCalc.loan_amount)}
                                </p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-green-100">
                                <p className="text-sm text-gray-500 mb-1">Down Payment</p>
                                <p className="text-xl font-bold text-gray-800">
                                    {formatCurrency(loanCalc.down_payment)}
                                </p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-green-100">
                                <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                                <p className="text-xl font-bold text-gray-800">
                                    {formatCurrency(loanCalc.total_amount)}
                                </p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-green-100">
                                <p className="text-sm text-gray-500 mb-1">Interest Rate</p>
                                <p className="text-xl font-bold text-gray-800">
                                    {loanCalc.interest_rate || 'N/A'}%
                                </p>
                            </div>
                        </div>
                        {loanCalc.monthly_repayment && (
                            <div className="mt-4 bg-white rounded-lg p-4 border border-green-100">
                                <p className="text-sm text-gray-500 mb-1">Monthly Repayment</p>
                                <p className="text-2xl font-bold text-[#273e8e]">
                                    {formatCurrency(loanCalc.monthly_repayment)}
                                </p>
                            </div>
                        )}
                        {/* Pay Down Payment – show when approved, down payment not yet paid, and no order yet */}
                        {isApplication &&
                            (order.status?.toLowerCase() === 'approved' || order.status?.toLowerCase() === 'counter_offer_accepted') &&
                            !order.order_id &&
                            !order.down_payment_completed &&
                            loanCalc.down_payment &&
                            parseAmount(repaymentSummary?.paid_amount ?? 0) < parseAmount(loanCalc.down_payment) && (
                            <div className="mt-4 bg-white rounded-lg p-4 border-2 border-[#273e8e]">
                                <p className="text-sm text-gray-600 mb-2">
                                    Pay your down payment to proceed with your order.
                                </p>
                                <button
                                    type="button"
                                    onClick={handlePayDownPayment}
                                    disabled={processingDownPayment}
                                    className="w-full sm:w-auto px-6 py-3 bg-[#273e8e] text-white font-semibold rounded-lg hover:bg-[#1a2b6b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {processingDownPayment ? (
                                        <>Processing...</>
                                    ) : (
                                        <>
                                            <CreditCard size={20} />
                                            Pay Down Payment ({formatCurrency(loanCalc.down_payment)})
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Overdue Warning Banner */}
                {installmentsWithHistory?.hasOverdue && (
                    <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="text-red-600" size={24} />
                            <div className="flex-1">
                                <h3 className="font-semibold text-red-800 mb-1">
                                    Overdue Payments Detected
                                </h3>
                                <p className="text-sm text-red-700">
                                    You have {installmentsWithHistory.overdueCount || 0} overdue installment(s) totaling {formatCurrency(installmentsWithHistory.overdueAmount || 0)}. Please pay immediately to avoid penalties.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Repayment Summary Cards */}
                {repaymentSchedule && repaymentSchedule.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <p className="text-sm text-gray-500 mb-1">Total Installments</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {repaymentSchedule.length}
                            </p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <p className="text-sm text-gray-500 mb-1">Paid</p>
                            <p className="text-2xl font-bold text-green-600">
                                {repaymentSchedule.filter(inst => inst.status === 'paid' || inst.computed_status === 'paid').length}
                            </p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <p className="text-sm text-gray-500 mb-1">Pending</p>
                            <p className="text-2xl font-bold text-yellow-600">
                                {repaymentSchedule.filter(inst => inst.status !== 'paid' && inst.computed_status !== 'paid').length}
                            </p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <p className="text-sm text-gray-500 mb-1">Overdue</p>
                            <p className="text-2xl font-bold text-red-600">
                                {repaymentSchedule.filter(inst => {
                                    const dueDate = new Date(inst.due_date || inst.payment_date);
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    dueDate.setHours(0, 0, 0, 0);
                                    return dueDate < today && inst.status !== 'paid' && inst.computed_status !== 'paid';
                                }).length}
                            </p>
                        </div>
                    </div>
                )}

                {/* Current Month Installments */}
                {installmentsWithHistory?.current_month && installmentsWithHistory.current_month.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-6 mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Clock className="text-[#273e8e]" size={24} />
                            <h3 className="text-xl font-semibold text-gray-800">Current Month Installments</h3>
                        </div>
                        <div className="space-y-3">
                            {installmentsWithHistory.current_month.map((installment, index) => {
                                const isOverdue = installment.is_overdue || (new Date(installment.payment_date || installment.due_date) < new Date() && installment.status !== 'paid');
                                return (
                                    <div
                                        key={installment.id || index}
                                        className={`bg-white rounded-lg p-4 border-2 ${
                                            isOverdue ? 'border-red-300 bg-red-50' : 'border-blue-100'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-sm font-semibold text-gray-700">
                                                        Installment #{installment.installment_number || 'N/A'}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(installment.status || installment.computed_status)}`}>
                                                        {(installment.status || installment.computed_status)?.toUpperCase() || 'PENDING'}
                                                    </span>
                                                    {isOverdue && (
                                                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
                                                            OVERDUE
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    Due: {formatDate(installment.payment_date || installment.due_date)}
                                                </p>
                                                {installment.remaining_duration && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {installment.remaining_duration} installments remaining
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-[#273e8e] mb-2">
                                                    {formatCurrency(installment.amount)}
                                                </p>
                                                {installment.status !== 'paid' && installment.computed_status !== 'paid' && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedInstallment(installment);
                                                            setShowPaymentModal(true);
                                                        }}
                                                        className="px-4 py-2 bg-[#273e8e] text-white text-sm font-semibold rounded-lg hover:bg-[#1a2b6b] transition-colors"
                                                    >
                                                        Pay Now
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Repayment Calendar */}
                {repaymentSchedule && repaymentSchedule.length > 0 && (
                    <RepaymentCalendar
                        installments={repaymentSchedule}
                        onInstallmentClick={(installment) => {
                            if (installment.status !== 'paid') {
                                setSelectedInstallment(installment);
                                setShowPaymentModal(true);
                            }
                        }}
                    />
                )}

                {/* Repayment Schedule Table */}
                {repaymentSchedule && repaymentSchedule.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Calendar className="text-[#273e8e]" size={20} />
                            <h3 className="text-lg font-semibold text-gray-800">Repayment Schedule</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Installment #</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {repaymentSchedule.map((installment, index) => {
                                        const isOverdue = new Date(installment.due_date) < new Date() && installment.status !== 'paid';
                                        const canPay = installment.status !== 'paid' && installment.id;
                                        return (
                                            <tr key={installment.id || index} className={isOverdue ? 'bg-red-50' : ''}>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                    {installment.installment_number || index + 1}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-700">
                                                    {formatDate(installment.due_date)}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                                    {formatCurrency(installment.amount)}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(installment.status)}`}>
                                                        {installment.status?.toUpperCase() || 'PENDING'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-700">
                                                    {installment.payment_date ? formatDate(installment.payment_date) : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {canPay ? (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedInstallment(installment);
                                                                setShowPaymentModal(true);
                                                            }}
                                                            className="px-3 py-1.5 bg-[#273e8e] text-white text-xs font-semibold rounded-lg hover:bg-[#1a2b6b] transition-colors"
                                                        >
                                                            Pay Now
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Repayment History */}
                {repaymentHistory && repaymentHistory.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Receipt className="text-[#273e8e]" size={20} />
                            <h3 className="text-lg font-semibold text-gray-800">Repayment History</h3>
                        </div>
                        <div className="space-y-4">
                            {repaymentHistory.map((payment, index) => (
                                <div key={payment.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-4">
                                        <CheckCircle2 className="text-green-600" size={20} />
                                        <div>
                                            <p className="font-semibold text-gray-800">
                                                {formatCurrency(payment.amount)}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Paid on {formatDate(payment.payment_date || payment.created_at)}
                                            </p>
                                            {payment.reference && (
                                                <p className="text-xs text-gray-400">
                                                    Reference: {payment.reference}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(payment.status || 'paid')}`}>
                                        {payment.status?.toUpperCase() || 'PAID'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Loan Application Details */}
                {loanApp && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <FileText className="text-[#273e8e]" size={20} />
                                <h3 className="text-lg font-semibold text-gray-800">Application Details</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Application ID</p>
                                    <p className="font-semibold text-gray-800">#{loanApp.id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Loan Amount</p>
                                    <p className="font-semibold text-gray-800">
                                        {formatCurrency(loanApp.loan_amount)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Repayment Duration</p>
                                    <p className="font-semibold text-gray-800">
                                        {loanApp.repayment_duration || 'N/A'} months
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Credit Check Method</p>
                                    <p className="font-semibold text-gray-800 capitalize">
                                        {loanApp.credit_check_method || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Customer Type</p>
                                    <p className="font-semibold text-gray-800 capitalize">
                                        {loanApp.customer_type || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Status</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(loanApp.status)}`}>
                                        {loanApp.status?.toUpperCase().replace(/_/g, ' ') || 'PENDING'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Property Information */}
                        {(loanApp.property_address || loanApp.property_state) && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Home className="text-[#273e8e]" size={20} />
                                    <h3 className="text-lg font-semibold text-gray-800">Property Information</h3>
                                </div>
                                <div className="space-y-4">
                                    {loanApp.property_state && (
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">State</p>
                                            <p className="font-semibold text-gray-800">
                                                {loanApp.property_state}
                                            </p>
                                        </div>
                                    )}
                                    {loanApp.property_address && (
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Address</p>
                                            <p className="font-semibold text-gray-800">
                                                {loanApp.property_address}
                                            </p>
                                        </div>
                                    )}
                                    {loanApp.property_landmark && (
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Landmark</p>
                                            <p className="font-semibold text-gray-800">
                                                {loanApp.property_landmark}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Guarantor Information */}
                {loanApp?.guarantor && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <User className="text-[#273e8e]" size={20} />
                            <h3 className="text-lg font-semibold text-gray-800">Guarantor Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Full Name</p>
                                <p className="font-semibold text-gray-800">
                                    {loanApp.guarantor.full_name || 'N/A'}
                                </p>
                            </div>
                            {loanApp.guarantor.email && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Email</p>
                                    <p className="font-semibold text-gray-800">
                                        {loanApp.guarantor.email}
                                    </p>
                                </div>
                            )}
                            {loanApp.guarantor.phone && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Phone</p>
                                    <p className="font-semibold text-gray-800">
                                        {loanApp.guarantor.phone}
                                    </p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Status</p>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(loanApp.guarantor.status)}`}>
                                    {loanApp.guarantor.status?.toUpperCase() || 'PENDING'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Back Button */}
                <div className="flex justify-start">
                    <button
                        onClick={() => navigate('/bnpl-loans')}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                    >
                        <ChevronLeft size={20} />
                        Back to Orders List
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F5F7FF] flex">
            <SideBar />
            <div className="flex-1 flex flex-col">
                <TopNavbar />
                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-[#273e8e] mb-2">
                                {id ? 'BNPL Loan Details' : 'My BNPL Loans'}
                            </h1>
                            <p className="text-gray-600">
                                {id 
                                    ? 'Complete details of your Buy Now Pay Later loan'
                                    : 'View and manage all your Buy Now Pay Later applications and orders'}
                            </p>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                                <Loading fullScreen={false} message="Loading loan details..." progress={null} />
                            </div>
                        )}

                        {/* Error State */}
                        {error && !loading && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                                <div className="flex items-center">
                                    <AlertCircle className="text-red-600 mr-3" size={24} />
                                    <div>
                                        <h3 className="font-semibold text-red-800">Error</h3>
                                        <p className="text-red-600">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Content */}
                        {!loading && !error && (
                            <>
                                {orderData?.isList ? renderOrderList() : renderOrderDetails()}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            <BNPLPaymentModal
                installment={selectedInstallment}
                isOpen={showPaymentModal}
                onClose={() => {
                    setShowPaymentModal(false);
                    setSelectedInstallment(null);
                }}
                onSuccess={() => {
                    // Refresh order details after successful payment
                    if (id) {
                        if (id.startsWith('app-')) {
                            const applicationId = id.replace('app-', '');
                            fetchApplicationDetails(applicationId);
                        } else {
                            fetchOrderDetails(id);
                        }
                    } else {
                        fetchAllOrders();
                    }
                    // Also refresh installments with history
                    const token = localStorage.getItem('access_token');
                    if (token) {
                        axios.get(API.Loan_Payment_Relate, {
                            headers: { 
                                Authorization: `Bearer ${token}`,
                                Accept: 'application/json'
                            }
                        }).then(response => {
                            if (response.data.status === 'success' && response.data.data) {
                                setInstallmentsWithHistory(response.data.data);
                            }
                        }).catch(err => {
                            console.log('Could not refresh installments with history:', err);
                        });
                    }
                }}
            />
        </div>
    );
};

export default BNPLLoanDetails;
