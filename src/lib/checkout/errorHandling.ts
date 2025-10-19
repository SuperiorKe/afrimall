/**
 * Enhanced error handling utilities for checkout process
 */

export interface ErrorAction {
  label: string
  action: string
  variant?: 'primary' | 'secondary' | 'danger'
}

export interface DetailedError {
  title: string
  message: string
  reasons?: string[]
  actions: ErrorAction[]
  severity: 'low' | 'medium' | 'high'
}

/**
 * Maps Stripe error codes to user-friendly messages with actionable guidance
 */
export const getDetailedErrorMessage = (error: any): DetailedError => {
  const errorCode = error?.code || error?.type || 'unknown'
  
  const errorMap: Record<string, DetailedError> = {
    'card_declined': {
      title: 'Card Declined',
      message: 'Your card was declined by your bank. This could be due to:',
      reasons: [
        'Insufficient funds in your account',
        'Card expired or invalid',
        'Bank security restrictions',
        'Daily spending limit reached',
        'Card not activated for online purchases'
      ],
      actions: [
        { label: 'Try Different Card', action: 'change_card', variant: 'primary' },
        { label: 'Contact Your Bank', action: 'contact_bank', variant: 'secondary' }
      ],
      severity: 'high'
    },
    'expired_card': {
      title: 'Card Expired',
      message: 'The card you entered has expired. Please use a different card.',
      actions: [
        { label: 'Use Different Card', action: 'change_card', variant: 'primary' }
      ],
      severity: 'medium'
    },
    'incorrect_cvc': {
      title: 'Invalid Security Code',
      message: 'The security code (CVC) you entered is incorrect. Please check the 3-digit code on the back of your card.',
      actions: [
        { label: 'Check CVC Again', action: 'retry', variant: 'primary' }
      ],
      severity: 'medium'
    },
    'incorrect_number': {
      title: 'Invalid Card Number',
      message: 'The card number you entered is invalid. Please check and try again.',
      actions: [
        { label: 'Check Card Number', action: 'retry', variant: 'primary' }
      ],
      severity: 'medium'
    },
    'processing_error': {
      title: 'Payment Processing Error',
      message: 'We encountered a temporary issue processing your payment. This is usually resolved quickly.',
      actions: [
        { label: 'Try Again', action: 'retry', variant: 'primary' },
        { label: 'Contact Support', action: 'support', variant: 'secondary' }
      ],
      severity: 'medium'
    },
    'payment_intent_unexpected_state': {
      title: 'Payment Already Processed',
      message: 'This payment has already been processed. Please refresh the page and check your order status.',
      actions: [
        { label: 'Refresh Page', action: 'refresh', variant: 'primary' },
        { label: 'Check Order Status', action: 'check_order', variant: 'secondary' }
      ],
      severity: 'low'
    },
    'authentication_required': {
      title: 'Additional Authentication Required',
      message: 'Your bank requires additional verification. Please complete the authentication process.',
      actions: [
        { label: 'Complete Authentication', action: 'authenticate', variant: 'primary' }
      ],
      severity: 'medium'
    },
    'generic_decline': {
      title: 'Card Declined',
      message: 'Your card was declined. This could be due to various reasons:',
      reasons: [
        'Insufficient funds',
        'Card restrictions',
        'Bank security measures',
        'Invalid card details'
      ],
      actions: [
        { label: 'Try Different Card', action: 'change_card', variant: 'primary' },
        { label: 'Contact Your Bank', action: 'contact_bank', variant: 'secondary' }
      ],
      severity: 'high'
    }
  }
  
  return errorMap[errorCode] || {
    title: 'Payment Failed',
    message: error?.message || 'An unexpected error occurred while processing your payment.',
    actions: [
      { label: 'Try Again', action: 'retry', variant: 'primary' },
      { label: 'Contact Support', action: 'support', variant: 'secondary' }
    ],
    severity: 'high'
  }
}

/**
 * Gets the appropriate color scheme for error severity
 */
export const getErrorColorScheme = (severity: 'low' | 'medium' | 'high') => {
  switch (severity) {
    case 'low':
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-800',
        icon: 'text-yellow-400'
      }
    case 'medium':
      return {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-800',
        icon: 'text-orange-400'
      }
    case 'high':
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        icon: 'text-red-400'
      }
    default:
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        icon: 'text-red-400'
      }
  }
}

/**
 * Gets the appropriate icon path for error severity
 */
export const getErrorIconPath = (severity: 'low' | 'medium' | 'high'): string => {
  switch (severity) {
    case 'low':
    case 'medium':
      return "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
    case 'high':
    default:
      return "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
  }
}
