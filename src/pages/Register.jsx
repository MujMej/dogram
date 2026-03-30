// src/pages/Register.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', full_name: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.full_name }
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0e0c] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tight mb-2">
            <span className="text-[#e8a230]">DO</span>GRAM
          </h1>
          <p className="text-gray-500 text-sm">Kreiraj račun i dodaj svog psa 🐶</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            name="full_name"
            placeholder="Tvoje ime"
            value={form.full_name}
            onChange={handleChange}
            required
            className="w-full bg-[#1a1916] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-[#e8a230] transition-colors"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full bg-[#1a1916] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-[#e8a230] transition-colors"
          />

          <input
            type="password"
            name="password"
            placeholder="Lozinka (min. 6 znakova)"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
            className="w-full bg-[#1a1916] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-[#e8a230] transition-colors"
          />

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e8a230] text-black font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Kreiranje...' : 'Kreiraj račun'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Već imaš račun?{' '}
          <Link to="/login" className="text-[#e8a230] font-medium hover:underline">
            Prijavi se
          </Link>
        </p>
      </div>
    </div>
  )
}
