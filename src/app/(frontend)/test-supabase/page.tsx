import { supabase } from '@/utilities/supabase'

export default async function TestSupabase() {
  // Skip Supabase connection during build time to prevent build errors
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL === '1') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Supabase Connection Test
            </h1>
            
            <div className="bg-yellow-100 dark:bg-yellow-900/20 p-6 rounded-lg mb-6">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-yellow-800 dark:text-yellow-200 font-medium">
                  This page is not available in production
                </span>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Development Only
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                This page is for testing Supabase connections during development only. 
                It has been disabled in production to prevent build errors.
              </p>
            </div>
            
            <div className="mt-6 text-center">
              <a 
                href="/" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .limit(5)
    
    if (error) throw error
    
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Supabase Connection Test
            </h1>
            
            <div className="bg-green-100 dark:bg-green-900/20 p-6 rounded-lg mb-6">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-800 dark:text-green-200 font-medium">
                  Successfully connected to Supabase!
                </span>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Database Query Results
              </h2>
              <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
            
            <div className="mt-6 text-center">
              <a 
                href="/admin" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to PayloadCMS Admin
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error: any) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Supabase Connection Test
            </h1>
            
            <div className="bg-red-100 dark:bg-red-900/20 p-6 rounded-lg mb-6">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-red-800 dark:text-red-200 font-medium">
                  Failed to connect to Supabase
                </span>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Error Details
              </h2>
              <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded text-sm">
                <p className="text-red-600 dark:text-red-400 mb-2">
                  {error.message || 'Unknown error occurred'}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Please check your environment variables and Supabase configuration.
                </p>
              </div>
            </div>
            
            <div className="mt-6 text-center space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Make sure you have:
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Created a `.env.local` file with your Supabase credentials</li>
                <li>• Run the SQL script in your Supabase SQL Editor</li>
                <li>• Set the correct environment variables</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
