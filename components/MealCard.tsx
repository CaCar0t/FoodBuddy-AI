"use client";

import React from 'react';
import { Meal } from '../types';
import { Clock, Flame, Heart } from 'lucide-react';

interface MealCardProps {
  meal: Meal;
  type?: string;
  isFavorite?: boolean;
  onToggleFavorite?: (meal: Meal) => void;
  onAdd?: (meal: Meal) => void;
}

const MealCard: React.FC<MealCardProps> = ({ meal, type, isFavorite = false, onToggleFavorite, onAdd }) => {
  return (
    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all group relative">
      <div className="flex justify-between items-start mb-2 pr-8">
        <div>
           {type && <span className="text-xs font-bold tracking-wider text-pink-500 uppercase mb-1 block">{type}</span>}
           <h3 className="font-bold text-gray-800 text-lg group-hover:text-pink-600 transition-colors">{meal.name}</h3>
        </div>
        <div className="bg-orange-50 text-orange-500 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0">
          <Flame size={12} fill="currentColor" /> {meal.calories}
        </div>
      </div>
      
      {onToggleFavorite && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(meal);
          }}
          className={`absolute top-5 right-4 p-2 rounded-full transition-all ${
            isFavorite 
              ? 'text-red-500 bg-red-50 hover:bg-red-100' 
              : 'text-gray-300 hover:text-red-400 hover:bg-gray-50'
          }`}
        >
          <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      )}
      
      <p className="text-gray-500 text-sm mb-4 line-clamp-2">{meal.description}</p>
      
      <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
            {meal.cookingTime && (
              <div className="flex items-center gap-1">
                <Clock size={14} /> {meal.cookingTime}
              </div>
            )}
            {(meal.protein || meal.carbs) && (
                <div className="flex gap-2">
                    {meal.protein && <span>P: {meal.protein}g</span>}
                    {meal.carbs && <span>C: {meal.carbs}g</span>}
                </div>
            )}
          </div>
          
          {onAdd && (
              <button 
                onClick={() => onAdd(meal)} 
                className="text-xs bg-pink-500 text-white px-3 py-1.5 rounded-xl hover:bg-pink-600 transition-colors"
              >
                  + บันทึก
              </button>
          )}
      </div>
    </div>
  );
};

export default MealCard;