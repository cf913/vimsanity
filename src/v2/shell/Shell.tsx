import { Outlet } from 'react-router-dom'
import WingsNav from './WingsNav'
import { CRT } from '../design/primitives'

export default function Shell() {
  return (
    // .vs-crt-root scopes the phosphor palette + JetBrains Mono so it never
    // leaks into /classic. CRT adds scanlines + noise across the whole screen.
    <div className="vs-crt-root">
      <CRT style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <WingsNav />
        <main style={{ flex: 1, minHeight: 0, overflow: 'auto', position: 'relative' }}>
          <Outlet />
        </main>
      </CRT>
    </div>
  )
}
