'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCheckout } from '../CheckoutContext';
import { ValidatedInput, ValidatedSelect, ValidatedTextarea } from '@/components/ui/validated-input';
import { shippingInfoSchema, type ShippingInfoFormData } from '@/lib/validation/checkout-schemas';
import { useState } from 'react';

export function ShippingInfoForm() {
  const { formData, updateFormData, setCurrentStep } = useCheckout();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    trigger,
  } = useForm<ShippingInfoFormData>({
    resolver: zodResolver(shippingInfoSchema),
    defaultValues: {
      ...formData.shippingAddress,
      shippingMethod: 'standard',
      specialInstructions: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: ShippingInfoFormData) => {
    try {
      setIsSubmitting(true);
      await updateFormData({ shippingAddress: data });
      setCurrentStep(3); // Move to billing step
    } catch (error) {
      console.error('Error updating shipping info:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = async (field: keyof ShippingInfoFormData, value: any) => {
    setValue(field, value);
    await trigger(field);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ValidatedInput
          label="First Name"
          placeholder="John"
          required
          error={errors.firstName?.message}
          {...register('firstName')}
          onChange={(e) => handleFieldChange('firstName', e.target.value)}
        />

        <ValidatedInput
          label="Last Name"
          placeholder="Doe"
          required
          error={errors.lastName?.message}
          {...register('lastName')}
          onChange={(e) => handleFieldChange('lastName', e.target.value)}
        />

        <ValidatedInput
          label="Address Line 1"
          placeholder="123 Main Street"
          required
          error={errors.address1?.message}
          {...register('address1')}
          onChange={(e) => handleFieldChange('address1', e.target.value)}
        />

        <ValidatedInput
          label="Address Line 2 (Optional)"
          placeholder="Apartment, suite, etc."
          error={errors.address2?.message}
          {...register('address2')}
          onChange={(e) => handleFieldChange('address2', e.target.value)}
        />

        <ValidatedInput
          label="City"
          placeholder="New York"
          required
          error={errors.city?.message}
          {...register('city')}
          onChange={(e) => handleFieldChange('city', e.target.value)}
        />

        <ValidatedSelect
          label="Country"
          required
          error={errors.country?.message}
          placeholder="Select a country"
          options={[
            { value: 'NG', label: 'Nigeria' },
            { value: 'KE', label: 'Kenya' },
            { value: 'ZA', label: 'South Africa' },
            { value: 'GH', label: 'Ghana' },
            { value: 'UG', label: 'Uganda' },
            { value: 'TZ', label: 'Tanzania' },
            { value: 'ET', label: 'Ethiopia' },
            { value: 'MA', label: 'Morocco' },
            { value: 'EG', label: 'Egypt' },
            { value: 'DZ', label: 'Algeria' },
            { value: 'US', label: 'United States' },
            { value: 'CA', label: 'Canada' },
            { value: 'UK', label: 'United Kingdom' },
            { value: 'OTHER', label: 'Other' },
          ]}
          {...register('country')}
          onChange={(e) => handleFieldChange('country', e.target.value)}
        />

        <ValidatedInput
          label="State/Province"
          placeholder="New York"
          required
          error={errors.state?.message}
          {...register('state')}
          onChange={(e) => handleFieldChange('state', e.target.value)}
        />

        <ValidatedInput
          label="ZIP/Postal Code"
          placeholder="10001"
          required
          error={errors.postalCode?.message}
          {...register('postalCode')}
          onChange={(e) => handleFieldChange('postalCode', e.target.value)}
        />

        <ValidatedSelect
          label="Shipping Method"
          required
          error={errors.shippingMethod?.message}
          options={[
            { value: 'standard', label: 'Standard Shipping (5-7 business days)' },
            { value: 'express', label: 'Express Shipping (2-3 business days)' },
            { value: 'overnight', label: 'Overnight Shipping (Next business day)' },
            { value: 'pickup', label: 'Store Pickup (Free)' },
          ]}
          {...register('shippingMethod')}
          onChange={(e) => handleFieldChange('shippingMethod', e.target.value)}
        />

        <ValidatedTextarea
          label="Special Instructions (Optional)"
          placeholder="Any special delivery instructions..."
          rows={3}
          error={errors.specialInstructions?.message}
          helperText="Let us know if you have any special delivery requirements"
          {...register('specialInstructions')}
          onChange={(e) => handleFieldChange('specialInstructions', e.target.value)}
        />
      </div>

      <div className="mt-8 flex justify-between items-center pt-4 border-t">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          ← Back to Contact
        </button>
        
        <div className="text-sm text-gray-500">
          Step 2 of 5 • Shipping Information
        </div>
        
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="inline-flex justify-center py-3 px-8 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Processing...
            </>
          ) : (
            'Continue to Billing'
          )}
        </button>
      </div>
    </form>
  );
}
