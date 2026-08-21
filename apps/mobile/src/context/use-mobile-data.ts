import { useContext } from 'react'

import { MobileDataContext } from './mobile-data-context'

export function useMobileData() {
  const value = useContext(MobileDataContext)
  if (!value) throw new Error('useMobileData must be used inside MobileDataProvider')
  return value
}
