import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Gift, Loader2, ChevronDown, Sparkles, RotateCcw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from '@/api/base44Client';

import ChatMessage from '@/components/gift/ChatMessage';
import GiftCard from '@/components/gift/GiftCard';
import BudgetSlider from '@/components/gift/BudgetSlider';
import PhotoUpload from '@/components/gift/PhotoUpload';
import InterestTags from '@/components/gift/InterestTags';

const steps = {
  GREETING: 'greeting',
  NAME: 'name',
  AGE: 'age',
  GENDER: 'gender',
  INTERESTS: 'interests',
  PHOTOS: 'photos',
  BUDGET: 'budget',
  GENERATING: 'generating',
  RESULTS: 'results'
};

export default function Home() {
  const isDark = false;
  const [currentStep, setCurrentStep] = useState(steps.GREETING);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    recipientName: '',
    age: '',
    gender: '',
    interests: [],
    photos: [],
    budgetMin: 2000,
    budgetMax: 10000
  });
  
  const [gifts, setGifts] = useState([]);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStep]);

  useEffect(() => {
    setTimeout(() => {
      addBotMessage('Привет! 🎁 Я помогу подобрать идеальный подарок. Давай начнём!\n\nКак зовут именинника?');
      setCurrentStep(steps.NAME);
    }, 500);
  }, []);

  const addBotMessage = (text) => {
    setMessages(prev => [...prev, { text, isBot: true }]);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, { text, isBot: false }]);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    const value = inputValue.trim();

    if (currentStep === steps.NAME) {
      addUserMessage(value);
      setInputValue('');
      setFormData(prev => ({ ...prev, recipientName: value }));
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addBotMessage(`Отлично! Готовлю подарок для ${value} ✨\n\nСколько лет исполняется?`);
        setCurrentStep(steps.AGE);
      }, 800);
    } else if (currentStep === steps.AGE) {
      // Validate age - only numbers or text representation of numbers
      const numberWords = ['один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять', 'десять', 
                          'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать', 'шестнадцать', 
                          'семнадцать', 'восемнадцать', 'девятнадцать', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 
                          'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто', 'сто'];
      const isNumber = /^\d+$/.test(value);
      const isNumberWord = numberWords.some(word => value.toLowerCase().includes(word));
      
      if (!isNumber && !isNumberWord) {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          addBotMessage('Пожалуйста, укажи возраст цифрами или словами (например, "25" или "двадцать пять")');
        }, 400);
        return;
      }
      
      addUserMessage(value);
      setInputValue('');
      setFormData(prev => ({ ...prev, age: value }));
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addBotMessage('Понял! А теперь выбери пол:');
        setCurrentStep(steps.GENDER);
      }, 600);
    }
  };

  const handleGenderSelect = (gender) => {
    const genderText = gender === 'male' ? 'Мужчина' : 'Женщина';
    addUserMessage(genderText);
    setFormData(prev => ({ ...prev, gender }));
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addBotMessage('Супер! Теперь расскажи об интересах и хобби именинника 🎯');
      setCurrentStep(steps.INTERESTS);
    }, 600);
  };

  const handleInterestsNext = () => {
    if (formData.interests.length === 0) return;
    addUserMessage(`Интересы: ${formData.interests.join(', ')}`);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addBotMessage('Если есть фото увлечений или хобби — загрузи их! Это поможет подобрать более точные идеи 📸\n\nМожешь пропустить этот шаг.');
      setCurrentStep(steps.PHOTOS);
    }, 600);
  };

  const handlePhotosNext = () => {
    if (formData.photos.length > 0) {
      addUserMessage(`Загружено фото: ${formData.photos.length}`);
    } else {
      addUserMessage('Пропускаю загрузку фото');
    }
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addBotMessage('Отлично! Последний шаг — выбери бюджет на подарок 💰');
      setCurrentStep(steps.BUDGET);
    }, 600);
  };

  const handleBudgetNext = async () => {
    const formatPrice = (v) => new Intl.NumberFormat('ru-RU').format(v) + ' ₽';
    addUserMessage(`Бюджет: ${formatPrice(formData.budgetMin)} — ${formatPrice(formData.budgetMax)}`);
    
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addBotMessage('Генерирую идеи подарков... Это займёт несколько секунд ✨');
      setCurrentStep(steps.GENERATING);
      generateGifts();
    }, 600);
  };

  const generateGifts = async () => {
    const prompt = `Ты эксперт по подаркам. Подбери 5 идей подарков на основе данных:
    
Имя: ${formData.recipientName}
Возраст: ${formData.age} лет
Пол: ${formData.gender === 'male' ? 'мужской' : formData.gender === 'female' ? 'женский' : 'не указан'}
Интересы: ${formData.interests.join(', ')}
Бюджет: от ${formData.budgetMin} до ${formData.budgetMax} рублей
${formData.photos.length > 0 ? 'Также учти загруженные фото увлечений.' : ''}

Для каждого подарка дай:
- Название (name)
- Краткое описание (description) - почему это хороший выбор
- Примерную цену в рублях (price_range)
- Категорию товара (category) - одна из: luxury, music, gaming, books, photo, art, sport, food, travel, accessories, fashion, love, special, default
- available_in_marketplaces (boolean) - false если это подарочный сертификат, впечатление, услуга или что-то что нельзя купить в маркетплейсе
- Если available_in_marketplaces=true, добавь ссылки:
  - ozon_link: https://www.ozon.ru/search/?text=название+товара
  - wildberries_link: https://www.wildberries.ru/catalog/0/search.aspx?search=название+товара  
  - yandex_market_link: https://market.yandex.ru/search?text=название+товара

Важно: подбирай разнообразные, креативные и персонализированные идеи. Для подарочных сертификатов, впечатлений, мастер-классов и услуг ставь available_in_marketplaces=false.

Ответь в формате JSON: {"gifts": [...]}.`;

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-r1-distill-qwen-32b',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        })
      });

      const data = await response.json();
      const content = data.choices[0].message.content;
      const result = JSON.parse(content);

      const generatedGifts = result.gifts || [];
      
      // Use gift images from the LLM response (already includes image_url from internet search)
      const giftsWithImages = generatedGifts;

      setGifts(prev => [...prev, ...giftsWithImages]);
      const totalGifts = gifts.length + giftsWithImages.length;
      addBotMessage(`Готово! Нашёл ${giftsWithImages.length} ${gifts.length > 0 ? 'новых ' : ''}идей подарков для ${formData.recipientName} 🎉`);
      setCurrentStep(steps.RESULTS);

      // Save to database
      await base44.entities.GiftSearch.create({
        recipient_name: formData.recipientName,
        age: parseInt(formData.age) || 0,
        gender: formData.gender,
        interests: formData.interests,
        budget_min: formData.budgetMin,
        budget_max: formData.budgetMax,
        photo_urls: formData.photos,
        generated_gifts: giftsWithImages
      });

    } catch (error) {
      console.error('Error generating gifts:', error);
      addBotMessage('Произошла ошибка при генерации. Попробуй ещё раз!');
      setCurrentStep(steps.BUDGET);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setCurrentStep(steps.GREETING);
    setFormData({
      recipientName: '',
      age: '',
      gender: '',
      interests: [],
      photos: [],
      budgetMin: 2000,
      budgetMax: 10000
    });
    setGifts([]);
    
    setTimeout(() => {
      addBotMessage('Привет! 🎁 Я помогу подобрать идеальный подарок. Давай начнём!\n\nКак зовут именинника?');
      setCurrentStep(steps.NAME);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-emerald-100 shadow-lg shadow-emerald-100/50"
      >
        <div className="max-w-2xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-green-600 flex items-center justify-center shadow-xl shadow-emerald-200"
            >
              <Gift className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Idea4Gift
              </h1>
              <p className="text-xs text-emerald-600 font-medium">Умный подбор подарков</p>
            </div>
          </div>
          
          {currentStep !== steps.GREETING && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetChat}
              className="text-emerald-600 hover:text-white hover:bg-gradient-to-r hover:from-emerald-500 hover:to-teal-500 transition-all rounded-xl px-4"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Сначала
            </Button>
          )}
        </div>
      </motion.header>

      {/* Chat Container */}
      <div 
        ref={chatContainerRef}
        className="max-w-2xl mx-auto px-4 pb-32 overflow-x-hidden"
      >
        <div className="py-6 space-y-4">
          <AnimatePresence mode="popLayout">
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg.text} isBot={msg.isBot} isDark={isDark} />
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-gray-400"
            >
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}

          {/* Gender Selection */}
          {currentStep === steps.GENDER && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              {[
                { value: 'male', label: '👨 Мужчина', color: 'from-emerald-400 to-teal-500' },
                { value: 'female', label: '👩 Женщина', color: 'from-teal-400 to-green-500' }
              ].map((option) => (
                <Button
                  key={option.value}
                  onClick={() => handleGenderSelect(option.value)}
                  className={`flex-1 bg-gradient-to-r ${option.color} text-white border-0 shadow-lg hover:opacity-90 transition-opacity rounded-2xl h-12`}
                >
                  {option.label}
                </Button>
              ))}
            </motion.div>
          )}

          {/* Interests Selection */}
          {currentStep === steps.INTERESTS && (
            <div className="space-y-4">
              <InterestTags
                interests={formData.interests}
                onInterestsChange={(interests) => setFormData(prev => ({ ...prev, interests }))}
                isDark={isDark}
              />
              <Button
                onClick={handleInterestsNext}
                disabled={formData.interests.length === 0}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl h-12 shadow-lg shadow-emerald-200 hover:opacity-90 transition-opacity"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Продолжить
              </Button>
            </div>
          )}

          {/* Photo Upload */}
          {currentStep === steps.PHOTOS && (
            <div className="space-y-4">
              <PhotoUpload
                photos={formData.photos}
                onPhotosChange={(photos) => setFormData(prev => ({ ...prev, photos }))}
                isUploading={isUploading}
                setIsUploading={setIsUploading}
                isDark={isDark}
              />
              <Button
                onClick={handlePhotosNext}
                disabled={isUploading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl h-12 shadow-lg shadow-emerald-200 hover:opacity-90 transition-opacity"
              >
                {formData.photos.length > 0 ? 'Продолжить' : 'Пропустить'}
              </Button>
            </div>
          )}

          {/* Budget Selection */}
          {currentStep === steps.BUDGET && (
            <div className="space-y-4">
              <BudgetSlider
                min={formData.budgetMin}
                max={formData.budgetMax}
                onMinChange={(v) => setFormData(prev => ({ ...prev, budgetMin: v }))}
                onMaxChange={(v) => setFormData(prev => ({ ...prev, budgetMax: v }))}
                isDark={isDark}
              />
              <Button
                onClick={handleBudgetNext}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl h-12 shadow-lg shadow-emerald-200 hover:opacity-90 transition-opacity"
              >
                <Gift className="w-4 h-4 mr-2" />
                Найти подарки
              </Button>
            </div>
          )}

          {/* Generating Animation */}
          {currentStep === steps.GENERATING && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-12"
            >
              <div className="relative">
                {/* Pulsing rings */}
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 w-32 h-32 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                />
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                  className="absolute inset-0 w-32 h-32 rounded-full bg-gradient-to-r from-teal-500 to-green-500"
                />
                
                {/* Center gift icon with rotation */}
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="relative w-32 h-32 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center shadow-2xl shadow-emerald-300"
                >
                  <Sparkles className="w-12 h-12 text-white absolute -top-2 -right-2 animate-pulse" />
                  <Gift className="w-12 h-12 text-white" />
                  <Sparkles className="w-8 h-8 text-white absolute -bottom-1 -left-1 animate-pulse" style={{ animationDelay: '0.5s' }} />
                </motion.div>
              </div>
              
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="mt-6 font-semibold text-lg text-emerald-700"
              >
                Подбираю идеи...
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex gap-2 mt-4"
              >
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                    className="w-2 h-2 rounded-full bg-emerald-500"
                  />
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* Gift Results */}
          {currentStep === steps.RESULTS && gifts.length > 0 && (
            <div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid gap-2"
                style={{
                  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))'
                }}
              >
                {gifts.map((gift, i) => (
                  <GiftCard key={i} gift={gift} index={i} isDark={isDark} />
                ))}
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="py-6"
              >
                <Button
                  onClick={async () => {
                    setCurrentStep(steps.GENERATING);
                    addBotMessage('Генерирую ещё больше идей для тебя... ✨');
                    await generateGifts();
                  }}
                  variant="outline"
                  className="w-full rounded-2xl border-2 h-12 border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Подобрать ещё идеи
                </Button>
              </motion.div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      {(currentStep === steps.NAME || currentStep === steps.AGE) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-0 left-0 right-0 backdrop-blur-xl border-t p-4 bg-white/90 border-emerald-100"
        >
          <div className="max-w-2xl mx-auto flex gap-3">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={currentStep === steps.NAME ? 'Введите имя...' : 'Введите возраст...'}
              className="flex-1 rounded-2xl h-12 px-5 border-emerald-200 focus:border-emerald-400"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="w-12 h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg hover:opacity-90 transition-opacity shadow-emerald-200"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
