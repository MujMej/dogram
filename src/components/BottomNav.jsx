// src/components/BottomNav.jsx
import { NavLink } from 'react-router-dom'

const items = [
  { to: '/',            icon: '🏠', label: 'Feed' },
  { to: '/mapa',        icon: '🗺️', label: 'Mapa' },
  { to: '/azili',       icon: '❤️', label: 'Azili' },
  { to: '/podsjetnici', icon: '⏰', label: 'Briga' },
  { to: '/profil',      icon: '🐾', label: 'Profil' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f0e0c]/95 backdrop-blur border-t border-white/5">
      <div className="max-w-lg mx-auto flex justify-around items-center px-2 py-2 pb-5">
        {items.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all text-xs font-medium
               ${isActive ? 'text-[#e8a230]' : 'text-gray-500 hover:text-gray-300'}`
            }
          >
            <span className="text-2xl leading-none">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
