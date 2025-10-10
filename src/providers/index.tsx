import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { CustomerAuthProvider } from '@/contexts/CustomerAuthContext'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <CustomerAuthProvider>
        <HeaderThemeProvider>{children}</HeaderThemeProvider>
      </CustomerAuthProvider>
    </ThemeProvider>
  )
}
