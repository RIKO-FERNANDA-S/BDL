import { createContext, useContext, useState, useEffect } from 'react'
import { FIGMA_CATALOG_CARDS, DEFAULT_GROUPS } from '../data/figmaCatalog'

const SESSION_KEY = 'closerz_user_session'
const REGISTERED_USERS_KEY = 'closerz_registered_users'
const SLOTS_STORAGE_KEY = 'closerz_card_slots'
const GROUPS_STORAGE_KEY = 'closerz_admin_groups'
const CARDS_STORAGE_KEY = 'closerz_admin_cards'
const ORDERS_STORAGE_KEY = 'closerz_user_orders'

export const ADMIN_CREDENTIALS = {
  email: 'admin@closerz.com',
  password: 'admin412504',
  role: 'admin',
  name: 'Admin Closerz',
}

const getInitialRegisteredUsers = () => {
  try {
    const saved = localStorage.getItem(REGISTERED_USERS_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) return parsed
    }
  } catch { }
  return []
}

const getInitialOrders = () => {
  try {
    const saved = localStorage.getItem(ORDERS_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) return parsed
    }
  } catch { }
  return []
}

const getInitialGroups = () => {
  try {
    const saved = localStorage.getItem(GROUPS_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch { }
  return DEFAULT_GROUPS
}

const getInitialCards = () => {
  try {
    const saved = localStorage.getItem(CARDS_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Sinkronkan status Pre-Order & Ready Stock untuk kartu default CYE
        return parsed.map((c) => {
          const defaultRef = FIGMA_CATALOG_CARDS.find((dc) => dc.id === c.id || dc.name?.toLowerCase() === c.name?.toLowerCase())
          if (defaultRef) {
            return {
              ...c,
              status: defaultRef.status,
              image: defaultRef.image, // Selalu gunakan asset foto member terbaru yang valid
              slots: defaultRef.status === 'Pre-Order' ? 99 : (c.slots !== undefined ? c.slots : defaultRef.slots),
            }
          }
          return c
        })
      }
    }
  } catch { }
  return FIGMA_CATALOG_CARDS
}

const getInitialSlots = (cards) => {
  try {
    const saved = localStorage.getItem(SLOTS_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed && typeof parsed === 'object') {
        const next = { ...parsed }
        // Pastikan kartu Pre-Order slotnya tidak 0
        cards.forEach((c) => {
          if (c.status === 'Pre-Order') {
            next[c.id] = 99
          } else if (next[c.id] === undefined) {
            next[c.id] = c.slots
          }
        })
        return next
      }
    }
  } catch { }
  const initial = {}
  cards.forEach((c) => {
    initial[c.id] = c.slots
  })
  return initial
}

const AppCtx = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY)
      if (saved) return JSON.parse(saved)
    } catch {
      const raw = localStorage.getItem(SESSION_KEY)
      return raw ? { email: raw, name: raw.split('@')[0] } : null
    }
    return null
  })

  // Daftar akun yang sudah pernah sign up
  const [registeredUsers, setRegisteredUsers] = useState(getInitialRegisteredUsers)

  const register = (userData) => {
    const email = (typeof userData === 'string' ? userData : userData.email || '').trim().toLowerCase()
    if (!email) return false
    const name = (userData && userData.name) || email.split('@')[0]
    const password = (userData && userData.password) || ''
    const newUser = { email, name, password, registeredAt: new Date().toISOString() }

    setRegisteredUsers((prev) => {
      const filtered = prev.filter((u) => u.email.toLowerCase() !== email)
      const updated = [...filtered, newUser]
      try {
        localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updated))
      } catch { }
      return updated
    })
    return newUser
  }

  const isEmailRegistered = (email) => {
    if (!email) return false
    const cleanEmail = email.trim().toLowerCase()
    if (cleanEmail === ADMIN_CREDENTIALS.email) return true
    return registeredUsers.some((u) => u.email.toLowerCase() === cleanEmail)
  }

  // Dynamic Groups & Cards for Admin and Catalog
  const [groups, setGroups] = useState(getInitialGroups)
  const [catalogCards, setCatalogCards] = useState(getInitialCards)

  // Cart & Orders
  const [cart, setCart] = useState([])
  const [orders, setOrders] = useState(getInitialOrders)
  const [toast, setToast] = useState(null)
  const [slots, setSlots] = useState(() => getInitialSlots(catalogCards))

  // Sync orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders))
    } catch { }
  }, [orders])

  const addOrder = (orderData) => {
    const newOrder = {
      id: orderData.code || 'GCZ-' + Date.now().toString(36).toUpperCase(),
      createdAt: new Date().toISOString(),
      userEmail: user?.email ? user.email.toLowerCase() : (orderData.email || 'guest').toLowerCase(),
      items: orderData.items || [],
      grandTotal: orderData.grandTotal || 0,
      toPayNow: orderData.toPayNow || 0,
      paymentOption: orderData.paymentOption || 'dp50',
      shippingFee: orderData.shippingFee || 0,
      checkoutTypeLabel: orderData.checkoutTypeLabel || 'Ready Stock',
      checkoutSummary: orderData.checkoutSummary || '',
      recipientName: orderData.recipientName || '',
      phone: orderData.phone || '',
      address: orderData.address || '',
    }

    setOrders((prev) => [newOrder, ...prev])
    return newOrder
  }

  // Riwayat pesanan khusus untuk user yang sedang aktif login
  const userOrders = user?.email
    ? orders.filter((o) => (o.userEmail || '').toLowerCase() === user.email.toLowerCase())
    : []

  // Sync groups to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups))
    } catch { }
  }, [groups])

  // Sync cards to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(catalogCards))
    } catch { }
  }, [catalogCards])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const login = (userData) => {
    const u = typeof userData === 'string' ? { email: userData, name: userData.split('@')[0] } : userData
    localStorage.setItem(SESSION_KEY, JSON.stringify(u))
    setUser(u)
  }

  const logout = () => {
    localStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem('closerz_admin_logged_in')
    setUser(null)
    setCart([])
  }

  const getCardSlot = (cardId) => {
    const found = catalogCards.find((c) => c.id === cardId)
    if (found && found.status === 'Pre-Order') {
      return 99 // Pre-Order selalu bisa dipesan dan tidak pernah slot habis
    }
    if (slots[cardId] !== undefined) return slots[cardId]
    return found ? found.slots : 0
  }

  // Tambah photocard ke keranjang
  const add = (card, qty = 1) => {
    const catalogRef =
      catalogCards.find((c) => c.id === card.id || c.name?.toLowerCase() === card.name?.toLowerCase()) ||
      FIGMA_CATALOG_CARDS.find((dc) => dc.id === card.id || dc.name?.toLowerCase() === card.name?.toLowerCase())

    const trueStatus = card.status || (catalogRef ? catalogRef.status : 'Ready Stock')
    const isPO = trueStatus === 'Pre-Order'
    const availableSlot = getCardSlot(card.id)

    // Untuk Ready Stock, cek ketersediaan slot. Untuk Pre-Order, selalu bisa dipesan!
    if (!isPO && availableSlot <= 0) {
      showToast(`Slot untuk ${card.name} sudah habis!`)
      return false
    }

    const validImage = card.image || (catalogRef ? catalogRef.image : null)

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === card.id)
      if (existingIndex > -1) {
        const next = [...prev]
        const currentQty = next[existingIndex].qty || 1
        const newQty = isPO
          ? currentQty + qty
          : Math.min(availableSlot, currentQty + qty)
        next[existingIndex] = {
          ...next[existingIndex],
          status: trueStatus,
          image: validImage,
          qty: newQty,
        }
        return next
      } else {
        return [
          ...prev,
          {
            ...card,
            status: trueStatus,
            image: validImage,
            type: card.type || card.edition || 'Photocard',
            edition: card.edition || card.type || 'Photocard',
            qty: isPO ? qty : Math.min(availableSlot, qty),
            stock: availableSlot,
          },
        ]
      }
    })

    showToast(`${card.name} (${qty} kartu [${trueStatus}]) berhasil ditambahkan ke keranjang!`)
    return true
  }

  const updateQty = (id, newQty) => {
    if (newQty <= 0) {
      remove(id)
      return
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const isPO = item.status === 'Pre-Order'
          const maxAvailable = getCardSlot(id)
          const limit = isPO ? newQty : Math.min(maxAvailable, newQty)
          return { ...item, qty: limit }
        }
        return item
      })
    )
  }

  const remove = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const clear = () => setCart([])

  const reduceSlots = (orderedItems) => {
    setSlots((prev) => {
      const next = { ...prev }
      orderedItems.forEach((item) => {
        // Pre-Order tidak memiliki batasan sisa slot
        if (item.status === 'Pre-Order') return
        const current = next[item.id] !== undefined ? next[item.id] : (item.slots || 10)
        const qty = item.qty || 1
        next[item.id] = Math.max(0, current - qty)
      })
      try {
        localStorage.setItem(SLOTS_STORAGE_KEY, JSON.stringify(next))
      } catch { }
      return next
    })

    // Update catalogCards juga agar sinkron di dashboard admin
    setCatalogCards((prev) =>
      prev.map((c) => {
        if (c.status === 'Pre-Order') return c
        const boughtItem = orderedItems.find((oi) => oi.id === c.id)
        if (boughtItem) {
          const newSlot = Math.max(0, (c.slots || 10) - (boughtItem.qty || 1))
          return { ...c, slots: newSlot, stock: newSlot }
        }
        return c
      })
    )
  }

  // ── ADMIN ACTIONS ──
  const addGroup = (groupData) => {
    const trimmedName = (groupData.name || '').trim().toUpperCase()
    if (!trimmedName) return false
    const id = trimmedName.toLowerCase().replace(/\s+/g, '-')
    if (groups.some((g) => g.name === trimmedName)) {
      showToast(`Grup ${trimmedName} sudah ada!`)
      return false
    }
    const newGroup = {
      id,
      name: trimmedName,
      fullName: groupData.fullName || trimmedName,
    }
    setGroups((prev) => [...prev, newGroup])
    showToast(`Grup ${trimmedName} berhasil ditambahkan!`)
    return true
  }

  const deleteGroup = (groupName) => {
    if (groups.length <= 1) {
      showToast('Minimal harus ada 1 grup di sistem!')
      return false
    }
    setGroups((prev) => prev.filter((g) => g.name !== groupName))
    setCatalogCards((prev) => prev.filter((c) => c.group !== groupName))
    showToast(`Grup ${groupName} dan kartunya berhasil dihapus.`)
    return true
  }

  const addCard = (cardData) => {
    const newId = Date.now()
    const newCard = {
      ...cardData,
      id: newId,
      status: cardData.status || 'Ready Stock',
      slots: Number(cardData.slots) || 10,
      stock: Number(cardData.slots) || 10,
      price: Number(cardData.price) || 18000,
      name: (cardData.name || 'Member').trim().toUpperCase(),
      group: (cardData.group || 'CYE').trim().toUpperCase(),
      edition: cardData.edition || 'Photocard Album Ver. A',
      image: cardData.image || null,
    }
    setCatalogCards((prev) => [...prev, newCard])
    setSlots((prev) => ({ ...prev, [newId]: newCard.slots }))
    showToast(`Photocard ${newCard.name} (${newCard.status}) berhasil ditambahkan ke katalog!`)
    return true
  }

  const increaseSlot = (cardId, amount = 1) => {
    setSlots((prev) => {
      const current = prev[cardId] !== undefined ? prev[cardId] : 0
      const next = { ...prev, [cardId]: current + amount }
      try {
        localStorage.setItem(SLOTS_STORAGE_KEY, JSON.stringify(next))
      } catch { }
      return next
    })
    setCatalogCards((prev) =>
      prev.map((c) =>
        c.id === cardId
          ? { ...c, slots: (c.slots || 0) + amount, stock: (c.slots || 0) + amount }
          : c
      )
    )
    showToast(`Slot kartu berhasil ditambah (+${amount})!`)
  }

  const setCardSlotDirect = (cardId, newTotal) => {
    const val = Math.max(0, Number(newTotal) || 0)
    setSlots((prev) => {
      const next = { ...prev, [cardId]: val }
      try {
        localStorage.setItem(SLOTS_STORAGE_KEY, JSON.stringify(next))
      } catch { }
      return next
    })
    setCatalogCards((prev) =>
      prev.map((c) =>
        c.id === cardId ? { ...c, slots: val, stock: val } : c
      )
    )
    showToast(`Slot kartu berhasil diubah menjadi ${val}!`)
  }

  const toggleCardStatus = (cardId) => {
    setCatalogCards((prev) =>
      prev.map((c) => {
        if (c.id === cardId) {
          const nextStatus = c.status === 'Ready Stock' ? 'Pre-Order' : 'Ready Stock'
          showToast(`Status ${c.name} diubah menjadi ${nextStatus}!`)
          return { ...c, status: nextStatus }
        }
        return c
      })
    )
  }

  const updateCard = (id, updatedFields) => {
    setCatalogCards((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const next = { ...c, ...updatedFields }
          if (updatedFields.slots !== undefined) {
            const numSlots = Math.max(0, Number(updatedFields.slots) || 0)
            next.slots = numSlots
            next.stock = numSlots
          }
          return next
        }
        return c
      })
    )
    if (updatedFields.slots !== undefined) {
      const numSlots = Math.max(0, Number(updatedFields.slots) || 0)
      setSlots((prev) => {
        const nextSlots = { ...prev, [id]: numSlots }
        try {
          localStorage.setItem(SLOTS_STORAGE_KEY, JSON.stringify(nextSlots))
        } catch { }
        return nextSlots
      })
    }
    showToast('Data photocard berhasil diperbarui.')
  }

  const reorderCards = (newCards) => {
    setCatalogCards(newCards)
    try {
      localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(newCards))
    } catch { }
    showToast('Urutan posisi photocard berhasil disimpan!')
  }

  const deleteCard = (id) => {
    const found = catalogCards.find((c) => c.id === id)
    setCatalogCards((prev) => prev.filter((c) => c.id !== id))
    remove(id)
    showToast(`Photocard ${found ? found.name : ''} berhasil dihapus.`)
  }

  const resetToDefault = () => {
    setGroups(DEFAULT_GROUPS)
    setCatalogCards(FIGMA_CATALOG_CARDS)
    const initialSlots = {}
    FIGMA_CATALOG_CARDS.forEach((c) => {
      initialSlots[c.id] = c.slots
    })
    setSlots(initialSlots)
    localStorage.removeItem(GROUPS_STORAGE_KEY)
    localStorage.removeItem(CARDS_STORAGE_KEY)
    localStorage.removeItem(SLOTS_STORAGE_KEY)
    showToast('Data katalog berhasil direset ke 7 Member Close Your Eyes (CYE)!')
  }

  const count = cart.reduce((acc, item) => acc + (item.qty || 1), 0)
  const subtotal = cart.reduce((acc, item) => acc + (item.price || 0) * (item.qty || 1), 0)
  const total = subtotal

  return (
    <AppCtx.Provider
      value={{
        user,
        login,
        logout,
        register,
        isEmailRegistered,
        registeredUsers,
        cart,
        items: cart,
        count,
        subtotal,
        total,
        toast,
        add,
        updateQty,
        remove,
        clear,
        slots,
        getCardSlot,
        reduceSlots,
        // Admin & Group states
        groups,
        catalogCards,
        addGroup,
        deleteGroup,
        addCard,
        increaseSlot,
        setCardSlotDirect,
        toggleCardStatus,
        updateCard,
        reorderCards,
        deleteCard,
        resetToDefault,
        ADMIN_CREDENTIALS,
        orders,
        userOrders,
        addOrder,
      }}
    >
      {children}
    </AppCtx.Provider>
  )
}

export const useApp = () => useContext(AppCtx)
