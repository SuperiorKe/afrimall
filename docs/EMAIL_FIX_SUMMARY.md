# Email Recipient Fix Summary

## Problem

Order confirmation emails were failing with the error:
```
Error: No recipients defined
```

This occurred because the email service expected a top-level `customerEmail` field, but the order data was being passed with a nested `customer.email` structure.

## Root Cause

The `sendOrderConfirmation` method in `src/lib/email/email.ts` expected data in the `OrderConfirmationData` format with a flattened structure:

```typescript
{
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  items: [...],
  // etc
}
```

However, the order data being passed from the API route had a nested structure:

```typescript
{
  customer: {
    email: string,
    firstName: string,
    lastName: string
  },
  orderNumber: string,
  items: [...],
  // etc
}
```

## Solution

Added a `normalizeOrderData` method to the email service that:

1. **Handles multiple data structures** - Extracts customer email from either `customerEmail` or `customer.email`
2. **Builds customer name** - Constructs full name from `firstName` and `lastName`
3. **Normalizes items** - Maps item data to the expected format, handling both `productSnapshot` and direct fields
4. **Handles shipping info** - Extracts shipping data from multiple possible locations
5. **Provides defaults** - Uses sensible defaults for any missing fields

## Changes Made

**File**: `src/lib/email/email.ts`

- Changed `sendOrderConfirmation` parameter from `OrderConfirmationData` to `any` to accept raw order data
- Added `normalizeOrderData` method to transform raw order data into the expected format
- Added error handling to prevent crashes when data format varies

## Testing

After this fix, when placing an order:

1. Order creation succeeds ✅
2. Email is queued successfully ✅
3. Email is sent with proper recipient ✅
4. No "No recipients defined" error ✅

## Files Modified

- `src/lib/email/email.ts` - Added data normalization
