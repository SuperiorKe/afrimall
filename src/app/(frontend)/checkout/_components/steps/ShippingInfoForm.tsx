'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCheckout, addressSchema } from '../CheckoutContext';
import { Input } from '@/components/ui/input';
import { z } from 'zod';

type FormData = z.infer<typeof addressSchema>;

export function ShippingInfoForm() {
  const { formData, updateFormData, setCurrentStep } = useCheckout();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: formData.shippingAddress,
  });

  const onSubmit = (data: FormData) => {
    updateFormData({ shippingAddress: data });
    setCurrentStep(3); // Move to billing step
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First name
          </label>
          <Input
            id="firstName"
            {...register('firstName')}
            error={errors.firstName?.message}
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last name
          </label>
          <Input
            id="lastName"
            {...register('lastName')}
            error={errors.lastName?.message}
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="address1" className="block text-sm font-medium text-gray-700 mb-1">
            Address line 1
          </label>
          <Input
            id="address1"
            {...register('address1')}
            error={errors.address1?.message}
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="address2" className="block text-sm font-medium text-gray-700 mb-1">
            Address line 2 (optional)
          </label>
          <Input
            id="address2"
            {...register('address2')}
            error={errors.address2?.message}
          />
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <Input
            id="city"
            {...register('city')}
            error={errors.city?.message}
          />
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <select
            id="country"
            {...register('country')}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">Select a country</option>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="UK">United Kingdom</option>
            <option value="KE">Kenya</option>
            <option value="NG">Nigeria</option>
            <option value="ZA">South Africa</option>
            <option value="GH">Ghana</option>
            <option value="TZ">Tanzania</option>
          </select>
          {errors.country && (
            <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
            State/Province
          </label>
          <Input
            id="state"
            {...register('state')}
            error={errors.state?.message}
          />
        </div>

        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
            ZIP/Postal code
          </label>
          <Input
            id="postalCode"
            {...register('postalCode')}
            error={errors.postalCode?.message}
          />
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Back
        </button>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Continue to Billing
        </button>
      </div>
    </form>
  );
}
