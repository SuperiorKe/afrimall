# Inventory Error Handling Implementation

## Overview

This document describes the implementation of user-friendly error messages for out-of-stock situations in the checkout process.

## Problem

When customers tried to place an order with items that were out of stock, they received generic error messages like "Insufficient inventory. Only 0 available." This was confusing and not actionable for customers.

## Solution

We've implemented comprehensive error handling that:
1. Detects inventory errors during order creation
2. Provides clear, actionable error messages
3. Offers relevant next steps to customers

## Implementation Details

### 1. Enhanced Order Creation Error Handling

**File:** `src/app/(frontend)/checkout/_components/CheckoutContext.tsx`

The `createOrderBeforePayment` function now:
- Properly parses API error responses
- Detects inventory-related errors
- Throws specific error codes for different error types

```typescript
if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))
  const errorMessage = errorData.error || errorData.message || 'Failed to create order'
  
  // Check for specific inventory errors
  if (errorMessage.includes('Insufficient inventory') || errorMessage.includes('INSUFFICIENT_INVENTORY')) {
    console.error('Inventory error:', errorMessage)
    throw new Error('OUT_OF_STOCK')
  }
  
  throw new Error(errorMessage)
}
```

### 2. Frontend Error Handling

**File:** `src/app/(frontend)/checkout/_components/steps/OrderReview.tsx`

The order creation process now:
- Wraps order creation in try-catch
- Detects `OUT_OF_STOCK` errors
- Displays appropriate error messages
- Provides actionable steps

```typescript
try {
  currentOrderId = await createOrderBeforePayment(cartItems, total, customerId!)
  // ... success handling
} catch (orderError: any) {
  // Handle out-of-stock or inventory errors
  if (orderError.message === 'OUT_OF_STOCK' || orderError.message?.includes('Insufficient inventory')) {
    const inventoryError = getDetailedErrorMessage({
      code: 'insufficient_inventory',
      message: 'One or more items in your cart are out of stock. Please review your cart and update your order.',
    })
    setPaymentError(inventoryError)
    setIsProcessing(false)
    return
  }
}
```

### 3. Error Message Templates

**File:** `src/lib/checkout/errorHandling.ts`

Added user-friendly error templates for:
- **Insufficient Inventory**: Clear message explaining out-of-stock situation
- **Order Creation Failed**: Generic error handling for other order creation issues

```typescript
'insufficient_inventory': {
  title: 'Out of Stock',
  message: 'One or more items in your cart are currently out of stock.',
  reasons: [
    'Item was purchased by another customer',
    'Stock levels have changed since you added the item',
    'Limited quantity available'
  ],
  actions: [
    { label: 'Update Cart', action: 'refresh', variant: 'primary' },
    { label: 'Continue Shopping', action: 'support', variant: 'secondary' }
  ],
  severity: 'high'
}
```

## User Experience

### Before
- Generic error message: "Insufficient inventory. Only 0 available."
- No context or next steps
- Confusing for customers

### After
- Clear title: "Out of Stock"
- Helpful message: "One or more items in your cart are currently out of stock."
- Context: Explains why this might happen
- Action buttons:
  - "Update Cart" - Refresh to see current stock levels
  - "Continue Shopping" - Browse for alternatives

## Error Flow

```
1. Customer clicks "Place Order"
   ↓
2. createOrderBeforePayment() called
   ↓
3. API checks inventory
   ↓
4. If out of stock:
   - API returns error with "INSUFFICIENT_INVENTORY" code
   ↓
5. Frontend catches error
   - Detects OUT_OF_STOCK error code
   ↓
6. Error message displayed
   - Title: "Out of Stock"
   - Message: User-friendly explanation
   - Actions: Update Cart or Continue Shopping
   ↓
7. Customer can:
   - Click "Update Cart" to refresh stock levels
   - Click "Continue Shopping" to find alternatives
```

## Error Scenarios Handled

### 1. Product Out of Stock
- Detects when quantity requested exceeds available stock
- Shows specific error message
- Provides update cart option

### 2. Stock Changed During Checkout
- Handles race conditions
- Alerts customer to review cart
- Allows retry after cart update

### 3. Multiple Items with Stock Issues
- Handles partial out-of-stock situations
- Shows aggregate error message
- Guides customer to review entire cart

## Testing Recommendations

### Manual Testing
1. Add item to cart with low/zero stock
2. Proceed to checkout
3. Click "Place Order"
4. Verify error message appears
5. Verify actions work (refresh cart, continue shopping)

### Edge Cases
1. Multiple items, some out of stock
2. Stock depletes during checkout
3. Cart contains only out-of-stock items
4. Variant-specific inventory issues

## Future Enhancements

### Potential Improvements
1. **Real-time Stock Updates**: Check stock on cart load
2. **Stock Notifications**: Let customers know when item is back in stock
3. **Alternative Suggestions**: Recommend similar in-stock products
4. **Save for Later**: Allow customers to save out-of-stock items

### Analytics
- Track out-of-stock error frequency
- Monitor cart abandonment due to stock issues
- Measure impact on conversions

## Files Modified

1. `src/app/(frontend)/checkout/_components/CheckoutContext.tsx`
   - Enhanced error handling in `createOrderBeforePayment()`
   
2. `src/app/(frontend)/checkout/_components/steps/OrderReview.tsx`
   - Added try-catch for order creation
   - Implemented inventory error detection
   
3. `src/lib/checkout/errorHandling.ts`
   - Added `insufficient_inventory` error template
   - Added `order_creation_failed` error template

## Summary

The inventory error handling implementation provides a much better user experience when customers encounter out-of-stock situations. The error messages are clear, contextual, and actionable, guiding customers to the next appropriate step instead of leaving them confused.
