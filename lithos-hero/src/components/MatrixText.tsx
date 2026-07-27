import React, { useState, useEffect } from 'react';

interface MatrixTextProps {
  text: string;
  trigger: any; // Changes to this trigger the animation
  className?: string;
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*';

export const MatrixText: React.FC<MatrixTextProps> = ({ text, trigger, className = '' }) => {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    let iterations = 0;
    const maxIterations = 10;
    
    const interval = setInterval(() => {
      setDisplayText(prev => {
        return text
          .split('')
          .map((char, index) => {
            if (index < iterations) {
              return text[index];
            }
            // Ignore spaces
            if (char === ' ') return ' ';
            
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('');
      });

      if (iterations >= text.length) {
        clearInterval(interval);
        setDisplayText(text);
      }
      
      iterations += 1/3;
    }, 30);

    return () => clearInterval(interval);
  }, [text, trigger]);

  return <span className={className}>{displayText}</span>;
};
