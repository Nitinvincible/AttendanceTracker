import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Attendance from './pages/Attendance';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Settings from './pages/Settings';
import Advanced from './pages/Advanced';
import Departments from './pages/Departments';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      refetchOnWindowFocus: true,
    },
  },
});

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease: 'easeIn' } },
};

function AnimatedRoutes() {
  const location = useLocation();
  const { isAdmin } = useAuth();
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit">
        <Routes location={location}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/settings" element={isAdmin ? <Settings /> : <Navigate to="/" />} />
          <Route path="/advanced" element={isAdmin ? <Advanced /> : <Navigate to="/" />} />
          <Route path="/departments" element={isAdmin ? <Departments /> : <Navigate to="/" />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function AuthRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit">
        <Routes location={location}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function AppInner() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-muted)' }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <BrowserRouter>
        <AuthRoutes />
      </BrowserRouter>
    );
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Navbar />
          <main className="main-content">
            <AnimatedRoutes />
          </main>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppInner />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            },
            success: { iconTheme: { primary: 'var(--green)', secondary: 'var(--bg-card)' } },
            error: { iconTheme: { primary: 'var(--red)', secondary: 'var(--bg-card)' } },
            duration: 3500,
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}
