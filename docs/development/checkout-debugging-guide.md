# 🐛 Checkout Flow Debugging Guide

## **Current Status**

### ✅ **Fixed Issues:**
1. ✅ Stripe CardElement null error - FIXED
2. ✅ ProductSnapshot image validation error - FIXED  
3. ✅ Customer email verification issue - FIXED
4. ✅ Redundant bottom "Place Order" button - REMOVED

### ⚠️ **Remaining Issue:**
- "Failed to create order" error still showing

## **Debugging Steps**

### **Step 1: Check Browser Console**

Open your browser's Developer Tools (F12 or right-click → Inspect) and check the Console tab.

**Look for these log messages:**

#### **Customer Creation Logs:**
```
Creating customer with data: { email: "...", phone: "...", ... }
Customer API response: { status: 200/201, data: { ... } }
Customer created successfully: [customer-id]
```

#### **Order Creation Logs:**
```
Creating order with data: { itemCount: X, subtotal: X, total: X, ... }
```

#### **Error Logs:**
```
Failed to create customer: { message: "...", error: "...", details: "..." }
Error creating order: ...
```

### **Step 2: Check Network Tab**

1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Click "Place Order" button
4. Look for these API calls:

#### **Expected API Calls:**
1. **POST /api/customers** 
   - Status: 200 or 201
   - Response: `{ success: true, data: { id: "..." } }`

2. **POST /api/orders**
   - Status: 200 or 201
   - Response: `{ success: true, data: { id: "..." } }`

#### **If API Fails:**
- Click on the failed request
- Check **Response** tab for error message
- Check **Headers** tab for status code

### **Step 3: Check Server Console**

Look at your terminal/command prompt where `npm run dev` is running.

**Look for these patterns:**

#### **Success Pattern:**
```
✓ Compiled /api/customers in XXms
[timestamp] INFO [API:customers] Customer created successfully
✓ Compiled /api/orders in XXms  
[timestamp] INFO [API:orders] Inventory reserved
[timestamp] INFO [API:orders] Order created successfully
```

#### **Error Pattern:**
```
[timestamp] ERROR [API:customers] Error creating customer
ValidationError: ...
[timestamp] ERROR [API:orders] Error creating order
ValidationError: ...
```

## **Common Issues & Solutions**

### **Issue 1: Customer Not Created**

**Symptoms:**
- Warning: "Please complete the contact information step"
- customerId is null

**Debug:**
1. Click "Debug Data" button on Order Review page
2. Check if email, phone, firstName, lastName are present
3. Check browser console for customer creation logs

**Solutions:**
- Ensure all fields in Contact Info step are filled
- Check for email format validation errors
- Try clicking "Try Create Customer Again" button

### **Issue 2: Order Validation Error**

**Symptoms:**
- "Failed to create order" error
- Server console shows ValidationError

**Common Causes:**
1. **Missing required fields**
2. **Invalid data types**
3. **Database schema mismatch**

**Debug:**
```javascript
// Check order data in console
console.log('Order data:', orderData)

// Check for:
- items array not empty
- customer ID exists
- prices are numbers
- addresses are complete
```

### **Issue 3: Payment Intent Missing**

**Symptoms:**
- "Payment session expired" error
- clientSecret is null

**Solutions:**
1. Go back to step 3 (Billing)
2. Move forward to step 4 (Payment) - this creates PaymentIntent
3. Proceed to step 5 (Review)

### **Issue 4: Stripe CardElement Error**

**Symptoms:**
- "Payment method not found" error
- CardElement returns null

**Solutions:**
1. Ensure CardElement is visible on Order Review page
2. Enter card details: 4242 4242 4242 4242
3. Check that Stripe Elements loaded (no errors in console)

## **Testing Checklist**

### **Pre-Test Setup:**
- [ ] Clear browser cache (Ctrl+Shift+Delete)
- [ ] Refresh page (Ctrl+R or Cmd+R)
- [ ] Open browser console (F12)
- [ ] Check server is running (`npm run dev`)

### **Test Flow:**
1. [ ] Add products to cart
2. [ ] Go to checkout
3. [ ] **Step 1: Contact Info**
   - [ ] Enter email
   - [ ] Enter phone
   - [ ] Check console for any errors
   - [ ] Click Continue

4. [ ] **Step 2: Shipping**
   - [ ] Enter first name
   - [ ] Enter last name
   - [ ] Enter complete address
   - [ ] Click Continue

5. [ ] **Step 3: Billing**
   - [ ] Check "Same as shipping" OR enter billing address
   - [ ] Click Continue
   - [ ] Wait for PaymentIntent creation

6. [ ] **Step 4: Payment**
   - [ ] Verify PaymentIntent created (check console)
   - [ ] Accept terms checkbox
   - [ ] Click Continue

7. [ ] **Step 5: Order Review**
   - [ ] Check if customer warning appears
   - [ ] If yes, click "Try Create Customer Again"
   - [ ] Check console for customer creation logs
   - [ ] Enter card: 4242 4242 4242 4242
   - [ ] Expiry: Any future date (e.g., 12/26)
   - [ ] CVC: Any 3 digits (e.g., 123)
   - [ ] Click "Place Order"
   - [ ] Check console and network tab for errors

### **Expected Success:**
- Customer created (ID in console)
- Payment confirmed
- Order created (ID in console)
- Redirect to order confirmation page

## **Manual Debugging Commands**

### **Test Customer Creation:**
```bash
# In browser console
fetch('/api/customers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    phone: '+1234567890',
    firstName: 'Test',
    lastName: 'User',
    addresses: []
  })
}).then(r => r.json()).then(console.log)
```

### **Check Current Customer:**
```javascript
// In browser console
console.log('Customer ID:', customerId)
```

### **Check Cart Data:**
```javascript
// In browser console  
fetch('/api/cart?sessionId=YOUR_SESSION_ID')
  .then(r => r.json())
  .then(console.log)
```

## **Error Messages Reference**

### **Customer Errors:**
| Error | Cause | Solution |
|-------|-------|----------|
| "Email, first name, and last name are required" | Missing fields | Complete contact info |
| "A customer with this email already exists" | Duplicate email | Normal - returns existing customer |
| "Password is required for customer creation" | Auth config issue | Check _verified flag added |

### **Order Errors:**
| Error | Cause | Solution |
|-------|-------|----------|
| "Cart is empty - cannot create order" | No cart items | Add items to cart |
| "Shipping address is incomplete" | Missing address fields | Complete shipping info |
| "Customer ID is required" | Customer not created | Create customer first |
| "Items X > Product Snapshot > Image" | Validation error | Check image field type |
| "Insufficient inventory" | Out of stock | Check product inventory |

## **Quick Fixes**

### **Reset Checkout State:**
```javascript
// In browser console
localStorage.clear()
sessionStorage.clear()
location.reload()
```

### **Force Customer Creation:**
```javascript
// Click "Try Create Customer Again" button on Order Review page
// OR run in console:
createCustomer()
```

### **Check Stripe Elements:**
```javascript
// In browser console
console.log('Stripe:', stripe)
console.log('Elements:', elements)
console.log('CardElement:', elements.getElement('card'))
```

## **Next Steps**

1. **Follow the debugging steps above**
2. **Share the console output** (copy full error messages)
3. **Share network tab errors** (screenshot or copy response)
4. **Share server console errors** (copy full stack trace)

This will help identify the exact issue causing the order creation failure.

## **Files to Check**

If issues persist, check these files:
- `src/app/api/customers/route.ts` - Customer creation
- `src/app/api/orders/route.ts` - Order creation
- `src/collections/Orders.ts` - Order schema
- `src/collections/Customers.ts` - Customer schema
- `src/app/(frontend)/checkout/_components/CheckoutContext.tsx` - Checkout state
- `src/app/(frontend)/checkout/_components/steps/OrderReview.tsx` - Order submission

