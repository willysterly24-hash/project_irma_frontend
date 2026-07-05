import { useContext } from 'react'
import { DeviseContext } from './devise-context'

export function useDevise() {
  const ctx = useContext(DeviseContext)
  if (!ctx) throw new Error('useDevise must be used inside DeviseProvider')
  return ctx
}
