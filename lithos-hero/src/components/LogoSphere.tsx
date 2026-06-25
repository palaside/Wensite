import React from 'react';

type LogoSphereProps = {
  activeLogo: string; 
};

/**
 * LogoSphere renders a glass‑morphism sphere with an active logo
 * in the centre and spinning laser animations.
 */
const LogoSphere: React.FC<LogoSphereProps> = ({ activeLogo }) => {
  return (
    <div className="relative flex items-center justify-center pointer-events-none z-20">
      
      {/* Laser rings */}
      <div className="laser-ring"></div>
      <div className="laser-ring-2"></div>
      <div className="laser-ring-3"></div>

      {/* Main glass sphere */}
      <div className="logo-sphere">
        <img
          key={activeLogo} // changing key forces re-mount/animation if needed
          src={activeLogo}
          alt="Active Mode Logo"
          className="h-48 w-48 object-contain drop-shadow-2xl hero-zoom"
        />
      </div>
    </div>
  );
};

export default LogoSphere;
