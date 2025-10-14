# Inventory Integration Test Plan

## Manual Testing Steps

### Test 1: Inventory Deduction on Order Creation
1. **Setup:**
   - Create a product with inventory tracking enabled
   - Set initial quantity (e.g., 10 units)
   - Add product to cart

2. **Test Steps:**
   - Complete checkout process with quantity > 1
   - Complete payment successfully

3. **Expected Results:**
   - Product inventory should be reduced by ordered quantity
   - Order should be created successfully
   - Console should show inventory reservation logs

### Test 2: Out of Stock Prevention
1. **Setup:**
   - Create product with inventory tracking enabled
   - Set quantity to 0 (out of stock)
   - Set allowBackorder to false

2. **Test Steps:**
   - Try to add product to cart
   - Try to complete checkout

3. **Expected Results:**
   - Product should show "Out of Stock" badge
   - Cart should prevent adding out-of-stock items
   - Order creation should fail with inventory error

### Test 3: Low Stock Alerts
1. **Setup:**
   - Create product with low stock threshold (e.g., 5)
   - Set current quantity to threshold or below

2. **Test Steps:**
   - Create order that reduces stock below threshold

3. **Expected Results:**
   - Console should show low stock warning
   - Admin should be notified (when email system is implemented)

### Test 4: Inventory Restoration on Order Cancellation
1. **Setup:**
   - Create order with inventory deduction
   - Note the reduced inventory quantity

2. **Test Steps:**
   - Cancel the order via API: `PUT /api/orders/{orderId}` with status: 'cancelled'

3. **Expected Results:**
   - Inventory should be restored to original quantity
   - Console should show inventory restoration logs

### Test 5: Backorder Handling
1. **Setup:**
   - Create product with allowBackorder: true
   - Set quantity to 0

2. **Test Steps:**
   - Add product to cart
   - Complete checkout

3. **Expected Results:**
   - Order should be created successfully despite zero inventory
   - No inventory deduction should occur

## API Testing

### Test 6: Order Management API
1. **Get Order:**
   ```bash
   GET /api/orders/{orderId}
   ```

2. **Update Order Status:**
   ```bash
   PUT /api/orders/{orderId}
   Content-Type: application/json
   
   {
     "status": "cancelled",
     "notes": "Customer requested cancellation"
   }
   ```

3. **Expected Results:**
   - Order should be retrieved successfully
   - Status should be updated
   - Inventory should be restored if cancelled

## Edge Cases

### Test 7: Concurrent Orders
1. **Setup:**
   - Create product with limited inventory (e.g., 1 unit)
   - Attempt multiple simultaneous orders

2. **Expected Results:**
   - Only one order should succeed
   - Others should fail with insufficient inventory error

### Test 8: Cart Validation
1. **Setup:**
   - Add item to cart
   - Reduce inventory below cart quantity in admin

2. **Test Steps:**
   - Try to update cart or checkout

3. **Expected Results:**
   - Cart validation should fail
   - User should be notified of insufficient inventory

## Test Results
- [ ] Test 1 passed
- [ ] Test 2 passed  
- [ ] Test 3 passed
- [ ] Test 4 passed
- [ ] Test 5 passed
- [ ] Test 6 passed
- [ ] Test 7 passed
- [ ] Test 8 passed

**Status:** Ready for manual testing

## Implementation Summary

### ✅ **What's Implemented:**
1. **Inventory Deduction** - Automatic inventory reduction on order creation
2. **Inventory Validation** - Prevents overselling during cart operations
3. **Low Stock Alerts** - Console warnings when inventory falls below threshold
4. **Inventory Restoration** - Restores inventory when orders are cancelled
5. **Order Management API** - Endpoints for retrieving and updating orders
6. **Backorder Support** - Handles products that allow backorders
7. **Real-time Validation** - Cart operations check inventory in real-time

### 🔧 **Key Features:**
- **Atomic Operations** - Inventory changes are atomic with order creation
- **Error Handling** - Comprehensive error handling for inventory failures
- **Logging** - Detailed logging for debugging and monitoring
- **Admin Integration** - Low stock alerts visible in console (ready for email integration)
- **API Endpoints** - RESTful API for order management

### 📊 **Database Changes:**
- Enhanced order creation with inventory validation
- Added inventory hooks to Products collection
- Created order management endpoints
- Inventory tracking integrated with existing schema
