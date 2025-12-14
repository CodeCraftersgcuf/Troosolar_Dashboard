# BNPL Flow Guide - Troosolar Dashboard

**Last Updated:** 2025-01-27  
**Version:** 1.0  
**Status:** Active Development

---

## 📋 Table of Contents
1. [Flow Overview](#flow-overview)
2. [Initial Flow Steps (Matching Flowchart)](#initial-flow-steps-matching-flowchart)
3. [Complete Step-by-Step Flow](#complete-step-by-step-flow)
4. [Data Structure](#data-structure)
5. [API Endpoints Used](#api-endpoints-used)
6. [Change Log](#change-log)

---

## 🎯 Flow Overview

The BNPL (Buy Now Pay Later) flow allows customers to purchase solar products with flexible payment plans. The flow starts with customer type selection and branches based on their choices.

**Entry Point:** `/bnpl/*` route

**Main Flow Branches:**
- **Choose Bundle** → Bundle selection → Order summary → Loan calculator → Application
- **Build System** → Redirects to `/solar-builder` page
- **Request Audit** → Audit type selection → Property details → Order summary → Invoice

---

## 🗺️ Initial Flow Steps (Matching Flowchart)

Based on the uploaded flowchart, the initial BNPL flow structure is:

### **Step 1: Flow Starts**
- User enters BNPL flow from main entry point

### **Step 2: Customer Type Selection**
**UI:** Three options displayed
- **Residential** (`customerType: 'residential'`)
- **SMEs** (`customerType: 'sme'`)
- **Commercial/Industrial** (`customerType: 'commercial'`)

**Action:** User selects one → Proceeds to Step 3

**Implementation:** `renderStep1()` → `handleCustomerTypeSelect()` → `setStep(2)`

---

### **Step 3: Solar Solution Selection**
**UI:** Five product category options displayed
- **Solar panels, inverter, and battery solution** (`productCategory: 'full-kit'`)
- **Inverter and battery solution** (`productCategory: 'inverter-battery'`)
- **Battery only (choose battery capacity)** (`productCategory: 'battery-only'`)
- **Inverter only (Choose inverter capacity)** (`productCategory: 'inverter-only'`)
- **Solar panels only** (`productCategory: 'panels-only'`)

**Action:** User selects one → Proceeds to Step 4

**Implementation:** `renderStep2()` → `handleCategorySelect()` → `setStep(3)`

---

### **Step 4: Action/Decision Selection**
**UI:** Three action options displayed (hexagonal decision points)
- **Choose my solar bundle** (`optionType: 'choose-system'`)
- **Build my solar system** (`optionType: 'build-system'`)
- **Request a professional audit (Paid)** (`optionType: 'audit'`)

**Action:** User selects one → Branches to different paths

**Implementation:** `renderStep3()` → `handleOptionSelect()` → Different step based on option

---

## 🔀 Complete Step-by-Step Flow

### **Path A: Choose Solar Bundle** (`optionType: 'choose-system'`)

| Step | Name | Description | Next Step |
|------|------|-------------|-----------|
| 1 | Customer Type | Select Residential/SME/Commercial | → 2 |
| 2 | Product Category | Select solar solution type | → 3 |
| 3 | Option Selection | Select "Choose my solar bundle" | → 3.5 |
| 3.5 | Bundle Selection | Display available bundles, user selects one | → 6.5 |
| 6.5 | Order Summary | Show selected bundle details and price | → 7 |
| 7 | Add-ons Selection | Select optional add-ons (Insurance compulsory for BNPL) | → 8 |
| 8 | Loan Calculator | Configure deposit %, tenor, view repayment schedule | → 9 |
| 9 | Proceed Confirmation | User confirms to proceed with loan plan | → 10 |
| 10 | Credit Check Method | Select Auto (BVN) or Manual (Bank statement) | → 11 |
| 11 | Application Form | Fill personal details, property details, upload documents | → 12 |
| 12 | Application Submitted | Show pending status, application ID | → 13/14/15 |
| 13 | Application Approved | Show approval, proceed to guarantor | → 14 |
| 14 | Guarantor Form | Fill guarantor details, upload signed form | → 17 |
| 15 | Counteroffer | Show alternative loan terms, user accepts/rejects | → 16 |
| 16 | Counteroffer Accepted | Update loan details, proceed to application form | → 11 |
| 17 | Guarantor Uploaded | Confirmation, proceed to invoice | → 20 |
| 19 | Application Rejected | Show rejection message | - |
| 20 | Calendar Slots | Select audit/installation date | → 21 |
| 21 | Invoice & Payment | View final invoice, make payment | - |

---

### **Path B: Build Solar System** (`optionType: 'build-system'`)

| Step | Name | Description | Next Step |
|------|------|-------------|-----------|
| 1 | Customer Type | Select Residential/SME/Commercial | → 2 |
| 2 | Product Category | Select solar solution type | → 3 |
| 3 | Option Selection | Select "Build my solar system" | → Redirect |
| - | **Redirect** | Navigates to `/solar-builder` page | External |

**Note:** This path redirects to a separate Solar Builder page outside the BNPL flow.

---

### **Path C: Request Professional Audit** (`optionType: 'audit'`)

| Step | Name | Description | Next Step |
|------|------|-------------|-----------|
| 1 | Customer Type | Select Residential/SME/Commercial | → 2 |
| 2 | Product Category | Select solar solution type | → 3 |
| 3 | Option Selection | Select "Request a professional audit" | → 4 |
| 4 | Audit Type Selection | Select Home/Office or Commercial/Industrial | → 5/6 |
| 5 | Property Details Form | Fill address, floors, rooms, estate details | → 6.5 |
| 6 | Commercial Notification | Show notification for commercial audits | - |
| 6.5 | Order Summary | Show audit request summary | → 7 |
| 7 | Audit Invoice | Display invoice with audit fee | → 7.5 |
| 7.5 | Payment Confirmation | Confirm payment for audit | → 20 |
| 20 | Calendar Slots | Select audit date (48 hours after payment) | → 21 |
| 21 | Invoice & Payment | View final invoice | - |

---

## 📊 Data Structure

### **Form Data State**
```javascript
formData = {
    // Initial selections
    customerType: '',           // 'residential' | 'sme' | 'commercial'
    productCategory: '',        // 'full-kit' | 'inverter-battery' | 'battery-only' | 'inverter-only' | 'panels-only'
    optionType: '',            // 'choose-system' | 'build-system' | 'audit'
    auditType: '',             // 'home-office' | 'commercial'
    
    // Product/Bundle selection
    selectedProductPrice: 0,
    selectedBundleId: null,
    selectedBundle: null,
    selectedProductId: null,
    selectedProduct: null,
    
    // Loan details (from calculator)
    loanDetails: {
        depositPercent: 30-80,
        tenor: 3 | 6 | 9 | 12,
        depositAmount: number,
        principal: number,
        monthlyRepayment: number,
        totalRepayment: number,
        totalInterest: number,
        managementFee: number,
        residualFee: number
    },
    
    // Credit check
    creditCheckMethod: '',     // 'auto' | 'manual'
    
    // Personal details
    fullName: '',
    bvn: '',
    phone: '',
    email: '',
    socialMedia: '',
    
    // Property details
    state: '',
    stateId: null,
    address: '',
    streetName: '',
    houseNo: '',
    landmark: '',
    floors: '',
    rooms: '',
    isGatedEstate: false,
    estateName: '',
    estateAddress: '',
    
    // Documents
    bankStatement: File | null,
    livePhoto: File | null,
    
    // Audit
    auditRequestId: null
}
```

---

## 🔌 API Endpoints Used

### **Configuration Endpoints**
- `GET /api/config/customer-types` - Fetch customer types
- `GET /api/config/audit-types` - Fetch audit types
- `GET /api/config/loan-configuration` - Fetch loan config (interest rates, fees, minimum amounts)
- `GET /api/config/add-ons` - Fetch available add-ons
- `GET /api/config/states` - Fetch Nigerian states
- `GET /api/config/delivery-locations?state_id={id}` - Fetch delivery locations

### **Product/Bundle Endpoints**
- `GET /api/categories` - Fetch product categories
- `GET /api/categories/{id}/products` - Fetch products in category
- `GET /api/bundles` - Fetch solar bundles
- `GET /api/bundles/{id}` - Fetch bundle details

### **Audit Endpoints**
- `POST /api/audit/request` - Submit audit request
- `GET /api/audit/request/{id}` - Get audit request details
- `GET /api/audit/requests` - Get user's audit requests

### **Loan/BNPL Endpoints**
- `POST /api/loan-calculation` - Create loan calculation
- `POST /api/bnpl/apply` - Submit BNPL application
- `GET /api/bnpl/status/{id}` - Check application status
- `POST /api/bnpl/guarantor/invite` - Invite guarantor
- `POST /api/bnpl/guarantor/form` - Submit guarantor form
- `POST /api/bnpl/guarantor/upload` - Upload signed guarantor form
- `POST /api/bnpl/counteroffer/accept` - Accept counteroffer
- `GET /api/bnpl/invoice/{applicationId}` - Get invoice

### **Calendar & Payment**
- `GET /api/calendar/slots` - Get available calendar slots
- Payment via Flutterwave integration

---

## 📝 Step Details

### **Step 1: Customer Type Selection**
- **Component:** `renderStep1()`
- **Handler:** `handleCustomerTypeSelect(type)`
- **State Update:** `formData.customerType = type`
- **Next:** `setStep(2)`

### **Step 2: Product Category Selection**
- **Component:** `renderStep2()`
- **Handler:** `handleCategorySelect(groupType)`
- **State Update:** `formData.productCategory = groupType`
- **API Calls:** Fetches categories if not loaded
- **Next:** 
  - If single product category → `setStep(2.5)` (Product Selection)
  - Otherwise → `setStep(3)` (Option Selection)

### **Step 2.5: Product Selection** (For single-item categories)
- **Component:** `renderStep2_5()`
- **Handler:** `handleProductSelect(product)`
- **State Update:** Sets `selectedProductId`, `selectedProduct`, `selectedProductPrice`
- **Next:** `setStep(8)` (Skip to Loan Calculator)

### **Step 3: Option Selection**
- **Component:** `renderStep3()`
- **Handler:** `handleOptionSelect(option)`
- **State Update:** `formData.optionType = option`
- **Next:**
  - `'audit'` → `setStep(4)` (Audit Type)
  - `'choose-system'` → `setStep(3.5)` (Bundle Selection)
  - `'build-system'` → `navigate('/solar-builder')`

### **Step 3.5: Bundle Selection**
- **Component:** `renderStep3_5()`
- **Handler:** `handleBundleSelect(bundle)`
- **API Call:** `GET /api/bundles`
- **State Update:** Sets `selectedBundleId`, `selectedBundle`, `selectedProductPrice`
- **Next:** `setStep(6.5)` (Order Summary)

### **Step 4: Audit Type Selection**
- **Component:** `renderStep4()`
- **Handler:** `handleAuditTypeSelect(type)`
- **State Update:** `formData.auditType = type`
- **Next:**
  - `'commercial'` → `setStep(6)` (Commercial Notification)
  - `'home-office'` → `setStep(5)` (Property Details)

### **Step 5: Property Details Form (Audit)**
- **Component:** `renderStep5()`
- **Handler:** `handleAddressSubmit(e)`
- **API Call:** `POST /api/audit/request`
- **State Update:** Sets property details, `auditRequestId`
- **Next:**
  - Commercial → `setStep(6)` (Notification)
  - Home/Office → `setStep(6.5)` (Order Summary)

### **Step 6: Commercial Audit Notification**
- **Component:** `renderStep6()`
- **Description:** Shows notification that commercial audits require admin approval
- **Next:** User can proceed to order summary → `setStep(6.5)`

### **Step 6.5: Order Summary**
- **Component:** `renderStep6_5()`
- **Description:** Displays selected bundle/product details, total amount
- **Next:**
  - Audit path → `setStep(7)` (Add-ons/Invoice)
  - Bundle path → `setStep(7)` (Add-ons Selection)

### **Step 7: Add-ons Selection / Audit Invoice**
- **Component:** `renderStep7()`
- **Description:** 
  - For bundles: Select optional add-ons (Insurance is compulsory for BNPL)
  - For audit: Display audit invoice
- **Next:**
  - Audit → `setStep(7.5)` (Payment Confirmation)
  - Bundle → `setStep(8)` (Loan Calculator)

### **Step 7.5: Payment Confirmation (Audit)**
- **Component:** `renderStep7_5()`
- **Description:** Confirm audit payment, process via Flutterwave
- **Next:** `setStep(20)` (Calendar Slots)

### **Step 8: Loan Calculator**
- **Component:** `renderStep8()`
- **Uses:** `<LoanCalculator />` component
- **Handler:** `handleLoanConfirm(loanDetails)`
- **State Update:** `formData.loanDetails = loanDetails`
- **Calculations:**
  - Deposit: 30-80% of total amount
  - Principal: Total - Deposit
  - Interest: Principal × Rate × Tenor
  - Management Fee: 1% of principal (upfront)
  - Residual Fee: 1% of principal (end)
  - Total Repayment: Principal + Interest + Residual Fee
- **Next:** `setStep(9)` (Proceed Confirmation)

### **Step 9: Proceed Confirmation**
- **Component:** `renderStep9()`
- **Description:** Shows loan summary, user confirms to proceed
- **Next:** `setStep(10)` (Credit Check Method)

### **Step 10: Credit Check Method**
- **Component:** `renderStep10()`
- **Handler:** User selects 'auto' (BVN) or 'manual' (Bank statement)
- **State Update:** `formData.creditCheckMethod = method`
- **Next:** `setStep(11)` (Application Form)

### **Step 11: Application Form**
- **Component:** `renderStep11()`
- **Handler:** `handleApplicationSubmit(e)`
- **API Calls:**
  1. `POST /api/loan-calculation` (if loan details exist)
  2. `POST /api/bnpl/apply` (main application)
- **Form Fields:**
  - Personal: Full name, BVN, Phone, Email, Social media
  - Property: State, Address, Landmark, Floors, Rooms, Estate details
  - Documents: Bank statement, Live photo
- **State Update:** Sets `applicationId`, `applicationStatus`
- **Next:** `setStep(12)` (Application Submitted)

### **Step 12: Application Submitted**
- **Component:** `renderStep12()`
- **Description:** Shows pending status, application ID
- **API Call:** `GET /api/bnpl/status/{id}` (polling)
- **Next:** Based on status:
  - `approved` → `setStep(13)`
  - `rejected` → `setStep(19)`
  - `counter_offer` → `setStep(15)`

### **Step 13: Application Approved**
- **Component:** `renderStep13()`
- **Description:** Shows approval confirmation
- **Next:** `setStep(14)` (Guarantor Form)

### **Step 14: Guarantor Form**
- **Component:** `renderStep14()`
- **Handler:** `handleGuarantorSubmit(e)`
- **API Call:** `POST /api/bnpl/guarantor/form`
- **Form Fields:** Full name, Phone, Email, Relationship
- **Next:** `setStep(17)` (Guarantor Upload)

### **Step 15: Counteroffer**
- **Component:** `renderStep15()`
- **Description:** Shows alternative loan terms (higher deposit, longer tenor)
- **Handler:** User accepts or rejects
- **Next:**
  - Accept → `setStep(16)` (Update loan details, go to Step 11)
  - Reject → Stay on Step 15

### **Step 16: Counteroffer Accepted**
- **Component:** `renderStep16()`
- **Description:** Updates loan details with counteroffer terms
- **State Update:** Updates `formData.loanDetails` with new terms
- **Next:** `setStep(11)` (Application Form with updated terms)

### **Step 17: Guarantor Upload**
- **Component:** `renderStep17()`
- **Handler:** `handleGuarantorUpload(e)`
- **API Call:** `POST /api/bnpl/guarantor/upload`
- **File Upload:** Signed guarantor form (PDF, JPG, PNG)
- **Next:** `setStep(20)` (Calendar Slots)

### **Step 19: Application Rejected**
- **Component:** `renderStep19()`
- **Description:** Shows rejection message
- **Next:** User can retry or exit

### **Step 20: Calendar Slots**
- **Component:** `renderStep20()`
- **Handler:** `handleSlotSelect(slot)`
- **API Call:** `GET /api/calendar/slots?payment_date={date}`
- **Description:** 
  - Audit slots: Available 48 hours after payment
  - Installation slots: Available 72 hours after payment
- **Next:** `setStep(21)` (Invoice & Payment)

### **Step 21: Invoice & Payment**
- **Component:** `renderStep21()`
- **API Call:** `GET /api/bnpl/invoice/{applicationId}`
- **Description:** Shows final invoice with all fees, payment schedule
- **Payment:** Flutterwave integration
- **Next:** Payment success → Order completion

---

## 🔄 Change Log

### Version 1.0 (2025-01-27)
- **Initial Documentation:** Created comprehensive BNPL flow guide
- **Flow Analysis:** Documented all 21 steps based on current implementation
- **Flowchart Mapping:** Mapped initial flow steps (1-4) to uploaded flowchart
- **Data Structure:** Documented form data state structure
- **API Endpoints:** Listed all API endpoints used in the flow

---

## 📌 Notes

1. **Minimum Order Value:** Currently set to ₦1,500,000 (can be configured via loan-configuration API)
2. **Insurance:** Compulsory for BNPL, optional for Buy Now
3. **Loan Calculator:** Uses loan configuration from API (interest rates, fees, minimum amounts)
4. **Calendar Slots:** Timing depends on payment confirmation date
5. **Commercial Audits:** Require admin approval, no instant invoice

---

## 🔧 Maintenance

**When making changes:**
1. Update the relevant step details in this document
2. Add entry to Change Log with version number and date
3. Update step numbers if flow structure changes
4. Document any new API endpoints or data fields
5. Update flow diagrams if major changes occur

---

**Document Maintainer:** Development Team  
**Review Frequency:** After each major change

