import React, { useRef, useState, useEffect } from 'react';
// liquid-glass-react exports a CommonJS module. Import the default and
// extract LiquidGlass safely to support both ESM and CJS interop.
import _pkg from 'liquid-glass-react';
const LiquidGlass = (_pkg && (_pkg.LiquidGlass || _pkg.default || _pkg)) || null;

// Acepta `children` como una prop
export default function LiquidGlassComponent({ children }) {
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(true); // Por defecto móvil para SSR
  const [isClient, setIsClient] = useState(false);
  
  // Detectar si estamos en el cliente y si es móvil
  useEffect(() => {
    setIsClient(true);
    
    // Detectar dispositivos móviles de manera más completa
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 1024; // Aumentado para tablets también
      
      return isMobileUA || (isTouchDevice && isSmallScreen);
    };
    
    setIsMobile(checkMobile());
    
    // NO actualizar en resize para evitar re-renders costosos
  }, []);
  
  // Fallback ULTRA-LIGERO para móviles - SIN backdrop-filter, SIN efectos pesados
  const MobileFallback = () => (
    <div style={{
      width: '90%',
      maxWidth: '400px',
      padding: '20px 28px',
      background: 'rgba(0, 0, 0, 0.5)', // Fondo semi-opaco simple
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      position: 'relative',
      zIndex: 100,
      margin: '0 auto',
      boxSizing: 'border-box',
    }}>
      {children}
    </div>
  );
  
  // Si no se encontró el componente o estamos en el servidor, renderizamos fallback
  if (!LiquidGlass || !isClient) {
    return <MobileFallback />;
  }
  
  // En móviles, usar fallback CSS ultra-ligero (sin WebGL, sin backdrop-filter)
  if (isMobile) {
    return <MobileFallback />;
  }

  // En desktop, usar el efecto completo pero muy optimizado
  return (
      <LiquidGlass
        displacementScale={40}
        blurAmount={0.5}
        saturation={110}
        aberrationIntensity={1}
        elasticity={0.08}
        cornerRadius={1000000}
        padding="24px 32px"
        background="rgba(255, 255, 255, 0.08)"
        mode="standard"
        mouseContainer={containerRef}
        style={{
          position: 'auto',
          top: '500px',
          left: '500px',
          transform: 'translateX(-50%)',
          zIndex: 100,
          maxWidth: '550px'
        }}
      >
        {children}
      </LiquidGlass>
    
  );
}