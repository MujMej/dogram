import { useEffect, useMemo, useState } from 'react'

const defaultReminderForm = {
  title: '',
  category: 'Hranjenje',
  date: '',
  time: '',
}

const categories = ['Hranjenje', 'Šetnja', 'Kupanje', 'Veterinar', 'Lijekovi', 'Trening']

export default function Reminders() {
  const [form, setForm] = useState(defaultReminderForm)
  const [reminders, setReminders] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem('dogram_reminders')
    if (saved) {
      try {
        setReminders(JSON.parse(saved))
      } catch {
        setReminders([])
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('dogram_reminders', JSON.stringify(reminders))
  }, [reminders])

  const sortedReminders = useMemo(() => {
    return [...reminders].sort((a, b) => {
      const aDate = new Date(`${a.date}T${a.time || '00:00'}`).getTime()
      const bDate = new Date(`${b.date}T${b.time || '00:00'}`).getTime()
      return aDate - bDate
    })
  }, [reminders])

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!form.title || !form.date) return

    const newReminder = {
      id: crypto.randomUUID(),
      ...form,
      completed: false,
    }

    setReminders((prev) => [...prev, newReminder])
    setForm(defaultReminderForm)
  }

  const toggleCompleted = (id) => {
    setReminders((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    )
  }

  const deleteReminder = (id) => {
    setReminders((prev) => prev.filter((item) => item.id !== id))
  }

  const todayCount = sortedReminders.filter((item) => item.date === getToday()).length
  const completedCount = sortedReminders.filter((item) => item.completed).length

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-[#171512] p-5 shadow-lg">
        <h1 className="text-2xl font-black text-white">Podsjetnici & briga</h1>
        <p className="mt-2 text-sm text-gray-400">
          Dodaj obaveze za svog psa i prati dnevnu rutinu.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#0f0e0c] p-4">
            <span className="block text-xs uppercase tracking-wide text-gray-500">Za danas</span>
            <span className="mt-2 block text-2xl font-black text-white">{todayCount}</span>
          </div>
          <div className="rounded-2xl bg-[#0f0e0c] p-4">
            <span className="block text-xs uppercase tracking-wide text-gray-500">Završeno</span>
            <span className="mt-2 block text-2xl font-black text-white">{completedCount}</span>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#171512] p-4">
        <h2 className="mb-4 text-lg font-bold text-white">Dodaj podsjetnik</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Npr. Večernja šetnja"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            className="w-full rounded-2xl border border-white/10 bg-[#0f0e0c] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500"
          />

          <select
            value={form.category}
            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
            className="w-full rounded-2xl border border-white/10 bg-[#0f0e0c] px-4 py-3 text-sm text-white outline-none"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-[#0f0e0c] px-4 py-3 text-sm text-white outline-none"
            />

            <input
              type="time"
              value={form.time}
              onChange={(e) => setForm((prev) => ({ ...prev, time: e.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-[#0f0e0c] px-4 py-3 text-sm text-white outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-[#e8a230] px-4 py-3 text-sm font-bold text-black transition hover:scale-[1.01]"
          >
            Sačuvaj podsjetnik
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#171512] p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Lista obaveza</h2>
          <span className="text-sm text-gray-400">{sortedReminders.length} ukupno</span>
        </div>

        <div className="space-y-3">
          {sortedReminders.length > 0 ? (
            sortedReminders.map((item) => (
              <div
                key={item.id}
                className={`rounded-3xl border p-4 transition ${
                  item.completed
                    ? 'border-green-500/20 bg-green-500/5'
                    : 'border-white/10 bg-[#0f0e0c]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={`text-base font-bold ${
                          item.completed ? 'text-gray-400 line-through' : 'text-white'
                        }`}
                      >
                        {item.title}
                      </h3>
                      <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-300">
                        {item.category}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-gray-400">
                      {formatDate(item.date)}
                      {item.time ? ` u ${item.time}` : ''}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      item.completed
                        ? 'bg-green-500/15 text-green-300'
                        : 'bg-[#e8a230]/15 text-[#e8a230]'
                    }`}
                  >
                    {item.completed ? 'Završeno' : 'Aktivno'}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => toggleCompleted(item.id)}
                    className="rounded-2xl bg-[#e8a230] px-4 py-2 text-sm font-bold text-black"
                  >
                    {item.completed ? 'Vrati kao aktivno' : 'Označi završeno'}
                  </button>

                  <button
                    onClick={() => deleteReminder(item.id)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Obriši
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 bg-[#0f0e0c] p-6 text-center text-sm text-gray-400">
              Još nema podsjetnika. Dodaj prvi zadatak za hranjenje, šetnju ili veterinarski pregled.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function getToday() {
  return new Date().toISOString().split('T')[0]
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('sr-RS', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
