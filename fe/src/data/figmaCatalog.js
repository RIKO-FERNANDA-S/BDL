// ─────────────────────────────────────────────────────────────────────────────
// Close Your Eyes (CYE) - Catalog Data & Dynamic Groups
// 7 Members with predefined Ready Stock and Pre-Order status
// Both statuses can be ordered, Ready Stock shows remaining slots, Pre-Order does not.
// ─────────────────────────────────────────────────────────────────────────────

import minwookImg from '../assets/members/minwook.jpg'
import jingxiangImg from '../assets/members/jingxiang.jpg'
import yeojunImg from '../assets/members/yeojun.jpg'
import sungminImg from '../assets/members/sungmin.jpg'
import seunghoImg from '../assets/members/seungho.jpg'
import kenshinImg from '../assets/members/kenshin.jpg'
import kyoungbaeImg from '../assets/members/kyoungbae.jpg'

// Grup default
export const DEFAULT_GROUPS = [
  { id: 'cye', name: 'CYE', fullName: 'Close Your Eyes' },
]

// 7 Photocard Close Your Eyes (CYE)
// Pilihan kartu Ready Stock (tampil sisa slot) & Pre-Order (tanpa tulisan sisa slot, bisa dipesan)
export const FIGMA_CATALOG_CARDS = [
  // 1. MINWOOK - Ready Stock (Tampil sisa slot, bisa dipesan)
  {
    id: 201,
    name: 'MINWOOK',
    group: 'CYE',
    edition: 'Photocard Album Ver. A (ETERNAL...)',
    status: 'Ready Stock',
    slots: 12,
    stock: 12,
    price: 18000,
    image: minwookImg,
    gradient: 'linear-gradient(180deg, #7dc8ff 0%, #d7b8ff 100%)',
  },
  // 2. JINGXIANG - Pre-Order (Tanpa tulisan sisa slot, BISA DIPESAN)
  {
    id: 202,
    name: 'JINGXIANG',
    group: 'CYE',
    edition: 'Photocard Album Ver. A (ETERNALT)',
    status: 'Pre-Order',
    slots: 15,
    stock: 15,
    price: 20000,
    image: jingxiangImg,
    gradient: 'linear-gradient(180deg, #7dc8ff 0%, #d7b8ff 100%)',
  },
  // 3. YEOJUN - Ready Stock (Tampil sisa slot, bisa dipesan)
  {
    id: 203,
    name: 'YEOJUN',
    group: 'CYE',
    edition: 'Photocard Album Ver. A (ETERNA...)',
    status: 'Ready Stock',
    slots: 10,
    stock: 10,
    price: 18000,
    image: yeojunImg,
    gradient: 'linear-gradient(180deg, #b8cde6 0%, #8ca9d3 100%)',
  },
  // 4. SUNGMIN - Pre-Order (Tanpa tulisan sisa slot, BISA DIPESAN)
  {
    id: 204,
    name: 'SUNGMIN',
    group: 'CYE',
    edition: 'Photocard Album Ver. B (DUSK)',
    status: 'Pre-Order',
    slots: 15,
    stock: 15,
    price: 18000,
    image: sungminImg,
    gradient: 'linear-gradient(180deg, #d1d5db 0%, #9ca3af 100%)',
  },
  // 5. SEUNGHO - Ready Stock (Tampil sisa slot, bisa dipesan)
  {
    id: 205,
    name: 'SEUNGHO',
    group: 'CYE',
    edition: 'Photocard Album Ver. B (DUSK)',
    status: 'Ready Stock',
    slots: 6,
    stock: 6,
    price: 18000,
    image: seunghoImg,
    gradient: 'linear-gradient(180deg, #3a3a52 0%, #14111c 100%)',
  },
  // 6. KENSHIN - Pre-Order (Tanpa tulisan sisa slot, BISA DIPESAN)
  {
    id: 206,
    name: 'KENSHIN',
    group: 'CYE',
    edition: 'Lucky Draw Hologram Silver',
    status: 'Pre-Order',
    slots: 15,
    stock: 15,
    price: 45000,
    image: kenshinImg,
    gradient: 'linear-gradient(180deg, #7d58d0 0%, #93acd7 100%)',
  },
  // 7. KYOUNGBAE - Ready Stock (Tampil sisa slot, bisa dipesan)
  {
    id: 207,
    name: 'KYOUNGBAE',
    group: 'CYE',
    edition: 'POB Weverse Special Pink',
    status: 'Ready Stock',
    slots: 5,
    stock: 5,
    price: 38000,
    image: kyoungbaeImg,
    gradient: 'linear-gradient(180deg, #7d58d0 0%, #93acd7 100%)',
  },
]
