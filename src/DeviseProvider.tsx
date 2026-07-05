import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { DeviseContext, DEVISES, type Devise } from './devise-context'
import { deviseApi } from './services/api'

const STORAGE_KEY = 'devise_code'

const getStoredDeviseCode = () => localStorage.getItem(STORAGE_KEY) || 'XOF'

export function DeviseProvider({ children }: { children: ReactNode }) {
  const [deviseCode, setDeviseCodeState] = useState(getStoredDeviseCode)
  const [taux, setTaux] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  // Les prix en base sont stockés en FCFA (XOF) → on récupère les taux à partir de XOF une seule fois
  useEffect(() => {
    let cancelled = false
    deviseApi.getTaux('XOF')
      .then(res => {
        if (!cancelled) setTaux(res.data.taux || {})
      })
      .catch(() => {
        // En cas d'échec de l'API, on reste sur FCFA (taux vide → convert() renverra le montant brut)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const setDeviseCode = useCallback((code: string) => {
    setDeviseCodeState(code)
    localStorage.setItem(STORAGE_KEY, code)
  }, [])

  const convert = useCallback((montantFCFA: number): number => {
    if (deviseCode === 'XOF') return montantFCFA
    const taux_devise = taux[deviseCode]
    if (!taux_devise) return montantFCFA
    return montantFCFA * taux_devise
  }, [deviseCode, taux])

  const formatPrice = useCallback((montantFCFA: number): string => {
    const montantConverti = convert(montantFCFA)
    const devise = DEVISES.find(d => d.code === deviseCode) || DEVISES[0]

    const decimales = deviseCode === 'XOF' ? 0 : 2
    const montantFormate = montantConverti.toLocaleString('fr-FR', {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales,
    })

    return deviseCode === 'XOF'
      ? `${montantFormate} ${devise.symbole}`
      : `${montantFormate} ${devise.symbole}`
  }, [convert, deviseCode])

  const devise: Devise = DEVISES.find(d => d.code === deviseCode) || DEVISES[0]

  return (
    <DeviseContext.Provider value={{ devise, setDeviseCode, loading, convert, formatPrice }}>
      {children}
    </DeviseContext.Provider>
  )
}
