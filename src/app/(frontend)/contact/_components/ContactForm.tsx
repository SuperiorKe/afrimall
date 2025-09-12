'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { ValidatedInput, ValidatedTextarea, ValidatedSelect } from '@/components/ui/validated-input'
import { Checkbox } from '@/components/ui/checkbox'
import { contactFormSchema, type ContactFormData } from '@/lib/validation/checkout-schemas'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

const inquiryTypeOptions = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'support', label: 'Customer Support' },
  { value: 'sales', label: 'Sales Question' },
  { value: 'partnership', label: 'Partnership Opportunity' },
  { value: 'other', label: 'Other' },
]

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    trigger,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      inquiryType: 'general',
      subscribeToNewsletter: false,
    },
    mode: 'onChange',
  })

  const handleFieldChange = async (field: keyof ContactFormData, value: any) => {
    setValue(field, value)
    await trigger(field)
  }

  const onSubmit = async (data: ContactFormData) => {
    try {
      setIsSubmitting(true)
      setSubmitStatus('idle')
      setSubmitMessage('')

      // Simulate API call - replace with actual endpoint
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setSubmitMessage("Thank you for your message! We'll get back to you within 24 hours.")
        reset()
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      console.error('Error submitting contact form:', error)
      setSubmitStatus('error')
      setSubmitMessage(
        'Sorry, there was an error sending your message. Please try again or contact us directly.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Send us a Message
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Fill out the form below and we'll get back to you as soon as possible.
        </p>
      </div>

      {/* Status Messages */}
      {submitStatus === 'success' && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-green-800 dark:text-green-200 text-sm">{submitMessage}</p>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-800 dark:text-red-200 text-sm">{submitMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name and Email Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ValidatedInput
            label="Full Name"
            type="text"
            placeholder="Your full name"
            required
            error={errors.name?.message}
            {...register('name')}
            onChange={(e) => handleFieldChange('name', e.target.value)}
          />

          <ValidatedInput
            label="Email Address"
            type="email"
            placeholder="your@email.com"
            required
            error={errors.email?.message}
            helperText="We'll use this to respond to your inquiry"
            {...register('email')}
            onChange={(e) => handleFieldChange('email', e.target.value)}
          />
        </div>

        {/* Subject and Inquiry Type Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ValidatedInput
            label="Subject"
            type="text"
            placeholder="What's this about?"
            required
            error={errors.subject?.message}
            {...register('subject')}
            onChange={(e) => handleFieldChange('subject', e.target.value)}
          />

          <ValidatedSelect
            label="Inquiry Type"
            required
            error={errors.inquiryType?.message}
            options={inquiryTypeOptions}
            placeholder="Select inquiry type"
            {...register('inquiryType')}
            onChange={(e) => handleFieldChange('inquiryType', e.target.value)}
          />
        </div>

        {/* Message */}
        <ValidatedTextarea
          label="Message"
          placeholder="Tell us more about your inquiry..."
          required
          error={errors.message?.message}
          helperText="Please provide as much detail as possible so we can help you better"
          rows={6}
          {...register('message')}
          onChange={(e) => handleFieldChange('message', e.target.value)}
        />

        {/* Newsletter Subscription */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="subscribeToNewsletter"
            {...register('subscribeToNewsletter')}
            onCheckedChange={(checked) => handleFieldChange('subscribeToNewsletter', checked)}
          />
          <label
            htmlFor="subscribeToNewsletter"
            className="text-sm text-gray-700 dark:text-gray-300"
          >
            Subscribe to our newsletter for updates on new African products and special offers
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full bg-afrimall-orange hover:bg-afrimall-gold text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending Message...
              </>
            ) : (
              'Send Message'
            )}
          </Button>
        </div>

        {/* Privacy Notice */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          By submitting this form, you agree to our privacy policy. We'll only use your information
          to respond to your inquiry.
        </div>
      </form>
    </div>
  )
}
