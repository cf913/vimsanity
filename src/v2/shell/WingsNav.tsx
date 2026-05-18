import { NavLink } from 'react-router-dom'

const tabs: Array<{ to: string; label: string }> = [
  { to: '/learn', label: '📘 Learn' },
  { to: '/practice', label: '🎯 Practice' },
  { to: '/apply', label: '⚒ Apply' },
]

export default function WingsNav() {
  return (
    <nav className="flex gap-1 border-b border-gray-800 bg-gray-950 px-4 py-2">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          className={({ isActive }) =>
            `rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-gray-800 text-white'
                : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200'
            }`
          }
        >
          {t.label}
        </NavLink>
      ))}
    </nav>
  )
}
