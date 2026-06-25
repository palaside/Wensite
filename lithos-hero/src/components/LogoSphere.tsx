import React from 'react';

type LogoSphereProps = {
  logos: string[]; // array of image paths relative to public folder
};

/**
 * LogoSphere renders a glass‑morphism sphere that displays the provided logos
 * side‑by‑side (or overlapping) in the centre of the screen. It is intended to be
 * used on the hero section after login.
 */
const LogoSphere: React.FC<LogoSphereProps> = ({ logos }) => {
  return (
    <div className="logo-sphere flex items-center justify-center gap-4 p-4">
      {logos.map((src, idx) => (
        <img
          key={idx}
          src={src}
          alt={`logo-${idx}`}
          className="h-12 w-12 object-contain"
        />
      ))}
    </div>
  );
};

export default LogoSphere;
