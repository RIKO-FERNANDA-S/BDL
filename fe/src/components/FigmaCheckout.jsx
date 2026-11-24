import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { FIGMA_CATALOG_CARDS } from '../data/figmaCatalog'
import './FigmaAuth.css'

const LINE_ADMIN_URL = 'https://line.me/ti/p/DXxrMczHYq'

export default function FigmaCheckout() {
  const navigate = useNavigate()
  const { cart, count, subtotal, clear, reduceSlots, addOrder } = useApp()

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
    paymentOption: 'dp50', // 'dp50' | 'full'
  })

  const [isSubmitted, setIsSubmitted] = useState(false)
  const [orderCode, setOrderCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [completedOrderItems, setCompletedOrderItems] = useState([])
  const [completedTotals, setCompletedTotals] = useState({ grandTotal: 0, toPayNow: 0, ongkir: 0 })
  const [completedCheckoutLabel, setCompletedCheckoutLabel] = useState('Ready Stock')
  const [completedCheckoutSummary, setCompletedCheckoutSummary] = useState('')

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0)
  }

  const getCardImage = (item) => {
    if (item.image) return item.image
    const found = FIGMA_CATALOG_CARDS.find(
      (c) => c.id === item.id || c.name?.toLowerCase() === item.name?.toLowerCase()
    )
    return found ? found.image : null
  }

  // Identifikasi kuantitas kartu berdasarkan status pembelian (Ready Stock vs Pre-Order)
  const readyStockItems = cart.filter((c) => (c.status || 'Ready Stock') === 'Ready Stock')
  const preOrderItems = cart.filter((c) => c.status === 'Pre-Order')

  const readyStockCount = readyStockItems.reduce((acc, it) => acc + (it.qty || 1), 0)
  const preOrderCount = preOrderItems.reduce((acc, it) => acc + (it.qty || 1), 0)
  const totalItemCount = readyStockCount + preOrderCount

  let checkoutTypeLabel = 'Ready Stock'
  let checkoutSubtitle = `${readyStockCount} Kartu Ready Stock`

  if (readyStockCount > 0 && preOrderCount > 0) {
    checkoutTypeLabel = 'Ready Stock & Pre-Order'
    checkoutSubtitle = `${readyStockCount} Kartu Ready Stock & ${preOrderCount} Kartu Pre-Order (Total ${totalItemCount} Kartu)`
  } else if (preOrderCount > 0) {
    checkoutTypeLabel = 'Pre-Order'
    checkoutSubtitle = `${preOrderCount} Kartu Pre-Order`
  } else {
    checkoutTypeLabel = 'Ready Stock'
    checkoutSubtitle = `${readyStockCount} Kartu Ready Stock`
  }

  const ongkir = subtotal >= 200000 ? 0 : 15000
  const grandTotal = subtotal + ongkir
  const dpAmount = Math.round(grandTotal / 2)
  const toPayNow = form.paymentOption === 'dp50' ? dpAmount : grandTotal

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'phone') {
      // Hanya menerima angka (karakter huruf dan simbol non-angka langsung disaring)
      const numericOnly = value.replace(/\D/g, '')
      setForm((prev) => ({ ...prev, phone: numericOnly }))
      return
    }
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const generateLineMessage = (code, items, totalVal, payNowVal, shippingFee, typeLabel, typeSummary) => {
    const readyItems = items.filter((c) => (c.status || 'Ready Stock') === 'Ready Stock')
    const poItems = items.filter((c) => c.status === 'Pre-Order')

    const readyCnt = readyItems.reduce((acc, it) => acc + (it.qty || 1), 0)
    const poCnt = poItems.reduce((acc, it) => acc + (it.qty || 1), 0)

    let breakdownSection = ''
    if (readyItems.length > 0) {
      breakdownSection += `[KARTU READY STOCK - ${readyCnt} pcs]\n`
      breakdownSection += readyItems
        .map(
          (c) =>
            `• ${c.name} (${c.group}) × ${c.qty || 1} pcs = ${formatRupiah(
              (c.price || 0) * (c.qty || 1)
            )}`
        )
        .join('\n') + '\n\n'
    }

    if (poItems.length > 0) {
      breakdownSection += `[KARTU PRE-ORDER - ${poCnt} pcs]\n`
      breakdownSection += poItems
        .map(
          (c) =>
            `• ${c.name} (${c.group}) × ${c.qty || 1} pcs = ${formatRupiah(
              (c.price || 0) * (c.qty || 1)
            )}`
        )
        .join('\n') + '\n\n'
    }

    return (
      `Halo Admin GO Closerz!\n\n` +
      `Saya ingin konfirmasi pesanan [Checkout ${typeLabel}]:\n` +
      `Status Pembelian: ${typeSummary}\n` +
      `-----------------------------------\n` +
      `KODE PESANAN : ${code}\n` +
      `NAMA : ${form.name}\n` +
      `NO. HP / WA : ${form.phone}\n` +
      `ALAMAT : ${form.address}${form.city ? ', ' + form.city : ''}\n` +
      (form.notes ? `CATATAN : ${form.notes}\n` : '') +
      `-----------------------------------\n` +
      `RINCIAN PHOTOCARD:\n${breakdownSection.trim()}\n` +
      `-----------------------------------\n` +
      `Ongkir Lokal : ${shippingFee === 0 ? 'GRATIS' : formatRupiah(shippingFee)}\n` +
      `Total Nilai : ${formatRupiah(totalVal)}\n` +
      `Skema Pembayaran : ${form.paymentOption === 'dp50' ? 'DP 50%' : 'Pelunasan Penuh'}\n` +
      `JUMLAH TRANSFER : ${formatRupiah(payNowVal)}\n` +
      `-----------------------------------\n` +
      `Mohon verifikasi slot kartu dan kirimkan info pembayaran LINE. Terima kasih!`
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      alert('Silakan lengkapi formulir pengiriman.')
      return
    }

    const newCode = 'GCZ-' + Date.now().toString(36).toUpperCase()
    setOrderCode(newCode)
    setCompletedOrderItems([...cart])
    setCompletedTotals({ grandTotal, toPayNow, ongkir })
    setCompletedCheckoutLabel(checkoutTypeLabel)
    setCompletedCheckoutSummary(checkoutSubtitle)

    // Simpan ke riwayat pesanan akun
    if (addOrder) {
      addOrder({
        code: newCode,
        items: [...cart],
        grandTotal,
        toPayNow,
        paymentOption: form.paymentOption,
        shippingFee: ongkir,
        checkoutTypeLabel,
        checkoutSummary: checkoutSubtitle,
        recipientName: form.name,
        phone: form.phone,
        address: form.address + (form.city ? ', ' + form.city : ''),
      })
    }

    // Kurangi slot kartu yang dibeli secara otomatis
    reduceSlots(cart)

    // Bersihkan keranjang belanja
    clear()

    // Beralih ke Tampilan Orderan Berhasil (Konfirmasi ke LINE Admin dilakukan di tampilan ini)
    setIsSubmitted(true)
  }

  const handleConfirmToLine = () => {
    const text = generateLineMessage(
      orderCode,
      completedOrderItems,
      completedTotals.grandTotal,
      completedTotals.toPayNow,
      completedTotals.ongkir,
      completedCheckoutLabel,
      completedCheckoutSummary
    )
    // Otomatis salin format pesan ke clipboard
    try {
      navigator.clipboard.writeText(text)
      setCopied(true)
    } catch { }

    // Buka tautan LINE Admin
    window.open(LINE_ADMIN_URL, '_blank')
  }

  const handleCopyMessage = () => {
    const text = generateLineMessage(
      orderCode,
      completedOrderItems,
      completedTotals.grandTotal,
      completedTotals.toPayNow,
      completedTotals.ongkir,
      completedCheckoutLabel,
      completedCheckoutSummary
    )
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    })
  }

  if ((!cart || cart.length === 0) && !isSubmitted) {
    return (
      <div className="figma-cart-page">
        <header className="figma-auth-header">
          <div className="figma-auth-header-left">
            <button
              type="button"
              className="figma-btn-back"
              onClick={() => navigate('/landing')}
            >
              Back
            </button>
            <Link to="/landing" className="figma-auth-logo">
              <span className="logo-g">G</span>
              <span className="logo-star">★</span>
              <span className="logo-closerz">Closerz</span>
            </Link>
          </div>
        </header>
        <div className="figma-cart-body" style={{ textAlign: 'center', paddingTop: 80 }}>
          <p className="figma-cart-empty-text">Keranjang Anda masih kosong.</p>
          <Link
            to="/landing"
            className="figma-btn-checkout"
            style={{ textDecoration: 'none', display: 'inline-flex', marginTop: 16 }}
          >
            ← Kembali ke Katalog
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="figma-cart-page" data-name="checkout">
      {/* Header */}
      <header className="figma-auth-header">
        <div className="figma-auth-header-left">
          <button
            type="button"
            className="figma-btn-back"
            onClick={() => navigate('/keranjang-figma')}
          >
            Back
          </button>
          <Link to="/landing" className="figma-auth-logo">
            <span className="logo-g">G</span>
            <span className="logo-star">★</span>
            <span className="logo-closerz">Closerz</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="figma-cart-body">
        {isSubmitted ? (
          /* ─────────────────────────────────────────────────────────────
             TAMPILAN ORDERAN BERHASIL & KONFIRMASI KE LINE ADMIN
             ───────────────────────────────────────────────────────────── */
          <div
            className="figma-cart-filled-wrap"
            style={{
              textAlign: 'center',
              padding: '44px 32px',
              maxWidth: 740,
              background: 'rgba(32, 20, 62, 0.7)',
              border: '1.5px solid rgba(241, 230, 248, 0.35)',
              borderRadius: 24,
              backdropFilter: 'blur(16px)',
              color: '#ffffff',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Ikon Sukses (SVG Vector, No Emoji) */}
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'rgba(6, 199, 85, 0.2)',
                border: '2px solid #06c755',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                boxShadow: '0 0 30px rgba(6, 199, 85, 0.4)',
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#06c755"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ width: 36, height: 36 }}
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <div style={{ marginBottom: 8 }}>
              <span
                style={{
                  display: 'inline-block',
                  background: 'rgba(6, 199, 85, 0.2)',
                  color: '#06c755',
                  border: '1px solid #06c755',
                  fontFamily: 'Unbounded, sans-serif',
                  fontWeight: 800,
                  fontSize: 11,
                  padding: '4px 14px',
                  borderRadius: 999,
                  letterSpacing: '0.05em',
                  marginBottom: 10,
                }}
              >
                ORDERAN BERHASIL DIBUAT
              </span>
            </div>

            <h1
              style={{
                fontFamily: 'Unbounded, sans-serif',
                fontSize: 24,
                color: '#ffffff',
                margin: '0 0 8px 0',
              }}
            >
              Checkout {completedCheckoutLabel} Berhasil!
            </h1>

            {completedCheckoutSummary && (
              <div
                style={{
                  display: 'inline-block',
                  background: 'rgba(125, 200, 255, 0.15)',
                  color: '#7dc8ff',
                  border: '1px solid rgba(125, 200, 255, 0.4)',
                  fontSize: 13,
                  fontWeight: 700,
                  padding: '4px 14px',
                  borderRadius: 999,
                  marginBottom: 14,
                }}
              >
                {completedCheckoutSummary}
              </div>
            )}

            <p style={{ color: '#d1dcfa', fontSize: 15, margin: '0 0 16px 0' }}>
              Kode Pesanan: <strong style={{ color: '#7dc8ff', fontSize: 17 }}>{orderCode}</strong>
            </p>

            <p style={{ color: '#c7dde9', fontSize: 14, maxWidth: 540, margin: '0 auto 24px', lineHeight: 1.6 }}>
              Pesanan kartu Anda telah berhasil dibuat. Silakan klik tombol di bawah untuk <strong>konfirmasi ke LINE Admin</strong> agar slot kartu diverifikasi dan info pembayaran diberikan.
            </p>

            {/* Tombol Utama: Konfirmasi ke LINE Admin di Tampilan Orderan Berhasil */}
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
              <button
                type="button"
                onClick={handleConfirmToLine}
                style={{
                  background: '#06c755',
                  color: '#ffffff',
                  fontFamily: 'Unbounded, sans-serif',
                  fontWeight: 800,
                  fontSize: 14,
                  padding: '14px 28px',
                  borderRadius: 999,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  boxShadow: '0 8px 24px rgba(6, 199, 85, 0.45)',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>Konfirmasi ke LINE Admin</span>
              </button>

              <button
                type="button"
                onClick={handleCopyMessage}
                style={{
                  background: copied ? 'rgba(52, 211, 153, 0.25)' : 'rgba(125, 200, 255, 0.15)',
                  color: copied ? '#34d399' : '#7dc8ff',
                  border: `1.5px solid ${copied ? '#34d399' : '#7dc8ff'}`,
                  fontFamily: 'Figtree, sans-serif',
                  fontWeight: 700,
                  fontSize: 14,
                  padding: '14px 22px',
                  borderRadius: 999,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.2s ease',
                }}
              >
                <span>{copied ? 'Format Pesanan Tersalin!' : 'Salin Format Pesanan'}</span>
              </button>
            </div>

            {/* Rincian item kartu yang berhasil di-checkout (disertai foto member) */}
            <div
              style={{
                background: 'rgba(16, 10, 36, 0.8)',
                border: '1px solid rgba(125, 200, 255, 0.25)',
                borderRadius: 18,
                padding: '20px 22px',
                textAlign: 'left',
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 13,
                  color: '#7dc8ff',
                  marginBottom: 14,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>Daftar Photocard ({completedOrderItems.length} Kartu):</span>
                <span style={{ fontSize: 11, color: '#9cb8dd', fontWeight: 600 }}>
                  Penerima: {form.name} ({form.phone})
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {completedOrderItems.map((item) => {
                  const itemImg = getCardImage(item)
                  return (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        paddingBottom: 10,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div
                          style={{
                            width: 48,
                            height: 66,
                            borderRadius: 8,
                            overflow: 'hidden',
                            background: '#2b1e79',
                            border: '1px solid rgba(125, 200, 255, 0.3)',
                            flexShrink: 0,
                          }}
                        >
                          {itemImg ? (
                            <img
                              src={itemImg}
                              alt={item.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 12,
                                fontWeight: 800,
                                color: '#7dc8ff',
                              }}
                            >
                              {item.name.slice(0, 2)}
                            </div>
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 15, color: '#ffffff' }}>
                            {item.name} · <span style={{ color: '#7dc8ff' }}>{item.group}</span>
                          </div>
                          <div style={{ fontSize: 12, color: '#c7dde9', marginTop: 2 }}>
                            <span
                              style={{
                                color: item.status === 'Pre-Order' ? '#d7b8ff' : '#34d399',
                                fontWeight: 700,
                              }}
                            >
                              {item.status || 'Ready Stock'}
                            </span>{' '}
                            · {item.qty} pcs
                          </div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: '#ffffff' }}>
                        {formatRupiah((item.price || 0) * (item.qty || 1))}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 14,
                  paddingTop: 8,
                  fontSize: 14,
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <span style={{ color: '#c7dde9' }}>Total Pembayaran:</span>
                <span style={{ fontWeight: 900, color: '#7dc8ff', fontSize: 18 }}>
                  {formatRupiah(completedTotals.grandTotal)}
                </span>
              </div>
            </div>

            <Link
              to="/landing"
              style={{
                color: '#7dc8ff',
                fontWeight: 700,
                fontSize: 14,
                textDecoration: 'none',
              }}
            >
              ← Kembali ke Beranda Katalog
            </Link>
          </div>
        ) : (
          /* ─────────────────────────────────────────────────────────────
             FORMULIR CHECKOUT KARTU
             ───────────────────────────────────────────────────────────── */
          <div
            className="figma-cart-filled-wrap"
            style={{
              maxWidth: 820,
              background: 'rgba(32, 20, 62, 0.65)',
              border: '1.5px solid rgba(241, 230, 248, 0.3)',
              borderRadius: 24,
              backdropFilter: 'blur(16px)',
              padding: '32px 36px',
              color: '#ffffff',
            }}
          >
            {/* Header Checkout Dinamis: Checkout Ready Stock / Checkout Pre-Order / Checkout Ready Stock & Pre-Order */}
            <div style={{ marginBottom: 24, borderBottom: '1px solid rgba(255, 255, 255, 0.1)', pb: 16 }}>
              <div
                style={{
                  display: 'inline-block',
                  background:
                    readyStockCount > 0 && preOrderCount > 0
                      ? 'rgba(215, 184, 255, 0.2)'
                      : preOrderCount > 0
                        ? 'rgba(215, 184, 255, 0.2)'
                        : 'rgba(125, 200, 255, 0.2)',
                  color:
                    readyStockCount > 0 && preOrderCount > 0
                      ? '#d7b8ff'
                      : preOrderCount > 0
                        ? '#d7b8ff'
                        : '#7dc8ff',
                  border: `1px solid ${readyStockCount > 0 && preOrderCount > 0
                    ? '#d7b8ff'
                    : preOrderCount > 0
                      ? '#d7b8ff'
                      : '#7dc8ff'
                    }`,
                  fontFamily: 'Unbounded, sans-serif',
                  fontWeight: 800,
                  fontSize: 11,
                  padding: '3px 12px',
                  borderRadius: 999,
                  letterSpacing: '0.05em',
                  marginBottom: 8,
                }}
              >
                STATUS PEMBELIAN: {checkoutTypeLabel.toUpperCase()}
              </div>
              <h1
                style={{
                  fontFamily: 'Unbounded, sans-serif',
                  fontSize: 24,
                  color: '#ffffff',
                  margin: '4px 0 6px 0',
                }}
              >
                Checkout {checkoutTypeLabel} ({totalItemCount} Kartu)
              </h1>
              <p style={{ color: '#7dc8ff', fontSize: 14, fontWeight: 700, margin: '4px 0 6px 0' }}>
                Rincian Pesanan: {checkoutSubtitle}
              </p>
              <p style={{ color: '#9cb8dd', fontSize: 13, margin: 0 }}>
                Setelah mengisi data pengiriman, pesanan akan diproses dan tombol konfirmasi ke LINE Admin akan tersedia di tampilan orderan berhasil.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Form Data Pengiriman */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#d1dcfa', marginBottom: 6 }}>
                    Nama Lengkap Pembeli *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Contoh: Gibran Rakabuming"
                    value={form.name}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      height: 48,
                      borderRadius: 12,
                      border: '1px solid rgba(125, 200, 255, 0.3)',
                      background: 'rgba(10, 8, 24, 0.7)',
                      color: '#ffffff',
                      padding: '0 16px',
                      fontSize: 15,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#d1dcfa', marginBottom: 6 }}>
                    Nomor WhatsApp / HP *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    placeholder="Contoh: 081234567890"
                    value={form.phone}
                    onChange={handleChange}
                    onKeyDown={(e) => {
                      // Hanya izinkan angka 0-9, backspace, delete, tab, enter, dan panah navigasi
                      if (
                        !/^[0-9]$/.test(e.key) &&
                        !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(e.key) &&
                        !e.ctrlKey &&
                        !e.metaKey
                      ) {
                        e.preventDefault()
                      }
                    }}
                    style={{
                      width: '100%',
                      height: 48,
                      borderRadius: 12,
                      border: '1px solid rgba(125, 200, 255, 0.3)',
                      background: 'rgba(10, 8, 24, 0.7)',
                      color: '#ffffff',
                      padding: '0 16px',
                      fontSize: 15,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#d1dcfa', marginBottom: 6 }}>
                  Alamat Lengkap Pengiriman *
                </label>
                <textarea
                  name="address"
                  required
                  rows={3}
                  placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
                  value={form.address}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    borderRadius: 12,
                    border: '1px solid rgba(125, 200, 255, 0.3)',
                    background: 'rgba(10, 8, 24, 0.7)',
                    color: '#ffffff',
                    padding: 14,
                    fontSize: 15,
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#d1dcfa', marginBottom: 6 }}>
                    Kota / Kabupaten
                  </label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Contoh: Jakarta Selatan"
                    value={form.city}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      height: 48,
                      borderRadius: 12,
                      border: '1px solid rgba(125, 200, 255, 0.3)',
                      background: 'rgba(10, 8, 24, 0.7)',
                      color: '#ffffff',
                      padding: '0 16px',
                      fontSize: 15,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#d1dcfa', marginBottom: 6 }}>
                    Catatan Pesanan (Opsional)
                  </label>
                  <input
                    type="text"
                    name="notes"
                    placeholder="Contoh: Toploader tambahan / packing kado"
                    value={form.notes}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      height: 48,
                      borderRadius: 12,
                      border: '1px solid rgba(125, 200, 255, 0.3)',
                      background: 'rgba(10, 8, 24, 0.7)',
                      color: '#ffffff',
                      padding: '0 16px',
                      fontSize: 15,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Pilihan Pembayaran DP 50% vs Lunas */}
              <div style={{ marginTop: 4 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#d1dcfa', marginBottom: 8 }}>
                  Skema Pembayaran
                </label>
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '12px 20px',
                      borderRadius: 12,
                      border:
                        form.paymentOption === 'dp50'
                          ? '2px solid #7dc8ff'
                          : '1px solid rgba(125, 200, 255, 0.25)',
                      background:
                        form.paymentOption === 'dp50'
                          ? 'rgba(125, 200, 255, 0.18)'
                          : 'rgba(10, 8, 24, 0.5)',
                      color: '#ffffff',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentOption"
                      value="dp50"
                      checked={form.paymentOption === 'dp50'}
                      onChange={handleChange}
                    />
                    <span>DP 50% ({formatRupiah(dpAmount)})</span>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '12px 20px',
                      borderRadius: 12,
                      border:
                        form.paymentOption === 'full'
                          ? '2px solid #7dc8ff'
                          : '1px solid rgba(125, 200, 255, 0.25)',
                      background:
                        form.paymentOption === 'full'
                          ? 'rgba(125, 200, 255, 0.18)'
                          : 'rgba(10, 8, 24, 0.5)',
                      color: '#ffffff',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentOption"
                      value="full"
                      checked={form.paymentOption === 'full'}
                      onChange={handleChange}
                    />
                    <span>Bayar Penuh ({formatRupiah(grandTotal)})</span>
                  </label>
                </div>
              </div>

              {/* Rincian Item Kartu (Foto + Status) */}
              <div
                style={{
                  background: 'rgba(12, 8, 28, 0.7)',
                  borderRadius: 16,
                  padding: 16,
                  border: '1px solid rgba(125, 200, 255, 0.2)',
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 13, color: '#7dc8ff', marginBottom: 10 }}>
                  Kartu yang Dipesan ({cart.length} item):
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {cart.map((item) => {
                    const itemImg = getCardImage(item)
                    return (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            style={{
                              width: 44,
                              height: 60,
                              borderRadius: 8,
                              overflow: 'hidden',
                              background: '#1e1544',
                              flexShrink: 0,
                            }}
                          >
                            {itemImg ? (
                              <img
                                src={itemImg}
                                alt={item.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 11,
                                  fontWeight: 800,
                                  color: '#7dc8ff',
                                }}
                              >
                                {item.name.slice(0, 2)}
                              </div>
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 14 }}>
                              {item.name} · <span style={{ color: '#7dc8ff' }}>{item.group}</span>
                            </div>
                            <div style={{ fontSize: 12, color: '#9cb8dd' }}>
                              <span
                                style={{
                                  color: item.status === 'Pre-Order' ? '#d7b8ff' : '#34d399',
                                  fontWeight: 700,
                                }}
                              >
                                {item.status || 'Ready Stock'}
                              </span>{' '}
                              · {item.qty} pcs
                            </div>
                          </div>
                        </div>
                        <div style={{ fontWeight: 800, fontSize: 14 }}>
                          {formatRupiah((item.price || 0) * (item.qty || 1))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Rincian Biaya */}
              <div
                style={{
                  background: 'rgba(12, 8, 28, 0.7)',
                  borderRadius: 16,
                  padding: 18,
                  border: '1px solid rgba(125, 200, 255, 0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  fontSize: 14,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d1dcfa' }}>
                  <span>
                    Subtotal Photocard ({totalItemCount} kartu: {readyStockCount > 0 ? `${readyStockCount} Ready` : ''}{readyStockCount > 0 && preOrderCount > 0 ? ' · ' : ''}{preOrderCount > 0 ? `${preOrderCount} PO` : ''}):
                  </span>
                  <strong>{formatRupiah(subtotal)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d1dcfa' }}>
                  <span>Ongkos Kirim Flat:</span>
                  <strong>{ongkir === 0 ? 'GRATIS' : formatRupiah(ongkir)}</strong>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    paddingTop: 10,
                    fontSize: 16,
                  }}
                >
                  <span style={{ fontWeight: 700 }}>Total:</span>
                  <strong style={{ color: '#7dc8ff', fontSize: 19 }}>{formatRupiah(toPayNow)}</strong>
                </div>
              </div>

              {/* Tombol Selesaikan Pesanan */}
              <div style={{ marginTop: 8 }}>
                <button
                  type="submit"
                  className="figma-btn-checkout"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    background: '#7dc8ff',
                    color: '#180a33',
                    border: 'none',
                    fontSize: 16,
                    padding: '16px',
                    boxShadow: '0 8px 24px rgba(125, 200, 255, 0.35)',
                  }}
                >
                  {readyStockCount > 0 && preOrderCount > 0
                    ? `Konfirmasi Checkout Ready Stock (${readyStockCount}) & Pre-Order (${preOrderCount}) →`
                    : preOrderCount > 0
                      ? `Konfirmasi Checkout Pre-Order (${preOrderCount} Kartu) →`
                      : `Konfirmasi Checkout Ready Stock (${readyStockCount} Kartu) →`}
                </button>
                <div
                  style={{
                    textAlign: 'center',
                    fontSize: 12,
                    color: '#9cb8dd',
                    marginTop: 8,
                  }}
                >
                  Slot kartu akan berkurang secara otomatis dan konfirmasi ke LINE Admin dapat dilakukan di tampilan orderan berhasil.
                </div>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
