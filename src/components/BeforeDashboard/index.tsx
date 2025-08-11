import { Banner } from '@payloadcms/ui/elements/Banner'
import React from 'react'

import { SeedButton } from './SeedButton'
import './index.scss'

const baseClass = 'before-dashboard'

const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      {/* Afrimall Logo and Welcome */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center mb-4">
          <svg
            width="60"
            height="60"
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to <span className="text-green-600">Afri</span>
          <span className="text-orange-500">mall</span> Admin
        </h1>
        <p className="text-gray-600">Your African marketplace management dashboard</p>
      </div>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>🎉 Welcome to your Afrimall dashboard!</h4>
      </Banner>
      Here&apos;s what to do next:
      <ul className={`${baseClass}__instructions`}>
        <li>
          <SeedButton />
          {' with a few pages, posts, and projects to jump-start your new site, then '}
          <a href="/" target="_blank">
            visit your website
          </a>
          {' to see the results.'}
        </li>
        <li>
          If you created this repo using Payload Cloud, head over to GitHub and clone it to your
          local machine. It will be under the <i>GitHub Scope</i> that you selected when creating
          this project.
        </li>
        <li>
          {'Modify your '}
          <a
            href="https://payloadcms.com/docs/configuration/collections"
            rel="noopener noreferrer"
            target="_blank"
          >
            collections
          </a>
          {' and add more '}
          <a
            href="https://payloadcms.com/docs/fields/overview"
            rel="noopener noreferrer"
            target="_blank"
          >
            fields
          </a>
          {' as needed. If you are new to Payload, we also recommend you check out the '}
          <a
            href="https://payloadcms.com/docs/getting-started/what-is-payload"
            rel="noopener noreferrer"
            target="_blank"
          >
            Getting Started
          </a>
          {' docs.'}
        </li>
        <li>
          Commit and push your changes to the repository to trigger a redeployment of your project.
        </li>
      </ul>
      {'Pro Tip: This block is a '}
      <a
        href="https://payloadcms.com/docs/custom-components/overview"
        rel="noopener noreferrer"
        target="_blank"
      >
        custom component
      </a>
      , you can remove it at any time by updating your <strong>payload.config</strong>.
    </div>
  )
}

export default BeforeDashboard
