# TrooSolar Home Page - Service Cards Integration Guide

This document explains how the **Buy Now** and **Buy Now Pay Later (BNPL)** service cards on the home page integrate with the backend, including required API calls, configuration data, and the complete flow from card click to application start.

---

## 📋 Overview

The home page (`/dashboard` or `/`) displays three service cards:
1. **Buy Now** - Purchase solar systems outright
2. **Buy Now, Pay Later (BNPL)** - Flexible payment plans (marked as POPULAR)
3. **Solar Shop** - Browse products

This document focuses on the **Buy Now** and **BNPL** cards and their backend integration.

---

## 🎨 Frontend Component Structure

### ServiceCards Component
**Location:** `src/Component/ServiceCards.jsx`

**Current Implementation:**
- Static component with no API calls
- Buy Now card → Links to `/buy-now`
- BNPL card → Links to `/bnpl`
- Both cards are clickable and navigate to respective flows

**Card Details:**

#### Buy Now Card
- **Title:** "Buy Now"
- **Description:** "Purchase your solar system outright. Best prices & ownership."
- **CTA:** "Get Started"
- **Route:** `/buy-now`
- **Icon:** CreditCard (blue theme)

#### BNPL Card
- **Title:** "Buy Now, Pay Later"
- **Description:** "Flexible payment plans. Start with a small deposit."
- **CTA:** "Apply Now"
- **Route:** `/bnpl`
- **Icon:** Sun (yellow accent, blue gradient background)
- **Badge:** "POPULAR" (yellow badge)

---

## 🔄 Integration Flow

### When User Clicks "Buy Now" Card

```
User clicks "Buy Now" card
  ↓
Navigate to /buy-now route
  ↓
BuyNowFlow component loads
  ↓
Step 1: Customer Type Selection (Static - no API call)
  ↓
Step 2: Product Category Selection (Static - no API call)
  ↓
Step 3: Method Selection (if applicable)
  ↓
Step 4: Checkout Options
  ↓
POST /api/orders/checkout (with configuration data)
  ↓
Step 5: Invoice & Payment
```

### When User Clicks "BNPL" Card

```
User clicks "BNPL" card
  ↓
Navigate to /bnpl route
  ↓
BNPLFlow component loads
  ↓
Fetch Configuration Data (on component mount):
  ├─→ GET /api/config/customer-types
  └─→ GET /api/config/audit-types
  ↓
Step 1: Customer Type Selection (Dynamic from API)
  ↓
Step 2: Product Category Selection (Static)
  ↓
Step 3: Method Selection (if applicable)
  ↓
Step 4: Audit Type Selection (Dynamic from API)
  ↓
... (continues through BNPL flow)
  ↓
Step 11: Final Application Form
  ↓
POST /api/bnpl/apply
```

---

## 🔌 Required Backend API Endpoints

### 1. Get Customer Types (BNPL Flow)
**Endpoint:** `GET /api/config/customer-types`

**Purpose:** Fetch available customer types for BNPL flow Step 1

**Headers:**
```
Accept: application/json
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "residential",
      "label": "For Residential"
    },
    {
      "id": "sme",
      "label": "For SMEs"
    },
    {
      "id": "commercial",
      "label": "Commercial & Industrial"
    }
  ]
}
```

**Frontend Usage:**
- Called when BNPL flow component mounts
- Used to populate Step 1 customer type options
- If API fails, frontend uses hardcoded fallback values

**Implementation Status:** ✅ Created (ConfigurationController)

---

### 2. Get Audit Types (BNPL Flow)
**Endpoint:** `GET /api/config/audit-types`

**Purpose:** Fetch available audit types for BNPL flow Step 4

**Headers:**
```
Accept: application/json
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "home-office",
      "label": "Home / Office"
    },
    {
      "id": "commercial",
      "label": "Commercial / Industrial"
    }
  ]
}
```

**Frontend Usage:**
- Called when BNPL flow component mounts
- Used to populate Step 4 audit type options
- If API fails, frontend uses hardcoded fallback values

**Implementation Status:** ✅ Created (ConfigurationController)

---

### 3. Get Loan Configuration (BNPL Flow - Recommended)
**Endpoint:** `GET /api/config/loan-configuration`

**Purpose:** Fetch loan configuration for loan calculator (interest rates, fees, minimum amounts)

**Headers:**
```
Accept: application/json
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "insurance_fee_percentage": 0.50,
    "residual_fee_percentage": 1.00,
    "equity_contribution_min": 30.00,
    "equity_contribution_max": 80.00,
    "interest_rate_min": 3.00,
    "interest_rate_max": 4.00,
    "repayment_tenor_min": 1,
    "repayment_tenor_max": 12,
    "management_fee_percentage": 1.00,
    "minimum_loan_amount": 1500000.00
  }
}
```

**Frontend Usage:**
- Called when BNPL flow reaches Loan Calculator step (Step 8)
- Used to configure loan calculator:
  - Minimum deposit: `equity_contribution_min` (30%)
  - Maximum deposit: `equity_contribution_max` (80%)
  - Interest rate range: `interest_rate_min` to `interest_rate_max` (3-4%)
  - Tenor options: Based on `repayment_tenor_min` and `repayment_tenor_max` (typically 3, 6, 9, 12 months)
  - Minimum loan amount validation: `minimum_loan_amount` (₦1,500,000)

**Implementation Status:** ⚠️ Pending (Route exists, controller needs implementation)

---

### 4. Get Add-Ons (Both Flows - Recommended)
**Endpoint:** `GET /api/config/add-ons`

**Purpose:** Fetch available add-ons (Insurance, Maintenance, etc.) for checkout

**Headers:**
```
Accept: application/json
```

**Query Parameters (Optional):**
- `type` - Filter by type: `buy_now` | `bnpl`
- `is_compulsory` - Filter compulsory add-ons: `true` | `false`

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "title": "Insurance",
      "description": "System insurance coverage (0.5% of product price)",
      "price": 0.00,
      "type": "service",
      "is_compulsory_bnpl": true,
      "is_compulsory_buy_now": false,
      "is_optional": true,
      "calculation_type": "percentage",
      "calculation_value": 0.50
    },
    {
      "id": 2,
      "title": "Maintenance Services",
      "description": "Annual maintenance package",
      "price": 50000.00,
      "type": "service",
      "is_compulsory_bnpl": false,
      "is_compulsory_buy_now": false,
      "is_optional": true,
      "calculation_type": "fixed",
      "calculation_value": 50000.00
    }
  ]
}
```

**Frontend Usage:**
- Called when Buy Now flow reaches Step 4 (Checkout Options)
- Called when BNPL flow reaches Step 21 (Invoice)
- Used to:
  - Display available add-ons
  - Pre-select compulsory add-ons (Insurance for BNPL)
  - Calculate add-on prices dynamically

**Implementation Status:** ⚠️ Pending (Route exists, controller needs implementation)

---

### 5. Get States (Both Flows - Recommended)
**Endpoint:** `GET /api/config/states`

**Purpose:** Fetch available states for delivery/installation location selection

**Headers:**
```
Accept: application/json
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Lagos",
      "code": "LA",
      "delivery_fee": 25000.00,
      "installation_fee": 50000.00,
      "is_active": true
    },
    {
      "id": 2,
      "name": "Abuja",
      "code": "FCT",
      "delivery_fee": 30000.00,
      "installation_fee": 60000.00,
      "is_active": true
    }
  ]
}
```

**Frontend Usage:**
- Called when user needs to select delivery/installation location
- Used to:
  - Populate state dropdown
  - Calculate delivery fee based on selected state
  - Calculate installation fee based on selected state

**Implementation Status:** ⚠️ Pending (Route exists, controller needs implementation)

---

### 6. Get Delivery Locations (Both Flows - Recommended)
**Endpoint:** `GET /api/config/delivery-locations`

**Purpose:** Fetch delivery locations for a specific state

**Headers:**
```
Accept: application/json
```

**Query Parameters:**
- `state_id` (integer, required) - State ID

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "state_id": 1,
      "name": "Lagos Island",
      "delivery_fee": 30000.00,
      "is_active": true
    },
    {
      "id": 2,
      "state_id": 1,
      "name": "Lagos Mainland",
      "delivery_fee": 25000.00,
      "is_active": true
    }
  ]
}
```

**Frontend Usage:**
- Called after user selects a state
- Used to:
  - Populate delivery location dropdown
  - Calculate delivery fee based on specific location

**Implementation Status:** ⚠️ Pending (Route exists, controller needs implementation)

---

## 📊 Data Flow Diagram

### Buy Now Flow Integration

```
Home Page (/dashboard)
  ↓
User clicks "Buy Now" card
  ↓
Navigate to /buy-now
  ↓
BuyNowFlow Component
  ├─→ (Optional) GET /api/config/add-ons?type=buy_now
  ├─→ (Optional) GET /api/config/states
  └─→ Step 1: Customer Type (Static)
      ↓
      Step 2: Product Category (Static)
      ↓
      Step 3: Method Selection (if applicable)
      ↓
      Step 4: Checkout Options
      │   ├─→ Display add-ons (if fetched)
      │   └─→ User selects installer & insurance
      ↓
      POST /api/orders/checkout
      │   ├─→ customer_type
      │   ├─→ product_category
      │   ├─→ installer_choice
      │   ├─→ include_insurance
      │   ├─→ state_id (if states API used)
      │   ├─→ delivery_location_id (if delivery locations API used)
      │   └─→ add_on_ids[] (if add-ons API used)
      ↓
      Step 5: Invoice Display
      ↓
      GET /api/calendar/slots?type=installation&payment_date={date}
      ↓
      Payment Gateway
```

### BNPL Flow Integration

```
Home Page (/dashboard)
  ↓
User clicks "BNPL" card
  ↓
Navigate to /bnpl
  ↓
BNPLFlow Component (on mount)
  ├─→ GET /api/config/customer-types
  ├─→ GET /api/config/audit-types
  ├─→ (Optional) GET /api/config/loan-configuration
  ├─→ (Optional) GET /api/config/add-ons?type=bnpl
  └─→ (Optional) GET /api/config/states
  ↓
Step 1: Customer Type (Dynamic from API)
  ↓
Step 2: Product Category (Static)
  ↓
Step 3: Method Selection (if applicable)
  ↓
Step 4: Audit Type (Dynamic from API)
  ↓
... (continues through flow)
  ↓
Step 8: Loan Calculator
  ├─→ Uses loan-configuration data (if fetched)
  └─→ Calculates loan terms
  ↓
Step 11: Final Application Form
  ↓
POST /api/bnpl/apply
  ├─→ customer_type
  ├─→ product_category
  ├─→ loan_amount
  ├─→ repayment_duration
  ├─→ personal_details
  ├─→ property_details
  ├─→ state_id (if states API used)
  ├─→ delivery_location_id (if delivery locations API used)
  ├─→ add_on_ids[] (if add-ons API used)
  └─→ Files (bank_statement, live_photo)
  ↓
Step 12: Application Submitted
  ↓
GET /api/bnpl/status/{application_id} (polling)
  ↓
Step 13: Application Approved
  ↓
Step 17: Guarantor Form
  ↓
Step 21: Invoice Display
  ↓
Payment Gateway
```

---

## 🎯 Recommended Implementation Strategy

### Phase 1: Essential APIs (Current)
**Status:** ✅ Implemented

1. **GET /api/config/customer-types** - Required for BNPL Step 1
2. **GET /api/config/audit-types** - Required for BNPL Step 4

**Frontend Action:**
- BNPL flow already calls these APIs
- Has fallback values if API fails

---

### Phase 2: Enhanced Configuration (Recommended)
**Status:** ⚠️ Pending Implementation

1. **GET /api/config/loan-configuration** - For dynamic loan calculator
2. **GET /api/config/add-ons** - For add-on selection
3. **GET /api/config/states** - For location-based pricing
4. **GET /api/config/delivery-locations** - For specific location pricing

**Frontend Action:**
- Update BuyNowFlow to fetch add-ons and states before Step 4
- Update BNPLFlow to fetch loan-configuration before Step 8
- Update both flows to use states/delivery locations for fee calculation

---

### Phase 3: Full Integration (Future)
**Status:** 📋 Planned

1. **GET /api/config/local-governments** - For LGA-level pricing
2. **GET /products/most-popular** - For featured products on home page
3. Dynamic product/bundle availability based on state

---

## 🔧 Backend Implementation Checklist

### Immediate (Required for Current Flow)
- [x] **GET /api/config/customer-types** - ✅ Implemented
- [x] **GET /api/config/audit-types** - ✅ Implemented

### Short Term (Recommended for Enhanced UX)
- [ ] **GET /api/config/loan-configuration** - For dynamic loan calculator
- [ ] **GET /api/config/add-ons** - For add-on selection in checkout
- [ ] **GET /api/config/states** - For location-based fees
- [ ] **GET /api/config/delivery-locations** - For specific location fees

### Controller Updates Needed
- [ ] **ConfigurationController** - Add methods:
  - `getLoanConfiguration()` - Return loan config from `loan_configurations` table
  - `getAddOns()` - Return add-ons from `add_ons` table (filter by type if provided)
  - `getStates()` - Return active states from `states` table
  - `getDeliveryLocations($stateId)` - Return delivery locations for state

### Database Requirements
- [x] `loan_configurations` table - ✅ Created
- [x] `add_ons` table - ✅ Created
- [x] `states` table - ✅ Created
- [x] `delivery_locations` table - ✅ Created

---

## 📝 Frontend Integration Notes

### Current Implementation

**ServiceCards Component:**
- Static component, no API calls
- Simple navigation to `/buy-now` and `/bnpl` routes
- No pre-fetching of configuration data

**BuyNowFlow Component:**
- No configuration API calls on mount
- Uses static values for customer types and product categories
- Calls `POST /api/orders/checkout` when submitting Step 4

**BNPLFlow Component:**
- Fetches `GET /api/config/customer-types` on mount
- Fetches `GET /api/config/audit-types` on mount
- Has fallback values if APIs fail
- Calls `POST /api/bnpl/apply` when submitting Step 11

### Recommended Enhancements

**ServiceCards Component:**
- No changes needed (static navigation is fine)

**BuyNowFlow Component:**
- Add API calls on mount or before Step 4:
  ```javascript
  useEffect(() => {
    // Fetch add-ons for checkout options
    axios.get(API.CONFIG_ADD_ONS, { params: { type: 'buy_now' } })
      .then(res => setAddOns(res.data.data));
    
    // Fetch states for location selection
    axios.get(API.CONFIG_STATES)
      .then(res => setStates(res.data.data));
  }, []);
  ```

**BNPLFlow Component:**
- Add API calls before Step 8 (Loan Calculator):
  ```javascript
  useEffect(() => {
    if (step === 8) {
      // Fetch loan configuration for calculator
      axios.get(API.CONFIG_LOAN_CONFIGURATION)
        .then(res => setLoanConfig(res.data.data));
    }
  }, [step]);
  ```

---

## 🚨 Important Business Rules

### Buy Now Flow
1. **Insurance:** Optional (user can choose)
2. **Installation:** Optional (user can choose TrooSolar or own installer)
3. **Delivery Fee:** Based on state/delivery location (if APIs implemented)
4. **Installation Fee:** Based on state/delivery location and installer choice

### BNPL Flow
1. **Insurance:** **Compulsory** (0.5% of product price, pre-selected)
2. **Installation:** **Compulsory** (pre-selected, cannot be deselected)
3. **Minimum Loan Amount:** ₦1,500,000 (from loan-configuration)
4. **Equity Contribution:** 30-80% (from loan-configuration)
5. **Interest Rate:** 3-4% monthly (from loan-configuration)
6. **Repayment Tenor:** 3, 6, 9, or 12 months (from loan-configuration)
7. **Social Media:** **Required** (validation in backend)

---

## 📡 API Endpoints Summary

| Endpoint | Method | Purpose | Status | Required For |
|----------|--------|---------|--------|--------------|
| `/api/config/customer-types` | GET | Get customer type options | ✅ Implemented | BNPL Step 1 |
| `/api/config/audit-types` | GET | Get audit type options | ✅ Implemented | BNPL Step 4 |
| `/api/config/loan-configuration` | GET | Get loan calculator config | ⚠️ Pending | BNPL Step 8 |
| `/api/config/add-ons` | GET | Get available add-ons | ⚠️ Pending | Both flows (checkout) |
| `/api/config/states` | GET | Get states with fees | ⚠️ Pending | Both flows (location) |
| `/api/config/delivery-locations` | GET | Get delivery locations | ⚠️ Pending | Both flows (location) |
| `/api/orders/checkout` | POST | Generate Buy Now invoice | ✅ Implemented | Buy Now Step 4 |
| `/api/bnpl/apply` | POST | Submit BNPL application | ✅ Implemented | BNPL Step 11 |
| `/api/bnpl/status/{id}` | GET | Get application status | ✅ Implemented | BNPL Step 12+ |
| `/api/calendar/slots` | GET | Get calendar slots | ✅ Implemented | Both flows (scheduling) |

---

## ✅ Testing Checklist

### Service Cards
- [ ] Buy Now card navigates to `/buy-now`
- [ ] BNPL card navigates to `/bnpl`
- [ ] Cards display correctly on desktop and mobile
- [ ] Hover effects work properly

### Buy Now Flow
- [ ] Flow starts without errors
- [ ] All steps render correctly
- [ ] Checkout API call works
- [ ] Invoice displays correctly
- [ ] Calendar slots API works

### BNPL Flow
- [ ] Configuration APIs are called on mount
- [ ] Customer types populate from API (with fallback)
- [ ] Audit types populate from API (with fallback)
- [ ] Loan calculator works (with or without config API)
- [ ] Application submission works
- [ ] Status polling works

---

## 📞 Support

For questions or clarifications:
- Review `BuyNow_BNPL_Flow.md` for complete flow documentation
- Review `IMPLEMENTATION_SUMMARY.md` for backend status
- Check `BackendFlow.md` for original flow requirements

**Last Updated:** November 26, 2025  
**Frontend Version:** Current codebase  
**Backend Base URL:** `http://127.0.0.1:8000/api` (development) / `https://troosolar.hmstech.org/api` (production)

