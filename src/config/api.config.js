// src/config/api.config.js
export const BASE_URL = 'https://troosolar.hmstech.org/api';

// export const BASE_URL = 'http://127.0.0.1:8000/api';

const API = {
    LOGIN: `${BASE_URL}/login`,
    REGISTER: `${BASE_URL}/register`,
    VERIFY_OTP_USER: (userId) => `${BASE_URL}/verify-otp/${userId}`, // 👈 add this
    LINK_ACCOUNTS: `${BASE_URL}/link-accounts`,
    LOAN_CALCULATION: `${BASE_URL}/loan-calculation`,
    MONO_LOAN: (loanCalculationId) => `${BASE_URL}/mono-loan/${loanCalculationId}`,
    LOAN_APPLICATION_DOCS: (monoLoanId) => `${BASE_URL}/loan-application/${monoLoanId}`,
    BENEFICIARY_DETAIL: (monoLoanId) => `${BASE_URL}/beneficiary-detail/${monoLoanId}`,
    LOAN_DETAILS: (monoLoanId) => `${BASE_URL}/loan-details/${monoLoanId}`,
    LOAN_WALLET: `${BASE_URL}/loan-wallet`,
    LOAN_DASHBOARD: `${BASE_URL}/loan-dashboard`,
    CATEGORIES: `${BASE_URL}/categories`,
    CATEGORY_BY_ID: (id) => `${BASE_URL}/categories/${id}`,
    CATEGORY_PRODUCTS: (id) => `${BASE_URL}/categories/${id}/products`,
    PRODUCTS: `${BASE_URL}/products`,
    PRODUCT_BY_ID: (id) => `${BASE_URL}/products/${id}`,
    BUNDLES: `${BASE_URL}/bundles`,
    BUNDLE_BY_ID: (id) => `${BASE_URL}/bundles/${id}`,
    UPDATE_USER: `${BASE_URL}/update-user`,
    CART: `${BASE_URL}/cart`,
    CART_ITEM: (id) => `${BASE_URL}/cart/${id}`,
    CART_ACCESS: (token) => `${BASE_URL}/cart/access/${token}`,
    DELIVERY_ADDRESS_STORE: `${BASE_URL}/delivery-address/store`,
    DELIVERY_ADDRESS_SHOW: (id) => `${BASE_URL}/delivery-address/show/${id}`,
    DELIVERY_ADDRESS_UPDATE: (id) => `${BASE_URL}/delivery-address/update/${id}`,
    CART_CHECKOUT_SUMMARY: `${BASE_URL}/cart/checkout-summary`,
    ORDERS: `${BASE_URL}/orders`,
    TICKETS: `${BASE_URL}/website/tickets`,
    LOGOUT: `${BASE_URL}/logout`,
    CATEGORY_BRANDS: (id) => `${BASE_URL}/categories/${id}/brands`,
    BRAND_PRODUCTS: (idsCsv) => `${BASE_URL}/brands/${idsCsv}/products`,
    PRODUCT_REVIEWS: `${BASE_URL}/product-reviews`,
    Fund_Wallet: `${BASE_URL}/fund-wallet`,
    Payment_Confirmation: `${BASE_URL}/order/payment-confirmation`,
    Order_Details: (id) => `${BASE_URL}/order/details/${id}`,
    Forgot_Password: `${BASE_URL}/forget-password`,
    Verify_Reset_Password_OTP: `${BASE_URL}/verify-reset-password-otp`,
    Reset_Password: `${BASE_URL}/reset-password`,
    Transaction_History: `${BASE_URL}/transactions`,
    Get_Referral_Details: `${BASE_URL}/get-referral-details`,
    Withdraw_Referral_Balance: `${BASE_URL}/withdraw`,
    Loan_Calculation_Status: `${BASE_URL}/loan-calculation-stauts`,
    Loan_Calculation_finalize: (id) => `${BASE_URL}/loan-calculation-finalized/${id}`,
    Offered_Loan_Calculation: `${BASE_URL}/offered-loan-calculation`,
    Loan_Payment_Relate: `${BASE_URL}/installments/with-history`,
    Loan_Payment_Repay: (id) => `${BASE_URL}/installments/${id}/pay`,
    Get_All_Addresses: `${BASE_URL}/delivery-address/index`,
    Update_Address: (id) => `${BASE_URL}/delivery-address/update/${id}`,
    Delete_Address: (id) => `${BASE_URL}/delivery-address/delete/${id}`,
    Add_Address: `${BASE_URL}/delivery-address/store`,
    Product_Reviews: `${BASE_URL}/product-reviews`,
    Update_Product_Review: (id) => `${BASE_URL}/product-reviews/${id}`,
    Kyc_Upload: `${BASE_URL}/kyc`,




    // BNPL & Buy Now Endpoints
    CONFIG_CUSTOMER_TYPES: `${BASE_URL}/config/customer-types`,
    CONFIG_AUDIT_TYPES: `${BASE_URL}/config/audit-types`,
    CONFIG_LOAN_CONFIGURATION: `${BASE_URL}/config/loan-configuration`,
    CONFIG_ADD_ONS: `${BASE_URL}/config/add-ons`,
    CONFIG_STATES: `${BASE_URL}/config/states`,
    CONFIG_DELIVERY_LOCATIONS: (stateId) => `${BASE_URL}/config/delivery-locations?state_id=${stateId}`,
    BNPL_APPLY: `${BASE_URL}/bnpl/apply`,
    BNPL_APPLICATIONS: `${BASE_URL}/bnpl/applications`,
    BNPL_STATUS: (id) => `${BASE_URL}/bnpl/status/${id}`,
    BNPL_GUARANTOR_INVITE: `${BASE_URL}/bnpl/guarantor/invite`,
    BNPL_GUARANTOR_FORM: `${BASE_URL}/bnpl/guarantor/form`,
    BNPL_GUARANTOR_UPLOAD: `${BASE_URL}/bnpl/guarantor/upload`,
    BNPL_COUNTEROFFER_ACCEPT: `${BASE_URL}/bnpl/counteroffer/accept`,
    BNPL_INVOICE: (applicationId) => `${BASE_URL}/bnpl/invoice/${applicationId}`,
    BNPL_PROCESS_CREDIT_CHECK: `${BASE_URL}/bnpl/process-credit-check`,
    BUY_NOW_CHECKOUT: `${BASE_URL}/orders/checkout`,
    CALENDAR_SLOTS: `${BASE_URL}/calendar/slots`,
    
    // Audit Request Endpoints
    AUDIT_REQUEST: `${BASE_URL}/audit/request`,
    AUDIT_REQUEST_BY_ID: (id) => `${BASE_URL}/audit/request/${id}`,
    AUDIT_REQUESTS: `${BASE_URL}/audit/requests`,

    // add more when needed
};

export default API;
