import React from 'react';

type LogoSphereProps = {
  activeLogo: string; 
};

/**
 * LogoSphere renders a massive glass‑morphism sphere with an active logo
 * in the centre and 3D spinning laser orbits.
 */
const LogoSphere: React.FC<LogoSphereProps> = ({ activeLogo }) => {
  return (
    <div className="relative flex items-center justify-center pointer-events-none z-20">
      
      {/* 3D Laser Orbits Container */}
      <div className="laser-ring-container">
        <div className="laser-orbit orbit-1"></div>
        <div className="laser-orbit orbit-2"></div>
        <div className="laser-orbit orbit-3"></div>
      </div>

      {/* Main glass sphere */}
      <div className="logo-sphere">
        <img
          key={activeLogo} // changing key forces re-mount/animation if needed
          src={activeLogo}
          alt="Active Mode Logo"
          className="h-full w-full object-contain drop-shadow-2xl hero-zoom"
          style={{ transform: 'scale(1.2)' }}
        />
      </div>
    </div>
  );
};

export default LogoSphere;
