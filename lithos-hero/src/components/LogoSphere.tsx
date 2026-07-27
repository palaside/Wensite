import React from 'react';
import { motion } from 'framer-motion';

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
      <motion.img
        key={activeLogo}
        layoutId={activeLogo}
        src={activeLogo}
        alt="Active Mode Logo"
        className="object-contain drop-shadow-2xl hero-zoom p-4 md:p-10 absolute inset-0 m-auto w-full h-full max-w-[12rem] max-h-[12rem] sm:max-w-[16rem] sm:max-h-[16rem] md:max-w-[28rem] md:max-h-[28rem]"
        transition={{ type: "spring", stiffness: 150, damping: 20 }}
      />
    </div>
  );
};

export default LogoSphere;
