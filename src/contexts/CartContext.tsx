'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface CartItem {
  id: string
  product: {
    id: string
    title: string
    price: number
    images: Array<{
      url: string
      alt: string
    }>
    categories: Array<{
      id: string
      title: string
      slug: string
    }>
  }
  variant?: {
    id: string
    title: string
    price: number
  } | null
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Cart {
  id: string
  items: CartItem[]
  subtotal: number
  itemCount: number
  currency: string
  customer?: string
  sessionId?: string
  status: string
  createdAt: string
  updatedAt: string
}

interface CartContextType {
  cart: Cart | null
  loading: boolean
  error: string | null
  loadCart: () => Promise<void>
  addToCart: (productId: string, variantId?: string, quantity?: number) => Promise<boolean>
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => Promise<boolean>
  removeFromCart: (productId: string, variantId?: string) => Promise<boolean>
  clearCart: () => Promise<void>
  refreshCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getSessionId = () => {
    let sessionId = localStorage.getItem('afrimall_session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('afrimall_session_id', sessionId)
    }
    return sessionId
  }

  const getCustomerId = () => {
    // TODO: Get from auth context when implemented
    return null
  }

  const loadCart = async () => {
    try {
      setLoading(true)
      setError(null)

      const customerId = getCustomerId()
      const sessionId = getSessionId()

      const response = await fetch(
        `/api/cart?${customerId ? `customerId=${customerId}` : `sessionId=${sessionId}`}`
      )
      const data = await response.json()

      if (data.success) {
        setCart(data.data)
      } else {
        setCart(null)
        setError(data.message || 'Failed to load cart')
      }
    } catch (error) {
      console.error('Error loading cart:', error)
      setError('Failed to load cart. Please try again.')
      setCart(null)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId: string, variantId?: string, quantity = 1): Promise<boolean> => {
    try {
      setError(null)

      const customerId = getCustomerId()
      const sessionId = getSessionId()

      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          sessionId,
          productId,
          variantId,
          quantity,
          currency: 'USD',
        }),
      })

      const data = await response.json()

      if (data.success) {
        setCart(data.data)
        // Trigger cart update event for other components
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: data.data }))
        return true
      } else {
        setError(data.message || 'Failed to add item to cart')
        return false
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      setError('Failed to add item to cart. Please try again.')
      return false
    }
  }

  const updateQuantity = async (
    productId: string,
    variantId: string | undefined,
    quantity: number
  ): Promise<boolean> => {
    try {
      setError(null)

      const customerId = getCustomerId()
      const sessionId = getSessionId()

      const response = await fetch('/api/cart/items', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          sessionId,
          productId,
          variantId,
          quantity,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setCart(data.data)
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: data.data }))
        return true
      } else {
        setError(data.message || 'Failed to update quantity')
        return false
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
      setError('Failed to update quantity. Please try again.')
      return false
    }
  }

  const removeFromCart = async (productId: string, variantId?: string): Promise<boolean> => {
    try {
      setError(null)

      const customerId = getCustomerId()
      const sessionId = getSessionId()

      const response = await fetch(
        `/api/cart/items?${customerId ? `customerId=${customerId}` : `sessionId=${sessionId}`}&productId=${productId}${variantId ? `&variantId=${variantId}` : ''}`,
        {
          method: 'DELETE',
        }
      )

      const data = await response.json()

      if (data.success) {
        setCart(data.data)
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: data.data }))
        return true
      } else {
        setError(data.message || 'Failed to remove item')
        return false
      }
    } catch (error) {
      console.error('Error removing item:', error)
      setError('Failed to remove item. Please try again.')
      return false
    }
  }

  const clearCart = async () => {
    try {
      setError(null)

      const customerId = getCustomerId()
      const sessionId = getSessionId()

      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          sessionId,
          action: 'clear',
        }),
      })

      const data = await response.json()

      if (data.success) {
        setCart(null)
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: null }))
      } else {
        setError(data.message || 'Failed to clear cart')
      }
    } catch (error) {
      console.error('Error clearing cart:', error)
      setError('Failed to clear cart. Please try again.')
    }
  }

  const refreshCart = () => {
    loadCart()
  }

  useEffect(() => {
    loadCart()

    // Listen for cart updates from other components
    const handleCartUpdate = () => {
      loadCart()
    }

    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => window.removeEventListener('cartUpdated', handleCartUpdate)
  }, [])

  const value: CartContextType = {
    cart,
    loading,
    error,
    loadCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
