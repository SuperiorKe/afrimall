'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCheckout, contactInfoSchema } from '../CheckoutContext';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { z } from 'zod';

type FormData = z.infer<typeof contactInfoSchema>;

export function ContactInfoForm() {
  const { formData, updateFormData, setCurrentStep } = useCheckout();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: formData.contactInfo,
  });

  const onSubmit = (data: FormData) => {
    updateFormData({ contactInfo: data });
    setCurrentStep(2); // Move to shipping step
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="text-xl font-semibold mb-6">Contact Information</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email address
          </label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone number
          </label>
          <Input
            id="phone"
            type="tel"
            {...register('phone')}
            error={errors.phone?.message}
          />
        </div>

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

      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Continue to Shipping
        </button>
      </div>
    </form>
  );
}
