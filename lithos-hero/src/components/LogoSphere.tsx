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
      
      {/* Outer spinning lasers */}
      <div className="laser-ring-outer"></div>
      <div className="laser-ring-inner"></div>

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
