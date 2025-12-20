# BNPL Flow - Complete Frontend Documentation & Backend Requirements

**Last Updated:** 2024-12-27  
**Purpose:** Complete documentation of the BNPL (Buy Now Pay Later) flow, including all data being sent, missing APIs, and backend requirements.

---

## 📑 Table of Contents

1. [Complete BNPL Flow Overview](#complete-bnpl-flow-overview)
2. [Step-by-Step Flow Breakdown](#step-by-step-flow-breakdown)
3. [Data Being Sent to Backend](#data-being-sent-to-backend)
4. [Missing Data & APIs](#missing-data--apis)
5. [Backend Route Requirements](#backend-route-requirements)
6. [API Response Expectations](#api-response-expectations)
7. [Error Handling Requirements](#error-handling-requirements)

---

## 🎯 Complete BNPL Flow Overview

The BNPL flow consists of **21 steps** that guide users through:
1. Customer type selection
2. Product/bundle selection
3. Property details collection
4. Loan calculation
5. Credit check payment
6. Application submission
7. Status tracking
8. Guarantor invitation
9. Final payment

---

## 📋 Step-by-Step Flow Breakdown

### **Step 1: Customer Type Selection**
**Purpose:** User selects who they're purchasing for

**Options:**
- Residential
- SMEs (Small & Medium Enterprises)
- Commercial & Industrial

**Data Collected:**
- `customerType`: `'residential'` | `'sme'` | `'commercial'`

**API Used:**
- `GET /api/config/customer-types` ✅ (Working)

**Next Step:** Step 2 (Product Category Selection)

---

### **Step 2: Product Category Selection**
**Purpose:** User selects what type of solar system they need

**Options:**
- Full Kit (Complete Solar System)
- Inverter + Battery
- Battery Only
- Inverter Only
- Panels Only

**Data Collected:**
- `productCategory`: `'full-kit'` | `'inverter-battery'` | `'battery-only'` | `'inverter-only'` | `'panels-only'`

**API Used:**
- None (hardcoded options)

**Next Step:** Step 3 (Option Type Selection)

---

### **Step 3: Option Type Selection**
**Purpose:** User chooses how they want to proceed

**Options:**
- Choose System (Select from existing bundles/products)
- Build System (Custom configuration)
- Audit (Professional energy audit)

**Data Collected:**
- `optionType`: `'choose-system'` | `'build-system'` | `'audit'`

**API Used:**
- None (hardcoded options)

**Next Step:** 
- If `choose-system` → Step 3.5 (Bundle/Product Selection)
- If `build-system` → Step 3.5 (Component Selection)
- If `audit` → Step 5 (Audit Type Selection)

---

### **Step 3.5: Bundle/Product Selection**
**Purpose:** User selects bundles or products

**Data Collected:**
- `selectedBundles[]`: Array of bundle objects `[{id, bundle, price}, ...]`
- `selectedProducts[]`: Array of product objects `[{id, product, price}, ...]`
- `selectedBundleId`: Single bundle ID (legacy)
- `selectedProductId`: Single product ID (legacy)
- `selectedProductPrice`: Total price of selected items

**APIs Used:**
- `GET /api/bundles` ✅ (Working)
- `GET /api/products` ✅ (Working)
- `GET /api/categories/{id}/products` ✅ (Working)

**Next Step:** Step 4 (Invoice Preview)

---

### **Step 4: Invoice Preview**
**Purpose:** Show selected items and total amount

**Data Displayed:**
- Selected bundles/products
- Subtotal
- Insurance fee (compulsory BNPL add-on)
- Material cost
- Installation fee
- Delivery fee
- Inspection fee
- **Total Amount**

**APIs Used:**
- `GET /api/config/add-ons` ✅ (Working - to get compulsory BNPL add-ons)

**Missing Data:**
- ❌ Material cost should come from state selection
- ❌ Installation fee should come from state selection
- ❌ Delivery fee should come from delivery location selection
- ❌ Inspection fee should come from API

**Next Step:** Step 5 (Property Details) or Step 7 (Audit Request)

---

### **Step 5: Property Details (For Non-Audit)**
**Purpose:** Collect property information

**Data Collected:**
- `state`: State name
- `stateId`: State ID (if states API available)
- `houseNo`: House number
- `streetName`: Street name
- `address`: Full address (constructed from houseNo + streetName)
- `landmark`: Landmark
- `floors`: Number of floors
- `rooms`: Number of rooms
- `isGatedEstate`: Boolean
- `estateName`: Estate name (if gated estate)
- `estateAddress`: Estate address (if gated estate)

**APIs Used:**
- `GET /api/config/states` ✅ (Working)

**Next Step:** Step 6 (Invoice with Property Details)

---

### **Step 6: Invoice with Property Details**
**Purpose:** Final invoice before loan calculation

**Data Displayed:**
- All selected items
- Property details
- All fees
- Total amount

**Next Step:** Step 8 (Loan Calculator)

---

### **Step 7: Audit Request Flow**
**Purpose:** Handle audit requests (home-office or commercial)

**Data Collected:**
- `auditType`: `'home-office'` | `'commercial'`
- Property details (same as Step 5)
- For commercial: Optional property details

**APIs Used:**
- `POST /api/audit/request` ✅ (Working)
- `GET /api/audit/request/{id}` ✅ (Working)
- `GET /api/calendar/slots?type=audit&payment_date={date}` ✅ (Working)

**Data Sent to `/api/audit/request`:**
```json
{
  "audit_type": "home-office" | "commercial",
  "customer_type": "residential" | "sme" | "commercial",
  "property_state": "string",
  "property_address": "string",
  "property_landmark": "string",
  "property_floors": number,
  "property_rooms": number,
  "is_gated_estate": boolean,
  "estate_name": "string" (if is_gated_estate),
  "estate_address": "string" (if is_gated_estate)
}
```

**Missing:**
- ❌ No API to get audit fee/price before submission
- ❌ No API to get material_cost, installation_fee, delivery_fee, inspection_fee based on state

**Next Step:** Step 7.5 (Audit Calendar Selection) → Step 8 (Loan Calculator)

---

### **Step 8: Loan Calculator**
**Purpose:** Calculate loan terms based on total amount

**Data Collected:**
- `loanDetails`: Object containing:
  - `totalAmount`: Total amount to finance
  - `depositPercent`: Down payment percentage
  - `depositAmount`: Down payment amount
  - `principal`: Loan amount
  - `tenor`: Repayment duration (months)
  - `monthlyRepayment`: Monthly payment amount
  - `totalRepayment`: Total amount to repay

**APIs Used:**
- `GET /api/config/loan-configuration` ✅ (Working - for tenor options, interest rates)

**Missing:**
- ❌ No API endpoint to calculate loan terms server-side
- ❌ Calculation is done client-side only

**Next Step:** Step 9 (Review Loan Plan)

---

### **Step 9: Review Loan Plan**
**Purpose:** User reviews loan terms before proceeding

**Data Displayed:**
- Loan summary
- All loan details

**Next Step:** Step 11 (Final Application) or Step 8 (Adjust Plan)

---

### **Step 10: Credit Check Method Selection**
**Purpose:** User selects credit check method

**Options:**
- Automatic (BVN Verification) - Auto-selected by default
- Manual (Bank Statement Review)

**Data Collected:**
- `creditCheckMethod`: `'auto'` | `'manual'`
- `bankStatement`: File (PDF, JPG, PNG - Max 10MB)
- `livePhoto`: File (JPG, PNG - Max 5MB)

**Note:** Both files are required regardless of method (backend validation)

**Missing:**
- ❌ No API to get credit check fee before payment
- ❌ Currently hardcoded as 5% of loan amount

**Next Step:** Credit Check Payment Modal → Step 11 (Application Submission)

---

### **Step 11: Final Application Form**
**Purpose:** Collect personal and property details

**Data Collected:**
- `fullName`: Full name
- `bvn`: BVN number
- `phone`: Phone number
- `email`: Email address
- `socialMedia`: Social media handle (required)
- Property details (same as Step 5)

**Validation:**
- All personal details required
- Social media handle required
- Property details required
- Estate name/address required if gated estate

**Next Step:** Step 10 (Credit Check Method)

---

### **Credit Check Payment**
**Purpose:** Pay credit check fee (5% of loan amount)

**Payment Flow:**
1. Show credit check fee modal
2. Initialize Flutterwave payment
3. Process payment
4. After successful payment → Submit application

**APIs Used:**
- Flutterwave payment gateway ✅ (Working)

**Missing:**
- ❌ No backend endpoint to confirm credit check payment
- ❌ No API to get credit check fee amount
- ❌ Payment confirmation not stored in backend

**Next Step:** Application Submission

---

### **Application Submission**
**Purpose:** Submit BNPL application to backend

**API Used:**
- `POST /api/loan-calculation` ✅ (Working - creates loan calculation first)
- `POST /api/bnpl/apply` ✅ (Working - submits application)

**Data Sent to `/api/loan-calculation`:**
```json
{
  "product_amount": number, // Total of all selected items
  "loan_amount": number, // Total repayment amount
  "repayment_duration": number // Tenor in months
}
```

**Data Sent to `/api/bnpl/apply` (multipart/form-data):**

**Basic Fields:**
- `customer_type`: string (required)
- `product_category`: string (required)
- `loan_amount`: number (required)
- `repayment_duration`: number (required)
- `credit_check_method`: string (required) - `'auto'` | `'manual'`
- `loan_calculation_id`: number (optional) - ID from loan calculation

**Personal Details (nested):**
- `personal_details[full_name]`: string (required)
- `personal_details[bvn]`: string (required)
- `personal_details[phone]`: string (required)
- `personal_details[email]`: string (required)
- `personal_details[social_media]`: string (required)

**Property Details (nested):**
- `property_details[state]`: string (required)
- `property_details[address]`: string (required)
- `property_details[landmark]`: string (optional)
- `property_details[floors]`: string (optional)
- `property_details[rooms]`: string (optional)
- `property_details[is_gated_estate]`: number (0 or 1)
- `property_details[estate_name]`: string (required if gated estate)
- `property_details[estate_address]`: string (required if gated estate)

**Product/Bundle Selection:**
- `bundle_ids[]`: array of bundle IDs (if bundles selected)
- `product_ids[]`: array of product IDs (if products selected)
- `bundle_id`: single bundle ID (legacy, if single bundle)
- `product_id`: single product ID (legacy, if single product)

**Add-ons:**
- `add_on_ids[]`: array of add-on IDs (compulsory BNPL add-ons)

**Files:**
- `bank_statement`: file (required) - PDF, JPG, PNG (Max 10MB)
- `live_photo`: file (required) - JPG, PNG (Max 5MB)

**Additional Fields (if available):**
- `state_id`: number (optional) - State ID

**Missing Data Not Being Sent:**
- ❌ `creditScore`: Credit score from Mono (0-100) - Not sent
- ❌ `creditReport`: Full credit report from Mono - Not sent
- ❌ `audit_request_id`: Audit request ID (if audit flow) - Not sent
- ❌ `material_cost`: Material cost - Not sent
- ❌ `installation_fee`: Installation fee - Not sent
- ❌ `delivery_fee`: Delivery fee - Not sent
- ❌ `inspection_fee`: Inspection fee - Not sent
- ❌ `insurance_fee`: Insurance fee - Not sent
- ❌ `house_no`: House number separately - Not sent (only in address)
- ❌ `street_name`: Street name separately - Not sent (only in address)
- ❌ `delivery_location_id`: Delivery location ID - Not sent

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "loan_application": {
      "id": number,
      "status": "pending" | "approved" | "rejected" | "counter_offer",
      ...
    }
  }
}
```

**Next Step:** 
- If `status === 'approved'` → Step 21 (Invoice/Payment)
- Otherwise → Step 12 (Application Submitted/Pending)

---

### **Step 12: Application Submitted**
**Purpose:** Show application is pending review

**Features:**
- Status polling every 30 seconds
- Check application status
- Navigate to BNPL loans page

**APIs Used:**
- `GET /api/bnpl/status/{application_id}` ✅ (Working)

**Next Step:** 
- If `status === 'approved'` → Step 13 (Approved)
- If `status === 'rejected'` → Step 14 (Rejected)
- If `status === 'counter_offer'` → Step 15 (Counter Offer)

---

### **Step 13: Application Approved**
**Purpose:** Show approval and proceed to guarantor

**Next Step:** Step 16 (Guarantor Invitation)

---

### **Step 14: Application Rejected**
**Purpose:** Show rejection message

**Next Step:** Back to dashboard or retry

---

### **Step 15: Counter Offer**
**Purpose:** Show counter offer terms

**Data Collected:**
- `minimumDeposit`: Minimum deposit amount
- `minimumTenor`: Minimum repayment duration

**APIs Used:**
- `POST /api/bnpl/counteroffer/accept` ✅ (Working)

**Data Sent:**
```json
{
  "application_id": number,
  "minimum_deposit": number,
  "minimum_tenor": number
}
```

**Next Step:** Step 13 (Approved) or Step 12 (Pending)

---

### **Step 16: Guarantor Invitation**
**Purpose:** Invite guarantor for loan

**Data Collected:**
- `guarantorName`: Full name
- `guarantorPhone`: Phone number
- `guarantorEmail`: Email address
- `guarantorBVN`: BVN number
- `guarantorRelationship`: Relationship to applicant

**APIs Used:**
- `POST /api/bnpl/guarantor/invite` ✅ (Working)

**Data Sent:**
```json
{
  "loan_application_id": number,
  "full_name": string,
  "email": string,
  "phone": string,
  "bvn": string,
  "relationship": string
}
```

**Missing:**
- ❌ No validation for guarantor BVN format
- ❌ No API to check if guarantor email/phone already exists

**Next Step:** Step 17 (Guarantor Form Upload)

---

### **Step 17: Guarantor Form Upload**
**Purpose:** Upload signed guarantor form

**Data Collected:**
- `guarantorForm`: File (PDF, JPG, PNG - Max 10MB)

**APIs Used:**
- `POST /api/bnpl/guarantor/upload` ✅ (Working)

**Data Sent (multipart/form-data):**
- `guarantor_id`: number
- `signed_form`: file

**Next Step:** Step 18 (Guarantor Status)

---

### **Step 18: Guarantor Status**
**Purpose:** Show guarantor invitation status

**Next Step:** Step 19 (Terms Agreement) or wait for guarantor approval

---

### **Step 19: Terms Agreement**
**Purpose:** User accepts terms and conditions

**Data Collected:**
- `agreedToTerms`: Boolean

**Next Step:** Step 20 (Upfront Deposit Payment)

---

### **Step 20: Upfront Deposit Payment**
**Purpose:** Pay upfront deposit (down payment)

**Payment Flow:**
1. Show deposit amount
2. Initialize Flutterwave payment
3. Process payment
4. Confirm payment with backend

**APIs Used:**
- Flutterwave payment gateway ✅ (Working)
- `POST /api/order/payment-confirmation` ✅ (Working - but may need BNPL-specific endpoint)

**Data Sent to Payment Confirmation:**
```json
{
  "amount": number,
  "orderId": number,
  "txId": string,
  "type": "direct" | "audit" | "wallet"
}
```

**Missing:**
- ❌ No BNPL-specific payment confirmation endpoint
- ❌ No API to get deposit amount from application
- ❌ Payment confirmation may not link to BNPL application correctly

**Next Step:** Step 21 (Invoice/Payment Complete)

---

### **Step 21: Invoice/Payment Complete**
**Purpose:** Show final invoice and order details

**APIs Used:**
- `GET /api/bnpl/invoice/{application_id}` ✅ (May exist, needs verification)
- `GET /api/bnpl/orders/{order_id}` ✅ (Working)

**Missing:**
- ❌ No clear API to get invoice after deposit payment
- ❌ Order creation after deposit payment not confirmed

**Next Step:** Navigate to BNPL loans page

---

## 📊 Data Being Sent to Backend

### **Complete Data Structure**

```javascript
{
  // Basic Application Data
  customer_type: "residential" | "sme" | "commercial",
  product_category: "full-kit" | "inverter-battery" | "battery-only" | "inverter-only" | "panels-only",
  loan_amount: number,
  repayment_duration: number,
  credit_check_method: "auto" | "manual",
  loan_calculation_id: number, // Optional
  
  // Personal Details
  personal_details: {
    full_name: string,
    bvn: string,
    phone: string,
    email: string,
    social_media: string
  },
  
  // Property Details
  property_details: {
    state: string,
    address: string,
    landmark: string,
    floors: string,
    rooms: string,
    is_gated_estate: boolean,
    estate_name: string, // If gated estate
    estate_address: string // If gated estate
  },
  
  // Product Selection
  bundle_ids: [number, ...], // Array of bundle IDs
  product_ids: [number, ...], // Array of product IDs
  bundle_id: number, // Legacy single bundle
  product_id: number, // Legacy single product
  
  // Add-ons
  add_on_ids: [number, ...], // Compulsory BNPL add-ons
  
  // Files
  bank_statement: File, // PDF, JPG, PNG (Max 10MB)
  live_photo: File, // JPG, PNG (Max 5MB)
  
  // Optional
  state_id: number
}
```

---

## ❌ Missing Data & APIs

### **1. Credit Check Related**

**Missing APIs:**
- ❌ `GET /api/bnpl/credit-check-fee` - Get credit check fee amount
- ❌ `POST /api/bnpl/credit-check-payment-confirmation` - Confirm credit check payment
- ❌ `POST /api/bnpl/process-credit-check` - Process credit check after Mono Connect
- ❌ `GET /api/config/mono-keys` - Get Mono public/secret keys from backend

**Missing Data:**
- ❌ `creditScore`: Credit score from Mono (0-100) - Collected but not sent
- ❌ `creditReport`: Full credit report from Mono - Collected but not sent
- ❌ `mono_account_id`: Mono account ID after connection - Not collected
- ❌ `mono_code`: Mono authorization code - Not collected

---

### **2. Fee Calculation**

**Missing APIs:**
- ❌ `GET /api/config/fees?state_id={id}` - Get fees based on state
  - Should return: `material_cost`, `installation_fee`, `delivery_fee`, `inspection_fee`
- ❌ `GET /api/config/delivery-fee?state_id={id}&delivery_location_id={id}` - Get delivery fee
- ❌ `GET /api/config/installation-fee?state_id={id}` - Get installation fee

**Currently Hardcoded:**
- Material cost: ₦50,000
- Installation fee: ₦50,000
- Delivery fee: ₦25,000
- Inspection fee: ₦10,000

---

### **3. Loan Calculation**

**Missing APIs:**
- ❌ `POST /api/loan-calculator-tool` - Server-side loan calculation
  - Should accept: `loan_amount`, `repayment_duration`, `deposit_percentage`
  - Should return: Calculated loan terms

**Currently:** Calculation done client-side only

---

### **4. Property Address**

**Missing Data:**
- ❌ `house_no`: House number (separate field)
- ❌ `street_name`: Street name (separate field)
- ❌ Currently only sending combined `address` field

**Backend Should Accept:**
```json
{
  "property_details": {
    "house_no": string,
    "street_name": string,
    "address": string, // Full address
    "landmark": string
  }
}
```

---

### **5. Audit Request**

**Missing Data:**
- ❌ `audit_request_id`: Not being sent in BNPL application
- ❌ `audit_fee`: Audit fee amount - Not collected

**Missing APIs:**
- ❌ `GET /api/audit/fee?audit_type={type}` - Get audit fee
- ❌ `GET /api/audit/request/{id}/invoice` - Get audit invoice

---

### **6. Payment Confirmation**

**Missing APIs:**
- ❌ `POST /api/bnpl/deposit-payment-confirmation` - BNPL-specific deposit payment confirmation
  - Should accept: `application_id`, `amount`, `tx_id`, `type`
  - Should link payment to BNPL application
  - Should create order after payment

**Currently Using:**
- `POST /api/order/payment-confirmation` (may not link to BNPL correctly)

---

### **7. Invoice & Order**

**Missing APIs:**
- ❌ `GET /api/bnpl/applications/{id}/invoice` - Get invoice for application
- ❌ `GET /api/bnpl/applications/{id}/order` - Get order created from application
- ❌ `POST /api/bnpl/applications/{id}/create-order` - Create order from application

**Currently:**
- Using `/api/bnpl/invoice/{application_id}` (needs verification)
- Using `/api/bnpl/orders/{order_id}` (after order is created)

---

### **8. Delivery Location**

**Missing Data:**
- ❌ `delivery_location_id`: Delivery location ID - Not collected
- ❌ `delivery_address_id`: Delivery address ID - Not collected

**Missing APIs:**
- ❌ `GET /api/config/delivery-locations?state_id={id}` - Get delivery locations for state
- ❌ `POST /api/delivery-address/store` - Create delivery address (may exist)

---

### **9. Add-ons Selection**

**Missing Data:**
- ❌ Only sending compulsory BNPL add-ons
- ❌ Optional add-ons not being sent

**Should Support:**
- `add_on_ids[]`: Array of all selected add-ons (compulsory + optional)

---

### **10. Product/Bundle Details**

**Missing Data:**
- ❌ Only sending IDs, not quantities
- ❌ No quantity field for bundles/products

**Should Support:**
```json
{
  "bundles": [
    {"id": number, "quantity": number},
    ...
  ],
  "products": [
    {"id": number, "quantity": number},
    ...
  ]
}
```

---

## 🔧 Backend Route Requirements

### **New Routes Needed**

#### **1. Credit Check Fee**
```http
GET /api/bnpl/credit-check-fee
Query Params: loan_amount (required)
Response: {
  "status": "success",
  "data": {
    "fee_amount": number,
    "fee_percentage": number,
    "loan_amount": number
  }
}
```

#### **2. Credit Check Payment Confirmation**
```http
POST /api/bnpl/credit-check-payment-confirmation
Body: {
  "application_id": number,
  "amount": number,
  "tx_id": string,
  "payment_method": string
}
Response: {
  "status": "success",
  "data": {
    "payment_id": number,
    "application_id": number,
    "status": "confirmed"
  }
}
```

#### **3. Process Credit Check (Mono)**
```http
POST /api/bnpl/process-credit-check
Body: {
  "application_id": number,
  "mono_code": string,
  "mono_account_id": string,
  "credit_score": number,
  "credit_report": object
}
Response: {
  "status": "success",
  "data": {
    "credit_score": number,
    "credit_report": object,
    "application_status": "pending" | "approved" | "rejected"
  }
}
```

#### **4. Get Fees by State**
```http
GET /api/config/fees
Query Params: state_id (required)
Response: {
  "status": "success",
  "data": {
    "material_cost": number,
    "installation_fee": number,
    "delivery_fee": number,
    "inspection_fee": number,
    "state_id": number
  }
}
```

#### **5. Server-Side Loan Calculator**
```http
POST /api/loan-calculator-tool
Body: {
  "loan_amount": number,
  "repayment_duration": number,
  "deposit_percentage": number
}
Response: {
  "status": "success",
  "data": {
    "total_amount": number,
    "deposit_amount": number,
    "principal": number,
    "monthly_repayment": number,
    "total_repayment": number,
    "interest_rate": number,
    "tenor": number
  }
}
```

#### **6. BNPL Deposit Payment Confirmation**
```http
POST /api/bnpl/deposit-payment-confirmation
Body: {
  "application_id": number,
  "amount": number,
  "tx_id": string,
  "type": "deposit"
}
Response: {
  "status": "success",
  "data": {
    "payment_id": number,
    "application_id": number,
    "order_id": number, // Order created after payment
    "status": "confirmed"
  }
}
```

#### **7. Get BNPL Invoice**
```http
GET /api/bnpl/applications/{application_id}/invoice
Response: {
  "status": "success",
  "data": {
    "application_id": number,
    "items": [...],
    "fees": {
      "material_cost": number,
      "installation_fee": number,
      "delivery_fee": number,
      "inspection_fee": number,
      "insurance_fee": number
    },
    "loan_details": {...},
    "total_amount": number
  }
}
```

#### **8. Get Delivery Locations**
```http
GET /api/config/delivery-locations
Query Params: state_id (required)
Response: {
  "status": "success",
  "data": [
    {
      "id": number,
      "name": string,
      "fee": number,
      "state_id": number
    },
    ...
  ]
}
```

#### **9. Get Audit Fee**
```http
GET /api/audit/fee
Query Params: audit_type (required: "home-office" | "commercial")
Response: {
  "status": "success",
  "data": {
    "audit_type": string,
    "fee_amount": number
  }
}
```

#### **10. Get Mono Configuration**
```http
GET /api/config/mono-keys
Response: {
  "status": "success",
  "data": {
    "public_key": string,
    "environment": "sandbox" | "production"
  }
}
```

---

## 📝 API Response Expectations

### **BNPL Apply Response**

**Current Expected:**
```json
{
  "status": "success",
  "data": {
    "loan_application": {
      "id": number,
      "status": "pending" | "approved" | "rejected" | "counter_offer",
      "loan_amount": number,
      "repayment_duration": number,
      ...
    }
  }
}
```

**Should Also Include:**
- `loan_calculation`: Loan calculation details
- `order_id`: Order ID if order is created
- `invoice_id`: Invoice ID if invoice is created
- `credit_check_fee`: Credit check fee amount
- `deposit_amount`: Required deposit amount

---

## ⚠️ Error Handling Requirements

### **Validation Errors**

Backend should return detailed validation errors:

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": {
    "customer_type": ["The customer type field is required."],
    "personal_details.full_name": ["The full name field is required."],
    "bank_statement": ["The bank statement field is required."],
    "live_photo": ["The live photo field is required."]
  }
}
```

### **File Upload Errors**

```json
{
  "status": "error",
  "message": "File upload failed",
  "errors": {
    "bank_statement": ["The bank statement must be a file of type: pdf, jpg, png."],
    "live_photo": ["The live photo may not be greater than 5120 kilobytes."]
  }
}
```

---

## ✅ Summary of Missing Items

### **Critical Missing APIs:**
1. ❌ Credit check fee API
2. ❌ Credit check payment confirmation API
3. ❌ BNPL deposit payment confirmation API
4. ❌ Fees by state API
5. ❌ Server-side loan calculator API
6. ❌ BNPL invoice API
7. ❌ Delivery locations API
8. ❌ Audit fee API
9. ❌ Mono configuration API

### **Missing Data Fields:**
1. ❌ Credit score and report from Mono
2. ❌ House number and street name (separate fields)
3. ❌ Delivery location ID
4. ❌ Audit request ID in application
5. ❌ Product/bundle quantities
6. ❌ Optional add-ons

### **Data Not Properly Linked:**
1. ❌ Credit check payment not linked to application
2. ❌ Deposit payment may not create order correctly
3. ❌ Invoice not generated after application submission
4. ❌ Order not created after deposit payment

---

## 🎯 Recommendations for Backend Team

1. **Create missing API endpoints** listed above
2. **Update BNPL apply endpoint** to accept:
   - Separate house_no and street_name fields
   - Product/bundle quantities
   - Audit request ID
   - Credit score and report
3. **Link payments to applications:**
   - Credit check payment → Application
   - Deposit payment → Application → Order
4. **Generate invoices automatically** after application approval
5. **Create orders automatically** after deposit payment
6. **Return comprehensive data** in API responses (order_id, invoice_id, etc.)
7. **Add fee calculation endpoints** based on state and delivery location
8. **Support server-side loan calculation** for consistency

---

**End of BNPL Flow Complete Documentation**

