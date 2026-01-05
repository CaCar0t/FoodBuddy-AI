"use client";

import React, { useState } from 'react';
import { HistoryItem, Meal } from '../types';
import MealCard from './MealCard';
import { Calendar, ChevronDown, ChevronUp, History } from 'lucide-react';

interface HistoryViewProps {
  history: HistoryItem[];
  isFavorite: (meal: Meal) => boolean;
  onToggleFavorite: (meal: Meal) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, isFavorite, onToggleFavorite }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (history.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400 animate-fade-in p-6">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
             <History size={40} />
        </div>
        <p>ยังไม่มีประวัติการวางแผน</p>
        <p className="text-sm">เมื่อคุณยอมรับแผนอาหาร ระบบจะบันทึกไว้ที่นี่</p>
      </div>
    );
  }

  const sortedHistory = [...history].sort((a, b) => b.timestamp - a.timestamp);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-4 animate-fade-in p-6 pb-24">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">ประวัติการกิน</h1>
      {sortedHistory.map((item) => {
        const isExpanded = expandedId === item.id;
        const dateObj = new Date(item.timestamp);
        const dateStr = dateObj.toLocaleDateString('th-TH', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        return (
          <div key={item.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden transition-all">
            <button 
              onClick={() => toggleExpand(item.id)}
              className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="bg-pink-100 p-3 rounded-2xl text-pink-500">
                  <Calendar size={24} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-gray-800">{dateStr}</div>
                  <div className="text-xs text-gray-500 mt-0.5">รวม {item.plan.totalCalories} kcal</div>
                </div>
              </div>
              <div className="text-gray-300">
                {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </div>
            </button>

            {isExpanded && (
               <div className="p-5 pt-0 border-t border-gray-100 bg-gray-50/50">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <MealCard type="เช้า" meal={item.plan.breakfast} isFavorite={isFavorite(item.plan.breakfast)} onToggleFavorite={onToggleFavorite} />
                      <MealCard type="เที่ยง" meal={item.plan.lunch} isFavorite={isFavorite(item.plan.lunch)} onToggleFavorite={onToggleFavorite} />
                      <MealCard type="เย็น" meal={item.plan.dinner} isFavorite={isFavorite(item.plan.dinner)} onToggleFavorite={onToggleFavorite} />
                   </div>
               </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default HistoryView;