# Order Data Population Test Plan

## Manual Testing Steps

### Test 1: Complete Order Data Validation
1. **Setup:**
   - Add multiple products to cart with different variants
   - Ensure cart has items with proper product data (title, SKU, price)

2. **Test Steps:**
   - Go through complete checkout process
   - Complete payment successfully
   - Check order confirmation page

3. **Expected Results:**
   - Order should contain all cart items
   - Each item should have:
     - Product ID
     - Variant ID (if applicable)
     - Correct quantity
     - Correct unit price
     - Correct total price
     - Product snapshot with title, SKU, and image
   - Order totals should match cart totals + shipping + tax
   - Customer information should be populated
   - Shipping and billing addresses should be included

### Test 2: SKU Field Population
1. **Setup:**
   - Create products with proper SKU values
   - Add products to cart

2. **Test Steps:**
   - Complete checkout process
   - Check order data

3. **Expected Results:**
   - Product snapshots should contain actual SKU values
   - SKU should not be the product ID (unless SKU is not set)

### Test 3: Order Totals Accuracy
1. **Setup:**
   - Add items to cart with known prices
   - Note the cart subtotal

2. **Test Steps:**
   - Complete checkout
   - Compare order totals with expected values

3. **Expected Results:**
   - Subtotal should match cart subtotal
   - Shipping should be added (currently $9.99)
   - Tax should be calculated (currently 10%)
   - Total should be subtotal + shipping + tax

### Test 4: Variant Data Handling
1. **Setup:**
   - Add products with variants to cart
   - Mix products with and without variants

2. **Test Steps:**
   - Complete checkout process

3. **Expected Results:**
   - Variant ID should be included when applicable
   - Unit price should reflect variant price when applicable
   - Product snapshot should show correct variant information

### Test 5: Empty Cart Prevention
1. **Setup:**
   - Clear cart completely

2. **Test Steps:**
   - Try to proceed through checkout

3. **Expected Results:**
   - Order creation should fail with "Cart is empty" error
   - User should be prevented from completing checkout

### Test 6: Incomplete Address Validation
1. **Setup:**
   - Add items to cart
   - Leave shipping address incomplete

2. **Test Steps:**
   - Try to complete checkout

3. **Expected Results:**
   - Order creation should fail with "Shipping address is incomplete" error
   - User should be prompted to complete address

## API Testing

### Test 7: Order API Data Structure
1. **Create Order:**
   ```bash
   POST /api/orders
   ```

2. **Expected Response Structure:**
   ```json
   {
     "success": true,
     "data": {
       "id": "order_id",
       "orderNumber": "AFR1234567890",
       "items": [
         {
           "product": "product_id",
           "variant": "variant_id_or_null",
           "quantity": 2,
           "unitPrice": 29.99,
           "totalPrice": 59.98,
           "productSnapshot": {
             "title": "Product Name",
             "sku": "PRODUCT-SKU-001",
             "image": "image_url_or_null"
           }
         }
       ],
       "subtotal": 59.98,
       "total": 75.97,
       "currency": "USD",
       "customer": "customer_id",
       "shipping": { ... },
       "billing": { ... },
       "payment": { ... },
       "status": "confirmed"
     }
   }
   ```

### Test 8: Order Retrieval
1. **Get Order:**
   ```bash
   GET /api/orders/{orderId}
   ```

2. **Expected Results:**
   - Order should be retrieved with all populated data
   - Items should have complete product information
   - All addresses and payment info should be present

## Edge Cases

### Test 9: Large Cart Handling
1. **Setup:**
   - Add many items to cart (10+ items)
   - Mix different products and variants

2. **Test Steps:**
   - Complete checkout process

3. **Expected Results:**
   - All items should be included in order
   - Totals should be calculated correctly
   - No data should be lost

### Test 10: Concurrent Order Creation
1. **Setup:**
   - Open multiple browser tabs with same cart
   - Complete checkout in multiple tabs simultaneously

2. **Expected Results:**
   - Only one order should be created successfully
   - Cart should be cleared after successful order
   - Duplicate orders should be prevented

## Test Results
- [ ] Test 1 passed
- [ ] Test 2 passed  
- [ ] Test 3 passed
- [ ] Test 4 passed
- [ ] Test 5 passed
- [ ] Test 6 passed
- [ ] Test 7 passed
- [ ] Test 8 passed
- [ ] Test 9 passed
- [ ] Test 10 passed

**Status:** Ready for manual testing

## Implementation Summary

### ✅ **What's Fixed:**
1. **Cart Data Population** - Cart items are properly mapped to order items
2. **SKU Field** - Product SKU is now included in cart and order data
3. **Data Validation** - Added validation for empty cart and incomplete addresses
4. **Order Totals** - Totals are calculated from actual cart data
5. **Product Snapshots** - Complete product information is preserved in orders
6. **Error Handling** - Better error messages for data validation failures
7. **Logging** - Added console logging for debugging order creation

### 🔧 **Key Improvements:**
- **Complete Data Mapping** - All cart data is properly transferred to orders
- **SKU Integration** - Product SKUs are now available in orders
- **Validation** - Prevents orders with incomplete data
- **Type Safety** - Updated TypeScript interfaces for better type checking
- **Debugging** - Added logging to track order creation process

### 📊 **Data Flow:**
1. Cart items → Order items with complete product data
2. Cart subtotal → Order subtotal
3. Calculated totals (subtotal + shipping + tax) → Order total
4. Customer data → Order customer relationship
5. Address data → Order shipping/billing information
6. Payment data → Order payment information

### 🚨 **Critical Fixes:**
- **Empty Cart Prevention** - Orders can't be created with empty carts
- **Address Validation** - Orders require complete shipping addresses
- **SKU Preservation** - Product SKUs are maintained in order records
- **Data Integrity** - All cart data is properly transferred to orders
