# BuyNow Flow Changes Guide - Troosolar Dashboard

**Last Updated:** 2025-01-27  
**Version:** 1.0  
**Status:** Active Development

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Previous BuyNow Flow (Before Changes)](#previous-buynow-flow-before-changes)
3. [Changes Summary](#changes-summary)
4. [New Flow Structure](#new-flow-structure)
5. [Step-by-Step Flow Comparison](#step-by-step-flow-comparison)
6. [Technical Implementation Details](#technical-implementation-details)
7. [Code Changes Breakdown](#code-changes-breakdown)
8. [API Integration](#api-integration)
9. [Change Log](#change-log)

---

## 🎯 Overview

The BuyNow flow has been restructured to match the BNPL flow structure, providing a consistent user experience across both payment methods. The flow now follows the same initial steps (Customer Type → Solar Solution → Action Selection) before branching into specific paths.

**Key Principle:** All old code has been **commented out** (not removed) to preserve existing functionality for reference.

---

## 📜 Previous BuyNow Flow (Before Changes)

### **Original Flow Structure**

The previous BuyNow flow had a simpler, more direct structure that went straight from customer type selection to API categories, without the intermediate solar solution and action selection steps.

```
Step 1: Customer Type Selection
├── Residential
├── SMEs
└── Commercial/Industrial
    ↓
Step 2: API Category Selection (Direct from API)
├── Category 1 (from API)
├── Category 2 (from API)
├── Category 3 (from API)
└── ... (all categories from API)
    ↓
Step 2.5: Product Selection
├── Product 1
├── Product 2
└── ... (products from selected category)
    ↓
Step 3: Action Selection (Limited)
├── Choose my solar system → Step 3.5 (Bundle Selection)
├── Build My System → Redirect to /solar-builder
└── Request Professional Audit → Redirect to BNPL flow
    ↓
Step 3.5: Bundle Selection
├── Bundle 1
├── Bundle 2
└── ... (bundles from API)
    ↓
Step 7: Order Summary
    ↓
Step 4: Checkout Options
├── Installer Choice (TrooSolar / Own)
└── Insurance (Optional)
    ↓
Step 8: Order Summary with Details
    ↓
Step 5: Invoice
    ↓
Step 6: Payment Result
```

### **Previous Step Details**

#### **Step 1: Customer Type Selection**
- **Status:** Same as current
- **Options:** Residential, SMEs, Commercial/Industrial
- **Next:** Step 2 (API Categories)

#### **Step 2: API Category Selection (OLD)**
- **Status:** Removed/Replaced
- **Implementation:** 
  - Fetched all categories from `GET /api/categories`
  - Displayed categories directly from API response
  - Each category had its own icon/image
  - User clicked category → went to Step 2.5
- **Handler:** `handleCategorySelect(categoryId)` - took API category ID directly
- **Next:** Step 2.5 (Product Selection)

#### **Step 2.5: Product Selection**
- **Status:** Still exists (unchanged)
- **Purpose:** Show products from selected category
- **Next:** Step 7 (Order Summary)

#### **Step 3: Action Selection (OLD - Limited)**
- **Status:** Enhanced
- **Previous Implementation:**
  - "Choose my solar system" → Step 3.5 (Bundle Selection) ✅
  - "Build My System" → `navigate('/solar-builder')` ✅
  - "Request Professional Audit" → `navigate('/bnpl')` with confirmation ❌
- **Issue:** Audit flow redirected to BNPL instead of handling in BuyNow
- **Next:** 
  - Choose → Step 3.5
  - Build → External redirect
  - Audit → External redirect

#### **Step 3.5: Bundle Selection**
- **Status:** Still exists (unchanged)
- **Next:** Step 7 (Order Summary)

#### **Step 4: Checkout Options (OLD)**
- **Status:** Now conditional
- **Previous Implementation:**
  - Always showed checkout options
  - Installer choice: TrooSolar Certified / Own Installer
  - Insurance: Optional checkbox
  - No audit flow handling
- **Next:** Step 8 (Order Summary with Details)

#### **Step 5: Invoice (OLD)**
- **Status:** Now conditional
- **Previous Implementation:**
  - Always showed invoice
  - Displayed product breakdown (Inverter, Panels, Batteries)
  - Showed fees (Material, Installation, Delivery, Inspection, Insurance)
  - No audit invoice support
- **Next:** Step 6 (Payment)

#### **Step 6: Payment Result (OLD)**
- **Status:** Now conditional
- **Previous Implementation:**
  - Always showed payment result
  - Success: Order confirmation with calendar slots
  - Failed: Error message with retry option
  - No audit flow handling
- **Next:** Order completion or retry

#### **Step 7: Order Summary (OLD)**
- **Status:** Enhanced
- **Previous Implementation:**
  - Always showed product/bundle order summary
  - Displayed selected product/bundle details
  - Price information
  - "Proceed to Checkout Options" button
  - No audit order summary
- **Next:** Step 4 (Checkout Options)

#### **Step 8: Order Summary with Details (OLD)**
- **Status:** Enhanced
- **Previous Implementation:**
  - Always showed detailed order summary
  - Displayed invoice details from API
  - "View Detailed Invoice" button
  - No audit order summary
- **Next:** Step 5 (Invoice)

### **Previous Handler Functions**

#### **`handleCustomerTypeSelect(type)` (OLD)**
```javascript
const handleCustomerTypeSelect = (type) => {
    setFormData({ ...formData, customerType: type });
    setStep(2); // Go directly to API categories
};
```

#### **`handleCategorySelect(categoryId)` (OLD)**
```javascript
const handleCategorySelect = async (categoryId) => {
    // categoryId is now the actual category ID from the API
    const selectedCategory = categories.find(cat => cat.id === categoryId);
    setFormData({ ...formData, productCategory: selectedCategory.title || selectedCategory.name });
    setSelectedCategoryId(categoryId);
    
    // Fetch products for this category
    setCategoryProducts([]);
    setProductsLoading(true);
    setStep(2.5); // Go to Product Selection
    
    // ... fetch products from API
};
```

#### **`handleOptionSelect(option)` (OLD)**
```javascript
const handleOptionSelect = (option) => {
    setFormData(prev => ({ ...prev, optionType: option }));
    if (option === 'choose-system') {
        setStep(3.5); // Go to Bundle Selection
    } else if (option === 'build-system') {
        navigate('/solar-builder'); // Redirect to Solar Builder
    } else if (option === 'audit') {
        // Redirect to BNPL flow for audit
        if (window.confirm("Audit requests are handled through the BNPL flow. Would you like to proceed to BNPL?")) {
            navigate('/bnpl');
        }
    }
};
```

### **Previous Render Functions**

#### **`renderStep2()` (OLD)**
- **Purpose:** Display API categories directly
- **Implementation:**
  - Fetched categories from `GET /api/categories`
  - Displayed each category as a card
  - Used category icon/image if available
  - Fallback icon based on category name (Battery, Inverter, Solar, etc.)
  - Clicking category → `handleCategorySelect(cat.id)`
- **No predefined groups** - all categories shown as-is from API

#### **`renderStep3()` (OLD)**
- **Purpose:** Show action selection
- **Implementation:**
  - Three buttons: Choose, Build, Audit
  - Audit button redirected to BNPL flow
  - No audit flow within BuyNow

#### **`renderStep4()` (OLD)**
- **Purpose:** Always show checkout options
- **Implementation:**
  - Installer choice selection
  - Insurance checkbox
  - No conditional logic
  - Always proceeded to Step 8

#### **`renderStep5()` (OLD)**
- **Purpose:** Always show invoice
- **Implementation:**
  - Displayed invoice details
  - Product breakdown
  - Fee breakdown
  - No conditional logic
  - No audit invoice support

#### **`renderStep6()` (OLD)**
- **Purpose:** Always show payment result
- **Implementation:**
  - Success/Failed states
  - Calendar slot selection
  - No conditional logic
  - No audit flow handling

### **Previous State Management**

**Previous FormData:**
```javascript
formData = {
    customerType: '',
    productCategory: '', // Category name from API
    optionType: '', // 'choose-system', 'build-system', 'audit'
    selectedProductPrice: 0,
    selectedBundleId: null,
    selectedBundle: null,
    selectedProductId: null,
    selectedProduct: null,
    // NO multi-select arrays
    // NO selectedBundles or selectedProducts arrays
    installerChoice: '', // 'troosolar', 'own'
    includeInsurance: false,
    address: '',
    state: '',
    stateId: null,
    deliveryLocationId: null,
    // NO audit-related fields
}
```

**Current FormData (After Version 1.1):**
```javascript
formData = {
    customerType: '',
    productCategory: '',
    optionType: '',
    selectedProductPrice: 0,
    selectedBundleId: null,
    selectedBundle: null,
    selectedProductId: null,
    selectedProduct: null,
    selectedBundles: [], // NEW: Array of selected bundles
    selectedProducts: [], // NEW: Array of selected products
    installerChoice: '',
    includeInsurance: false,
    // ... other fields
}
```

**Previous State Variables:**
```javascript
// No audit-related state
const [addOns, setAddOns] = useState([]);
const [states, setStates] = useState([]);
const [deliveryLocations, setDeliveryLocations] = useState([]);
// No auditTypes, no auditRequestId
```

### **Previous Helper Functions**

#### **`getCategoryIdFromProductCategory` (OLD)**
```javascript
const getCategoryIdFromProductCategory = (productCategory) => {
    const categoryMap = {
        'battery-only': ['battery', 'batteries'],
        'inverter-only': ['inverter', 'inverters'],
        'panels-only': ['solar panel', 'panels', 'solar panels'],
    };
    
    const searchTerms = categoryMap[productCategory] || [];
    if (searchTerms.length === 0) return null;
    
    // Find category by matching name (case-insensitive)
    const found = categories.find(cat => {
        const name = (cat.name || cat.title || '').toLowerCase();
        return searchTerms.some(term => name.includes(term));
    });
    
    return found?.id || null;
};
```

**Purpose:** Map product category strings to API category IDs (limited to 3 types)

### **Previous API Integration**

**Previous API Calls:**
1. `GET /api/categories` - Fetch all categories
2. `GET /api/categories/{id}/products` - Fetch products by category
3. `GET /api/bundles` - Fetch bundles
4. `POST /api/orders/checkout` - Checkout (products/bundles only)
5. `GET /api/config/states` - Fetch states
6. `GET /api/config/add-ons` - Fetch add-ons

**No Audit API Calls:**
- No `GET /api/config/audit-types`
- No `POST /api/audit/request`
- No audit checkout handling

### **Previous Flow Limitations**

1. **No Solar Solution Grouping:**
   - All API categories shown directly
   - No predefined groups (Full Kit, Inverter-Battery, etc.)
   - User had to know which category to select

2. **Limited Action Selection:**
   - Audit flow redirected to BNPL
   - No audit handling within BuyNow
   - Build system redirected externally

3. **No Audit Flow:**
   - No audit type selection
   - No property details form
   - No audit invoice
   - No commercial audit notification

4. **Direct Category Selection:**
   - Went straight from customer type to API categories
   - No intermediate grouping step
   - Less user-friendly for non-technical users

5. **Inconsistent with BNPL:**
   - Different initial flow structure
   - Different user experience
   - No unified approach

### **Previous Code Structure**

**File Organization:**
- Single flow path (no branching for audit)
- No conditional rendering
- Simpler state management
- Less code complexity

**Code Location (OLD):**
- `renderStep2()` - Lines ~493-550 (OLD version)
- `renderStep3()` - Lines ~659-688 (OLD version)
- `handleCategorySelect()` - Lines ~131-179 (OLD version)
- `handleOptionSelect()` - Lines ~183-199 (OLD version)

**All old code is now commented out with "OLD:" markers for reference.**

---

## 📝 Changes Summary

### **Major Changes:**

1. **Added 5 Solar Solution Options** (Step 2)
   - Same as BNPL: Full Kit, Inverter-Battery, Battery Only, Inverter Only, Panels Only
   - Replaces direct API category selection

2. **Added 3 Action Options** (Step 3)
   - Choose my solar bundle
   - Build my solar system
   - Request a professional audit

3. **Integrated Audit Flow**
   - Complete audit flow matching BNPL
   - Property details form
   - Invoice generation for audit requests

4. **Unified Flow Structure**
   - All paths now start with: Customer Type → Solar Solution → Action Selection
   - Consistent navigation and user experience

---

## 🗺️ New Flow Structure

### **Initial Flow (Steps 1-3) - Same as BNPL**

```
Step 1: Customer Type Selection
├── Residential
├── SMEs
└── Commercial/Industrial
    ↓
Step 2: Solar Solution Selection (NEW - 5 predefined options)
├── Solar panels, inverter, and battery solution
├── Inverter and battery solution
├── Battery only (choose battery capacity)
├── Inverter only (Choose inverter capacity)
└── Solar panels only
    ↓
Step 3: Action Selection (NEW - 3 options)
├── Choose my solar bundle → Step 3.5 (Bundle Selection)
├── Build my solar system → Step 3.75 (All Products - Build Custom Bundle) [NEW]
└── Request a professional audit → Step 4 (Audit Type Selection)
```

### **Branching Paths**

#### **Path A: Choose Solar Bundle**
```
Step 3 → Step 3.5 (Bundle Selection) → Step 7 (Order Summary) → Step 4 (Checkout Options) → Step 8 (Order Summary with Details) → Step 5 (Invoice) → Step 6 (Payment)
```

#### **Path B: Build Solar System**
```
Step 3 → Step 3.75 (Build System - All Products) → Step 7 (Order Summary) → Step 4 (Checkout Options) → Step 8 (Order Summary with Details) → Step 5 (Invoice) → Step 6 (Payment)
```

#### **Path C: Request Professional Audit**
```
Step 3 → Step 4 (Audit Type Selection) → Step 5 (Property Details Form) → Step 7 (Order Summary) → Step 8 (Order Summary with Details) → Step 5 (Invoice) → Step 6 (Payment)
```

---

## 🔄 Step-by-Step Flow Comparison

### **Before Changes:**

| Step | Old Flow | Description |
|------|----------|-------------|
| 1 | Customer Type | Select Residential/SME/Commercial |
| 2 | API Categories | Direct selection from API categories |
| 2.5 | Product Selection | Select individual products |
| 3 | Action Selection | Choose/Build/Audit (limited) |
| 3.5 | Bundle Selection | Select bundles |
| 4 | Checkout Options | Installer choice, insurance |
| 5 | Invoice | View invoice |
| 6 | Payment | Payment result |

### **After Changes:**

| Step | New Flow | Description |
|------|----------|-------------|
| 1 | Customer Type | Select Residential/SME/Commercial |
| 2 | **Solar Solution Selection** | **5 predefined options (NEW)** |
| 2.5 | Product Selection | For individual components |
| **2.75** | **API Categories** | **For "Build my solar system" path (NEW)** |
| 3 | **Action Selection** | **3 options: Choose/Build/Audit (ENHANCED)** |
| 3.5 | Bundle Selection | Select bundles |
| 4 | **Conditional** | **Audit Type OR Checkout Options** |
| 5 | **Conditional** | **Property Details Form OR Invoice** |
| 6 | **Conditional** | **Commercial Notification OR Payment Result** |
| 7 | Order Summary | Order summary with details |
| 8 | Order Summary with Details | Detailed order summary |
| 5 | Invoice | View invoice (after Step 8) |
| 6 | Payment | Payment result |

---

## 🔧 Technical Implementation Details

### **1. New Helper Function**

**Added:** `getCategoryIdsForGroup(groupType)`
- Maps predefined category groups to API category IDs
- Same implementation as BNPL flow
- Handles: 'full-kit', 'inverter-battery', 'battery-only', 'inverter-only', 'panels-only'

**Location:** Lines ~104-149

### **2. Updated State Management**

**Added State Variables:**
```javascript
const [auditTypes, setAuditTypes] = useState([]);
const [auditRequestId, setAuditRequestId] = useState(null);
```

**Updated FormData:**
```javascript
formData = {
    // ... existing fields
    auditType: '', // 'home-office' | 'commercial' (NEW)
    houseNo: '', // (NEW)
    landmark: '', // (NEW)
    floors: '', // (NEW)
    rooms: '', // (NEW)
    isGatedEstate: false, // (NEW)
    estateName: '', // (NEW)
    estateAddress: '', // (NEW)
    streetName: '', // (NEW)
}
```

### **3. New Handler Functions**

**Added:**
- `handleAuditTypeSelect(type)` - Handles audit type selection
- `handleAuditAddressSubmit(e)` - Submits audit property details
- `handleBuildSystemCategorySelect(categoryId)` - Handles category selection for build system path (OLD - now deprecated)
- `renderStep3_75()` - Build Your Solar System step with multi-select product selection

**Modified:**
- `handleCustomerTypeSelect(type)` - Now goes to Step 2 (solar solution selection)
- `handleCategorySelect(groupType)` - Now handles predefined groups instead of API categories
- `handleOptionSelect(option)` - Enhanced to handle audit flow

### **4. New Render Functions**

**Added:**
- `renderStep2_75()` - API category selection for "Build my solar system" path (DEPRECATED - replaced by Step 3.75)
- `renderStep3_75()` - Build Your Solar System - All products with multi-select

**Modified:**
- `renderStep2()` - Now shows 5 predefined solar solution options
- `renderStep3()` - Shows 3 action options (same as BNPL)
- `renderStep4()` - Conditional: Audit Type Selection OR Checkout Options
- `renderStep5()` - Conditional: Property Details Form OR Invoice
- `renderStep6()` - Conditional: Commercial Notification OR Payment Result
- `renderStep7()` - Conditional: Audit Order Summary OR Regular Order Summary
- `renderStep8()` - Conditional: Audit Order Summary OR Regular Order Summary

---

## 📊 Code Changes Breakdown

### **File: `src/Pages/BuyNow/BuyNowFlow.jsx`**

#### **1. Helper Functions (Lines ~104-149)**

**Added:**
```javascript
const getCategoryIdsForGroup = (groupType) => {
    // Maps predefined groups to API category IDs
    // Same as BNPL implementation
}
```

**Commented Out:**
```javascript
// OLD: const getCategoryIdFromProductCategory = (productCategory) => {
//     // Old category mapping logic
// };
```

#### **2. useEffect Hook (Lines ~95-130)**

**Updated:**
- Now fetches both categories AND audit types
- Uses Promise.all for parallel API calls
- Falls back to default audit types if API fails

#### **3. Handler Functions**

**`handleCustomerTypeSelect` (Line ~126)**
- **Before:** `setStep(2)` → API categories
- **After:** `setStep(2)` → Solar solution selection (5 options)

**`handleCategorySelect` (Line ~131)**
- **Before:** Handled API category IDs directly
- **After:** Handles predefined group types ('full-kit', etc.)
- Routes to Step 3 (action selection) for full-kit/inverter-battery
- Routes to Step 2.5 (product selection) for individual components

**`handleOptionSelect` (Line ~494)**
- **Before:** Limited audit handling (redirected to BNPL), 'build-system' → Step 2.75
- **After:** 
  - 'choose-system' → Step 3.5 (bundle selection)
  - 'build-system' → Step 3.75 (All products - fetches from all categories)
  - 'audit' → Step 4 (audit type selection)
- **NEW:** 'build-system' now fetches all products from all categories and navigates to Step 3.75

**New: `handleAuditTypeSelect` (Line ~383)**
- Routes to Step 5 (property details) for home-office
- Routes to Step 6 (commercial notification) for commercial

**New: `handleAuditAddressSubmit` (Line ~394)**
- Submits audit request to API
- Calls checkout API for home-office audits
- Routes to Step 8 (order summary with details)

**New: `handleBuildSystemCategorySelect` (Line ~332)**
- Handles API category selection for "Build my solar system" path (DEPRECATED)
- Same logic as old `handleCategorySelect`
- **Note:** Replaced by direct product selection in Step 3.75

**Updated: `handleProductSelect` (Line ~541)**
- **Before:** Single product selection, auto-navigates to Step 7
- **After:** 
  - Toggle selection (add/remove from array)
  - Calculates total from all selected products
  - No auto-navigation (allows multiple selections)
  - Updates `selectedProducts` array
  - Maintains backward compatibility with single-item fields

#### **4. Render Functions**

**`renderStep2()` (Line ~493)**
- **Before:** Showed API categories directly
- **After:** Shows 5 predefined solar solution options
- **Old code:** Commented out (Lines ~550-841)

**New: `renderStep2_75()` (Line ~843)**
- Shows API categories for "Build my solar system" path (DEPRECATED - replaced by Step 3.75)

**New: `renderStep3_75()` (Line ~1212)**
- Shows all products from all categories for building custom system
- Multi-select functionality with visual indicators
- Requires at least one product to be selected
- Continue button navigates to Step 7 (Order Summary)
- Button text: "Add to Bundle" / "Remove from Bundle"
- Uses old `renderStep2` logic

**`renderStep3()` (Line ~887)**
- **Before:** Showed action options (but audit redirected)
- **After:** Shows 3 action options with full audit support
- **Old code:** Commented out (Lines ~659-688)

**`renderStep4()` (Line ~1288)**
- **Before:** Only checkout options
- **After:** Conditional rendering:
  - If `optionType === 'audit'` → Audit Type Selection
  - Otherwise → Checkout Options

**`renderStep5()` (Line ~1827)**
- **Before:** Only invoice
- **After:** Conditional rendering:
  - If `optionType === 'audit' && auditType === 'home-office' && !invoiceDetails` → Property Details Form
  - Otherwise → Invoice

**`renderStep6()` (Line ~1957)**
- **Before:** Only payment result
- **After:** Conditional rendering:
  - If `optionType === 'audit' && auditType === 'commercial'` → Commercial Notification
  - Otherwise → Payment Result

**`renderStep7()` (Line ~1767)**
- **Before:** Only regular order summary (single item)
- **After:** Conditional rendering with multi-select support:
  - If `optionType === 'audit'` → Audit Order Summary (with "Proceed to Invoice" button)
  - Otherwise → Regular Order Summary
  - **NEW:** Displays all selected bundles with individual prices
  - **NEW:** Displays all selected products with individual prices
  - **NEW:** Shows items subtotal for multiple items
  - **NEW:** Maintains backward compatibility for single-item selections

**`renderStep8()` (Line ~1685)**
- **Before:** Only regular order summary with details
- **After:** Conditional rendering:
  - If `optionType === 'audit'` → Audit Order Summary with details
  - Otherwise → Regular Order Summary with details

---

## 🔌 API Integration

### **New API Calls**

1. **Fetch Audit Types**
   ```javascript
   GET /api/config/audit-types
   ```
   - Called in useEffect on component mount
   - Falls back to defaults if API fails

2. **Submit Audit Request**
   ```javascript
   POST /api/audit/request
   ```
   - Called in `handleAuditAddressSubmit`
   - Payload includes property details, state, floors, rooms, etc.

3. **Checkout for Audit**
   ```javascript
   POST /api/orders/checkout
   ```
   - Called with `audit_request_id` for audit flows
   - Returns invoice details including audit fee

### **Updated API Calls**

**Checkout API** now handles:
- Regular products/bundles (existing)
- Audit requests (new) - includes `audit_request_id` in payload

---

## 📋 Step Details

### **Step 1: Customer Type Selection**
- **Status:** Unchanged
- **Options:** Residential, SMEs, Commercial/Industrial
- **Next:** Step 2

### **Step 2: Solar Solution Selection (NEW)**
- **Status:** Completely new
- **Options:** 5 predefined solutions
- **Implementation:** Uses `getCategoryIdsForGroup()` to map to API categories
- **Next:** 
  - Full-kit/Inverter-Battery → Step 3
  - Individual components → Step 2.5

### **Step 2.5: Product Selection**
- **Status:** Unchanged (for individual components)
- **Next:** Step 7

### **Step 2.75: API Category Selection (DEPRECATED)**
- **Status:** Replaced by Step 3.75
- **Note:** This step is no longer used. "Build my System" now goes directly to Step 3.75

### **Step 3.75: Build Your Solar System (NEW)**
- **Status:** New step for "Build my solar system" path
- **Purpose:** Allow users to select multiple products from all categories to create custom bundle
- **Features:**
  - Displays all products from all categories (no category selection needed)
  - Multi-select functionality (toggle selection)
  - Visual indicators for selected products (blue border, checkmark)
  - Requires at least one product to be selected
  - Continue button shows product count: "Continue with X Products in Bundle"
- **Next:** Step 7 (Order Summary)

### **Step 3: Action Selection (ENHANCED)**
- **Status:** Enhanced with full audit support
- **Options:** Choose bundle, Build system, Request audit
- **Next:**
  - Choose bundle → Step 3.5
  - Build system → Step 3.75 (NEW - All products)
  - Request audit → Step 4

### **Step 3.5: Bundle Selection**
- **Status:** Unchanged
- **Next:** Step 7

### **Step 4: Conditional (ENHANCED)**
- **Status:** Now conditional
- **If Audit:** Audit Type Selection (Home/Office or Commercial)
- **If Regular:** Checkout Options (Installer choice, Insurance)
- **Next:**
  - Audit → Step 5 (property details) or Step 6 (commercial notification)
  - Regular → Step 8

### **Step 5: Conditional (ENHANCED)**
- **Status:** Now conditional
- **If Audit (no invoice):** Property Details Form
- **If Invoice exists:** Invoice Display
- **Next:**
  - Property form → Step 7 (after submission)
  - Invoice → Step 6 (payment)

### **Step 6: Conditional (ENHANCED)**
- **Status:** Now conditional
- **If Audit (commercial):** Commercial Notification
- **If Payment:** Payment Result (Success/Failed)
- **Next:**
  - Commercial notification → Step 7
  - Payment success → Order completion

### **Step 7: Order Summary (ENHANCED)**
- **Status:** Enhanced with audit support
- **If Audit:** Shows audit order summary with "Proceed to Invoice" button
- **If Regular:** Shows product/bundle order summary with "Proceed to Checkout Options" button
- **Next:**
  - Audit → Step 8 (after checkout API call)
  - Regular → Step 4

### **Step 8: Order Summary with Details (ENHANCED)**
- **Status:** Enhanced with audit support
- **If Audit:** Shows audit order summary with invoice details
- **If Regular:** Shows product order summary with invoice details
- **Next:** Step 5 (Invoice)

---

## 🔄 Change Log

### Version 1.1 (2025-01-27)

#### **Build My System Enhancement**
- ✅ Added "Build my System" functionality (Step 3.75) - users can select multiple products to create custom bundle
- ✅ Replaced redirect to `/solar-builder` with in-flow product selection
- ✅ Added multi-select support for products (`selectedProducts` array)
- ✅ Added multi-select support for bundles (`selectedBundles` array)
- ✅ Updated `handleProductSelect` to support toggle selection
- ✅ Updated Order Summary (Step 7) to display multiple selected products
- ✅ Added visual indicators for selected products (blue border, checkmark)
- ✅ Added validation requiring at least one product to be selected
- ✅ Products fetched from all categories for building custom system

### Version 1.0 (2025-01-27)

#### **Initial Restructuring**
- ✅ Added 5 solar solution options (matching BNPL)
- ✅ Added 3 action options (matching BNPL)
- ✅ Integrated complete audit flow
- ✅ Added Step 2.75 for "Build my solar system" path (OLD - now replaced with Step 3.75)
- ✅ Made Steps 4, 5, 6, 7, 8 conditional
- ✅ Added audit-related state and handlers
- ✅ Updated all render functions to support new flow
- ✅ Commented out all old code (preserved for reference)

#### **Audit Flow Integration**
- ✅ Added audit type selection
- ✅ Added property details form
- ✅ Added commercial audit notification
- ✅ Integrated audit checkout API call
- ✅ Added audit invoice display

#### **Code Preservation**
- ✅ All old code commented out (not removed)
- ✅ Clear markers: "OLD:" and "NEW:" comments
- ✅ Original functionality preserved in comments

---

## 📌 Key Differences from BNPL Flow

1. **No Loan Calculator:** BuyNow doesn't have loan calculation steps
2. **Direct Payment:** Goes straight to payment after invoice
3. **No Guarantor:** No guarantor form or upload steps
4. **Simpler Application:** No credit check or application form
5. **Same Initial Flow:** Customer Type → Solar Solution → Action Selection (identical)

---

## 🔍 Testing Checklist

### **Path A: Choose Solar Bundle**
- [ ] Customer type selection works
- [ ] Solar solution selection shows 5 options
- [ ] Action selection shows 3 options
- [ ] Bundle selection loads correctly
- [ ] Order summary displays bundle details
- [ ] Checkout options work
- [ ] Invoice displays correctly
- [ ] Payment flow works

### **Path B: Build Solar System**
- [ ] Customer type selection works
- [ ] Solar solution selection works
- [ ] "Build my solar system" shows all products (Step 3.75)
- [ ] Multi-select works correctly (can select multiple products)
- [ ] Visual indicators appear for selected products
- [ ] Continue button only appears when products are selected
- [ ] Warning message displays correctly
- [ ] Order summary displays all selected products with individual prices
- [ ] Items subtotal calculated correctly
- [ ] Checkout options work
- [ ] Invoice displays correctly
- [ ] Payment flow works

### **Path C: Request Professional Audit**
- [ ] Customer type selection works
- [ ] Solar solution selection works
- [ ] "Request audit" shows audit type selection
- [ ] Home/Office audit shows property form
- [ ] Property form submission works
- [ ] Order summary displays audit details
- [ ] Invoice displays audit fee
- [ ] Payment flow works
- [ ] Commercial audit shows notification

---

## 🛠️ Maintenance Notes

**When making changes:**
1. Check if change affects both regular and audit flows
2. Update conditional rendering logic if needed
3. Test all three paths (Bundle, Build, Audit)
4. Update this guide with change log entry
5. Preserve commented code for reference

**Code Organization:**
- New code marked with "NEW:" comments
- Old code marked with "OLD:" comments
- Conditional logic clearly documented
- Step numbers documented in comments

---

## 📚 Related Documentation

- `BNPL_FLOW_GUIDE.md` - Complete BNPL flow documentation
- `BuyNow_BNPL_Flow.md` - Original flow comparison
- `BACKEND_ROUTES_REQUIREMENTS.md` - API endpoint documentation

---

**Document Maintainer:** Development Team  
**Review Frequency:** After each major change  
**Last Reviewed:** 2025-01-27

