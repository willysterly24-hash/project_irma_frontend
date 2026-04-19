import { useState, type ReactElement } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../useAuth"
import { navItems } from "../../data"
import StatsPage        from "./StatsPage"
import HotelsPage       from "./HotelsPage"
import ChambresPage     from "./ChambresPage"
import ReservationsPage from "./ReservationsPage"
import UsersPage        from "./UsersPage"

type PageId = "stats" | "hotels" | "chambres" | "reservations" | "users"

const pages: Record<PageId, ReactElement> = {
  stats:        <StatsPage />,
  hotels:       <HotelsPage />,
  chambres:     <ChambresPage />,
  reservations: <ReservationsPage />,
  users:        <UsersPage />,
}

export default function AdminDashboard() {
  const [page, setPage] = useState<PageId>("stats")
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col fixed top-0 bottom-0 left-0">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-800 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-extrabold text-gray-800 m-0">LuxStay</p>
              <p className="text-xs text-gray-400 m-0">Administration</p>
            </div>
          </div>
        </div>
        {/* Nav */}
        <nav className="p-3 flex-1">
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest px-2 mb-2">Menu</p>
          {navItems.map((item: { id: string; icon: string; label: string }) => (
            <button
              key={item.id}
              onClick={() => setPage(item.id as PageId)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl mb-0.5 text-sm font-medium border-none cursor-pointer transition-colors
                ${page === item.id
                  ? "bg-blue-50 text-blue-600 font-bold"
                  : "bg-transparent text-gray-500 hover:bg-gray-50"
                }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        {/* User + Logout */}
        <div className="px-5 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-700">
              EA
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700 m-0">Emma Admin</p>
              <p className="text-[11px] text-gray-400 m-0">Super Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
      {/* Main content */}
      <main className="ml-56 flex-1 p-7">
        {pages[page]}
      </main>
    </div>
  )
}
