import React, { useRef } from 'react';
// liquid-glass-react exports a CommonJS module. Import the default and
// extract LiquidGlass safely to support both ESM and CJS interop.
import _pkg from 'liquid-glass-react';
const LiquidGlass = (_pkg && (_pkg.LiquidGlass || _pkg.default || _pkg)) || null;

// Acepta `children` como una prop
export default function LiquidGlassComponent({ children }) {
  const containerRef = useRef(null);
  
  // Si no se encontró el componente, renderizamos un fallback simple
  if (!LiquidGlass) {
    return (
      <div style={{ width: '400px', padding: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: 20 }}>
        {children}
      </div>
    );
  }

  return (
      <LiquidGlass
        displacementScale={100}
        blurAmount={0.5}
        saturation={140}
        aberrationIntensity={2}
        elasticity={0.03}
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