export default function AquiLogo({ className = "", size = 60, withText = false }: { className?: string; size?: number; withText?: boolean }) {
  const h = (size * 130) / 160;
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 160 130" width={size} height={h} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="aquiBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0A1930" />
            <stop offset="50%" stopColor="#0D2137" />
            <stop offset="100%" stopColor="#122D4A" />
          </linearGradient>
          <linearGradient id="aquiHandle" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#1976D2" />
            <stop offset="100%" stopColor="#1565C0" />
          </linearGradient>
        </defs>

        {/* Handle/Arch - bright blue */}
        <path
          d="M58 52 L58 34 Q58 12 80 12 Q102 12 102 34 L102 52"
          fill="none"
          stroke="url(#aquiHandle)"
          strokeWidth="14"
          strokeLinecap="round"
        />

        {/* Main body - dark navy, pointed bag shape */}
        <path
          d="M34 56 L34 112 Q34 122 44 122 L116 122 Q126 122 126 112 L126 56 L102 56 L80 32 L58 56 Z"
          fill="url(#aquiBody)"
        />

        {/* Location pin - dark navy */}
        <circle cx="80" cy="76" r="10" fill="#0A1930" />
        <circle cx="80" cy="74" r="4" fill="white" />
        <path
          d="M80 86 L75 80 Q75 73 80 69 Q85 73 85 80 Z"
          fill="#0A1930"
        />

        {/* Smile/arc - bright orange */}
        <path
          d="M54 102 Q80 118 106 102"
          fill="none"
          stroke="#FF5722"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>
      {withText && (
        <div className="flex flex-col">
          <span className="font-extrabold text-aqui-dark tracking-tight" style={{ fontSize: size * 0.5 }}>AQUÍ</span>
          <span className="text-aqui-orange font-bold tracking-[0.15em] uppercase" style={{ fontSize: size * 0.14 }}>Marketplace</span>
        </div>
      )}
    </div>
  );
}
