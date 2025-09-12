import { Metadata } from 'next'
import { ContactForm } from './_components/ContactForm'
import { Logo } from '@/components/Logo/Logo'

export const metadata: Metadata = {
  title: 'Contact Us | AfriMall',
  description:
    "Get in touch with AfriMall. We're here to help with your questions about African products, orders, and partnerships.",
  keywords: 'contact, support, help, African products, customer service',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <Logo className="h-16 w-16" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Have questions about our African products? Need help with an order? We're here to help
              you discover the beauty of African craftsmanship.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                  Get in Touch
                </h2>

                <div className="space-y-6">
                  {/* Phone */}
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-afrimall-orange rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Phone</h3>
                      <a
                        href="tel:+15074297272"
                        className="text-afrimall-orange hover:text-afrimall-gold transition-colors"
                      >
                        +1 (507) 429-7272
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-afrimall-orange rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Email</h3>
                      <a
                        href="mailto:support@afrimall.com"
                        className="text-afrimall-orange hover:text-afrimall-gold transition-colors"
                      >
                        support@afrimall.com
                      </a>
                    </div>
                  </div>

                  {/* Social Media */}
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-afrimall-orange rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 12l2 2 4-4"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Follow Us
                      </h3>
                      <div className="flex space-x-3">
                        <a
                          href="https://www.instagram.com/afrimall_/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-afrimall-orange hover:text-afrimall-gold transition-colors"
                          aria-label="Follow us on Instagram"
                        >
                          Instagram
                        </a>
                        <a
                          href="https://www.tiktok.com/@afrimall_"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-afrimall-orange hover:text-afrimall-gold transition-colors"
                          aria-label="Follow us on TikTok"
                        >
                          TikTok
                        </a>
                        <a
                          href="https://www.facebook.com/p/Afrimall-100061118447014/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-afrimall-orange hover:text-afrimall-gold transition-colors"
                          aria-label="Follow us on Facebook"
                        >
                          Facebook
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Response Time */}
                <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Response Time
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    We typically respond to inquiries within 24 hours during business days.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
