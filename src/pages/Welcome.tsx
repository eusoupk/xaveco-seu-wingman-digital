import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { xavecoClient } from "@/lib/xavecoClient";
import { useEffect, useState } from "react";
import { Heart, Mail, Settings, Sparkles } from "lucide-react";

const Welcome = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkPremiumStatus = async () => {
      try {
        const result = await xavecoClient.checkStatus();
        if (result.isPremium) {
          console.log('✅ User is premium, redirecting to wizard');
          navigate("/wizard");
          return;
        }
      } catch (error) {
        console.error('Error checking premium status:', error);
      } finally {
        setChecking(false);
      }
    };
    checkPremiumStatus();
  }, [navigate]);

  const handleStartTrial = () => {
    navigate("/trial");
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
        <PixelBackground />
        <div className="text-center z-10">
          <PixelHeart className="w-16 h-16 mx-auto mb-4 animate-bounce" />
          <p className="text-muted-foreground font-pixel text-xs">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-between p-6 pb-8 relative overflow-hidden">
      <PixelBackground />
      
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md w-full z-10">
        {/* Pixel Heart Logo */}
        <PixelHeart className="w-24 h-24 mb-4 animate-pulse" />
        
        {/* Title */}
        <h1 className="font-pixel text-3xl sm:text-4xl text-foreground mb-4 tracking-wide"
            style={{
              textShadow: '3px 3px 0 hsl(0 70% 40%), 6px 6px 0 rgba(0,0,0,0.3)',
              color: '#ff6b6b'
            }}>
          XAVECO
        </h1>
        
        {/* Subtitle */}
        <p className="font-pixel text-sm text-pixel-yellow mb-6">
          Desenrola com estilo ❤️🔥
        </p>
        
        {/* Description */}
        <p className="font-pixel text-[10px] text-muted-foreground mb-8 leading-relaxed px-4">
          O app brasileiro pra você parar de travar na hora de falar com ela
        </p>
      </div>

      {/* Icons and Button Section */}
      <div className="w-full max-w-md z-10">
        <div className="flex items-center justify-center gap-4 mb-6">
          {/* Left Icons */}
          <div className="flex flex-col gap-3">
            <Heart className="w-6 h-6 text-pixel-pink opacity-70" />
            <Mail className="w-6 h-6 text-pixel-purple-light opacity-70" />
          </div>
          
          {/* Main Button */}
          <Button 
            size="lg" 
            onClick={handleStartTrial} 
            className="font-pixel text-sm px-8 py-6 bg-pixel-green hover:bg-pixel-green-dark text-white border-b-4 border-pixel-green-dark hover:border-b-2 hover:translate-y-[2px] active:border-b-0 active:translate-y-1 transition-all duration-75 rounded-sm shadow-lg"
            style={{
              boxShadow: '0 4px 0 hsl(120 60% 30%), 0 6px 10px rgba(0,0,0,0.3)'
            }}
          >
            Começar
          </Button>
          
          {/* Right Icons */}
          <div className="flex flex-col gap-3">
            <Settings className="w-6 h-6 text-muted-foreground opacity-70" />
            <Sparkles className="w-6 h-6 text-pixel-yellow opacity-70" />
          </div>
        </div>

        {/* Terms */}
        <p className="font-pixel text-[8px] text-center text-muted-foreground px-4 leading-relaxed">
          <span className="underline decoration-pixel-purple-light cursor-pointer hover:text-pixel-purple-light">
            Termos de servicios
          </span>
          {" "}e{" "}
          <span className="underline decoration-pixel-purple-light cursor-pointer hover:text-pixel-purple-light">
            Política de privacidade
          </span>
        </p>
      </div>
    </div>
  );
};

// Pixel Heart SVG Component
const PixelHeart = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className}>
    {/* Heart shape in pixel art style */}
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
const PixelBackground = () => {
  const stars = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 60,
    size: Math.random() > 0.7 ? 3 : 2,
    delay: Math.random() * 3,
    color: Math.random() > 0.5 ? '#ffffff' : (Math.random() > 0.5 ? '#88ddff' : '#ff88ff')
  }));

  return (
    <div className="absolute inset-0 overflow-hidden">
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
      <div className="absolute bottom-0 left-0 right-0 h-32">
        <svg viewBox="0 0 400 80" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id="cityGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(260 50% 12%)" />
              <stop offset="100%" stopColor="hsl(260 60% 8%)" />
            </linearGradient>
          </defs>
          {/* Buildings silhouette */}
          <path 
            d="M0,80 L0,60 L20,60 L20,50 L30,50 L30,55 L40,55 L40,45 L50,45 L50,55 L60,55 L60,40 L70,40 L70,30 L80,30 L80,45 L90,45 L90,50 L100,50 L100,35 L110,35 L110,40 L120,40 L120,25 L130,25 L130,45 L140,45 L140,50 L150,50 L150,35 L160,35 L160,50 L170,50 L170,40 L180,40 L180,30 L190,30 L190,45 L200,45 L200,35 L210,35 L210,20 L220,20 L220,40 L230,40 L230,50 L240,50 L240,40 L250,40 L250,30 L260,30 L260,45 L270,45 L270,50 L280,50 L280,35 L290,35 L290,45 L300,45 L300,30 L310,30 L310,50 L320,50 L320,40 L330,40 L330,55 L340,55 L340,45 L350,45 L350,50 L360,50 L360,40 L370,40 L370,55 L380,55 L380,50 L390,50 L390,60 L400,60 L400,80 Z" 
            fill="url(#cityGrad)"
          />
          {/* Building windows (small yellow dots) */}
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
    </div>
  );
};

export default Welcome;
