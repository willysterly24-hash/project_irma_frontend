import type { ReactNode } from "react"

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
}

export default function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-7 w-[480px] max-w-[90%] shadow-2xl">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-lg w-8 h-8 text-lg cursor-pointer border-none"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}