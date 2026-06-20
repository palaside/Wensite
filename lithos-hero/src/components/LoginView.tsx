import React, { useState, useRef } from 'react';

interface LoginViewProps {
  isVisible: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export const LoginView = ({ isVisible, onClose, onLogin }: LoginViewProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Use a short, crisp public typing sound
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!isVisible) return null;

  const playTypeSound = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('https://actions.google.com/sounds/v1/foley/mechanical_keyboard_type.ogg');
    }
    // Reset and play quickly for every keystroke
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  };

  const handleInput = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    playTypeSound();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md hero-anim hero-fade p-4 font-mono">
      
      {/* Dog Tag Container */}
      <div className="relative w-full max-w-md">
        
        {/* Chain SVG decoration (Silver metal) */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-6 h-32 flex flex-col items-center opacity-90 z-0">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-3 h-6 border-[3px] border-[#a0a0a0] rounded-full mb-[-4px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),_0_2px_4px_rgba(0,0,0,0.5)] bg-transparent"></div>
          ))}
        </div>

        {/* Dog Tag Card (Realistic Stainless Steel) */}
        <div 
          className="relative rounded-[50px] p-10 shadow-[0_30px_60px_rgba(0,0,0,0.9),inset_0_0_15px_rgba(0,0,0,0.3),inset_2px_2px_10px_rgba(255,255,255,0.9)] border border-[#888] overflow-hidden z-10"
          style={{
            // Brushed stainless steel gradient
            background: `
              linear-gradient(135deg, #e6e6e6 0%, #b3b3b3 20%, #f0f0f0 45%, #999999 75%, #cccccc 100%),
              repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(255,255,255,0.1) 1px, rgba(255,255,255,0.1) 2px)
            `,
            backgroundBlendMode: 'overlay'
          }}
        >
          
          {/* Scratch Textures overlay */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply" 
            style={{ 
              backgroundImage: 'radial-gradient(circle at 30% 20%, #444 1px, transparent 1.5px), radial-gradient(circle at 70% 80%, #444 1px, transparent 1.5px)', 
              backgroundSize: '12px 12px' 
            }}
          ></div>
          
          {/* Dog Tag Hole */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-black shadow-[inset_0_4px_8px_rgba(0,0,0,0.9),0_2px_0_rgba(255,255,255,0.8)] border border-[#777]"></div>

          <form onSubmit={handleSubmit} className="relative z-10 mt-12 flex flex-col gap-6">
            
            {/* Indented Metal Text (Engraved style) */}
            <div className="text-center mb-4">
              <h2 
                className="text-3xl font-black text-[#333] tracking-[0.2em] uppercase" 
                style={{ textShadow: '1px 1px 1px rgba(255,255,255,0.9), -1px -1px 1px rgba(0,0,0,0.4)' }}
              >
                IDENTIFICATION
              </h2>
              <p 
                className="text-sm text-[#444] font-bold tracking-widest mt-2"
                style={{ textShadow: '1px 1px 1px rgba(255,255,255,0.9), -1px -1px 1px rgba(0,0,0,0.3)' }}
              >
                RESTRICTED ACCESS
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#1a1a1a] mb-2 pl-2 tracking-widest" style={{ textShadow: '1px 1px 1px rgba(255,255,255,0.3)' }}>USERNAME</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => handleInput(setUsername, e.target.value)}
                  className="w-full bg-[#111] border-2 border-[#222] rounded-lg px-5 py-3 text-[#00ff00] font-mono text-lg focus:outline-none focus:border-[#444] transition-colors shadow-[inset_0_4px_8px_rgba(0,0,0,0.8)]"
                  placeholder="ENTER ID..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1a1a1a] mb-2 pl-2 tracking-widest" style={{ textShadow: '1px 1px 1px rgba(255,255,255,0.3)' }}>PASSWORD</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => handleInput(setPassword, e.target.value)}
                  className="w-full bg-[#111] border-2 border-[#222] rounded-lg px-5 py-3 text-[#00ff00] font-mono text-lg focus:outline-none focus:border-[#444] transition-colors shadow-[inset_0_4px_8px_rgba(0,0,0,0.8)]"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-md bg-[#333] text-[#1a1a1a] font-bold text-lg border-2 border-[#222] hover:bg-[#444] transition-colors uppercase tracking-widest"
                style={{ boxShadow: 'inset 2px 2px 5px rgba(255,255,255,0.1), 2px 2px 5px rgba(0,0,0,0.5)', textShadow: '1px 1px 1px rgba(255,255,255,0.2)' }}
              >
                ABORT
              </button>
              <button 
                type="submit"
                className="flex-1 px-4 py-3 rounded-md bg-[#4a5d23] text-white font-bold text-lg border-2 border-[#2c3815] hover:bg-[#5c732b] transition-colors uppercase tracking-widest"
                style={{ boxShadow: 'inset 2px 2px 5px rgba(255,255,255,0.2), 2px 2px 5px rgba(0,0,0,0.5)', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
              >
                AUTHORIZE
              </button>
            </div>
          </form>

        </div>
      </div>

    </div>
  );
};
