import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return { isDark: false, toggleTheme: () => {} };
  }
  return context;
};

export default function Layout({ children }) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsDark(!isDark);
    }, 300);
    setTimeout(() => {
      setIsAnimating(false);
    }, 800);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <style>{`
        :root {
          --bg-primary: #faf5ff;
          --bg-secondary: #ffffff;
          --bg-card: #ffffff;
          --text-primary: #1f2937;
          --text-secondary: #6b7280;
          --border-color: #f3f4f6;
          --gradient-start: #f5f3ff;
          --gradient-mid: #fdf2f8;
          --gradient-end: #fff1f2;
        }
        
        .dark {
          --bg-primary: #0f0a1a;
          --bg-secondary: #1a1025;
          --bg-card: #241830;
          --text-primary: #f3e8ff;
          --text-secondary: #a78bfa;
          --border-color: #3b2d4d;
          --gradient-start: #0f0a1a;
          --gradient-mid: #1a0a1a;
          --gradient-end: #1a0a12;
        }
      `}</style>
      <div className={`min-h-screen relative overflow-hidden ${isDark ? 'dark' : ''}`}>
        {/* Theme transition wave overlay */}
        <AnimatePresence>
          {isAnimating && (
            <motion.div
              initial={{ 
                clipPath: 'circle(0% at 100% 0%)',
                opacity: 1
              }}
              animate={{ 
                clipPath: 'circle(150% at 100% 0%)',
                opacity: 1
              }}
              exit={{ 
                opacity: 0
              }}
              transition={{ 
                clipPath: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
                opacity: { duration: 0.2, delay: 0.5 }
              }}
              className={`fixed inset-0 z-[9999] pointer-events-none ${
                isDark 
                  ? 'bg-gradient-to-br from-violet-50 via-fuchsia-50 to-rose-50' 
                  : 'bg-gradient-to-br from-[#0f0a1a] via-[#1a0a1a] to-[#1a0a12]'
              }`}
            />
          )}
        </AnimatePresence>
        
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
