# Backend Routes Requirements for TrooSolar Dashboard

**Date:** December 2024  
**Status:** Frontend Implementation Complete - Backend Routes Needed

---

## 📋 Overview

This document outlines all backend routes required to support the Buy Now and BNPL flows as implemented in the frontend. All routes should follow the standard response format:

**Success Response:**
```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "status": "error",
  "message": "Error description",
  "errors": {
    "field": ["Error message"]
  }
}
```

---

## 🔐 Authentication

All protected routes require:
```
Authorization: Bearer {access_token}
```

---

## 📡 Required Backend Routes

### 1. Configuration Routes (Public)

#### `GET /api/config/customer-types`
**Status:** ✅ Should be implemented  
**Purpose:** Get customer type options for BNPL flow  
**Response:**
```json
{
  "status": "success",
  "data": [
    { "id": "residential", "label": "For Residential" },
    { "id": "sme", "label": "For SMEs" },
    { "id": "commercial", "label": "Commercial & Industrial" }
  ]
}
```

#### `GET /api/config/audit-types`
**Status:** ✅ Should be implemented  
**Purpose:** Get audit type options for BNPL flow  
**Response:**
```json
{
  "status": "success",
  "data": [
    { "id": "home-office", "label": "Home / Office" },
    { "id": "commercial", "label": "Commercial / Industrial" }
  ]
}
```

#### `GET /api/config/loan-configuration`
**Status:** ⚠️ Needs Implementation  
**Purpose:** Get loan calculator configuration  
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

#### `GET /api/config/add-ons`
**Status:** ⚠️ Needs Implementation  
**Purpose:** Get available add-ons for checkout  
**Query Parameters:**
- `type` (optional): `buy_now` | `bnpl`

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
    }
  ]
}
```

#### `GET /api/config/states`
**Status:** ⚠️ Needs Implementation  
**Purpose:** Get states with delivery/installation fees  
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
    }
  ]
}
```

#### `GET /api/config/delivery-locations`
**Status:** ⚠️ Needs Implementation  
**Purpose:** Get delivery locations for a state  
**Query Parameters:**
- `state_id` (required): State ID

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
    }
  ]
}
```

---

### 2. Buy Now Flow Routes (Protected)

#### `POST /api/orders/checkout`
**Status:** ✅ Should be implemented  
**Purpose:** Generate invoice for Buy Now order  
**Request Body:**
```json
{
  "customer_type": "residential",
  "product_category": "full-kit",
  "installer_choice": "troosolar",
  "include_insurance": true,
  "amount": 2500000,
  "state_id": 1,
  "delivery_location_id": 1,
  "add_on_ids": [1, 2]
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Invoice generated successfully",
  "data": {
    "order_id": 12345,
    "product_price": 2500000.00,
    "installation_fee": 50000.00,
    "delivery_fee": 25000.00,
    "insurance_fee": 12500.00,
    "material_cost": 50000.00,
    "inspection_fee": 10000.00,
    "total": 2647500.00,
    "order_type": "buy_now"
  }
}
```

**Business Logic:**
- Calculate `installation_fee`: ₦50,000 if `installer_choice === 'troosolar'`, else ₦0
- Calculate `insurance_fee`: 0.5% of product price if `include_insurance === true`, else ₦0
- Calculate `delivery_fee`: Based on `state_id` and `delivery_location_id` if provided
- Calculate `material_cost`: Fixed or based on product category
- Calculate `inspection_fee`: Fixed (₦10,000 default)

---

### 3. BNPL Flow Routes (Protected)

#### `POST /api/bnpl/apply`
**Status:** ✅ Should be implemented  
**Purpose:** Submit BNPL loan application  
**Content-Type:** `multipart/form-data`

**Request Body (FormData):**
```
customer_type: "residential"
product_category: "full-kit"
loan_amount: 2750000
repayment_duration: 12
credit_check_method: "auto"
loan_calculation_id: 123 (optional)
state_id: 1 (optional)
add_on_ids[]: 1 (optional, for compulsory add-ons)

personal_details[full_name]: "John Doe"
personal_details[bvn]: "12345678901"
personal_details[phone]: "08012345678"
personal_details[email]: "john@example.com"
personal_details[social_media]: "@johndoe" (REQUIRED)

property_details[state]: "Lagos"
property_details[address]: "123 Main Street"
property_details[landmark]: "Near Market"
property_details[floors]: "2"
property_details[rooms]: "4"
property_details[is_gated_estate]: "1"
property_details[estate_name]: "Sunshine Estate" (required if is_gated_estate = 1)
property_details[estate_address]: "123 Estate Street" (required if is_gated_estate = 1)

bank_statement: [File] (PDF, JPG, PNG, max 10MB)
live_photo: [File] (JPG, PNG, max 5MB)
```

**Response:**
```json
{
  "status": "success",
  "message": "Application submitted successfully",
  "data": {
    "loan_application": {
      "id": 123,
      "user_id": 1,
      "customer_type": "residential",
      "product_category": "full-kit",
      "loan_amount": 2750000.00,
      "repayment_duration": 12,
      "status": "pending",
      "credit_check_method": "auto",
      "property_state": "Lagos",
      "property_address": "123 Main Street",
      "created_at": "2025-11-26T10:30:00.000000Z"
    }
  }
}
```

**Validation Rules:**
- `loan_amount` must be >= ₦1,500,000
- `repayment_duration` must be one of: 3, 6, 9, 12
- `bvn` must be exactly 11 digits
- `social_media` is REQUIRED (cannot be empty)
- If `is_gated_estate === true`, `estate_name` and `estate_address` are required
- `bank_statement` and `live_photo` are required files

#### `GET /api/bnpl/status/{application_id}`
**Status:** ✅ Should be implemented  
**Purpose:** Get application status  
**Response:**
```json
{
  "status": "success",
  "data": {
    "loan_application": {
      "id": 123,
      "status": "approved",
      "loan_amount": 2750000.00,
      "repayment_duration": 12,
      "created_at": "2025-11-26T10:30:00.000000Z",
      "updated_at": "2025-11-26T14:20:00.000000Z"
    },
    "guarantor_required": true,
    "next_step": "guarantor_form"
  }
}
```

**Status Values:**
- `pending` - Application under review
- `approved` - Application approved, proceed to guarantor
- `rejected` - Application rejected
- `counter_offer` - Counter offer available

#### `POST /api/bnpl/guarantor/invite`
**Status:** ✅ Should be implemented  
**Purpose:** Save guarantor details  
**Request Body:**
```json
{
  "loan_application_id": 123,
  "full_name": "Jane Doe",
  "phone": "08098765432",
  "email": "jane@example.com",
  "relationship": "Spouse"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Guarantor details saved successfully",
  "data": {
    "id": 456,
    "loan_application_id": 123,
    "full_name": "Jane Doe",
    "phone": "08098765432",
    "email": "jane@example.com",
    "relationship": "Spouse",
    "status": "pending",
    "created_at": "2025-11-26T15:00:00.000000Z"
  }
}
```

#### `GET /api/bnpl/guarantor/form`
**Status:** ⚠️ Needs Implementation  
**Purpose:** Download guarantor form PDF  
**Query Parameters:**
- `loan_application_id` (required): Loan application ID

**Response:** PDF file (blob)

**Note:** This route should generate and return a PDF file for the guarantor to sign.

#### `POST /api/bnpl/guarantor/upload`
**Status:** ✅ Should be implemented  
**Purpose:** Upload signed guarantor form  
**Content-Type:** `multipart/form-data`

**Request Body (FormData):**
```
guarantor_id: 456
signed_form: [File] (PDF, JPG, PNG, max 10MB)
```

**Response:**
```json
{
  "status": "success",
  "message": "Guarantor form uploaded successfully",
  "data": {
    "id": 456,
    "signed_form_path": "guarantors/signed_form_456.pdf",
    "status": "pending",
    "updated_at": "2025-11-26T15:30:00.000000Z"
  }
}
```

#### `GET /api/bnpl/invoice/{application_id}`
**Status:** ⚠️ Needs Implementation (Recommended)  
**Purpose:** Get final invoice/order summary for approved BNPL application  
**Response:**
```json
{
  "status": "success",
  "data": {
    "order_id": 12345,
    "product_price": 2500000.00,
    "material_cost": 50000.00,
    "installation_fee": 50000.00,
    "delivery_fee": 25000.00,
    "inspection_fee": 10000.00,
    "insurance_fee": 12500.00,
    "total": 2647500.00,
    "order_type": "bnpl",
    "loan_details": {
      "deposit_amount": 750000.00,
      "monthly_repayment": 183333.33,
      "total_repayment": 2750000.00
    }
  }
}
```

---

### 4. Calendar Routes (Protected)

#### `GET /api/calendar/slots`
**Status:** ✅ Should be implemented  
**Purpose:** Get available calendar slots for installation/audit  
**Query Parameters:**
- `type` (required): `installation` | `audit`
- `payment_date` (required): Date in `YYYY-MM-DD` format

**Response:**
```json
{
  "status": "success",
  "data": {
    "slots": [
      {
        "date": "2025-12-04",
        "time": "09:00",
        "available": true
      },
      {
        "date": "2025-12-04",
        "time": "13:00",
        "available": true
      }
    ],
    "earliest_date": "2025-12-04",
    "message": "Installation slots available starting 72 hours after payment"
  }
}
```

**Business Logic:**
- For `type=installation` (Buy Now): Return slots starting **72 hours (3 days)** after `payment_date`
- For `type=audit` (BNPL): Return slots starting **48 hours (2 days)** after `payment_date`
- Exclude weekends/holidays if configured
- Check availability based on existing bookings

---

## 🔧 Additional Backend Requirements

### Database Schema Updates

All database schema changes are documented in `BackendFlow.md` and `IMPLEMENTATION_SUMMARY.md`. Key tables that need to be updated:

1. **loan_applications** - Add fields for customer type, product category, property details, etc.
2. **guarantors** - Create new table for guarantor management
3. **orders** - Add fields for material_cost, delivery_fee, inspection_fee, insurance_fee, order_type
4. **add_ons** - Create table for add-on products/services
5. **loan_configurations** - Create table for loan configuration
6. **states** - Create table for state management
7. **delivery_locations** - Create table for delivery location management

### Business Rules

1. **BNPL Minimum Order:** Reject applications where `loan_amount` < ₦1,500,000
2. **Commercial Audits:** Do NOT generate instant invoice for commercial audits. Trigger admin notification instead.
3. **Insurance:** 
   - Compulsory for BNPL (0.5% of product price)
   - Optional for Buy Now (0.5% of product price if selected)
4. **Installation Fee:**
   - Buy Now: ₦50,000 if `installer_choice === 'troosolar'`, else ₦0
   - BNPL: Always included (compulsory)
5. **Social Media:** REQUIRED field for BNPL applications (validation must be enforced)
6. **Gated Estate:** If `is_gated_estate === true`, `estate_name` and `estate_address` are required

---

## 📝 Implementation Priority

### High Priority (Required for Current Flow)
1. ✅ `GET /api/config/customer-types`
2. ✅ `GET /api/config/audit-types`
3. ✅ `POST /api/orders/checkout`
4. ✅ `POST /api/bnpl/apply`
5. ✅ `GET /api/bnpl/status/{id}`
6. ✅ `POST /api/bnpl/guarantor/invite`
7. ✅ `POST /api/bnpl/guarantor/upload`
8. ✅ `GET /api/calendar/slots`

### Medium Priority (Recommended for Enhanced UX)
1. ⚠️ `GET /api/config/loan-configuration`
2. ⚠️ `GET /api/config/add-ons`
3. ⚠️ `GET /api/config/states`
4. ⚠️ `GET /api/config/delivery-locations`
5. ⚠️ `GET /api/bnpl/guarantor/form`
6. ⚠️ `GET /api/bnpl/invoice/{application_id}`

---

## 🧪 Testing Checklist

### Buy Now Flow
- [ ] Test checkout with all installer choices
- [ ] Test checkout with/without insurance
- [ ] Test checkout with state/delivery location selection
- [ ] Test calendar slots for installation
- [ ] Test error handling for missing fields

### BNPL Flow
- [ ] Test application submission with all required fields
- [ ] Test social media validation (required field)
- [ ] Test gated estate validation (estate name/address required)
- [ ] Test minimum loan amount validation (₦1.5M)
- [ ] Test status polling
- [ ] Test guarantor form download
- [ ] Test guarantor form upload
- [ ] Test calendar slots for audit

---

## 📞 Support

For questions or clarifications:
- Review `BuyNow_BNPL_Flow.md` for complete flow documentation
- Review `BackendFlow.md` for original backend requirements
- Review `IMPLEMENTATION_SUMMARY.md` for database schema details

**Last Updated:** December 2024  
**Frontend Version:** Current codebase  
**Backend Base URL:** `https://troosolar.hmstech.org/api` (production)

