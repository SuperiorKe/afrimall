import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import type { Header } from '@/payload-types'

export async function Header() {
  // During build time, skip fetching header data
  if (process.env.SKIP_DATABASE_CONNECTION === 'true' || 
      process.env.NODE_ENV === 'development' ||
      process.env.VERCEL === '1') {
    return <HeaderClient data={null} />
  }

  try {
    const headerData: Header = await getCachedGlobal('header', 1)()
    return <HeaderClient data={headerData} />
  } catch (error) {
    // Fallback to empty header if global fetch fails
    return <HeaderClient data={null} />
  }
}
