import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell.jsx'
import AuthPage from './pages/AuthPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import CustomersPage from './pages/CustomersPage.jsx'
import LeadsPage from './pages/LeadsPage.jsx'
import DealsPage from './pages/DealsPage.jsx'
import TasksPage from './pages/TasksPage.jsx'
import ActivitiesPage from './pages/ActivitiesPage.jsx'
import ReportsPage from './pages/ReportsPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import { isSupabaseConfigured, supabase } from './lib/supabase.js'

function ProtectedRoute({ session, children, fallbackTitle = 'Dashboard', userName, onLogout }) {
  const shouldProtect = isSupabaseConfigured

  if (!shouldProtect) {
    return (
      <AppShell title={fallbackTitle} userName={userName} onLogout={onLogout}>
        {children}
      </AppShell>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return (
    <AppShell title={fallbackTitle} userName={userName} onLogout={onLogout}>
      {children}
    </AppShell>
  )
}

function App() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(Boolean(supabase))

  useEffect(() => {
    if (!supabase) {
      return undefined
    }

    let isMounted = true

    const restoreSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (isMounted) {
        setSession(data.session)
        setAuthLoading(false)
      }
    }

    restoreSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (isMounted) {
        setSession(currentSession)
      }
    })

    return () => {
      isMounted = false
      authListener?.subscription.unsubscribe()
    }
  }, [])

  const userName = useMemo(() => session?.user?.email || 'Alex Morgan', [session])

  const handleLogout = async () => {
    if (!supabase) {
      return
    }

    await supabase.auth.signOut()
    setSession(null)
  }

  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-600">Loading CRM session…</div>
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={session ? <Navigate to="/" replace /> : <AuthPage />} />

        <Route path="/" element={<ProtectedRoute session={session} fallbackTitle="Dashboard" userName={userName} onLogout={handleLogout}><DashboardPage /></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute session={session} fallbackTitle="Customers" userName={userName} onLogout={handleLogout}><CustomersPage /></ProtectedRoute>} />
        <Route path="/leads" element={<ProtectedRoute session={session} fallbackTitle="Leads" userName={userName} onLogout={handleLogout}><LeadsPage /></ProtectedRoute>} />
        <Route path="/deals" element={<ProtectedRoute session={session} fallbackTitle="Deals" userName={userName} onLogout={handleLogout}><DealsPage /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute session={session} fallbackTitle="Tasks" userName={userName} onLogout={handleLogout}><TasksPage /></ProtectedRoute>} />
        <Route path="/activities" element={<ProtectedRoute session={session} fallbackTitle="Activities" userName={userName} onLogout={handleLogout}><ActivitiesPage /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute session={session} fallbackTitle="Reports" userName={userName} onLogout={handleLogout}><ReportsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute session={session} fallbackTitle="Settings" userName={userName} onLogout={handleLogout}><SettingsPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
