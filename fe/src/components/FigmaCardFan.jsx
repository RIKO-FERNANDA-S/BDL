import { useState } from 'react'
import './FigmaCardFan.css'

// Foto member depan (Close Your Eyes / CYE)
import minwookImg from '../assets/members/minwook.jpg'
import jingxiangImg from '../assets/members/jingxiang.jpg'
import yeojunImg from '../assets/members/yeojun.jpg'

// Asset gambar body belakang kartu (Warna gradasi aurora murni tanpa text)
import cardBackYuna from '../assets/figma/card-bg-yuna.png'
import cardBackKair from '../assets/figma/card-bg-kair.png'
import cardBackMira from '../assets/figma/card-bg-mira.png'

// 4-pointed sparkle SVG icon
function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  )
}

// 3 Photocard Close Your Eyes (CYE): Tampak depan foto member, body belakang asset gambar user
export const FAN_CARDS_DATA = [
  {
    key: 'jingxiang',
    posClass: 'card-left',
    num: '02',
    hasSparkle: true,
    name: 'JINGXIANG',
    group: 'CYE',
    photo: jingxiangImg,
    backImg: cardBackYuna,
    dataNodeId: '1:73',
  },
  {
    key: 'minwook',
    posClass: 'card-center',
    num: '01',
    hasSparkle: true,
    name: 'MINWOOK',
    group: 'CYE',
    photo: minwookImg,
    backImg: cardBackKair,
    dataNodeId: '1:85',
  },
  {
    key: 'yeojun',
    posClass: 'card-right',
    num: '03',
    hasSparkle: true,
    name: 'YEOJUN',
    group: 'CYE',
    photo: yeojunImg,
    backImg: cardBackMira,
    dataNodeId: '1:79',
  },
]

export default function FigmaCardFan({ className = '', style = {} }) {
  const [flipped, setFlipped] = useState({})

  const toggleFlip = (key) => {
    setFlipped((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  return (
    <div className={`figma-fan-wrapper ${className}`} style={style} data-name="Card fan">
      {/* 1. Halftone Dot Matrix Texture */}
      <div className="figma-fan-dot-bg" aria-hidden="true" />

      {/* 2. Interactive 3D Card Stack */}
      <div className="figma-fan-stage">
        {FAN_CARDS_DATA.map((card) => {
          const isCardFlipped = !!flipped[card.key]

          return (
            <div
              key={card.key}
              className={`figma-flipcard-item ${card.posClass} ${
                isCardFlipped ? 'is-flipped' : ''
              }`}
              onClick={() => toggleFlip(card.key)}
              title="Klik untuk flip photocard"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  toggleFlip(card.key)
                }
              }}
              data-node-id={card.dataNodeId}
              data-name={`Photocard ${card.name}`}
            >
              <div className="figma-flipcard-inner">
                {/* ── TAMPAK DEPAN KARTU (Foto Member CYE) ── */}
                <div className="figma-card-face figma-card-front">
                  {/* Foto asli member */}
                  <img
                    src={card.photo}
                    alt={card.name}
                    className="figma-fan-card-img"
                    loading="eager"
                  />
                  {/* Gradient shadow di bagian bawah untuk kontras nama */}
                  <div className="figma-fan-card-gradient" />

                  {/* Hologram Shimmer Layer */}
                  <div className="figma-card-hologram" aria-hidden="true" />

                  {/* Top: Nomor & Bintang Sparkle */}
                  <div className="figma-card-header">
                    <span className="figma-card-num">{card.num}</span>
                    {card.hasSparkle && (
                      <span className="figma-card-sparkle">
                        <SparkleIcon />
                      </span>
                    )}
                  </div>

                  {/* Bottom: Nama Member & Grup CYE */}
                  <div className="figma-card-footer">
                    <div className="figma-card-name">{card.name}</div>
                    <div className="figma-card-group">{card.group}</div>
                  </div>
                </div>

                {/* ── BODY BELAKANG KARTU (Asset Gradasi Warna Aurora Murni Tanpa Teks) ── */}
                <div className="figma-card-face figma-card-back">
                  {/* Gambar Art Gradasi Murni Tanpa Teks */}
                  <img
                    src={card.backImg}
                    alt=""
                    className="figma-card-back-asset-img"
                    loading="eager"
                  />
                  {/* Shimmer hologram overlay */}
                  <div className="figma-card-back-hologram" aria-hidden="true" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Subtext: Flip the Photocard */}
      <div className="figma-fan-hint-text">
        <span>Flip the Photocard</span>
      </div>
    </div>
  )
}
