'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCheckout } from '../CheckoutContext';
import { ValidatedInput } from '@/components/ui/validated-input';
import { Checkbox } from '@/components/ui/checkbox';
import { contactInfoSchema, type ContactInfoFormData } from '@/lib/validation/checkout-schemas';
import { useState } from 'react';

export function ContactInfoForm() {
  const { formData, updateFormData, setCurrentStep } = useCheckout();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    trigger,
  } = useForm<ContactInfoFormData>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: formData.contactInfo,
    mode: 'onChange',
  });

  const onSubmit = async (data: ContactInfoFormData) => {
    try {
      setIsSubmitting(true);
      await updateFormData({ contactInfo: data });
      setCurrentStep(2); // Move to shipping step
    } catch (error) {
      console.error('Error updating contact info:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = async (field: keyof ContactInfoFormData, value: any) => {
    setValue(field, value);
    await trigger(field);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="text-xl font-semibold mb-6">Contact Information</h2>
      
      <div className="space-y-4">
        <ValidatedInput
          label="Email Address"
          type="email"
          placeholder="your@email.com"
          required
          error={errors.email?.message}
          helperText="We'll use this to send order updates"
          {...register('email')}
          onChange={(e) => handleFieldChange('email', e.target.value)}
        />

        <ValidatedInput
          label="Phone Number"
          type="tel"
          placeholder="+1234567890"
          required
          error={errors.phone?.message}
          helperText="For delivery coordination"
          {...register('phone')}
          onChange={(e) => handleFieldChange('phone', e.target.value)}
        />

        <div className="flex items-center">
          <Checkbox
            id="subscribeToNewsletter"
            {...register('subscribeToNewsletter')}
          />
          <label
            htmlFor="subscribeToNewsletter"
            className="ml-2 block text-sm text-gray-700"
          >
            Subscribe to our newsletter for updates and promotions
          </label>
        </div>
      </div>

      <div className="mt-8 flex justify-between items-center pt-4 border-t">
        <div className="text-sm text-gray-500">
          Step 1 of 5 • Contact Information
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
            'Continue to Shipping'
          )}
        </button>
      </div>
    </form>
  );
}
