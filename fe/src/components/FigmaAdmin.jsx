import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import './FigmaAdmin.css'

export default function FigmaAdmin() {
  const navigate = useNavigate()
  const {
    user,
    logout,
    groups,
    catalogCards,
    getCardSlot,
    updateCard,
    reorderCards,
    addGroup,
    deleteGroup,
    addCard,
    deleteCard,
    resetToDefault,
    ADMIN_CREDENTIALS,
  } = useApp()

  // Sesi Login Admin (Autentikasi Email & Password Khusus)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return sessionStorage.getItem('closerz_admin_logged_in') === 'true' || user?.role === 'admin'
  })

  useEffect(() => {
    if (sessionStorage.getItem('closerz_admin_logged_in') === 'true' || user?.role === 'admin') {
      setIsAdminLoggedIn(true)
    }
  }, [user])

  const handleReturnToWebsite = () => {
    navigate('/landing')
  }

  const handleAdminLogout = () => {
    sessionStorage.removeItem('closerz_admin_logged_in')
    setIsAdminLoggedIn(false)
    logout()
    navigate('/login-figma')
  }

  // State Form Tambah Grup
  const [groupName, setGroupName] = useState('')
  const [groupFullName, setGroupFullName] = useState('')

  // State Form Tambah Photocard
  const [selectedGroup, setSelectedGroup] = useState('CYE')
  const [memberName, setMemberName] = useState('')
  const [edition, setEdition] = useState('')
  const [cardStatus, setCardStatus] = useState('Ready Stock') // 'Ready Stock' | 'Pre-Order'
  const [slots, setSlots] = useState('10')
  const [price, setPrice] = useState('18000')
  const [imageUrl, setImageUrl] = useState('')
  const [imagePreview, setImagePreview] = useState(null)

  // State Edit Modal Khusus
  const [editingCard, setEditingCard] = useState(null)
  const [editStatus, setEditStatus] = useState('Ready Stock')
  const [editSlots, setEditSlots] = useState(10)
  const [editPrice, setEditPrice] = useState(18000)
  const [editEdition, setEditEdition] = useState('')

  // Reordering (Hold & Geser / Drag & Drop) State
  const dragItem = useRef(null)
  const dragOverItem = useRef(null)
  const [isDraggingIdx, setIsDraggingIdx] = useState(null)
  const [dragOverIdx, setDragOverIdx] = useState(null)

  const handleDragStart = (e, index) => {
    dragItem.current = index
    setIsDraggingIdx(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }

  const handleDragEnter = (e, index) => {
    dragOverItem.current = index
    setDragOverIdx(index)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, targetIndex) => {
    e.preventDefault()
    const sourceIndex = dragItem.current
    if (sourceIndex === null || sourceIndex === undefined || sourceIndex === targetIndex) {
      setIsDraggingIdx(null)
      setDragOverIdx(null)
      return
    }

    const nextCards = [...catalogCards]
    const [movedCard] = nextCards.splice(sourceIndex, 1)
    nextCards.splice(targetIndex, 0, movedCard)

    reorderCards(nextCards)
    setIsDraggingIdx(null)
    setDragOverIdx(null)
    dragItem.current = null
    dragOverItem.current = null
  }

  const handleDragEnd = () => {
    setIsDraggingIdx(null)
    setDragOverIdx(null)
    dragItem.current = null
    dragOverItem.current = null
  }

  const handleMoveUp = (index) => {
    if (index <= 0) return
    const nextCards = [...catalogCards]
    const [moved] = nextCards.splice(index, 1)
    nextCards.splice(index - 1, 0, moved)
    reorderCards(nextCards)
  }

  const handleMoveDown = (index) => {
    if (index >= catalogCards.length - 1) return
    const nextCards = [...catalogCards]
    const [moved] = nextCards.splice(index, 1)
    nextCards.splice(index + 1, 0, moved)
    reorderCards(nextCards)
  }

  // Open & Close Edit Modal
  const handleOpenEdit = (card) => {
    const currentSlots = getCardSlot(card.id)
    setEditingCard(card)
    setEditStatus(card.status || 'Ready Stock')
    setEditSlots(currentSlots)
    setEditPrice(card.price || 18000)
    setEditEdition(card.edition || '')
  }

  const handleCloseEdit = () => {
    setEditingCard(null)
  }

  const handleSaveEdit = (e) => {
    e.preventDefault()
    if (!editingCard) return

    updateCard(editingCard.id, {
      status: editStatus,
      slots: Math.max(0, parseInt(editSlots, 10) || 0),
      price: Math.max(1000, parseInt(editPrice, 10) || 1000),
      edition: editEdition.trim() || editingCard.edition,
    })

    setEditingCard(null)
  }

  const handleAdjustEditSlot = (delta) => {
    setEditSlots((prev) => Math.max(0, Number(prev) + delta))
  }

  const fileInputRef = useRef(null)

  // Handle upload file foto lokal
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result)
        setImageUrl(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Submit Tambah Grup Baru
  const handleAddGroupSubmit = (e) => {
    e.preventDefault()
    if (!groupName.trim()) {
      alert('Nama grup tidak boleh kosong!')
      return
    }
    const success = addGroup({
      name: groupName.trim(),
      fullName: groupFullName.trim() || groupName.trim(),
    })
    if (success) {
      setGroupName('')
      setGroupFullName('')
    }
  }

  // Submit Tambah Photocard Baru dengan panel status Ready Stock / Pre-Order
  const handleAddCardSubmit = (e) => {
    e.preventDefault()
    if (!memberName.trim()) {
      alert('Nama member tidak boleh kosong!')
      return
    }
    if (!selectedGroup) {
      alert('Pilih grup terlebih dahulu!')
      return
    }

    const parsedSlots = parseInt(slots, 10) || 10
    const parsedPrice = parseInt(price, 10) || 18000

    const success = addCard({
      name: memberName.trim(),
      group: selectedGroup,
      edition: edition.trim() || 'Photocard Album Ver. A',
      status: cardStatus,
      slots: parsedSlots,
      stock: parsedSlots,
      price: parsedPrice,
      image: imageUrl || imagePreview || null,
    })

    if (success) {
      setMemberName('')
      setEdition('')
      setSlots('10')
      setPrice('18000')
      setImageUrl('')
      setImagePreview(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // ── GATE AUTENTIKASI ADMIN ──
  if (!isAdminLoggedIn) {
    return (
      <div className="figma-admin-page">
        <header className="figma-admin-header">
          <div className="figma-admin-header-inner">
            <div className="figma-admin-brand">
              <Link to="/landing" className="figma-admin-logo">
                <span className="logo-brand">Closerz</span>
                <span className="logo-panel-tag">Admin</span>
              </Link>
            </div>
            <div className="figma-admin-nav-actions">
              <button
                type="button"
                className="figma-admin-btn-back"
                onClick={handleReturnToWebsite}
              >
                <span className="btn-text-full">← Kembali ke Website</span>
                <span className="btn-text-short">← Ke Website</span>
              </button>
            </div>
          </div>
        </header>

        <main className="figma-admin-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '65vh' }}>
          <div className="figma-admin-card admin-gate-card">
            <div className="admin-gate-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>

            <h2 className="admin-gate-title">
              Akses Khusus Admin
            </h2>
            <p className="admin-gate-desc">
              Halaman ini hanya dapat diakses dengan akun email dan password khusus admin. Silakan login terlebih dahulu untuk melanjutkan:
            </p>

            <div className="admin-gate-credentials">
              <div className="cred-label">Akun Email Khusus Admin:</div>
              <div className="cred-val">{ADMIN_CREDENTIALS?.email || 'admin@closerz.com'}</div>
            </div>

            <div className="admin-gate-actions">
              <button
                type="button"
                className="figma-admin-btn-secondary"
                onClick={handleReturnToWebsite}
              >
                Kembali
              </button>
              <button
                type="button"
                className="figma-admin-btn-primary"
                onClick={() => navigate('/login-figma')}
              >
                Ke Halaman Login
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="figma-admin-page">
      {/* ── TOP HEADER ── */}
      <header className="figma-admin-header">
        <div className="figma-admin-header-inner">
          <div className="figma-admin-brand">
            <Link to="/landing" className="figma-admin-logo">
              <span className="logo-brand">Closerz</span>
              <span className="logo-panel-tag">Admin</span>
            </Link>
          </div>

          <div className="figma-admin-nav-actions">
            <button
              type="button"
              className="figma-admin-btn-back"
              onClick={handleReturnToWebsite}
              title="Kembali melihat tampilan katalog website"
            >
              <span className="btn-text-full">← Kembali ke Website</span>
              <span className="btn-text-short">← Ke Website</span>
            </button>
            <button
              type="button"
              className="figma-admin-btn-logout"
              onClick={handleAdminLogout}
              title="Logout dari akun admin"
            >
              Logout Admin
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="figma-admin-container">
        {/* Header Ringkasan Halaman */}
        <section className="figma-admin-summary">
          <div className="summary-text-block">
            <h1 className="figma-admin-title">Katalog & Manajemen Photocard</h1>
            <p className="figma-admin-subtitle">
              Kelola grup, urutan posisi kartu, status ketersediaan, serta jumlah kuota slot photocard.
            </p>
          </div>
          <div className="figma-admin-stats">
            <div className="stat-pill">
              <span className="stat-val">{groups.length}</span>
              <span className="stat-label">Grup Aktif</span>
            </div>
            <div className="stat-pill">
              <span className="stat-val">{catalogCards.length}</span>
              <span className="stat-label">Total Photocard</span>
            </div>
          </div>
        </section>

        <div className="figma-admin-grid">
          {/* ── KOLOM KIRI: FORM INPUT ── */}
          <div className="figma-admin-forms-col">
            {/* 1. Form Tambah Grup Baru */}
            <div className="figma-admin-panel">
              <h2 className="panel-title">Tambah Grup</h2>
              <p className="panel-desc">
                Tambahkan grup baru (misal: RIIZE, TXT, SEVENTEEN). Tab tombol filter akan otomatis bertambah di katalog depan.
              </p>

              <form onSubmit={handleAddGroupSubmit} className="figma-admin-form">
                <div className="form-group">
                  <label htmlFor="groupName">Kode / Nama Singkat Grup *</label>
                  <input
                    id="groupName"
                    type="text"
                    placeholder="Contoh: RIIZE"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="groupFullName">Nama Lengkap Grup (Opsional)</label>
                  <input
                    id="groupFullName"
                    type="text"
                    placeholder="Contoh: RIIZE SM Entertainment"
                    value={groupFullName}
                    onChange={(e) => setGroupFullName(e.target.value)}
                  />
                </div>

                <button type="submit" className="figma-admin-submit-btn">
                  Tambah Grup
                </button>
              </form>

              {/* Daftar Grup Saat Ini */}
              <div className="current-groups-list">
                <div className="current-groups-title">Daftar Grup Aktif ({groups.length}):</div>
                <div className="group-chips">
                  {groups.map((g) => (
                    <div key={g.name} className="group-chip-item">
                      <span className="chip-name">{g.name}</span>
                      {g.name !== 'CYE' ? (
                        <button
                          type="button"
                          className="chip-del-btn"
                          onClick={() => {
                            if (window.confirm(`Hapus grup ${g.name} beserta semua kartunya?`)) {
                              deleteGroup(g.name)
                            }
                          }}
                          title={`Hapus grup ${g.name}`}
                        >
                          ✕
                        </button>
                      ) : (
                        <span className="chip-badge-default">Default CYE</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Form Tambah Photocard Baru dengan Panel Penentuan Status */}
            <div className="figma-admin-panel">
              <h2 className="panel-title">Tambah Photocard</h2>
              <p className="panel-desc">
                Pilih grup dan tentukan status kartu: <strong>Ready Stock</strong> (dengan sisa slot) atau <strong>Pre-Order</strong>.
              </p>

              <form onSubmit={handleAddCardSubmit} className="figma-admin-form">
                {/* Panel Penentuan Status: Ready Stock vs Pre-Order */}
                <div className="form-group">
                  <label>Status Pembelian Kartu *</label>
                  <div className="status-selector-row">
                    <label
                      className={`status-option ${cardStatus === 'Ready Stock' ? 'is-selected is-ready' : ''}`}
                    >
                      <input
                        type="radio"
                        name="cardStatus"
                        value="Ready Stock"
                        checked={cardStatus === 'Ready Stock'}
                        onChange={(e) => setCardStatus(e.target.value)}
                      />
                      <span>Ready Stock</span>
                    </label>

                    <label
                      className={`status-option ${cardStatus === 'Pre-Order' ? 'is-selected is-po' : ''}`}
                    >
                      <input
                        type="radio"
                        name="cardStatus"
                        value="Pre-Order"
                        checked={cardStatus === 'Pre-Order'}
                        onChange={(e) => setCardStatus(e.target.value)}
                      />
                      <span>Pre-Order</span>
                    </label>
                  </div>
                  <div className="status-helper-text">
                    {cardStatus === 'Ready Stock'
                      ? 'Di katalog akan tampil teks "Sisa X slot".'
                      : 'Di katalog hanya akan tampil "Pre-Order" tanpa teks "sisa slot".'}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="cardGroup">Pilih Grup *</label>
                  <select
                    id="cardGroup"
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    required
                  >
                    {groups.map((g) => (
                      <option key={g.name} value={g.name}>
                        {g.name} {g.fullName && g.fullName !== g.name ? `(${g.fullName})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="memberName">Nama Member *</label>
                  <input
                    id="memberName"
                    type="text"
                    placeholder="Contoh: SUNGMIN"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cardEdition">Nama Edisi / Versi Album</label>
                  <input
                    id="cardEdition"
                    type="text"
                    placeholder="Contoh: Photocard Album Ver. A (ETERNAL...)"
                    value={edition}
                    onChange={(e) => setEdition(e.target.value)}
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="cardSlots">
                      {cardStatus === 'Ready Stock' ? 'Sisa Slot Kartu' : 'Kuota Slot PO'}
                    </label>
                    <input
                      id="cardSlots"
                      type="number"
                      min="1"
                      value={slots}
                      onChange={(e) => setSlots(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cardPrice">Harga (Rp) *</label>
                    <input
                      id="cardPrice"
                      type="number"
                      step="1000"
                      min="1000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Foto Member Photocard</label>
                  <div className="photo-input-options">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="photo-file-input"
                    />
                    <input
                      type="url"
                      placeholder="Atau tempel link URL foto (https://...)"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value)
                        setImagePreview(e.target.value)
                      }}
                      className="photo-url-input"
                    />
                  </div>
                  {imagePreview && (
                    <div className="photo-preview-box">
                      <img src={imagePreview} alt="Preview" />
                      <span>Preview Foto Siap Simpan</span>
                    </div>
                  )}
                </div>

                <button type="submit" className="figma-admin-submit-btn">
                  Simpan Photocard
                </button>
              </form>
            </div>
          </div>

          {/* ── KOLOM KANAN: DAFTAR KARTU, REORDER & EDIT SLOT/STATUS ── */}
          <div className="figma-admin-list-col">
            <div className="figma-admin-panel">
              <div className="panel-header-actions">
                <div>
                  <h2 className="panel-title">Daftar Photocard ({catalogCards.length})</h2>
                  <p className="panel-desc">
                    Geser kartu atau gunakan tombol panah untuk mengubah urutan di katalog. Klik <strong>Edit</strong> untuk mengubah status stok dan kuota slot.
                  </p>
                </div>
                <button
                  type="button"
                  className="figma-admin-reset-btn"
                  onClick={() => {
                    if (window.confirm('Reset semua grup dan photocard kembali ke 7 member default Close Your Eyes (CYE)?')) {
                      resetToDefault()
                    }
                  }}
                  title="Kembalikan data ke awal default CYE"
                >
                  Reset Default CYE
                </button>
              </div>

              {/* Grid Daftar Kartu dengan Reordering */}
              <div className="admin-cards-list">
                {catalogCards.map((card, index) => {
                  const currentSlots = getCardSlot(card.id)
                  const isReady = card.status === 'Ready Stock'
                  const isDragging = isDraggingIdx === index
                  const isDragOver = dragOverIdx === index

                  return (
                    <div
                      key={card.id}
                      className={`admin-card-row ${isDragging ? 'is-dragging' : ''} ${isDragOver ? 'is-drag-over' : ''}`}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragEnter={(e) => handleDragEnter(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                    >
                      {/* Kontrol Drag & Drop Handle serta Tombol Geser Naik/Turun */}
                      <div className="admin-reorder-col">
                        <div
                          className="admin-drag-handle"
                          title="Hold dan geser ke atas/bawah untuk memindahkan urutan posisi kartu"
                          aria-label="Hold dan geser urutan kartu"
                        >
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                            <circle cx="8" cy="5" r="1.5" />
                            <circle cx="16" cy="5" r="1.5" />
                            <circle cx="8" cy="12" r="1.5" />
                            <circle cx="16" cy="12" r="1.5" />
                            <circle cx="8" cy="19" r="1.5" />
                            <circle cx="16" cy="19" r="1.5" />
                          </svg>
                          <span className="reorder-badge-pos">#{index + 1}</span>
                        </div>

                        {/* Tombol Cepat Geser Naik / Turun */}
                        <div className="admin-reorder-steppers">
                          <button
                            type="button"
                            className="admin-step-btn"
                            disabled={index === 0}
                            onClick={() => handleMoveUp(index)}
                            title="Geser posisi 1 tingkat ke atas"
                            aria-label="Geser ke atas"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            className="admin-step-btn"
                            disabled={index === catalogCards.length - 1}
                            onClick={() => handleMoveDown(index)}
                            title="Geser posisi 1 tingkat ke bawah"
                            aria-label="Geser ke bawah"
                          >
                            ▼
                          </button>
                        </div>
                      </div>

                      {/* Thumbnail Foto */}
                      <div className="admin-card-thumb">
                        {card.image ? (
                          <img src={card.image} alt={card.name} />
                        ) : (
                          <div className="admin-card-placeholder">
                            {card.name.slice(0, 2)}
                          </div>
                        )}
                      </div>

                      {/* Info Detail */}
                      <div className="admin-card-info">
                        <div className="admin-card-title">
                          <span className="name">{card.name}</span>
                          <span className="group-badge">{card.group}</span>
                          <span className={`admin-status-badge ${isReady ? 'is-ready' : 'is-po'}`}>
                            {card.status || 'Ready Stock'}
                          </span>
                        </div>
                        <div className="admin-card-edition">{card.edition}</div>

                        {/* Rincian Harga & Slot */}
                        <div className="admin-card-meta">
                          <span className="price-tag">
                            <strong>Harga:</strong> Rp{(card.price || 0).toLocaleString('id-ID')}
                          </span>
                          <span className="dot">•</span>
                          <span className="slot-tag">
                            <strong>Slot:</strong> {currentSlots} slot
                          </span>
                        </div>
                      </div>

                      {/* Aksi: Edit & Hapus Kartu */}
                      <div className="admin-card-actions">
                        <button
                          type="button"
                          className="admin-edit-btn"
                          onClick={() => handleOpenEdit(card)}
                          title="Edit status kartu dan tambah/kurangkan slot"
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          className="admin-delete-btn"
                          onClick={() => {
                            if (window.confirm(`Hapus photocard ${card.name} (${card.group})?`)) {
                              deleteCard(card.id)
                            }
                          }}
                          title="Hapus Photocard"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── MODAL EDIT STATUS & SLOT PHOTOCARD ── */}
      {editingCard && (
        <div className="admin-modal-overlay" onClick={handleCloseEdit}>
          <div className="admin-edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-edit-modal-header">
              <div>
                <span className="admin-modal-badge">{editingCard.group}</span>
                <h3 className="admin-modal-title">Edit Photocard: {editingCard.name}</h3>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={handleCloseEdit}
                aria-label="Tutup modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="admin-edit-form">
              {/* 1. Status Kartu: Ready Stock vs Pre-Order */}
              <div className="edit-form-group">
                <label className="edit-form-label">Status Pembelian Kartu *</label>
                <div className="edit-status-toggle-row">
                  <button
                    type="button"
                    className={`edit-status-btn ${editStatus === 'Ready Stock' ? 'is-active is-ready' : ''}`}
                    onClick={() => setEditStatus('Ready Stock')}
                  >
                    Ready Stock (Slot Terbatas)
                  </button>
                  <button
                    type="button"
                    className={`edit-status-btn ${editStatus === 'Pre-Order' ? 'is-active is-po' : ''}`}
                    onClick={() => setEditStatus('Pre-Order')}
                  >
                    Pre-Order (Slot Fleksibel)
                  </button>
                </div>
                <div className="edit-status-desc">
                  {editStatus === 'Ready Stock'
                    ? 'Pengunjung dapat melihat jumlah "Sisa X slot" dan berkurang otomatis saat di-checkout.'
                    : 'Pengunjung melihat label "Pre-Order" tanpa batas kuota slot.'}
                </div>
              </div>

              {/* 2. Pengaturan Slot Kartu (Tambah / Kurangkan) */}
              <div className="edit-form-group">
                <label className="edit-form-label">
                  Jumlah Sisa Slot Kartu {editStatus === 'Pre-Order' ? '(Cadangan saat beralih Ready Stock)' : '*'}
                </label>
                <div className="edit-slot-stepper">
                  <button
                    type="button"
                    className="slot-stepper-btn btn-minus"
                    onClick={() => handleAdjustEditSlot(-1)}
                    title="Kurangi 1 slot"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={editSlots}
                    onChange={(e) => setEditSlots(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="slot-stepper-input"
                  />
                  <button
                    type="button"
                    className="slot-stepper-btn btn-plus"
                    onClick={() => handleAdjustEditSlot(1)}
                    title="Tambah 1 slot"
                  >
                    +
                  </button>
                </div>

                {/* Shortcut Cepat Tambah/Kurang Slot */}
                <div className="edit-slot-shortcuts">
                  <span className="shortcuts-label">Ubah Cepat:</span>
                  <button type="button" onClick={() => handleAdjustEditSlot(-5)} className="slot-pill-btn">-5</button>
                  <button type="button" onClick={() => handleAdjustEditSlot(-1)} className="slot-pill-btn">-1</button>
                  <button type="button" onClick={() => handleAdjustEditSlot(1)} className="slot-pill-btn">+1</button>
                  <button type="button" onClick={() => handleAdjustEditSlot(5)} className="slot-pill-btn">+5</button>
                  <button type="button" onClick={() => handleAdjustEditSlot(10)} className="slot-pill-btn">+10</button>
                </div>
              </div>

              {/* 3. Harga & Edisi Album */}
              <div className="edit-form-row-2">
                <div className="edit-form-group">
                  <label className="edit-form-label">Harga (Rp) *</label>
                  <input
                    type="number"
                    step="1000"
                    min="1000"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="edit-text-input"
                    required
                  />
                </div>
                <div className="edit-form-group">
                  <label className="edit-form-label">Edisi / Versi Album</label>
                  <input
                    type="text"
                    value={editEdition}
                    onChange={(e) => setEditEdition(e.target.value)}
                    placeholder="Contoh: Photocard Album Ver. A"
                    className="edit-text-input"
                  />
                </div>
              </div>

              {/* Actions Modal */}
              <div className="admin-edit-modal-actions">
                <button
                  type="button"
                  className="edit-btn-cancel"
                  onClick={handleCloseEdit}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="edit-btn-save"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
