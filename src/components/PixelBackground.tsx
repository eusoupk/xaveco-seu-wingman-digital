import { useMemo } from "react";

// Pixel Heart SVG Component
export const PixelHeart = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className}>
    <rect x="6" y="4" width="4" height="4" fill="#ff4444"/>
    <rect x="10" y="4" width="4" height="4" fill="#ff6666"/>
    <rect x="18" y="4" width="4" height="4" fill="#ff4444"/>
    <rect x="22" y="4" width="4" height="4" fill="#ff6666"/>
    
    <rect x="4" y="8" width="4" height="4" fill="#ff4444"/>
    <rect x="8" y="8" width="4" height="4" fill="#ff6666"/>
    <rect x="12" y="8" width="4" height="4" fill="#ff8888"/>
    <rect x="16" y="8" width="4" height="4" fill="#ff6666"/>
    <rect x="20" y="8" width="4" height="4" fill="#ff6666"/>
    <rect x="24" y="8" width="4" height="4" fill="#ff4444"/>
    
    <rect x="4" y="12" width="4" height="4" fill="#ff4444"/>
    <rect x="8" y="12" width="4" height="4" fill="#ff6666"/>
    <rect x="12" y="12" width="8" height="4" fill="#ff8888"/>
    <rect x="20" y="12" width="4" height="4" fill="#ff6666"/>
    <rect x="24" y="12" width="4" height="4" fill="#ff4444"/>
    
    <rect x="6" y="16" width="4" height="4" fill="#ff4444"/>
    <rect x="10" y="16" width="4" height="4" fill="#ff6666"/>
    <rect x="14" y="16" width="4" height="4" fill="#ff6666"/>
    <rect x="18" y="16" width="4" height="4" fill="#ff6666"/>
    <rect x="22" y="16" width="4" height="4" fill="#ff4444"/>
    
    <rect x="8" y="20" width="4" height="4" fill="#ff4444"/>
    <rect x="12" y="20" width="4" height="4" fill="#ff6666"/>
    <rect x="16" y="20" width="4" height="4" fill="#ff4444"/>
    <rect x="20" y="20" width="4" height="4" fill="#cc3333"/>
    
    <rect x="10" y="24" width="4" height="4" fill="#cc3333"/>
    <rect x="14" y="24" width="4" height="4" fill="#ff4444"/>
    <rect x="18" y="24" width="4" height="4" fill="#cc3333"/>
    
    <rect x="14" y="28" width="4" height="4" fill="#aa2222"/>
  </svg>
);

// Background with stars and city silhouette
export const PixelBackground = ({ showCity = true }: { showCity?: boolean }) => {
  const stars = useMemo(() => 
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 60,
      size: Math.random() > 0.7 ? 3 : 2,
      delay: Math.random() * 3,
      color: Math.random() > 0.5 ? '#ffffff' : (Math.random() > 0.5 ? '#88ddff' : '#ff88ff')
    })), []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient sky */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, hsl(260 60% 20%) 0%, hsl(270 50% 15%) 50%, hsl(260 50% 10%) 100%)'
        }}
      />
      
      {/* Stars */}
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute animate-pulse"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: star.color,
            animationDelay: `${star.delay}s`,
            boxShadow: `0 0 ${star.size * 2}px ${star.color}`
          }}
        />
      ))}
      
      {/* City silhouette */}
      {showCity && (
        <div className="absolute bottom-0 left-0 right-0 h-32">
          <svg viewBox="0 0 400 80" preserveAspectRatio="none" className="w-full h-full">
            <defs>
              <linearGradient id="cityGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(260 50% 12%)" />
                <stop offset="100%" stopColor="hsl(260 60% 8%)" />
              </linearGradient>
            </defs>
            <path 
              d="M0,80 L0,60 L20,60 L20,50 L30,50 L30,55 L40,55 L40,45 L50,45 L50,55 L60,55 L60,40 L70,40 L70,30 L80,30 L80,45 L90,45 L90,50 L100,50 L100,35 L110,35 L110,40 L120,40 L120,25 L130,25 L130,45 L140,45 L140,50 L150,50 L150,35 L160,35 L160,50 L170,50 L170,40 L180,40 L180,30 L190,30 L190,45 L200,45 L200,35 L210,35 L210,20 L220,20 L220,40 L230,40 L230,50 L240,50 L240,40 L250,40 L250,30 L260,30 L260,45 L270,45 L270,50 L280,50 L280,35 L290,35 L290,45 L300,45 L300,30 L310,30 L310,50 L320,50 L320,40 L330,40 L330,55 L340,55 L340,45 L350,45 L350,50 L360,50 L360,40 L370,40 L370,55 L380,55 L380,50 L390,50 L390,60 L400,60 L400,80 Z" 
              fill="url(#cityGrad)"
            />
            <rect x="72" y="35" width="2" height="2" fill="#ffff88" opacity="0.8"/>
            <rect x="76" y="38" width="2" height="2" fill="#ffff88" opacity="0.6"/>
            <rect x="122" y="30" width="2" height="2" fill="#ffff88" opacity="0.7"/>
            <rect x="126" y="35" width="2" height="2" fill="#ffff88" opacity="0.5"/>
            <rect x="212" y="25" width="2" height="2" fill="#ffff88" opacity="0.8"/>
            <rect x="216" y="30" width="2" height="2" fill="#ffff88" opacity="0.6"/>
            <rect x="252" y="35" width="2" height="2" fill="#ffff88" opacity="0.7"/>
            <rect x="302" y="35" width="2" height="2" fill="#ffff88" opacity="0.8"/>
            <rect x="306" y="40" width="2" height="2" fill="#ffff88" opacity="0.5"/>
          </svg>
        </div>
      )}
    </div>
  );
};

// Pixel Button style helper
export const pixelButtonClass = "font-pixel text-xs sm:text-sm px-6 py-4 bg-pixel-green hover:bg-pixel-green-dark text-white border-b-4 border-pixel-green-dark hover:border-b-2 hover:translate-y-[2px] active:border-b-0 active:translate-y-1 transition-all duration-75 rounded-sm";

// Pixel Card component
export const PixelCard = ({ 
  children, 
  className = "",
  onClick
}: { 
  children: React.ReactNode; 
  className?: string;
  onClick?: () => void;
}) => (
  <div 
    onClick={onClick}
    className={`bg-pixel-purple-mid border-2 border-pixel-purple-light/30 p-4 rounded-sm shadow-lg ${onClick ? 'cursor-pointer hover:bg-pixel-purple-mid/80 transition-colors' : ''} ${className}`}
    style={{ boxShadow: '4px 4px 0 rgba(0,0,0,0.3)' }}
  >
    {children}
  </div>
);
