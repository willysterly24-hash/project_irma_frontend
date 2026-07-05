import { useState, useRef, useEffect } from 'react'
import { Coins, Check } from 'lucide-react'
import { DEVISES } from './devise-context'
import { useDevise } from './useDevise'

export default function CurrencySelector() {
  const { devise, setDeviseCode } = useDevise()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-50 transition"
        aria-label="Choisir la devise"
        title={`Devise : ${devise.label}`}
      >
        <Coins className="w-5 h-5 text-gray-700" />
      </button>

      {open && (
        <div
          className="absolute top-12 right-0 w-56 bg-white overflow-hidden z-50"
          style={{
            borderRadius: '16px',
            boxShadow: '0 20px 60px -12px rgba(15,23,42,0.25), 0 0 0 1px rgba(15,23,42,0.04)',
          }}
        >
          <div className="px-4 py-3 border-b border-gray-100" style={{ fontFamily: "'Jost', sans-serif" }}>
            <p className="text-[11px] font-medium tracking-widest text-gray-400 uppercase">Voir les prix en</p>
          </div>
          <div className="p-1.5">
            {DEVISES.map(d => (
              <button
                key={d.code}
                onClick={() => { setDeviseCode(d.code); setOpen(false) }}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                  devise.code === d.code ? 'bg-amber-50 text-amber-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
                style={{ fontSize: '13.5px' }}
              >
                <span>{d.label} <span className="text-gray-400">({d.symbole})</span></span>
                {devise.code === d.code && <Check className="w-4 h-4 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
