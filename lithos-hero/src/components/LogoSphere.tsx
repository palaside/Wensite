import React from 'react';

type LogoSphereProps = {
  activeLogo: string; 
};

/**
 * LogoSphere renders the active logo inside a simple glowing laser circle.
 */
const LogoSphere: React.FC<LogoSphereProps> = ({ activeLogo }) => {
  return (
    <div className="logo-sphere-container">
      
      {/* Outer spinning lasers (9 rings total) */}
      <div className="laser-ring laser-ring-1"></div>
      <div className="laser-ring laser-ring-2"></div>
      <div className="laser-ring laser-ring-3"></div>
      <div className="laser-ring laser-ring-4"></div>
      <div className="laser-ring laser-ring-5"></div>
      <div className="laser-ring laser-ring-6"></div>
      <div className="laser-ring laser-ring-7"></div>
      <div className="laser-ring laser-ring-8"></div>
      <div className="laser-ring laser-ring-9"></div>

      {/* Main Logo Image */}
      <img
        key={activeLogo} // changing key forces re-mount/animation if needed
        src={activeLogo}
        alt="Active Mode Logo"
        className="h-full w-full object-contain drop-shadow-2xl hero-zoom p-6"
      />
    </div>
  );
};

export default LogoSphere;
