'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCheckout } from '../CheckoutContext';
import { ValidatedInput, ValidatedSelect } from '@/components/ui/validated-input';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { billingInfoSchema, type BillingInfoFormData } from '@/lib/validation/checkout-schemas';

export function BillingInfoForm() {
  const { formData, updateFormData, setCurrentStep } = useCheckout();
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    setValue,
    trigger,
  } = useForm<BillingInfoFormData>({
    resolver: zodResolver(billingInfoSchema),
    defaultValues: {
      sameAsShipping: true,
      billingAddress: formData.billingAddress || formData.shippingAddress,
    },
    mode: 'onChange',
  });

  const handleSameAsShippingChange = (checked: boolean) => {
    setSameAsShipping(checked);
    setValue('sameAsShipping', checked);
    
    if (checked) {
      const shippingData = formData.shippingAddress;
      setValue('billingAddress', shippingData);
      updateFormData({ 
        billingAddress: shippingData,
        sameAsBilling: true 
      });
    } else {
      updateFormData({ sameAsBilling: false });
    }
  };

  const onSubmit = async (data: BillingInfoFormData) => {
    try {
      setIsSubmitting(true);
      await updateFormData({ 
        billingAddress: data.sameAsShipping ? formData.shippingAddress : data.billingAddress,
        sameAsBilling: data.sameAsShipping 
      });
      setCurrentStep(4); // Move to payment step
    } catch (error) {
      console.error('Error updating billing info:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = async (field: keyof NonNullable<BillingInfoFormData['billingAddress']>, value: any) => {
    if (formData.billingAddress) {
      setValue(`billingAddress.${field}`, value);
      await trigger(`billingAddress.${field}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="text-xl font-semibold mb-6">Billing Information</h2>
      
      <div className="mb-6">
        <div className="flex items-center">
          <Checkbox
            id="sameAsShipping"
            checked={sameAsShipping}
            onCheckedChange={handleSameAsShippingChange}
          />
          <label
            htmlFor="sameAsShipping"
            className="ml-2 block text-sm text-gray-700"
          >
            Same as shipping information
          </label>
        </div>
      </div>

      {!sameAsShipping && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ValidatedInput
            label="First Name"
            placeholder="John"
            required
            error={errors.billingAddress?.firstName?.message}
            {...register('billingAddress.firstName')}
            onChange={(e) => handleFieldChange('firstName', e.target.value)}
          />

          <ValidatedInput
            label="Last Name"
            placeholder="Doe"
            required
            error={errors.billingAddress?.lastName?.message}
            {...register('billingAddress.lastName')}
            onChange={(e) => handleFieldChange('lastName', e.target.value)}
          />

          <ValidatedInput
            label="Address Line 1"
            placeholder="123 Main Street"
            required
            error={errors.billingAddress?.address1?.message}
            {...register('billingAddress.address1')}
            onChange={(e) => handleFieldChange('address1', e.target.value)}
          />

          <ValidatedInput
            label="Address Line 2 (Optional)"
            placeholder="Apartment, suite, etc."
            error={errors.billingAddress?.address2?.message}
            {...register('billingAddress.address2')}
            onChange={(e) => handleFieldChange('address2', e.target.value)}
          />

          <ValidatedInput
            label="City"
            placeholder="New York"
            required
            error={errors.billingAddress?.city?.message}
            {...register('billingAddress.city')}
            onChange={(e) => handleFieldChange('city', e.target.value)}
          />

          <ValidatedSelect
            label="Country"
            required
            error={errors.billingAddress?.country?.message}
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
            {...register('billingAddress.country')}
            onChange={(e) => handleFieldChange('country', e.target.value)}
          />

          <ValidatedInput
            label="State/Province"
            placeholder="New York"
            required
            error={errors.billingAddress?.state?.message}
            {...register('billingAddress.state')}
            onChange={(e) => handleFieldChange('state', e.target.value)}
          />

          <ValidatedInput
            label="ZIP/Postal Code"
            placeholder="10001"
            required
            error={errors.billingAddress?.postalCode?.message}
            {...register('billingAddress.postalCode')}
            onChange={(e) => handleFieldChange('postalCode', e.target.value)}
          />
        </div>
      )}

      <div className="mt-8 flex justify-between items-center pt-4 border-t">
        <button
          type="button"
          onClick={() => setCurrentStep(2)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          ← Back to Shipping
        </button>
        
        <div className="text-sm text-gray-500">
          Step 3 of 5 • Billing Information
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
            'Continue to Payment'
          )}
        </button>
      </div>
    </form>
  );
}
