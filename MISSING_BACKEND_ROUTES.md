# Missing Backend Routes - Buy Now & BNPL Flows

**Date:** December 2024  
**Status:** Routes Currently Used by Frontend but NOT Documented in BACKEND_ROUTES_REQUIREMENTS.md

---

## 🚨 Missing Routes (Currently Used in Frontend)

### 1. Loan Calculation Route

#### `POST /api/loan-calculation`
**Status:** ⚠️ **MISSING FROM DOCUMENTATION**  
**Purpose:** Create loan calculation before submitting BNPL application  
**Used In:** BNPL Flow (Step 9 - before application submission)

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
Accept: application/json
```

**Request Body:**
```json
{
  "product_amount": 2500000.00,
  "loan_amount": 2750000.00,
  "repayment_duration": 12
}
```

**Field Descriptions:**
- `product_amount` (number, required): Total product price including fees
- `loan_amount` (number, required): Total loan amount (principal + interest + fees)
- `repayment_duration` (number, required): Tenor in months (3, 6, 9, or 12)

**Response (Success):**
```json
{
  "status": "success",
  "message": "Loan calculation created successfully",
  "data": {
    "id": 123,
    "product_amount": 2500000.00,
    "loan_amount": 2750000.00,
    "repayment_duration": 12,
    "deposit_amount": 750000.00,
    "principal": 1750000.00,
    "total_interest": 840000.00,
    "monthly_repayment": 183333.33,
    "total_repayment": 2750000.00,
    "created_at": "2025-11-26T10:00:00.000000Z"
  }
}
```

**OR (Alternative Response Format):**
```json
{
  "status": "success",
  "id": 123,
  "product_amount": 2500000.00,
  "loan_amount": 2750000.00,
  "repayment_duration": 12
}
```

**Note:** Frontend checks for both `response.data.data.id` and `response.data.id` to handle different response formats.

**Business Logic:**
- Store loan calculation record
- Link to user account
- Return calculation ID for use in BNPL application

---

### 2. Bundles Route

#### `GET /api/bundles`
**Status:** ⚠️ **MISSING FROM DOCUMENTATION**  
**Purpose:** Fetch available solar system bundles for selection  
**Used In:** 
- Buy Now Flow (Step 3.5 - Bundle Selection)
- BNPL Flow (if bundle selection is added)

**Headers:**
```
Accept: application/json
Authorization: Bearer {access_token} (optional - may be public)
```

**Query Parameters:** None

**Response (Success):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "title": "5KVA Solar System Bundle",
      "bundle_type": "Residential",
      "featured_image": "/images/bundles/5kva-bundle.jpg",
      "total_price": 2800000.00,
      "discount_price": 2500000.00,
      "description": "Complete 5KVA solar system with inverter, batteries, and panels",
      "is_active": true,
      "created_at": "2025-11-26T10:00:00.000000Z"
    }
  ]
}
```

**OR (Alternative Response Format):**
```json
{
  "status": "success",
  "data": {
    "data": [
      {
        "id": 1,
        "title": "5KVA Solar System Bundle",
        ...
      }
    ]
  }
}
```

**OR (Simple Array):**
```json
[
  {
    "id": 1,
    "title": "5KVA Solar System Bundle",
    ...
  }
]
```

**Note:** Frontend handles all three response formats by checking `response.data?.data ?? response.data` and ensuring it's an array.

**Field Descriptions:**
- `id` (integer, required): Bundle ID
- `title` (string, required): Bundle name/title
- `bundle_type` (string, optional): Type of bundle (e.g., "Residential", "Commercial")
- `featured_image` (string, optional): Image URL or path
- `total_price` (number, required): Original price
- `discount_price` (number, optional): Discounted price (if available)
- `description` (string, optional): Bundle description
- `is_active` (boolean, optional): Whether bundle is available

**Business Logic:**
- Return only active bundles (`is_active = true`)
- Sort by relevance or price
- Include bundle details for display

---

### 3. Payment Confirmation Route (Audit-Specific)

#### `POST /api/order/payment-confirmation`
**Status:** ⚠️ **PARTIALLY DOCUMENTED**  
**Purpose:** Confirm payment for orders (Buy Now, BNPL Audit)  
**Used In:** 
- Buy Now Flow (after Flutterwave payment)
- BNPL Flow (after audit payment)

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
Accept: application/json
```

**Request Body:**
```json
{
  "amount": "50000",
  "orderId": 12345,
  "txId": "FLW1234567890",
  "type": "direct" | "audit"
}
```

**Field Descriptions:**
- `amount` (string, required): Payment amount as string
- `orderId` (integer, required): Order ID from checkout
- `txId` (string, required): Transaction ID from payment gateway
- `type` (string, required): Payment type - `"direct"` for Buy Now, `"audit"` for audit payments

**Response (Success):**
```json
{
  "status": "success",
  "message": "Payment confirmed successfully",
  "data": {
    "order_id": 12345,
    "payment_status": "confirmed",
    "transaction_id": "FLW1234567890",
    "amount": 50000.00,
    "confirmed_at": "2025-11-26T10:30:00.000000Z"
  }
}
```

**Business Logic:**
- Verify transaction with payment gateway
- Update order payment status
- For `type="audit"`: Mark audit as paid and enable calendar booking
- For `type="direct"`: Mark order as paid and enable installation calendar

**Note:** This route exists but needs to support `type="audit"` for audit payments in BNPL flow.

---

### 4. Buy Now Checkout Route (Audit Support)

#### `POST /api/orders/checkout`
**Status:** ✅ Documented but needs audit support  
**Purpose:** Generate invoice/order for Buy Now purchases AND audit orders  
**Used In:** 
- Buy Now Flow (Step 4 → Step 8)
- BNPL Flow (Step 7 - Audit Invoice payment)

**Current Request Body (Buy Now):**
```json
{
  "customer_type": "residential",
  "product_category": "full-kit",
  "installer_choice": "troosolar",
  "include_insurance": true,
  "amount": 2500000,
  "bundle_id": 123,
  "state_id": 1,
  "delivery_location_id": 1,
  "add_on_ids": [1, 2]
}
```

**Additional Request Body (Audit - MISSING):**
```json
{
  "customer_type": "residential",
  "product_category": "audit",
  "amount": 50000,
  "audit_type": "home-office"
}
```

**Response for Audit:**
```json
{
  "status": "success",
  "message": "Audit order created successfully",
  "data": {
    "order_id": 12345,
    "audit_fee": 50000.00,
    "total": 50000.00,
    "order_type": "audit",
    "audit_type": "home-office",
    "created_at": "2025-11-26T10:30:00.000000Z"
  }
}
```

**Business Logic:**
- If `product_category === "audit"`:
  - Create audit order (not full product order)
  - Set `order_type: "audit"`
  - Store `audit_type` (home-office or commercial)
  - Return order ID for payment confirmation

---

## 📋 Summary of Missing Routes

| Route | Method | Status | Priority | Used In |
|-------|--------|--------|----------|---------|
| `/api/loan-calculation` | POST | ⚠️ Missing | **HIGH** | BNPL Flow |
| `/api/bundles` | GET | ⚠️ Missing | **HIGH** | Buy Now Flow |
| `/api/order/payment-confirmation` | POST | ⚠️ Needs audit support | **MEDIUM** | Both Flows |
| `/api/orders/checkout` | POST | ⚠️ Needs audit support | **MEDIUM** | BNPL Flow (audit) |

---

## 🔧 Implementation Notes

### 1. Loan Calculation Route
- **Critical:** This route is called BEFORE `POST /api/bnpl/apply`
- Frontend expects either `response.data.data.id` or `response.data.id`
- Must return calculation ID for linking to BNPL application

### 2. Bundles Route
- **Critical:** Used in Buy Now bundle selection (Step 3.5)
- Frontend handles multiple response formats (nested data, direct array, etc.)
- Should return only active bundles
- Image URLs should be absolute or relative to base URL

### 3. Payment Confirmation
- **Enhancement:** Add support for `type="audit"` parameter
- Should handle both regular orders and audit orders
- Verify transaction with payment gateway before confirming

### 4. Checkout Route (Audit Support)
- **Enhancement:** Add support for `product_category: "audit"`
- Should create audit-specific orders
- Return order ID for payment confirmation

---

## ✅ Routes Already Documented (For Reference)

These routes are already in BACKEND_ROUTES_REQUIREMENTS.md:
- ✅ `GET /api/config/customer-types`
- ✅ `GET /api/config/audit-types`
- ✅ `GET /api/config/loan-configuration` (marked as needs implementation)
- ✅ `GET /api/config/add-ons` (marked as needs implementation)
- ✅ `GET /api/config/states` (marked as needs implementation)
- ✅ `GET /api/config/delivery-locations` (marked as needs implementation)
- ✅ `POST /api/bnpl/apply`
- ✅ `GET /api/bnpl/status/{id}`
- ✅ `POST /api/bnpl/guarantor/invite`
- ✅ `GET /api/bnpl/guarantor/form` (marked as needs implementation)
- ✅ `POST /api/bnpl/guarantor/upload`
- ✅ `GET /api/bnpl/invoice/{application_id}` (marked as needs implementation)
- ✅ `GET /api/calendar/slots`
- ✅ `POST /api/orders/checkout` (for Buy Now, but needs audit support)

---

## 🎯 Action Items for Backend Team

1. **Implement `POST /api/loan-calculation`** - Required for BNPL flow
2. **Implement `GET /api/bundles`** - Required for Buy Now bundle selection
3. **Enhance `POST /api/order/payment-confirmation`** - Add audit payment support
4. **Enhance `POST /api/orders/checkout`** - Add audit order creation support

---

**Last Updated:** December 2024  
**Frontend Version:** Current codebase

