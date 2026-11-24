import { lazy, Suspense, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'

// Figma Pages (Frame 1:20 - Landing 1:21, Login 1:169, Sign Up 1:221, Keranjang 1:275)
const LandingPage = lazy(() => import('./components/FigmaLandingPage'))
const Login = lazy(() => import('./components/FigmaLogin'))
const SignUp = lazy(() => import('./components/FigmaSignUp'))
const Keranjang = lazy(() => import('./components/FigmaKeranjang'))
const Checkout = lazy(() => import('./components/FigmaCheckout'))
const Admin = lazy(() => import('./components/FigmaAdmin'))

// ─────────────────────────────────────────────────────────────
// Pengelola Rute Terakhir, Restorasi Scroll saat Refresh & Nonaktifkan Drag Asset
// ─────────────────────────────────────────────────────────────
function PageAndDragManager() {
  const location = useLocation()
  const navigate = useNavigate()
  const isFirstMount = useRef(true)

  // 1. Nonaktifkan drag pada semua gambar & asset di seluruh website
  useEffect(() => {
    const handleDragStart = (e) => {
      // Kecualikan elemen drag handle atau baris kartu di panel admin agar bisa di-reorder
      if (
        e.target.closest('.admin-reorder-col') ||
        e.target.closest('.admin-drag-handle') ||
        e.target.closest('.admin-card-row')
      ) {
        return
      }

      if (
        e.target.tagName === 'IMG' ||
        e.target.closest('img') ||
        e.target.closest('svg') ||
        e.target.closest('.figma-decor-card') ||
        e.target.closest('.figma-flipcard-item')
      ) {
        e.preventDefault()
        return false
      }
    }
    window.addEventListener('dragstart', handleDragStart)
    return () => window.removeEventListener('dragstart', handleDragStart)
  }, [])

  // 2. Simpan rute terakhir pengguna agar saat refresh tetap di tampilan yang sama
  useEffect(() => {
    const currentPath = location.pathname + location.search + location.hash
    // Jangan simpan rute admin sebagai auto-redirect jika belum berizin
    if (location.pathname !== '/admin') {
      sessionStorage.setItem('closerz_last_route', currentPath)
    }
  }, [location])

  // 3. Simpan posisi scroll pengguna saat browsing
  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem('closerz_scroll_' + location.pathname, String(window.scrollY))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [location.pathname])

  // 4. Saat refresh: pulihkan tampilan & posisi scroll terakhir yang dilihat pengguna
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false

      // Cek apakah ada rute terakhir sebelum refresh yang perlu dipulihkan
      const savedRoute = sessionStorage.getItem('closerz_last_route')
      const currentFull = location.pathname + location.search + location.hash

      if (savedRoute && savedRoute !== currentFull && (location.pathname === '/' || location.pathname === '/landing')) {
        navigate(savedRoute, { replace: true })
        return
      }

      // Restore posisi scroll terakhir pengguna pada tampilan yang sedang dibuka
      const savedScroll = sessionStorage.getItem('closerz_scroll_' + location.pathname)
      if (savedScroll) {
        const top = parseInt(savedScroll, 10)
        if (!isNaN(top) && top > 0) {
          requestAnimationFrame(() => {
            window.scrollTo({ top, left: 0, behavior: 'instant' })
          })
          setTimeout(() => {
            window.scrollTo({ top, left: 0, behavior: 'instant' })
          }, 80)
        }
      }
    } else {
      // Saat navigasi pindah halaman normal (klik tombol menu), scroll ke atas
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }
  }, [location.pathname])

  return null
}

// Global Toast Notification
function GlobalToast() {
  const { toast } = useApp()
  if (!toast) return null
  return <div className="figma-global-toast">{toast}</div>
}

function AppRoutes() {
  return (
    <Suspense fallback={null}>
      <Routes>
        {/* Landing Page Figma (Node 1:21) */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing" element={<LandingPage />} />

        {/* Halaman Autentikasi Figma */}
        <Route path="/login" element={<Login />} />
        <Route path="/login-figma" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signup-figma" element={<SignUp />} />

        {/* Halaman Keranjang Figma (Node 1:275) */}
        <Route path="/keranjang" element={<Keranjang />} />
        <Route path="/keranjang-figma" element={<Keranjang />} />

        {/* Halaman Checkout */}
        <Route path="/checkout" element={<Checkout />} />

        {/* Dashboard Admin */}
        <Route path="/admin" element={<Admin />} />

        {/* Redirect semua rute lama / tidak dikenal ke beranda landing page */}
        <Route path="/beranda" element={<Navigate to="/" replace />} />
        <Route path="/katalog" element={<Navigate to="/" replace />} />
        <Route path="/cara-order" element={<Navigate to="/" replace />} />
        <Route path="/faq" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppProvider>
        <PageAndDragManager />
        <AppRoutes />
        <GlobalToast />
      </AppProvider>
    </BrowserRouter>
  )
}
