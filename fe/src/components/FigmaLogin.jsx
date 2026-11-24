import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import './FigmaAuth.css'

// Foto member tampak depan (Close Your Eyes / CYE - internet asset)
import minwookImg from '../assets/members/minwook.jpg'
import jingxiangImg from '../assets/members/jingxiang.jpg'
import yeojunImg from '../assets/members/yeojun.jpg'

// Asset gambar body belakang kartu (Warna gradasi aurora murni tanpa teks)
import cardBackYuna from '../assets/figma/card-bg-yuna.png'
import cardBackKair from '../assets/figma/card-bg-kair.png'
import cardBackMira from '../assets/figma/card-bg-mira.png'

// 4-pointed sparkle icon
function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ width: 18, height: 18 }}>
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  )
}

export default function FigmaLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isEmailRegistered, ADMIN_CREDENTIALS } = useApp()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // Cek jika diarahkan dari Sign Up
  useEffect(() => {
    if (location.state?.registeredEmail) {
      setEmail(location.state.registeredEmail)
    }
    if (location.state?.notice) {
      setMessage({ type: 'success', text: location.state.notice })
    }
  }, [location.state])

  // State Flipcard untuk 3 kartu dekoratif di background
  const [flippedCards, setFlippedCards] = useState({})
  const toggleCardFlip = (key) => {
    setFlippedCards((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail) {
      setMessage({ type: 'error', text: 'Silakan masukkan email Anda.' })
      return
    }

    // 1. Cek Login Khusus Admin
    if (ADMIN_CREDENTIALS && cleanEmail === ADMIN_CREDENTIALS.email.toLowerCase()) {
      if (password !== ADMIN_CREDENTIALS.password) {
        setMessage({ type: 'error', text: 'Password akun admin salah! Silakan periksa kembali.' })
        return
      }
      setIsLoading(true)
      setTimeout(() => {
        sessionStorage.setItem('closerz_admin_logged_in', 'true')
        login({
          email: ADMIN_CREDENTIALS.email,
          name: ADMIN_CREDENTIALS.name,
          role: 'admin',
        })
        setMessage({ type: 'success', text: 'Login berhasil sebagai Admin! Mengalihkan ke panel admin...' })
        setTimeout(() => {
          navigate('/admin')
        }, 600)
      }, 350)
      return
    }

    // 2. Validasi Login Pengguna Reguler
    if (!isEmailRegistered(cleanEmail)) {
      setMessage({
        type: 'error',
        text: 'Email ini belum terdaftar. Anda harus Sign Up terlebih dahulu sebelum bisa login!',
      })
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      sessionStorage.removeItem('closerz_admin_logged_in')
      login(cleanEmail)
      setMessage({ type: 'success', text: 'Berhasil login! Mengalihkan ke beranda...' })
      setTimeout(() => {
        navigate('/landing')
      }, 700)
    }, 400)
  }

  const handleBack = () => {
    // Jika baru saja sign up dan belum login, ingatkan untuk menyelesaikan login
    if (location.state?.fromSignUp) {
      setMessage({
        type: 'error',
        text: 'Anda baru saja membuat akun. Silakan login terlebih dahulu untuk mengakses website!',
      })
      return
    }
    navigate('/landing')
  }

  return (
    <div className="figma-auth-page" data-node-id="1:169" data-name="login">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP NAVIGATION (Node 1:170)
          ───────────────────────────────────────────────────────────── */}
      <header className="figma-auth-header" data-node-id="1:170" data-name="Nav login">
        <div className="figma-auth-header-left">
          {/* Back button (Node 1:203) */}
          <button
            type="button"
            className="figma-btn-back"
            onClick={handleBack}
            data-node-id="1:203"
            aria-label="Kembali"
          >
            Back
          </button>

          {/* Logo (Node 1:171) */}
          <span
            onClick={handleBack}
            className="figma-auth-logo"
            data-node-id="1:171"
            role="button"
            tabIndex={0}
            style={{ cursor: 'pointer' }}
          >
            <span className="logo-g" data-node-id="1:172">G</span>
            <span className="logo-star" data-node-id="1:173">★</span>
            <span className="logo-closerz" data-node-id="1:174">Closerz</span>
          </span>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. TAB SWITCHER (Node 1:196)
          ───────────────────────────────────────────────────────────── */}
      <div className="figma-auth-tabs-wrap">
        <div className="figma-auth-tabs" data-node-id="1:196" data-name="login/signup">
          <button
            type="button"
            className="figma-auth-tab is-active"
            data-node-id="1:200"
            data-name="login tombol"
          >
            Log In
          </button>
          <Link
            to="/signup-figma"
            className="figma-auth-tab"
            data-node-id="1:197"
            data-name="sign up tombol"
          >
            Sign Up
          </Link>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. MAIN BODY & CENTER MODAL (Node 1:175 & 1:206)
          ───────────────────────────────────────────────────────────── */}
      <main className="figma-auth-body">
        {/* 3 Floating Flipcards di background sesuai posisi Figma Asli */}
        <div className="figma-auth-cards-decor" data-node-id="1:176" aria-hidden="true">
          {/* Card 1: Kiri (MINWOOK / CYE-01) */}
          <div
            className={`figma-decor-card card-kair ${flippedCards.kair ? 'is-flipped' : ''}`}
            onClick={() => toggleCardFlip('kair')}
            title="Klik untuk flip photocard"
            role="button"
            tabIndex={0}
          >
            <div className="figma-decor-card-inner">
              {/* Tampak Depan: Foto Member CYE Full-Bleed */}
              <div className="figma-decor-card-face figma-decor-card-front">
                <img src={minwookImg} alt="MINWOOK" className="figma-decor-card-img" />
                <div className="figma-decor-card-overlay" />
                <div className="figma-decor-card-foil" />
                <div className="figma-decor-card-header">
                  <span className="figma-decor-card-num">01</span>
                  <span className="figma-decor-card-star"><SparkleIcon /></span>
                </div>
                <div className="figma-card-footer">
                  <div className="figma-card-name">MINWOOK</div>
                  <div className="figma-card-group">CYE</div>
                </div>
              </div>

              {/* Body Belakang: Asset Gradasi Warna Aurora Murni Tanpa Teks */}
              <div className="figma-decor-card-face figma-decor-card-back">
                <img src={cardBackKair} alt="" className="figma-decor-card-back-asset" />
                <div className="figma-decor-card-foil" />
              </div>
            </div>
          </div>

          {/* Card 2: Kanan Atas (JINGXIANG / CYE-02) */}
          <div
            className={`figma-decor-card card-yuna ${flippedCards.yuna ? 'is-flipped' : ''}`}
            onClick={() => toggleCardFlip('yuna')}
            title="Klik untuk flip photocard"
            role="button"
            tabIndex={0}
          >
            <div className="figma-decor-card-inner">
              {/* Tampak Depan: Foto Member CYE Full-Bleed */}
              <div className="figma-decor-card-face figma-decor-card-front">
                <img src={jingxiangImg} alt="JINGXIANG" className="figma-decor-card-img" />
                <div className="figma-decor-card-overlay" />
                <div className="figma-decor-card-foil" />
                <div className="figma-decor-card-header">
                  <span className="figma-decor-card-num">02</span>
                  <span className="figma-decor-card-star"><SparkleIcon /></span>
                </div>
                <div className="figma-card-footer">
                  <div className="figma-card-name">JINGXIANG</div>
                  <div className="figma-card-group">CYE</div>
                </div>
              </div>

              {/* Body Belakang: Asset Gradasi Warna Aurora Murni Tanpa Teks */}
              <div className="figma-decor-card-face figma-decor-card-back">
                <img src={cardBackYuna} alt="" className="figma-decor-card-back-asset" />
                <div className="figma-decor-card-foil" />
              </div>
            </div>
          </div>

          {/* Card 3: Kanan Bawah (YEOJUN / CYE-03) */}
          <div
            className={`figma-decor-card card-mira ${flippedCards.mira ? 'is-flipped' : ''}`}
            onClick={() => toggleCardFlip('mira')}
            title="Klik untuk flip photocard"
            role="button"
            tabIndex={0}
          >
            <div className="figma-decor-card-inner">
              {/* Tampak Depan: Foto Member CYE Full-Bleed */}
              <div className="figma-decor-card-face figma-decor-card-front">
                <img src={yeojunImg} alt="YEOJUN" className="figma-decor-card-img" />
                <div className="figma-decor-card-overlay" />
                <div className="figma-decor-card-foil" />
                <div className="figma-decor-card-header">
                  <span className="figma-decor-card-num">03</span>
                  <span className="figma-decor-card-star"><SparkleIcon /></span>
                </div>
                <div className="figma-card-footer">
                  <div className="figma-card-name">YEOJUN</div>
                  <div className="figma-card-group">CYE</div>
                </div>
              </div>

              {/* Body Belakang: Asset Gradasi Warna Aurora Murni Tanpa Teks */}
              <div className="figma-decor-card-face figma-decor-card-back">
                <img src={cardBackMira} alt="" className="figma-decor-card-back-asset" />
                <div className="figma-decor-card-foil" />
              </div>
            </div>
          </div>
        </div>

        {/* Center Modal Container (Node 1:206) */}
        <section className="figma-auth-modal" data-node-id="1:206" data-name="tempat login signuup">
          {/* Modal Logo (Node 1:217) */}
          <div className="figma-modal-logo" data-node-id="1:217">
            <span className="logo-g" data-node-id="1:218">G</span>
            <span className="logo-star" data-node-id="1:219">★</span>
            <span className="logo-closerz" data-node-id="1:220">Closerz</span>
          </div>

          {/* Title (Node 1:208) */}
          <h1 className="figma-modal-title" data-node-id="1:208">Welcome Back</h1>

          {/* Login Form */}
          <form className="figma-auth-form" onSubmit={handleSubmit}>
            {/* Email Field (Node 1:209 & 1:210) */}
            <div className="figma-input-group" data-node-id="1:209">
              <input
                type="email"
                className="figma-pill-input"
                placeholder="you@yourmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                aria-label="Email Address"
              />
            </div>

            {/* Password Field (Node 1:211 & 1:212) */}
            <div className="figma-input-group" data-node-id="1:211">
              <input
                type="password"
                className="figma-pill-input"
                placeholder="************"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                aria-label="Password"
              />
            </div>

            {/* Actions Row: Login Button & Forgot Password */}
            <div className="figma-auth-actions-row">
              {/* Login Button (Node 1:213 & 1:214) */}
              <button
                type="submit"
                className="figma-btn-submit"
                disabled={isLoading}
                data-node-id="1:213"
              >
                <span>{isLoading ? 'Loading...' : 'Login'}</span>
                <svg
                  viewBox="0 0 18.3 18.3"
                  fill="none"
                  aria-hidden="true"
                  data-node-id="1:215"
                >
                  <path
                    d="M7.63 14.5a1.2 1.2 0 0 1-.76-.32 1.15 1.15 0 0 1-.09-1.68L10.46 9.16 7.17 5.06a1.18 1.18 0 0 1 1.22-1.96l4.03 4.98a1.2 1.2 0 0 1 0 1.58l-4.03 4.98c-.2.25-.5.38-.76.38z"
                    fill="currentColor"
                  />
                </svg>
              </button>

              {/* Forgot Password Link (Node 1:216) */}
              <button
                type="button"
                className="figma-forgot-pwd"
                onClick={() => alert('Fitur reset password telah dikirim ke email Anda.')}
                data-node-id="1:216"
              >
                FORGOT PASSWORD
              </button>
            </div>

            {/* Message feedback */}
            {message && (
              <div
                className={`figma-auth-message ${
                  message.type === 'error' ? 'is-error' : 'is-success'
                }`}
                role="status"
              >
                {message.text}
              </div>
            )}
          </form>
        </section>
      </main>
    </div>
  )
}
