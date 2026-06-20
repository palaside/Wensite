import React, { useEffect, useRef } from 'react';

interface RevealLayerProps {
  image: string;
  cursorX: number;
  cursorY: number;
}

const SPOTLIGHT_R = 360; // Doubled flashlight size

export const RevealLayer: React.FC<RevealLayerProps> = ({ image, cursorX, cursorY }) => {
  const revealDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const revealDiv = revealDivRef.current;
    if (!revealDiv) return;

    if (cursorX === -999 && cursorY === -999) {
      revealDiv.style.opacity = '0';
      revealDiv.style.setProperty('-webkit-mask-image', 'none');
      revealDiv.style.setProperty('mask-image', 'none');
      return;
    }

    revealDiv.style.opacity = '1';

    // Pure CSS radial gradient mask
    const maskStr = `radial-gradient(circle ${SPOTLIGHT_R}px at ${cursorX}px ${cursorY}px, black 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.4) 60%, transparent 100%)`;
    
    revealDiv.style.setProperty('-webkit-mask-image', maskStr);
    revealDiv.style.setProperty('mask-image', maskStr);
    revealDiv.style.setProperty('-webkit-mask-repeat', 'no-repeat');
    revealDiv.style.setProperty('mask-repeat', 'no-repeat');

  }, [cursorX, cursorY]);

  return (
    <div
      ref={revealDivRef}
      className="absolute inset-0 bg-center bg-contain bg-no-repeat z-30 pointer-events-none mix-blend-screen transition-opacity duration-300"
      style={{ backgroundImage: `url('${image}')`, opacity: 0 }}
    />
  );
};
