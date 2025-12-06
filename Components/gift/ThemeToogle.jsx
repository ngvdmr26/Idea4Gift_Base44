import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-12 h-12 rounded-2xl overflow-hidden border-2 transition-all duration-300 shadow-lg ${
        isDark 
          ? 'bg-gradient-to-br from-indigo-900 to-violet-900 border-violet-500 shadow-violet-500/30' 
          : 'bg-gradient-to-br from-amber-100 to-orange-100 border-amber-300 shadow-amber-300/30'
      }`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isDark ? 'moon' : 'sun'}
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0, rotate: 180, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {isDark ? (
            <Moon className="w-6 h-6 text-violet-300" />
          ) : (
            <Sun className="w-6 h-6 text-amber-600" />
          )}
        </motion.div>
      </AnimatePresence>
      
      {/* Glow effect */}
      <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${
        isDark ? 'bg-violet-400/20' : 'bg-amber-400/20'
      }`} />
    </button>
  );
}
