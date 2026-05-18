import { NavLink } from 'react-router-dom'
import { units } from './units/registry'
import type { Progress } from '../../state/types'
import { getUnitProgress } from '../../state/progress'

interface Props {
  progress: Progress
}

function statusLabel(p: ReturnType<typeof getUnitProgress>): string {
  if (p.bStatus === 'completed') return '✓'
  if (p.aStatus === 'completed') return '◐'
  if (p.aStatus === 'ready') return '○'
  return '🔒'
}

export default function UnitSidebar({ progress }: Props) {
  return (
    <aside className="w-64 border-r border-gray-800 bg-gray-950 p-4">
      <div className="mb-3 text-xs uppercase tracking-wider text-gray-500">
        Curriculum
      </div>
      <ul className="flex flex-col gap-1">
        {units.map((u) => {
          const up = getUnitProgress(progress, u.id)
          const locked = up.aStatus === 'locked'
          return (
            <li key={u.id}>
              <NavLink
                to={locked ? '#' : `/learn/${u.id}`}
                onClick={(e) => {
                  if (locked) e.preventDefault()
                }}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded px-3 py-2 text-sm ${
                    locked
                      ? 'cursor-not-allowed text-gray-600'
                      : isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-900'
                  }`
                }
              >
                <span className="w-4 text-center">{statusLabel(up)}</span>
                <span className="flex-1">{u.title}</span>
              </NavLink>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
