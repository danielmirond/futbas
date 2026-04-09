interface KitSvgProps {
  primaryColor: string
  secondaryColor: string
  className?: string
}

export function KitSvg({ primaryColor, secondaryColor, className = '' }: KitSvgProps) {
  return (
    <svg
      viewBox="0 0 60 70"
      width="60"
      height="70"
      className={className}
      aria-label="Samarreta"
    >
      {/* Sleeves */}
      <path
        d="M5 10 L0 30 L10 32 L12 18 Z"
        fill={secondaryColor}
        stroke="#0A0A0A"
        strokeWidth="0.5"
      />
      <path
        d="M55 10 L60 30 L50 32 L48 18 Z"
        fill={secondaryColor}
        stroke="#0A0A0A"
        strokeWidth="0.5"
      />
      {/* Body */}
      <path
        d="M12 10 L12 65 C12 67 14 68 16 68 L44 68 C46 68 48 67 48 65 L48 10 C48 10 42 5 30 5 C18 5 12 10 12 10 Z"
        fill={primaryColor}
        stroke="#0A0A0A"
        strokeWidth="0.5"
      />
      {/* Collar */}
      <path
        d="M22 6 C22 6 26 9 30 9 C34 9 38 6 38 6"
        fill="none"
        stroke="#0A0A0A"
        strokeWidth="0.8"
      />
    </svg>
  )
}
