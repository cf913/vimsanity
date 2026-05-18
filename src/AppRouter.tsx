import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ClassicApp from './App'

function V2Placeholder({ wing }: { wing: string }) {
  return <div style={{ padding: 24 }}>V2 {wing} — placeholder</div>
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/learn" replace />} />
        <Route path="/learn/*" element={<V2Placeholder wing="Learn" />} />
        <Route path="/practice/*" element={<V2Placeholder wing="Practice" />} />
        <Route path="/apply/*" element={<V2Placeholder wing="Apply" />} />
        <Route path="/classic/*" element={<ClassicApp />} />
        <Route path="*" element={<Navigate to="/learn" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
