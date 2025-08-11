import React from 'react'

const BeforeLogin: React.FC = () => {
  return (
    <div className="text-center">
      {/* Afrimall Logo */}
      <div className="inline-flex items-center justify-center mb-4">
        <svg
          width="80"
          height="80"
          viewBox="0 0 60 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Left green bar */}
          <path d="M15 50 L25 10 L30 10 L40 50 L35 50 L33 45 L22 45 L20 50 Z" fill="#22C55E" />
          {/* Right orange bar */}
          <path
            d="M25 10 L30 10 L40 50 L35 50 L33 45 L22 45 L20 50 L15 50 L25 10 Z"
            fill="#F97316"
          />
          {/* Inner white highlight */}
          <path d="M22 45 L33 45 L30 15 L27 15 Z" fill="white" fillOpacity="0.3" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Welcome to <span className="text-green-600">Afri</span>
        <span className="text-orange-500">mall</span>
      </h1>
      <p className="text-gray-600">
        <b>Admin Dashboard</b> - This is where site admins will log in to manage your African
        marketplace.
      </p>
    </div>
  )
}

export default BeforeLogin
