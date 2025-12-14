# BNPL Flow Multi-Select Changes Guide

## Overview

This guide documents all changes made to the BNPL (Buy Now Pay Later) flow to enable **multiple bundle and product selection** functionality. Previously, users could only select a single bundle or product. Now, users can select multiple bundles and/or products in a single BNPL application.

---

## Summary of Changes

### Key Features Added
1. **Multi-Select for Bundles**: Users can now select multiple solar system bundles
2. **Multi-Select for Products**: Users can now select multiple individual products
3. **Combined Selection**: Users can mix bundles and products in a single application
4. **Visual Selection Indicators**: Selected items are highlighted with visual feedback
5. **Dynamic Total Calculation**: Order totals automatically update based on all selected items
6. **Enhanced Order Summary**: Displays all selected items with individual prices and subtotals
7. **Invoice Step**: Detailed invoice with all fees shown before loan calculator (Step 6.75)
8. **Build My System**: Users can build custom bundles by selecting multiple products (Step 3.75)
9. **Start Over Button**: Added in loan calculator to return to product category selection
10. **Application Flow Reordering**: Application form (Step 11) now comes before credit check (Step 10)

### Files Modified
- `src/Pages/BNPL/BNPLFlow.jsx` - Main BNPL flow component

---

## Technical Details

### State Management Changes

#### New State Variables
```javascript
selectedBundles: [], // Array of selected bundles [{id, bundle, price}, ...]
selectedProducts: [], // Array of selected products [{id, product, price}, ...]
```

#### Backward Compatibility
The following existing state variables are maintained for backward compatibility:
- `selectedBundleId` - Single bundle ID (now uses first selected bundle if any)
- `selectedBundle` - Single bundle object (now uses first selected bundle if any)
- `selectedProductId` - Single product ID (now uses first selected product if any)
- `selectedProduct` - Single product object (now uses first selected product if any)
- `selectedProductPrice` - Total price (now calculated from all selected items)

### Selection Logic

#### Bundle Selection (`handleBundleSelect`)
- **Toggle Behavior**: Clicking a bundle adds it if not selected, removes it if already selected
- **Price Calculation**: Automatically calculates total from all selected bundles and products
- **State Update**: Updates both new array and legacy single-item fields

#### Product Selection (`handleProductSelect`)
- **Toggle Behavior**: Clicking a product adds it if not selected, removes it if already selected
- **Price Calculation**: Automatically calculates total from all selected bundles and products
- **State Update**: Updates both new array and legacy single-item fields

---

## Code Changes Breakdown

### 1. State Initialization

**Location**: `formData` state object (lines ~58-89)

**Changes**:
```javascript
// NEW: Added arrays for multiple selections
selectedBundles: [], // Array of selected bundles [{id, bundle, price}, ...]
selectedProducts: [], // Array of selected products [{id, product, price}, ...]

// OLD: Kept for backward compatibility
selectedBundleId: null,
selectedBundle: null,
selectedProductId: null,
selectedProduct: null,
selectedProductPrice: 0,
```

### 2. Bundle Selection Handler

**Location**: `handleBundleSelect` function (lines ~410-419)

**Before**:
```javascript
const handleBundleSelect = (bundle) => {
    const price = Number(bundle.discount_price || bundle.total_price || 0);
    setFormData(prev => ({
        ...prev,
        selectedBundleId: bundle.id,
        selectedBundle: bundle,
        selectedProductPrice: price
    }));
    setStep(6.5); // Auto-navigate to order summary
};
```

**After**:
```javascript
const handleBundleSelect = (bundle) => {
    const price = Number(bundle.discount_price || bundle.total_price || 0);
    setFormData(prev => {
        // Check if bundle is already selected
        const isSelected = prev.selectedBundles.some(b => b.id === bundle.id);
        
        let updatedBundles;
        if (isSelected) {
            // Remove bundle if already selected
            updatedBundles = prev.selectedBundles.filter(b => b.id !== bundle.id);
        } else {
            // Add bundle if not selected
            updatedBundles = [...prev.selectedBundles, {
                id: bundle.id,
                bundle: bundle,
                price: price
            }];
        }
        
        // Calculate total price from all selected bundles and products
        const bundlesTotal = updatedBundles.reduce((sum, b) => sum + b.price, 0);
        const productsTotal = prev.selectedProducts.reduce((sum, p) => sum + p.price, 0);
        const totalPrice = bundlesTotal + productsTotal;
        
        return {
            ...prev,
            selectedBundles: updatedBundles,
            // Keep old fields for backward compatibility
            selectedBundleId: updatedBundles.length > 0 ? updatedBundles[0].id : null,
            selectedBundle: updatedBundles.length > 0 ? updatedBundles[0].bundle : null,
            selectedProductPrice: totalPrice
        };
    });
    // Don't auto-navigate - let user select multiple items
};
```

**Key Changes**:
- Toggle selection instead of single selection
- Calculate total from all selected items
- Maintain backward compatibility with legacy fields
- Removed auto-navigation to allow multiple selections

### 3. Product Selection Handler

**Location**: `handleProductSelect` function (lines ~421-430)

**Before**:
```javascript
const handleProductSelect = (product) => {
    const price = Number(product.discount_price || product.price || 0);
    setFormData(prev => ({
        ...prev,
        selectedProductId: product.id,
        selectedProduct: product,
        selectedProductPrice: price
    }));
    setStep(8); // Auto-navigate to loan calculator
};
```

**After**:
```javascript
const handleProductSelect = (product) => {
    const price = Number(product.discount_price || product.price || 0);
    setFormData(prev => {
        // Check if product is already selected
        const isSelected = prev.selectedProducts.some(p => p.id === product.id);
        
        let updatedProducts;
        if (isSelected) {
            // Remove product if already selected
            updatedProducts = prev.selectedProducts.filter(p => p.id !== product.id);
        } else {
            // Add product if not selected
            updatedProducts = [...prev.selectedProducts, {
                id: product.id,
                product: product,
                price: price
            }];
        }
        
        // Calculate total price from all selected bundles and products
        const bundlesTotal = prev.selectedBundles.reduce((sum, b) => sum + b.price, 0);
        const productsTotal = updatedProducts.reduce((sum, p) => sum + p.price, 0);
        const totalPrice = bundlesTotal + productsTotal;
        
        return {
            ...prev,
            selectedProducts: updatedProducts,
            // Keep old fields for backward compatibility
            selectedProductId: updatedProducts.length > 0 ? updatedProducts[0].id : null,
            selectedProduct: updatedProducts.length > 0 ? updatedProducts[0].product : null,
            selectedProductPrice: totalPrice
        };
    });
    // Don't auto-navigate - let user select multiple items
};
```

**Key Changes**:
- Toggle selection instead of single selection
- Calculate total from all selected items
- Maintain backward compatibility with legacy fields
- Removed auto-navigation to allow multiple selections

### 4. Bundle Selection UI (Step 3.5)

**Location**: `renderStep3_5` function (lines ~703-934)

**Changes**:
1. **Visual Selection Indicators**:
   - Selected bundles show blue border, background, and checkmark icon
   - Added conditional styling based on selection state

2. **Button Text**:
   - "Add to Selection" for unselected items
   - "Remove from Selection" for selected items (red button)

3. **Continue Button**:
   - Appears when at least one bundle is selected
   - Shows count of selected items
   - Navigates to order summary (Step 6.5)
   - Flow: Bundle Selection → Order Summary → Invoice → Loan Calculator

**Code Snippet**:
```javascript
// Check if bundle is selected
const isSelected = formData.selectedBundles.some(b => b.id === bundle.id);

// Conditional styling
className={`group bg-white border-2 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 ${
    isSelected 
        ? 'border-[#273e8e] bg-blue-50 ring-2 ring-[#273e8e]' 
        : 'border-gray-100 hover:border-[#273e8e]'
}`}

// Checkmark icon for selected items
{isSelected && (
    <div className="absolute top-2 right-2 bg-[#273e8e] text-white rounded-full p-2">
        <CheckCircle size={20} />
    </div>
)}

// Toggle button
<button
    onClick={() => handleBundleSelect(bundle)}
    className={`w-full py-2 rounded-lg font-semibold transition-colors mt-2 ${
        isSelected
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-[#273e8e] text-white hover:bg-[#1a2b6b]'
    }`}
>
    {isSelected ? 'Remove from Selection' : 'Add to Selection'}
</button>

// Continue button (appears when items selected)
{formData.selectedBundles.length > 0 && (
    <div className="mt-8 flex justify-center">
        <button
            onClick={() => setStep(6.5)}
            className="bg-[#273e8e] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#1a2b6b] transition-colors flex items-center"
        >
            Continue with {formData.selectedBundles.length} {formData.selectedBundles.length !== 1 ? 'Items' : 'Item'} Selected
            <ArrowRight size={20} className="ml-2" />
        </button>
    </div>
)}
```

### 5. Product Selection UI (Step 2.5)

**Location**: `renderStep2_5` function (lines ~598-751)

**Changes**:
1. **Visual Selection Indicators**: Same as bundles
2. **Button Text**: Same toggle behavior as bundles
3. **Continue Button**: Navigates to Order Summary (Step 6.5) for products (updated from direct navigation to loan calculator)

**Code Snippet**:
```javascript
// Similar structure to bundle selection
// Continue button navigates to Step 6.5 (Order Summary) - Updated from Step 8
{formData.selectedProducts.length > 0 && (
    <div className="mt-8 flex justify-center">
        <button
            onClick={() => setStep(6.5)}
            className="bg-[#273e8e] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#1a2b6b] transition-colors flex items-center"
        >
            Continue with {formData.selectedProducts.length} {formData.selectedProducts.length !== 1 ? 'Items' : 'Item'} Selected
            <ArrowRight size={20} className="ml-2" />
        </button>
    </div>
)}
```

### 6. Order Summary (Step 6.5)

**Location**: `renderStep6_5` function (lines ~1073-1150)

**Changes**:
1. **Multiple Items Display**: Shows all selected bundles and products separately
2. **Subtotal Calculation**: Calculates from all selected items
3. **Individual Item Details**: Each selected item shows its name and price
4. **Navigation Update**: Button now navigates to Invoice (Step 6.75) instead of directly to Loan Calculator

**Code Snippet**:
```javascript
// Calculate total from all selected items
const bundlesTotal = formData.selectedBundles.reduce((sum, b) => sum + b.price, 0);
const productsTotal = formData.selectedProducts.reduce((sum, p) => sum + p.price, 0);
const itemsSubtotal = bundlesTotal + productsTotal;
const basePrice = itemsSubtotal > 0 ? itemsSubtotal : formData.selectedProductPrice;

// Display selected bundles
{formData.selectedBundles.length > 0 && (
    <div className="space-y-3">
        <h3 className="font-semibold text-gray-700 mb-2">Selected Bundles ({formData.selectedBundles.length})</h3>
        {formData.selectedBundles.map((selectedBundle) => (
            <div key={selectedBundle.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                    <div className="bg-gray-100 p-2 rounded-lg mr-4">
                        <Sun size={20} className="text-gray-600" />
                    </div>
                    <div>
                        <p className="font-bold text-gray-800">
                            {selectedBundle.bundle.title || selectedBundle.bundle.name || `Bundle #${selectedBundle.id}`}
                        </p>
                        <p className="text-sm text-gray-500">Solar System Bundle</p>
                    </div>
                </div>
                <span className="font-bold">₦{Number(selectedBundle.price || 0).toLocaleString()}</span>
            </div>
        ))}
    </div>
)}

// Display selected products
{formData.selectedProducts.length > 0 && (
    <div className="space-y-3">
        <h3 className="font-semibold text-gray-700 mb-2">Selected Products ({formData.selectedProducts.length})</h3>
        {formData.selectedProducts.map((selectedProduct) => (
            <div key={selectedProduct.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                    <div className="bg-gray-100 p-2 rounded-lg mr-4">
                        <Battery size={20} className="text-gray-600" />
                    </div>
                    <div>
                        <p className="font-bold text-gray-800">
                            {selectedProduct.product.title || selectedProduct.product.name || `Product #${selectedProduct.id}`}
                        </p>
                        <p className="text-sm text-gray-500">Individual Component</p>
                    </div>
                </div>
                <span className="font-bold">₦{Number(selectedProduct.price || 0).toLocaleString()}</span>
            </div>
        ))}
    </div>
)}

// Subtotal for multiple items
{(formData.selectedBundles.length > 0 || formData.selectedProducts.length > 0) && (
    <div className="border-t pt-3 mt-3">
        <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-700">Items Subtotal:</span>
            <span className="font-bold text-lg">₦{Number(basePrice || 0).toLocaleString()}</span>
        </div>
    </div>
)}
```

### 7. Invoice Step (Step 6.75) - NEW

**Location**: `renderStep6_75` function (lines ~1501-1627)

**Purpose**: 
- Display detailed invoice with all selected items and fees before loan calculator
- Validate minimum order amount before proceeding

**Features**:
1. **Multiple Items Display**: Shows all selected bundles and products separately
2. **Detailed Fee Breakdown**: Lists all fees individually
3. **Total Calculation**: Shows grand total including all fees
4. **Validation**: Checks minimum order value (₦1,500,000) before proceeding

**Code Snippet**:
```javascript
const renderStep6_75 = () => {
    // Calculate total from all selected items
    const bundlesTotal = formData.selectedBundles.reduce((sum, b) => sum + b.price, 0);
    const productsTotal = formData.selectedProducts.reduce((sum, p) => sum + p.price, 0);
    const itemsSubtotal = bundlesTotal + productsTotal;
    const basePrice = itemsSubtotal > 0 ? itemsSubtotal : formData.selectedProductPrice;
    
    // Calculate fees
    const insuranceAddOn = addOns.find(a => a.is_compulsory_bnpl);
    const insuranceFee = insuranceAddOn && insuranceAddOn.calculation_type === 'percentage'
        ? (basePrice * insuranceAddOn.calculation_value) / 100
        : (insuranceAddOn?.price || basePrice * 0.005);
    
    const materialCost = 50000;
    const installationFee = 50000;
    const deliveryFee = 25000;
    const inspectionFee = 10000;
    const totalAmount = basePrice + insuranceFee + materialCost + installationFee + deliveryFee + inspectionFee;

    return (
        <div>
            {/* Display selected bundles */}
            {formData.selectedBundles.length > 0 && (
                <div>
                    {formData.selectedBundles.map((selectedBundle) => (
                        <div key={selectedBundle.id}>
                            <p>{selectedBundle.bundle.title}</p>
                            <span>₦{Number(selectedBundle.price || 0).toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Display selected products */}
            {formData.selectedProducts.length > 0 && (
                <div>
                    {formData.selectedProducts.map((selectedProduct) => (
                        <div key={selectedProduct.id}>
                            <p>{selectedProduct.product.title}</p>
                            <span>₦{Number(selectedProduct.price || 0).toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Items Subtotal */}
            <div>Items Subtotal: ₦{Number(basePrice || 0).toLocaleString()}</div>
            
            {/* Fees */}
            <div>
                <div>Material Cost: ₦{Number(materialCost).toLocaleString()}</div>
                <div>Installation Fee: ₦{Number(installationFee).toLocaleString()}</div>
                <div>Delivery Fee: ₦{Number(deliveryFee).toLocaleString()}</div>
                <div>Inspection Fee: ₦{Number(inspectionFee).toLocaleString()}</div>
                <div>Insurance Fee: ₦{Number(insuranceFee).toLocaleString()}</div>
            </div>
            
            {/* Total */}
            <div>Total: ₦{Number(totalAmount).toLocaleString()}</div>
            
            {/* Proceed button with validation */}
            <button
                onClick={() => {
                    const minOrderValue = 1500000;
                    if (totalAmount < minOrderValue) {
                        alert(`Your order total (₦${totalAmount.toLocaleString()}) does not meet the minimum ₦1,500,000 amount required for credit financing.`);
                        return;
                    }
                    setStep(8); // Go to Loan Calculator
                }}
            >
                Proceed to Loan Calculator
            </button>
        </div>
    );
};
```

**Key Features**:
- Displays all selected bundles with individual prices
- Displays all selected products with individual prices
- Shows items subtotal
- Lists all fees separately for transparency
- Shows grand total
- Validates minimum order amount before proceeding
- Back button to return to Order Summary

### 8. Build System Product Selection (Step 3.75) - NEW

**Location**: `renderStep3_75` function

**Purpose**: 
- Allow users to build custom solar system by selecting multiple products
- Replaces redirect to `/solar-builder` page
- Users must select at least one product to continue

**Features**:
1. **All Products Display**: Shows all available products from all categories
2. **Multi-Select**: Users can select multiple products to create a custom bundle
3. **Visual Indicators**: Selected products show blue border, background, and checkmark
4. **Validation**: Requires at least one product to be selected
5. **Navigation**: Continues to Order Summary (Step 6.5) after selection

**Code Snippet**:
```javascript
const renderStep3_75 = () => {
    // Fetch all products from all categories
    // Display in grid with multi-select capability
    // Show continue button only when products are selected
    // Navigate to Step 6.5 (Order Summary)
};
```

**Flow**:
- Step 3 (Options) → "Build My System" → Step 3.75 (Product Selection) → Step 6.5 (Order Summary)

### 9. Loan Calculator (Step 8)

**Location**: `renderStep8` function (lines ~1636-1653)

**Changes**:
- Updated to calculate total from all selected items instead of single item price

**Code Snippet**:
```javascript
// Calculate total from all selected bundles and products
const bundlesTotal = formData.selectedBundles.reduce((sum, b) => sum + b.price, 0);
const productsTotal = formData.selectedProducts.reduce((sum, p) => sum + p.price, 0);
const itemsSubtotal = bundlesTotal + productsTotal;
const basePrice = itemsSubtotal > 0 ? itemsSubtotal : formData.selectedProductPrice;

// Use basePrice for all calculations
const insuranceFee = insuranceAddOn && insuranceAddOn.calculation_type === 'percentage'
    ? (basePrice * insuranceAddOn.calculation_value) / 100
    : (insuranceAddOn?.price || 0);

const totalAmount = basePrice + insuranceFee + materialCost + installationFee + deliveryFee + inspectionFee;
```

### 10. Loan Calculator - Start Over Button (Step 8)

**Location**: `renderStep8` function

**New Feature**: Added "Start Over" button

**Purpose**: 
- Allows users to return to the beginning of the selection process
- Clears all selections and resets to Step 2 (Product Category Selection)

**Implementation**:
```javascript
const handleStartOver = () => {
    // Clear all selections and reset to Step 2
    setFormData(prev => ({
        ...prev,
        selectedBundles: [],
        selectedProducts: [],
        selectedBundleId: null,
        selectedBundle: null,
        selectedProductId: null,
        selectedProduct: null,
        selectedProductPrice: 0,
        productCategory: '',
        optionType: ''
    }));
    setStep(2); // Go back to product category selection (5 options)
};
```

**Button Placement**: Below the loan calculator component

### 11. Application Flow Reordering

**Changes**:
- **Before**: Step 9 → Step 10 (Credit Check) → Step 11 (Application Form) → Step 12
- **After**: Step 9 → Step 11 (Application Form) → Step 10 (Credit Check) → Step 12

**Step 11 (Application Form)**:
- Now comes before credit check method selection
- Form validates all required fields
- Button text changed from "Submit Application" to "Continue to Credit Check"
- Navigates to Step 10 after validation

**Step 10 (Credit Check Method)**:
- Now comes after application form
- Back button returns to Step 11
- Removed auto-navigation after method selection
- Added "Submit Application" button that submits after method selection
- Button disabled until credit check method is selected

**Code Changes**:
```javascript
// Step 9 - Review Loan Plan
onClick={() => setStep(11)} // Changed from setStep(10)

// Step 11 - Application Form
onSubmit={(e) => {
    e.preventDefault();
    // Validate required fields
    if (!formData.fullName || !formData.bvn || ...) {
        alert("Please fill in all required fields");
        return;
    }
    setStep(10); // Navigate to credit check
}}

// Step 10 - Credit Check Method
onClick={async (e) => {
    e.preventDefault();
    if (!formData.creditCheckMethod) {
        alert("Please select a credit check method");
        return;
    }
    await submitApplication(fakeEvent); // Submit from here
}}
```

### 12. Application Submission

**Location**: `submitApplication` function (lines ~1762-1900)

**Changes**:
1. **Multiple Bundle IDs**: Sends array of bundle IDs (`bundle_ids[]`)
2. **Multiple Product IDs**: Sends array of product IDs (`product_ids[]`)
3. **Total Price Calculation**: Uses total from all selected items

**Code Snippet**:
```javascript
// Calculate total from all selected items
const bundlesTotal = formData.selectedBundles.reduce((sum, b) => sum + b.price, 0);
const productsTotal = formData.selectedProducts.reduce((sum, p) => sum + p.price, 0);
const itemsSubtotal = bundlesTotal + productsTotal;
const basePrice = itemsSubtotal > 0 ? itemsSubtotal : formData.selectedProductPrice;

// Loan calculation payload
const loanCalcPayload = {
    product_amount: basePrice, // Use total of all selected items
    loan_amount: formData.loanDetails.totalRepayment,
    repayment_duration: formData.loanDetails.tenor
};

// Add multiple bundle IDs if selected
if (formData.selectedBundles.length > 0) {
    formData.selectedBundles.forEach(bundle => {
        formDataToSend.append('bundle_ids[]', bundle.id);
    });
} else if (formData.selectedBundleId) {
    // Fallback to single bundle ID for backward compatibility
    formDataToSend.append('bundle_id', formData.selectedBundleId);
}

// Add multiple product IDs if selected
if (formData.selectedProducts.length > 0) {
    formData.selectedProducts.forEach(product => {
        formDataToSend.append('product_ids[]', product.id);
    });
} else if (formData.selectedProductId) {
    // Fallback to single product ID for backward compatibility
    formDataToSend.append('product_id', formData.selectedProductId);
}
```

---

## User Experience Changes

### Before
- User selects one bundle → Immediately navigates to order summary → Loan calculator
- User selects one product → Immediately navigates to loan calculator (skips summary)
- Order summary shows single item
- Total price is for single item only
- No detailed invoice before loan calculator

### After
- User can select multiple bundles/products
- Visual feedback shows selected items (blue border, checkmark)
- Button text changes: "Add to Selection" / "Remove from Selection"
- Continue button appears with item count
- **Bundle Flow**: Selection → Order Summary → **Invoice** → Loan Calculator
- **Product Flow**: Selection → Order Summary → **Invoice** → Loan Calculator
- Order summary shows all selected items with individual prices
- **Invoice shows detailed breakdown with all fees**
- Total price is sum of all selected items
- Loan calculator uses combined total

### Visual Indicators
1. **Selected Items**:
   - Blue border (`border-[#273e8e]`)
   - Light blue background (`bg-blue-50`)
   - Ring effect (`ring-2 ring-[#273e8e]`)
   - Checkmark icon in top-right corner

2. **Unselected Items**:
   - Gray border (`border-gray-100`)
   - White background
   - Hover effect shows blue border

3. **Buttons**:
   - Selected: Red button ("Remove from Selection")
   - Unselected: Blue button ("Add to Selection")

---

## API Integration

### Request Format Changes

#### Bundle IDs
- **New Format**: `bundle_ids[]` (array)
- **Old Format**: `bundle_id` (single value)
- **Backward Compatibility**: Falls back to `bundle_id` if no items in array

#### Product IDs
- **New Format**: `product_ids[]` (array)
- **Old Format**: `product_id` (single value)
- **Backward Compatibility**: Falls back to `product_id` if no items in array

#### Product Amount
- **Calculation**: Sum of all selected bundle and product prices
- **Fallback**: Uses `selectedProductPrice` if no items selected (backward compatibility)

### Example Request
```javascript
// Multiple bundles and products
FormData {
    bundle_ids[]: [1, 2, 3],
    product_ids[]: [10, 11],
    product_amount: 5000000, // Sum of all selected items
    loan_amount: 4500000,
    repayment_duration: 12,
    // ... other fields
}
```

---

## Flow Changes

### Bundle Selection Flow (Step 3.5)
1. User sees list of bundles
2. User clicks "Add to Selection" on multiple bundles
3. Selected bundles show visual indicators
4. Continue button appears showing item count
5. User clicks "Continue with X Items Selected"
6. Navigates to Order Summary (Step 6.5)
7. From Order Summary → Navigates to Invoice (Step 6.75)
8. From Invoice → Navigates to Loan Calculator (Step 8)
9. User can click "Start Over" to return to Step 2

### Build System Flow (Step 3.75) - NEW
1. User clicks "Build My System" from Step 3
2. All products from all categories are fetched and displayed
3. User selects multiple products to create custom bundle
4. Selected products show visual indicators (blue border, checkmark)
5. Continue button appears when at least one product is selected
6. User clicks "Continue with X Products in Bundle"
7. Navigates to Order Summary (Step 6.5)
8. From Order Summary → Navigates to Invoice (Step 6.75)
9. From Invoice → Navigates to Loan Calculator (Step 8)

### Product Selection Flow (Step 2.5)
1. User sees list of products
2. User clicks "Add to Selection" on multiple products
3. Selected products show visual indicators
4. Continue button appears showing item count
5. User clicks "Continue with X Items Selected"
6. Navigates to Order Summary (Step 6.5)

### Order Summary Flow (Step 6.5)
1. Shows all selected bundles with individual prices
2. Shows all selected products with individual prices
3. Shows items subtotal
4. Shows fees (insurance, material, installation, delivery, inspection)
5. Shows total amount
6. User proceeds to Invoice (Step 6.75)

### Invoice Flow (Step 6.75) - NEW
1. Shows detailed breakdown of all selected bundles with prices
2. Shows detailed breakdown of all selected products with prices
3. Shows items subtotal
4. Shows all fees separately:
   - Material Cost
   - Installation Fee
   - Delivery Fee
   - Inspection Fee
   - Insurance Fee
5. Shows grand total
6. Validates minimum order amount (₦1,500,000)
7. User proceeds to Loan Calculator (Step 8)

---

## Testing Checklist

### Bundle Selection
- [ ] Select single bundle
- [ ] Select multiple bundles
- [ ] Deselect a bundle
- [ ] Visual indicators appear correctly
- [ ] Continue button appears when items selected
- [ ] Continue button shows correct count
- [ ] Order summary shows all selected bundles

### Product Selection
- [ ] Select single product
- [ ] Select multiple products
- [ ] Deselect a product
- [ ] Visual indicators appear correctly
- [ ] Continue button appears when items selected
- [ ] Continue button shows correct count
- [ ] Navigates to order summary (not directly to loan calculator)
- [ ] Order summary shows all selected products
- [ ] Invoice shows detailed breakdown
- [ ] Loan calculator uses correct total

### Combined Selection
- [ ] Select bundles and products together
- [ ] Total price calculates correctly
- [ ] Order summary shows both bundles and products
- [ ] Loan calculator uses combined total

### Order Summary
- [ ] All selected items displayed
- [ ] Individual prices shown correctly
- [ ] Subtotal calculated correctly
- [ ] Fees calculated on combined total
- [ ] Total amount is correct
- [ ] Button navigates to Invoice (not directly to loan calculator)

### Invoice (Step 6.75) - NEW
- [ ] All selected bundles displayed with prices
- [ ] All selected products displayed with prices
- [ ] Items subtotal shown correctly
- [ ] All fees listed separately (Material, Installation, Delivery, Inspection, Insurance)
- [ ] Grand total calculated correctly
- [ ] Minimum order validation works (₦1,500,000)
- [ ] Back button returns to Order Summary
- [ ] Proceed button navigates to Loan Calculator

### Build System (Step 3.75) - NEW
- [ ] All products from all categories are displayed
- [ ] Multi-select works correctly
- [ ] Visual indicators appear for selected products
- [ ] Continue button only appears when products are selected
- [ ] Warning message displays correctly
- [ ] Navigation to Order Summary works
- [ ] Back button returns to Step 3

### Loan Calculator (Step 8)
- [ ] "Start Over" button appears below calculator
- [ ] Button clears all selections correctly
- [ ] Button navigates to Step 2 (Product Category Selection)
- [ ] All form data is reset properly

### Application Flow
- [ ] Step 9 navigates to Step 11 (Application Form)
- [ ] Application form validates required fields
- [ ] Application form navigates to Step 10 (Credit Check)
- [ ] Credit check method selection submits application
- [ ] Back buttons work correctly in both steps

### Application Submission
- [ ] Multiple bundle IDs sent correctly
- [ ] Multiple product IDs sent correctly
- [ ] Product amount is sum of all items
- [ ] Backward compatibility works (single item)

### Edge Cases
- [ ] No items selected (should not show continue button)
- [ ] All items deselected (should clear selection)
- [ ] Navigation back and forth maintains selection
- [ ] Page refresh (selection may be lost - expected behavior)

---

## Backward Compatibility

### Maintained Fields
The following fields are maintained for backward compatibility:
- `selectedBundleId` - Uses first selected bundle ID
- `selectedBundle` - Uses first selected bundle object
- `selectedProductId` - Uses first selected product ID
- `selectedProduct` - Uses first selected product object
- `selectedProductPrice` - Calculated from all selected items

### API Compatibility
- If no items in arrays, falls back to single ID fields
- API accepts both array format (`bundle_ids[]`) and single format (`bundle_id`)
- Product amount always calculated from all selected items

---

## Known Limitations

1. **Selection Persistence**: Selections are not persisted across page refreshes
2. **Cart Integration**: Not integrated with shopping cart (separate system)
3. **Quantity**: Each item can only be selected once (no quantity selector)
4. **Validation**: No validation for maximum number of items

---

## Future Enhancements

1. **Quantity Selector**: Allow users to select quantity for each item
2. **Selection Persistence**: Save selections to localStorage
3. **Cart Integration**: Integrate with shopping cart system
4. **Maximum Items**: Add validation for maximum number of items
5. **Bulk Actions**: Add "Select All" / "Deselect All" buttons
6. **Comparison View**: Allow users to compare selected items side-by-side

---

## Change Log

### Version 1.2.0 - Build System & Flow Improvements
- **Date**: [Current Date]
- **Changes**:
  - Added "Build my System" functionality (Step 3.75) - users can select multiple products to create custom bundle
  - Added "Start Over" button in loan calculator to return to product category selection
  - Reordered application flow: Application Form (Step 11) now comes before Credit Check (Step 10)
  - Application form now navigates to credit check method selection
  - Credit check method selection now submits the application

### Version 1.1.0 - Invoice Step Addition
- **Date**: [Previous Date]
- **Changes**:
  - Added Invoice step (Step 6.75) before loan calculator
  - Updated bundle flow: Order Summary → Invoice → Loan Calculator
  - Updated product flow: Product Selection → Order Summary → Invoice → Loan Calculator
  - Invoice displays detailed breakdown of all selected items and fees
  - Added minimum order validation in invoice step
  - Updated navigation buttons to route through invoice step

### Version 1.0.0 - Multi-Select Implementation
- **Date**: [Previous Date]
- **Changes**:
  - Added multi-select functionality for bundles
  - Added multi-select functionality for products
  - Updated UI with visual selection indicators
  - Enhanced order summary to show all selected items
  - Updated loan calculator to use combined totals
  - Modified application submission to send multiple IDs
  - Maintained backward compatibility with single-item selections

---

## Notes

- All changes maintain backward compatibility
- Visual indicators use Tailwind CSS classes
- Icons use Lucide React (`CheckCircle`, `Sun`, `Battery`, `ArrowRight`)
- Price formatting uses Nigerian Naira (NGN) locale
- Total calculations include all fees (insurance, material, installation, delivery, inspection)

---

## Support

For questions or issues related to these changes, please refer to:
- BNPL Flow Guide: `BNPL_FLOW_GUIDE.md`
- BuyNow Flow Changes Guide: `BUYNOW_FLOW_CHANGES_GUIDE.md`

---

**End of Guide**

