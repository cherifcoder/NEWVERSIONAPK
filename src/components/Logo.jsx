/* Logo METHOD — masque de théâtre + monogramme M couronné + échiquier implicite.
   Rendu en SVG inline pour rester net à toutes les tailles et se thème facilement. */

export const Logo = ({ size = 44, className = '', glow = true }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 128 128"
    className={className}
    role="img"
    aria-label="METHOD"
    style={glow ? { filter: 'drop-shadow(0 6px 18px rgba(207,168,81,0.35))' } : undefined}
  >
    <defs>
      <linearGradient id="mthGold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f7ecd0" />
        <stop offset="45%" stopColor="#e0c07c" />
        <stop offset="100%" stopColor="#946d24" />
      </linearGradient>
      <linearGradient id="mthBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#141726" />
        <stop offset="100%" stopColor="#06070e" />
      </linearGradient>
    </defs>

    {/* Écrin */}
    <path
      d="M64 5 L113 33 L113 95 L64 123 L15 95 L15 33 Z"
      fill="url(#mthBg)"
      stroke="url(#mthGold)"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />

    {/* Monogramme M couronné */}
    <path
      d="M35 90 L35 44 L64 34 L93 44 L93 90"
      fill="none"
      stroke="url(#mthGold)"
      strokeWidth="9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Barre du masque */}
    <path
      d="M44 103 Q64 113 84 103"
      fill="none"
      stroke="#cfa851"
      strokeWidth="3.6"
      strokeLinecap="round"
      opacity="0.72"
    />

    {/* Yeux du masque */}
    <circle cx="50" cy="62" r="3.4" fill="#f7ecd0" />
    <circle cx="78" cy="62" r="3.4" fill="#f7ecd0" />
  </svg>
)

export default Logo
