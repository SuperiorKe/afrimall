'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useCheckout } from '../CheckoutContext'
import { paymentMethodSchema, type PaymentMethodFormData } from '@/lib/validation/checkout-schemas'

// Payment terms and conditions component (Card entry moved to Step 5)
function PaymentTermsForm() {
  const { updateFormData, formData } = useCheckout()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const methods = useForm<PaymentMethodFormData>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      ...formData.paymentMethod,
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    trigger,
    watch,
  } = methods

  // Watch form values for real-time updates
  const watchedValues = watch()

  const onSubmit = async (data: PaymentMethodFormData) => {
    if (!data.acceptTerms) {
      return
    }

    try {
      setIsSubmitting(true)
      await updateFormData({ paymentMethod: data })
      // The parent component will handle navigation
    } catch (error) {
      console.error('Error updating payment method:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFieldChange = async (field: keyof PaymentMethodFormData, value: any) => {
    setValue(field, value)
    await trigger(field)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="text-xl font-semibold mb-6">Review Terms & Conditions</h2>

      <div className="space-y-6">
        {/* Information Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Payment Information</h3>
          <p className="text-sm text-blue-800">
            You'll enter your payment details on the next step after reviewing your order.
          </p>
        </div>

        {/* Terms and conditions */}
        <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <Checkbox
            id="acceptTerms"
            required
            checked={watchedValues.acceptTerms || false}
            onCheckedChange={(checked) => handleFieldChange('acceptTerms', checked)}
          />
          <div className="flex-1">
            <Label
              htmlFor="acceptTerms"
              className="text-sm font-medium text-blue-900 cursor-pointer"
            >
              I accept the terms and conditions *
            </Label>
            <p className="text-xs text-blue-700 mt-1">
              By checking this box, you agree to our terms of service and privacy policy.
            </p>
            {errors.acceptTerms && (
              <p className="text-xs text-red-600 mt-1">{errors.acceptTerms.message}</p>
            )}
          </div>
        </div>

        {/* Marketing consent */}
        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
          <Checkbox
            id="acceptMarketing"
            checked={watchedValues.acceptMarketing || false}
            onCheckedChange={(checked) => handleFieldChange('acceptMarketing', checked)}
          />
          <Label htmlFor="acceptMarketing" className="text-sm text-gray-700 cursor-pointer">
            Send me updates about new products and special offers
          </Label>
        </div>

        {/* Save card option */}
        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
          <Checkbox
            id="saveCard"
            checked={watchedValues.saveCard || false}
            onCheckedChange={(checked) => handleFieldChange('saveCard', checked)}
          />
          <Label htmlFor="saveCard" className="text-sm text-gray-700 cursor-pointer">
            Save card for future purchases
          </Label>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t">
        <div className="text-sm text-gray-500 text-center">Step 4 of 5 • Terms & Conditions</div>
      </div>
    </form>
  )
}

// Main component export
export function PaymentMethodForm() {
  return <PaymentTermsForm />
}
