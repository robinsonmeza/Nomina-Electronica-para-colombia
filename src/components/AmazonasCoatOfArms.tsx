import React from 'react';

interface Props {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const AmazonasCoatOfArms: React.FC<Props> = ({ className = '', size = 'md', showText = false }) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  // 24 angles for the official Amazon sunburst petals
  const angles = Array.from({ length: 24 }, (_, i) => i * 15);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative ${sizeMap[size]} flex-shrink-0 rounded-full shadow-md bg-white flex items-center justify-center overflow-hidden`}>
        {/* Official Circular Logo - Gobernación del Amazonas */}
        <svg 
          viewBox="0 0 200 200" 
          className="w-full h-full select-none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Top Text Arc */}
            <path
              id="arc-top"
              d="M 26 100 A 74 74 0 0 1 174 100"
              fill="none"
            />
            {/* Bottom Text Arc */}
            <path
              id="arc-bottom"
              d="M 30 100 A 70 70 0 0 0 170 100"
              fill="none"
            />
            
            {/* Center Clip Circle for the Green disk and River */}
            <clipPath id="center-circle-clip">
              <circle cx="100" cy="100" r="39" />
            </clipPath>
          </defs>

          {/* 1. Outer Dark Charcoal Border Ring */}
          <circle cx="100" cy="100" r="98" fill="#4B4B4B" stroke="#2B2B2B" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="77" fill="#FFFFFF" stroke="#4B4B4B" strokeWidth="1.5" />

          {/* 2. Official Arc Texts */}
          <text 
            fill="#FFFFFF" 
            fontSize="13" 
            fontWeight="800" 
            letterSpacing="2.2" 
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            <textPath href="#arc-top" startOffset="50%" textAnchor="middle">
              GOBERNACIÓN DEL
            </textPath>
          </text>

          <text 
            fill="#FFFFFF" 
            fontSize="13" 
            fontWeight="800" 
            letterSpacing="3.5" 
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            <textPath href="#arc-bottom" startOffset="50%" textAnchor="middle">
              AMAZONAS
            </textPath>
          </text>

          {/* 3. Layered Multi-Color Amazon Sun Petals (Yellow, Orange, Red) */}
          <g id="petals-group">
            {angles.map((deg, idx) => {
              const isRed = idx % 2 === 0;
              const isYellow = idx % 3 === 0;
              const isOrange = !isRed && !isYellow;
              const fillColor = isRed ? '#E11D48' : isOrange ? '#EA580C' : '#FBBF24';
              const strokeColor = isRed ? '#BE123C' : isOrange ? '#C2410C' : '#D97706';

              return (
                <g key={deg} transform={`rotate(${deg} 100 100)`}>
                  {/* Outer petal tip */}
                  <path
                    d="M 93 54 L 100 32 L 107 54 L 100 62 Z"
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth="0.8"
                    strokeLinejoin="round"
                  />
                  {/* Inner petal layer for multi-colored depth */}
                  <path
                    d="M 95 56 L 100 39 L 105 56 L 100 62 Z"
                    fill={isRed ? '#F97316' : isOrange ? '#FDE047' : '#EF4444'}
                    opacity="0.9"
                  />
                </g>
              );
            })}
          </g>

          {/* 4. White Middle Border Enclosure */}
          <circle cx="100" cy="100" r="41" fill="#FFFFFF" stroke="#2B2B2B" strokeWidth="2" />

          {/* 5. Center Green Jungle Landscape */}
          <g clipPath="url(#center-circle-clip)">
            {/* Lush Amazonian Green background */}
            <circle cx="100" cy="100" r="39" fill="#22C55E" />

            {/* The Amazon River - Iconic Winding S-Shape */}
            {/* River bed and water */}
            <path
              d="M 82 58 
                 C 96 58, 116 61, 122 69 
                 C 127 76, 123 83, 102 83 
                 C 82 83, 76 89, 76 98 
                 C 76 109, 93 113, 118 113 
                 C 128 113, 131 123, 128 132 
                 C 124 141, 102 143, 90 143 
                 L 110 143 
                 C 128 143, 138 134, 138 122 
                 C 138 110, 128 103, 106 103 
                 C 86 103, 84 94, 85 89 
                 C 86 78, 100 75, 116 75 
                 C 132 75, 134 65, 124 58 Z"
              fill="#7DD3FC"
              stroke="#1E293B"
              strokeWidth="2.2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </g>

          {/* 6. Top and bottom delicate Victoria Regia flourishes on central border */}
          <path d="M 96 60 Q 100 57 104 60" stroke="#1E293B" strokeWidth="1.5" fill="none" />
          <path d="M 96 140 Q 100 143 104 140" stroke="#1E293B" strokeWidth="1.5" fill="none" />
          <circle cx="100" cy="100" r="41" fill="none" stroke="#1E293B" strokeWidth="1.8" />
        </svg>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">
            República de Colombia
          </span>
          <span className="text-base font-extrabold tracking-tight text-white leading-tight font-serif">
            Gobernación del Amazonas
          </span>
          <span className="text-xs text-emerald-100/80 font-medium">
            Secretaría de Hacienda y Servicios Administrativos
          </span>
        </div>
      )}
    </div>
  );
};
