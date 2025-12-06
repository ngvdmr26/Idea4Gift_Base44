import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';

export default function ChatMessage({ message, isBot, isDark }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}
    >
      {isBot && (
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg flex-shrink-0 shadow-emerald-200">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}
      
      <div
        className={`${isBot ? 'max-w-[75%]' : 'max-w-[85%]'} px-4 py-3 rounded-2xl ${
          isBot
            ? 'bg-white shadow-sm border border-emerald-100 text-gray-800'
            : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
      </div>
      
      {!isBot && (
        <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200">
          <User className="w-5 h-5 text-gray-600" />
        </div>
      )}
    </motion.div>
  );
}
