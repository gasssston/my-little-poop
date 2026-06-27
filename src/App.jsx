import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { Toaster } from 'sonner'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import LogPage from './pages/LogPage'
import HistoryPage from './pages/HistoryPage'
import AccountPage from './pages/AccountPage'
import FriendsPage from './pages/FriendsPage'
import CelebrationPage from './pages/CelebrationPage'
import { Analytics } from "@vercel/analytics/react"

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-5xl animate-bounce">💩</div>
      </div>
    )
  }
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-5xl animate-bounce">💩</div>
      </div>
    )
  }
  return user ? <Navigate to="/app/log" replace /> : children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/app/log" replace />} />
        <Route path="log" element={<LogPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="friends" element={<FriendsPage />} />
        <Route path="celebration" element={<CelebrationPage />} />
        <Route path="account" element={<AccountPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            style: {
              background: '#FAF0DF',
              border: '1px solid #E5D4BC',
              color: '#3D2B1F',
              fontFamily: 'Inter, sans-serif',
            },
          }}
        />
        <Analytics />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
