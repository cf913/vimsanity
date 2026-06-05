import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ClassicApp from './App'
import { v2Routes } from './v2/routes'

export default function AppRouter() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Navigate to="/learn" replace />} />
        {v2Routes()}
        <Route path="/classic/*" element={<ClassicApp />} />
        <Route path="*" element={<Navigate to="/learn" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
