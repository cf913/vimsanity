import { Outlet } from 'react-router-dom'
import WingsNav from './WingsNav'

export default function Shell() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-950 text-gray-100">
      <WingsNav />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
