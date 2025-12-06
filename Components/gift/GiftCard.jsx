import React from 'react';
import { motion } from 'framer-motion';
import { Gift, Sparkles, Heart, Star, Gem, Music, Gamepad2, Book, Camera, Palette, Dumbbell, Utensils, Plane, Watch, Shirt } from 'lucide-react';

const categoryIcons = {
  default: Gift,
  luxury: Gem,
  music: Music,
  gaming: Gamepad2,
  books: Book,
  photo: Camera,
  art: Palette,
  sport: Dumbbell,
  food: Utensils,
  travel: Plane,
  accessories: Watch,
  fashion: Shirt,
  love: Heart,
  special: Star,
};

const iconColors = [
  'from-emerald-500 to-teal-500',
  'from-teal-500 to-green-500',
  'from-green-500 to-emerald-600',
  'from-emerald-600 to-teal-600',
  'from-teal-600 to-green-700',
];

// Marketplace logos
const OzonLogo = () => (
  <img 
    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69316384b77fea929baab6f9/b83e24aec_image.png" 
    alt="Ozon" 
    className="w-full h-full object-cover"
  />
);

const WBLogo = () => (
  <img 
    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69316384b77fea929baab6f9/144e74c28_image.png" 
    alt="Wildberries" 
    className="w-full h-full object-cover"
  />
);

const YMLogo = () => (
  <img 
    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69316384b77fea929baab6f9/74b4776be_image.png" 
    alt="Яндекс Маркет" 
    className="w-full h-full object-cover"
  />
);

export default function GiftCard({ gift, index, isDark }) {
  const hasMarketplaceLinks = gift.available_in_marketplaces !== false;
  
  const marketplaces = hasMarketplaceLinks ? [
    { name: 'Ozon', link: gift.ozon_link, Logo: OzonLogo, bg: 'bg-[#005BFF] hover:bg-[#0050E0]' },
    { name: 'WB', link: gift.wildberries_link, Logo: WBLogo, bg: 'bg-[#CB11AB] hover:bg-[#B00F99]' },
    { name: 'Маркет', link: gift.yandex_market_link, Logo: YMLogo, bg: 'bg-[#FFCC00] hover:bg-[#E6B800] text-black' },
  ].filter(m => m.link) : [];

  const IconComponent = categoryIcons[gift.category] || categoryIcons.default;
  const colorClass = iconColors[index % iconColors.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.08, ease: "easeOut" }}
      className={`rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border ${isDark ? 'bg-[#241830] border-[#3b2d4d]' : 'bg-white border-gray-100'}`}
    >
      {/* Infographic header */}
      <div className={`relative h-24 bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-white/20" />
          <div className="absolute bottom-3 right-3 w-12 h-12 rounded-full bg-white/10" />
          <div className="absolute top-4 right-6 w-4 h-4 rounded-full bg-white/30" />
        </div>
        <IconComponent className="w-10 h-10 text-white drop-shadow-lg" />
      </div>
      
      {/* Content */}
      <div className="p-3">
        {/* Price */}
        <div className={`text-sm font-bold mb-1.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
          {gift.price_range}
        </div>
        
        <h3 className={`font-semibold text-sm leading-tight line-clamp-2 mb-1.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {gift.name}
        </h3>

        <p className={`text-xs leading-relaxed mb-3 ${isDark ? 'text-violet-300' : 'text-gray-500'}`}>
          {gift.description}
        </p>
        
        {/* Marketplace buttons or unavailable notice */}
        {marketplaces.length > 0 ? (
          <div className="flex gap-1.5">
            {marketplaces.map((marketplace) => (
              <a
                key={marketplace.name}
                href={marketplace.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 overflow-hidden rounded-xl h-10 transition-transform hover:scale-105"
              >
                <marketplace.Logo />
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-2 rounded-lg text-xs bg-emerald-50 text-emerald-600">
            <Sparkles className="w-3 h-3 inline mr-1" />
            Найти самостоятельно
          </div>
        )}
      </div>
    </motion.div>
  );
}
