// src/components/Layout.jsx
import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#0f0e0c] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f0e0c]/95 backdrop-blur border-b border-white/5 px-4 py-3 flex items-center justify-between max-w-lg mx-auto">
        <span className="font-black text-2xl tracking-tight">
          <span className="text-[#e8a230]">DO</span>GRAM
        </span>
        <div className="flex gap-4 text-xl text-gray-500">
          <button className="hover:text-[#e8a230] transition-colors">🔍</button>
          <button className="hover:text-[#e8a230] transition-colors">🔔</button>
        </div>
      </header>

      {/* Sadržaj stranice */}
      <main className="max-w-lg mx-auto px-4 pb-24 pt-4">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  )
}
