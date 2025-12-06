import React from 'react';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';
import { Slider } from "@/components/ui/slider";

const formatPrice = (value) => {
  return new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
};

export default function BudgetSlider({ min, max, onMinChange, onMaxChange, isDark }) {
  const budgetRanges = [500, 1000, 2000, 3000, 5000, 7000, 10000, 15000, 20000, 30000, 50000, 100000];
  
  const minIndex = budgetRanges.findIndex(v => v >= min) || 0;
  const maxIndex = budgetRanges.findIndex(v => v >= max) || budgetRanges.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl p-6 shadow-lg border bg-white border-emerald-100"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Бюджет на подарок</h3>
          <p className="text-sm text-emerald-600">Выберите ценовой диапазон</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-3">
            <span className="text-sm text-gray-500">От</span>
            <span className="text-sm font-semibold text-emerald-600">{formatPrice(min)}</span>
          </div>
          <Slider
            value={[minIndex]}
            onValueChange={(v) => onMinChange(budgetRanges[v[0]])}
            max={budgetRanges.length - 1}
            step={1}
            className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-emerald-400 [&_[role=slider]]:to-teal-500 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg"
          />
        </div>

        <div>
          <div className="flex justify-between mb-3">
            <span className="text-sm text-gray-500">До</span>
            <span className="text-sm font-semibold text-teal-600">{formatPrice(max)}</span>
          </div>
          <Slider
            value={[maxIndex]}
            onValueChange={(v) => onMaxChange(budgetRanges[v[0]])}
            max={budgetRanges.length - 1}
            step={1}
            className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-teal-400 [&_[role=slider]]:to-green-500 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg"
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl p-4 text-center bg-gradient-to-r from-emerald-50 to-teal-50">
        <p className="text-sm text-gray-600">Ваш бюджет:</p>
        <p className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          {formatPrice(min)} — {formatPrice(max)}
        </p>
      </div>
    </motion.div>
  );
}
