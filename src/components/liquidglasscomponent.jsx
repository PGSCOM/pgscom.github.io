import React, { useRef, useState, useEffect } from 'react';
// liquid-glass-react exports a CommonJS module. Import the default and
// extract LiquidGlass safely to support both ESM and CJS interop.
import _pkg from 'liquid-glass-react';
const LiquidGlass = (_pkg && (_pkg.LiquidGlass || _pkg.default || _pkg)) || null;

// Acepta `children` como una prop
export default function LiquidGlassComponent({ children }) {
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Detectar si estamos en el cliente y si es móvil
  useEffect(() => {
    setIsClient(true);
    
    // Detectar dispositivos móviles de manera más completa
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 768;
      
      return isMobileUA || (isTouchDevice && isSmallScreen);
    };
    
    setIsMobile(checkMobile());
    
    // Actualizar en cambio de tamaño de ventana
    const handleResize = () => {
      setIsMobile(checkMobile());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Fallback optimizado para móviles con efecto glassmorphism CSS puro
  const MobileFallback = () => (
    <div style={{
      width: '100%',
      maxWidth: '400px',
      padding: '24px 32px',
      background: 'rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderRadius: '32px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      position: 'relative',
      zIndex: 100,
      transform: 'translateX(-50%)',
      left: '50%',
    }}>
      {children}
    </div>
  );
  
  // Si no se encontró el componente, renderizamos un fallback simple
  if (!LiquidGlass || !isClient) {
    return (
      <div style={{ 
        width: '100%', 
        maxWidth: '400px', 
        padding: '24px 32px', 
        background: 'rgba(255,255,255,0.1)', 
        borderRadius: 32,
        position: 'relative',
        zIndex: 100,
        transform: 'translateX(-50%)',
        left: '50%',
      }}>
        {children}
      </div>
    );
  }
  
  // En móviles, usar fallback CSS puro (sin WebGL)
  if (isMobile) {
    return <MobileFallback />;
  }

  // En desktop, usar el efecto completo pero optimizado
  return (
      <LiquidGlass
        displacementScale={60}
        blurAmount={0.3}
        saturation={120}
        aberrationIntensity={1.5}
        elasticity={0.05}
        cornerRadius={32}
        padding="24px 32px"
        background="rgba(255, 255, 255, 0.1)"
        mode="standard"
        mouseContainer={containerRef}
        style={{
          position: 'auto',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          maxWidth: '400px'
        }}
      >
        {children}
      </LiquidGlass>
    
  );
}