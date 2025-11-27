# Backend Requirements Summary

This document outlines the backend APIs and data requirements needed to fully support the BNPL and Buy Now flows as implemented in the frontend.

## ✅ Already Implemented APIs

The following APIs are already integrated and working:

1. **Categories & Products**
   - `GET /api/categories` - Fetch all categories
   - `GET /api/categories/{id}/products` - Fetch products by category
   - `GET /api/products` - Fetch all products
   - `GET /api/bundles` - Fetch all bundles

2. **Configuration APIs**
   - `GET /api/config/customer-types` - Customer type options
   - `GET /api/config/audit-types` - Audit type options
   - `GET /api/config/loan-configuration` - Loan calculator configuration
   - `GET /api/config/add-ons` - Add-on services/products
   - `GET /api/config/states` - State list
   - `GET /api/config/delivery-locations?state_id={id}` - Delivery locations by state

3. **Audit Request APIs**
   - `POST /api/audit/request` - Submit audit request
   - `GET /api/audit/request/{id}` - Get audit request status
   - `GET /api/audit/requests` - Get all user's audit requests

4. **Order & Payment APIs**
   - `POST /api/orders/checkout` - Create order and generate invoice
   - `POST /api/order/payment-confirmation` - Confirm payment
   - `GET /api/calendar/slots?type={type}&payment_date={date}` - Get calendar slots

5. **BNPL APIs**
   - `POST /api/bnpl/apply` - Submit BNPL application
   - `GET /api/bnpl/status/{id}` - Get application status
   - `POST /api/bnpl/guarantor/invite` - Save guarantor details
   - `GET /api/bnpl/guarantor/form` - Download guarantor form
   - `POST /api/bnpl/guarantor/upload` - Upload signed guarantor form
   - `GET /api/bnpl/invoice/{application_id}` - Get BNPL invoice

---

## 🔧 Backend Data Requirements

### 1. Invoice Generation - Product Breakdown

**Requirement:** The invoice should show detailed breakdown of product components.

**Current Implementation:**
- Frontend calculates approximate breakdown:
  - Solar Inverter: 40% of product price
  - Solar Panels: 35% of product price
  - Batteries: 25% of product price

**Backend Should Provide:**
```json
{
  "invoice": {
    "solar_inverter": {
      "quantity": 1,
      "price": 1000000,
      "description": "5KVA Solar Inverter"
    },
    "solar_panels": {
      "quantity": 4,
      "price": 875000,
      "description": "400W Solar Panels"
    },
    "batteries": {
      "quantity": 2,
      "price": 625000,
      "description": "200Ah Deep Cycle Batteries"
    },
    "material_cost": 50000,
    "installation_fee": 50000,
    "delivery_fee": 25000,
    "inspection_fee": 10000,
    "insurance_fee": 12500
  }
}
```

**API Endpoint Needed:**
- `GET /api/orders/{order_id}/invoice-details` - Get detailed invoice breakdown
- OR include in existing `POST /api/orders/checkout` response

---

### 2. Loan Calculator Configuration

**Requirement:** Loan calculator should support:
- Minimum order value: ₦1,500,000 (backend-configurable)
- Deposit percentages: 30%, 40%, 50%, 60%, 70%, 80%
- Tenor options: 3, 6, 9, 12 months
- Interest rate calculation
- Management fee and residual fee

**Current Implementation:**
- Frontend uses `GET /api/config/loan-configuration`
- Expected response structure:
```json
{
  "status": "success",
  "data": {
    "minimum_loan_amount": 1500000,
    "equity_contribution_min": 30,
    "equity_contribution_max": 80,
    "interest_rate_min": 3,
    "interest_rate_max": 4,
    "management_fee_percentage": 1.0,
    "residual_fee_percentage": 1.0
  }
}
```

**Status:** ✅ Already implemented, but verify backend returns correct structure

---

### 3. Order Summary Data

**Requirement:** Order summary should include:
- Item description
- Price
- Quantity
- Appliances (for full systems)
- Backup time (for full systems)

**Backend Should Provide:**
```json
{
  "order_summary": {
    "items": [
      {
        "name": "Solar System Bundle",
        "description": "5KVA Inverter + 4x 400W Panels + 2x 200Ah Batteries",
        "quantity": 1,
        "price": 2500000,
        "appliances": "Standard household appliances",
        "backup_time": "8-12 hours (depending on usage)"
      }
    ]
  }
}
```

**API Endpoint:**
- Include in `POST /api/orders/checkout` response
- OR `GET /api/orders/{order_id}/summary`

---

### 4. Minimum Order Value Validation

**Requirement:** BNPL requires minimum order value of ₦1,500,000

**Current Implementation:**
- Frontend checks before proceeding to loan calculator
- Backend should also validate in `POST /api/bnpl/apply`

**Backend Validation Needed:**
```php
// In BNPL application endpoint
if ($totalAmount < 1500000) {
    return response()->json([
        'status' => 'error',
        'message' => 'Your order total does not meet the minimum ₦1,500,000 amount required for credit financing.'
    ], 422);
}
```

---

### 5. Invoice Calculation Based on Property Details

**Requirement:** For audit requests, invoice should be calculated based on:
- Location/State
- Address
- Number of floors
- Number of rooms

**Current Implementation:**
- Frontend sends property details in audit request
- Frontend sends property details in checkout payload
- Backend should use these to calculate invoice amount

**Backend Should:**
- Calculate audit fee based on property size (floors, rooms)
- Consider location/state for delivery and installation fees
- Return calculated invoice in `POST /api/orders/checkout` response

---

### 6. Calendar Slots Timing

**Requirement:**
- Audit slots: Available 48 hours after payment confirmation
- Installation slots: Available 72 hours after payment confirmation

**Current Implementation:**
- Frontend passes `payment_date` parameter
- Backend should filter slots accordingly

**Backend Should:**
- Filter audit slots to show only dates >= payment_date + 48 hours
- Filter installation slots to show only dates >= payment_date + 72 hours

**API Endpoint:**
- `GET /api/calendar/slots?type=audit&payment_date=YYYY-MM-DD`
- `GET /api/calendar/slots?type=installation&payment_date=YYYY-MM-DD`

---

### 7. Product/Bundle Details for Invoice

**Requirement:** Invoice should show actual product/bundle details, not just price breakdown

**Backend Should Provide:**
```json
{
  "bundle": {
    "id": 1,
    "title": "10KVA Solar Bundle",
    "components": [
      {
        "type": "inverter",
        "name": "10KVA Solar Inverter",
        "quantity": 1,
        "price": 1200000
      },
      {
        "type": "panels",
        "name": "500W Solar Panels",
        "quantity": 8,
        "price": 1400000
      },
      {
        "type": "batteries",
        "name": "200Ah Deep Cycle Batteries",
        "quantity": 4,
        "price": 800000
      }
    ]
  }
}
```

---

## 📋 Summary of Required Backend Changes

### High Priority (Required for Full Functionality)

1. **Invoice Breakdown API**
   - Provide detailed product breakdown (inverter, panels, batteries with quantities and prices)
   - Endpoint: Include in `POST /api/orders/checkout` response or new endpoint

2. **Order Summary API**
   - Provide item details, quantity, appliances, backup time
   - Endpoint: Include in checkout response or new endpoint

3. **Minimum Order Value Validation**
   - Validate ₦1,500,000 minimum in `POST /api/bnpl/apply`
   - Return appropriate error message

4. **Audit Invoice Calculation**
   - Calculate audit fee based on property details (floors, rooms, location)
   - Use property details from audit request

5. **Calendar Slots Filtering**
   - Ensure audit slots filtered to 48+ hours after payment
   - Ensure installation slots filtered to 72+ hours after payment

### Medium Priority (Enhancements)

1. **Product Component Details**
   - Store and return component details for bundles
   - Include quantities and individual prices

2. **Loan Configuration**
   - Verify `GET /api/config/loan-configuration` returns all required fields
   - Ensure minimum loan amount is configurable

3. **Invoice Itemization**
   - Break down product price into components (inverter, panels, batteries)
   - Store component details in order/bundle records

---

## 🔄 Data Flow Requirements

### BNPL Flow Data Requirements

1. **Step 6.5 (Order Summary)**
   - Need: Item description, quantity, appliances, backup time
   - Source: Bundle/product details from API

2. **Step 8 (Loan Calculator)**
   - Need: Total amount, minimum order validation
   - Source: Calculated from product price + fees

3. **Step 21 (Final Invoice)**
   - Need: Detailed breakdown (inverter, panels, batteries, all fees)
   - Source: `GET /api/bnpl/invoice/{application_id}` or calculated

### Buy Now Flow Data Requirements

1. **Step 7 (Order Summary)**
   - Need: Item description, quantity, appliances, backup time
   - Source: Bundle/product details from API

2. **Step 5 (Invoice)**
   - Need: Detailed breakdown based on selected products
   - Source: `POST /api/orders/checkout` response

---

## 📝 Notes

1. **Product Price Breakdown:** Currently, frontend estimates breakdown percentages (40% inverter, 35% panels, 25% batteries). Backend should provide actual component prices.

2. **Bundle Components:** For bundles, backend should return individual component details (inverter, panels, batteries) with quantities and prices.

3. **Audit Fee Calculation:** Backend should calculate audit fee dynamically based on property size (floors × rooms) and location.

4. **Minimum Order Value:** The ₦1,500,000 threshold should be configurable in backend admin panel.

5. **Calendar Slots:** Backend must ensure slots are filtered correctly based on payment confirmation date and type (audit vs installation).

---

## ✅ Testing Checklist

- [ ] Verify invoice breakdown shows actual component prices (not estimates)
- [ ] Verify minimum order value validation works (₦1,500,000)
- [ ] Verify audit fee calculation based on property details
- [ ] Verify calendar slots are filtered correctly (48h for audit, 72h for installation)
- [ ] Verify order summary includes all required details (quantity, appliances, backup time)
- [ ] Verify loan calculator configuration is correct
- [ ] Verify bundle components are returned with details

---

**Last Updated:** Based on flow requirements document provided by user

