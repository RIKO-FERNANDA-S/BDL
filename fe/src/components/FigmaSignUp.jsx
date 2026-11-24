import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

export default function FigmaSignUp() {
  const navigate = useNavigate()
  const { register } = useApp()

  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // State Flipcard untuk 3 kartu dekoratif di background
  const [flippedCards, setFlippedCards] = useState({})
  const toggleCardFlip = (key) => {
    setFlippedCards((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleNext = (e) => {
    e.preventDefault()
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail) {
      setMessage({ type: 'error', text: 'Silakan masukkan email Anda.' })
      return
    }

    if (step === 1) {
      setStep(2)
      setMessage(null)
      return
    }

    // Step 2: Set password & register user (wajib diarahkan ke login, tidak auto-login ke beranda)
    setIsLoading(true)
    setTimeout(() => {
      register({ email: cleanEmail, password })
      setIsLoading(false)
      // Redirect ke login dengan notifikasi bahwa akun berhasil dibuat
      navigate('/login-figma', {
        state: {
          registeredEmail: cleanEmail,
          fromSignUp: true,
          notice: 'Akun Anda berhasil didaftarkan! Silakan login terlebih dahulu untuk mengakses beranda.',
        },
      })
    }, 400)
  }

  return (
    <div className="figma-auth-page" data-node-id="1:221" data-name="sign up">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP NAVIGATION (Node 1:222)
          ───────────────────────────────────────────────────────────── */}
      <header className="figma-auth-header" data-node-id="1:222" data-name="Nav sign up">
        <div className="figma-auth-header-left">
          {/* Back button (Node 1:272) */}
          <button
            type="button"
            className="figma-btn-back"
            onClick={() => {
              if (step === 2) {
                setStep(1)
              } else {
                navigate('/login-figma')
              }
            }}
            data-node-id="1:272"
            aria-label="Kembali ke halaman login"
          >
            Back
          </button>

          {/* Logo (Node 1:223) */}
          <Link to="/login-figma" className="figma-auth-logo" data-node-id="1:223">
            <span className="logo-g" data-node-id="1:224">G</span>
            <span className="logo-star" data-node-id="1:225">★</span>
            <span className="logo-closerz" data-node-id="1:226">Closerz</span>
          </Link>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. TAB SWITCHER (Node 1:268)
          ───────────────────────────────────────────────────────────── */}
      <div className="figma-auth-tabs-wrap">
        <div className="figma-auth-tabs" data-node-id="1:268" data-name="login/signup">
          <Link
            to="/login-figma"
            className="figma-auth-tab"
            data-node-id="1:265"
            data-name="login tombol"
          >
            Log In
          </Link>
          <button
            type="button"
            className="figma-auth-tab is-active"
            data-node-id="1:269"
            data-name="sign up tombol"
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. MAIN BODY & CENTER MODAL (Node 1:227 & 1:228)
          ───────────────────────────────────────────────────────────── */}
      <main className="figma-auth-body">
        {/* 3 Floating Flipcards di background sesuai posisi Figma Asli */}
        <div className="figma-auth-cards-decor" data-node-id="1:240" aria-hidden="true">
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

        {/* Center Modal Container (Node 1:228 & 1:229) */}
        <section className="figma-auth-modal" data-node-id="1:228" data-name="tempat login signuup">
          {/* Modal Logo (Node 1:261) */}
          <div className="figma-modal-logo" data-node-id="1:261">
            <span className="logo-g" data-node-id="1:262">G</span>
            <span className="logo-star" data-node-id="1:263">★</span>
            <span className="logo-closerz" data-node-id="1:264">Closerz</span>
          </div>

          {/* Title (Node 1:260) */}
          <h1 className="figma-modal-title" data-node-id="1:260">Welcome!</h1>

          {/* Sign Up Form */}
          <form className="figma-auth-form" onSubmit={handleNext}>
            {step === 1 ? (
              /* Field 1: Email with "Enter your mail" badge (Node 1:230) */
              <div className="figma-input-group" data-node-id="1:230" data-name="field 1">
                {/* Floating Badge (Node 1:238 & 1:239) */}
                <div className="figma-input-badge" data-node-id="1:238">
                  Enter your mail
                </div>
                {/* Pill input (Node 1:236 & 1:237) */}
                <input
                  type="email"
                  className="figma-pill-input"
                  placeholder="you@yourmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  autoFocus
                  aria-label="Enter your email"
                />
              </div>
            ) : (
              /* Step 2: Password Setup */
              <div className="figma-input-group">
                <div className="figma-input-badge">
                  Create password
                </div>
                <input
                  type="password"
                  className="figma-pill-input"
                  placeholder="Buat kata sandi aman"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  autoFocus
                  aria-label="Create password"
                />
              </div>
            )}

            {/* Next Button (Node 1:231 - 1:234) */}
            <div className="figma-auth-actions-row">
              <button
                type="submit"
                className="figma-btn-submit"
                disabled={isLoading}
                data-node-id="1:231"
                data-name="next"
              >
                <span data-node-id="1:233">{isLoading ? 'Loading...' : step === 1 ? 'Next' : 'Daftar Sekarang'}</span>
                <svg
                  viewBox="0 0 18.3 18.3"
                  fill="none"
                  aria-hidden="true"
                  data-node-id="1:234"
                >
                  <path
                    d="M7.63 14.5a1.2 1.2 0 0 1-.76-.32 1.15 1.15 0 0 1-.09-1.68L10.46 9.16 7.17 5.06a1.18 1.18 0 0 1 1.22-1.96l4.03 4.98a1.2 1.2 0 0 1 0 1.58l-4.03 4.98c-.2.25-.5.38-.76.38z"
                    fill="currentColor"
                  />
                </svg>
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
