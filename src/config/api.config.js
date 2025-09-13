// src/config/api.config.js
export const BASE_URL = 'https://troosolar.hmstech.org/api';

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




    // add more when needed
};

export default API;
