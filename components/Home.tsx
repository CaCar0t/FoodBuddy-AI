"use client";

import React, { useState } from 'react';
import { UserProfile, Meal } from '../types';
import { calculateBMR, calculateTDEE, calculateTargetCalories } from '../utils/calculations';
import { suggestSingleMeal } from '../services/geminiService';
import MealCard from './MealCard';
import { Search, Zap, Heart, Utensils, DollarSign } from 'lucide-react';

interface HomeProps {
  profile: UserProfile;
  onAddMeal: (meal: Meal) => void;
  isFavorite: (meal: Meal) => boolean;
  onToggleFavorite: (meal: Meal) => void;
}

const Home: React.FC<HomeProps> = ({ profile, onAddMeal, isFavorite, onToggleFavorite }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestedMeal, setSuggestedMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(false);

  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const targetCalories = calculateTargetCalories(tdee, profile.goal);

  // BMI Calculation
  const heightM = profile.height / 100;
  const bmi = (profile.weight / (heightM * heightM)).toFixed(1);
  const getBmiStatus = (b: number) => {
      if (b < 18.5) return { text: 'น้ำหนักน้อย', color: 'text-blue-500', bg: 'bg-blue-100' };
      if (b < 23) return { text: 'สมส่วน', color: 'text-green-500', bg: 'bg-green-100' };
      if (b < 25) return { text: 'ท้วม', color: 'text-yellow-500', bg: 'bg-yellow-100' };
      if (b < 30) return { text: 'อ้วน', color: 'text-orange-500', bg: 'bg-orange-100' };
      return { text: 'อ้วนมาก', color: 'text-red-500', bg: 'bg-red-100' };
  };
  const bmiStatus = getBmiStatus(parseFloat(bmi));

  const fullProfile = { ...profile, bmr, tdee };

  const handleSuggest = async (type: string, prompt: string) => {
    setLoading(true);
    setSuggestedMeal(null);
    try {
      const meal = await suggestSingleMeal(fullProfile, type, targetCalories, prompt);
      setSuggestedMeal(meal);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'random', label: 'สุ่มเมนู', icon: <Zap size={24} />, color: 'bg-yellow-100 text-yellow-600', prompt: 'Random delicious Thai meal' },
    { id: 'healthy', label: 'เมนูสุขภาพ', icon: <Heart size={24} />, color: 'bg-green-100 text-green-600', prompt: 'Healthy, low sodium, nutrient dense meal' },
    { id: 'fast', label: 'เมนูด่วน', icon: <Utensils size={24} />, color: 'bg-orange-100 text-orange-600', prompt: 'Fast food style but healthier version or quick cooking' },
    { id: 'budget', label: 'งบน้อย', icon: <DollarSign size={24} />, color: 'bg-blue-100 text-blue-600', prompt: 'Budget friendly meal, easy ingredients' },
  ];

  // Mock popular menu for display
  const popularMeals: Meal[] = [
    { name: 'ข้าวมันไก่ต้ม', calories: 600, description: 'ข้าวมันหอมๆ พร้อมไก่ต้มเนื้อนุ่ม น้ำจิ้มรสเด็ด', cookingTime: '30 นาที', protein: 25, carbs: 60, fats: 20 },
    { name: 'ส้มตำไทย', calories: 150, description: 'มะละกอกรอบๆ รสชาติเปรี้ยวหวาน เผ็ดกำลังดี', cookingTime: '15 นาที', protein: 5, carbs: 20, fats: 2 },
    { name: 'ต้มยำกุ้งน้ำข้น', calories: 350, description: 'ต้มยำรสจัดจ้าน กุ้งตัวโต ใส่กะทิหอมมัน', cookingTime: '25 นาที', protein: 30, carbs: 10, fats: 20 },
  ];

  return (
    <div className="p-6 space-y-8 pb-24">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">หวัดดี, {profile.name} 👋</h1>
          <p className="text-gray-500 text-sm">วันนี้กินอะไรดี?</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-pink-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-2xl">
           🧑‍🍳
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="ค้นหาเมนูอาหาร..." 
          className="w-full pl-12 pr-4 py-4 rounded-3xl bg-white shadow-sm border border-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-600 placeholder-gray-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Calories Card */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-400 rounded-3xl p-6 text-white shadow-lg shadow-pink-200">
         <div className="flex justify-between items-start">
            <div>
               <p className="text-pink-100 text-sm mb-1">เป้าหมายวันนี้</p>
               <h2 className="text-4xl font-bold">{targetCalories} <span className="text-lg font-normal opacity-80">kcal</span></h2>
            </div>
            <div className="bg-white/20 p-2 rounded-2xl">
              <Zap size={24} className="text-yellow-300" fill="currentColor" />
            </div>
         </div>
         <div className="mt-4 bg-black/10 rounded-full h-2 overflow-hidden">
             <div className="bg-white h-full w-[0%]"></div>
         </div>
         <div className="mt-2 text-xs text-pink-100 text-right">0 / {targetCalories} kcal</div>
      </div>

      {/* BMI Display */}
      <div className="flex items-center justify-between bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bmiStatus.bg} ${bmiStatus.color}`}>
                  <span className="font-bold text-lg">BMI</span>
              </div>
              <div>
                  <p className="text-xs text-gray-400">ดัชนีมวลกาย</p>
                  <h3 className="font-bold text-gray-800 text-xl">{bmi}</h3>
              </div>
          </div>
          <div className={`px-4 py-2 rounded-xl text-sm font-bold ${bmiStatus.bg} ${bmiStatus.color}`}>
              {bmiStatus.text}
          </div>
      </div>

      {/* AI Suggestions Categories */}
      <div>
        <h3 className="font-bold text-gray-800 mb-4 text-lg">AI แนะนำเมนู</h3>
        <div className="flex justify-between gap-2 md:gap-6">
          {categories.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => handleSuggest(cat.label, cat.prompt)}
              className="flex flex-col items-center gap-2 w-1/4"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-sm ${cat.color} transition-transform hover:scale-110`}>
                {cat.icon}
              </div>
              <span className="text-xs font-medium text-gray-600">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Suggestion Result Area */}
      {loading && (
        <div className="text-center py-8">
           <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-2"></div>
           <p className="text-gray-400 text-sm">AI กำลังปรุงเมนู...</p>
        </div>
      )}
      
      {suggestedMeal && !loading && (
        <div className="animate-fade-in">
           <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-gray-800">ผลลัพธ์จาก AI</h3>
              <button onClick={() => setSuggestedMeal(null)} className="text-xs text-pink-500">ล้าง</button>
           </div>
           <MealCard 
              meal={suggestedMeal} 
              isFavorite={isFavorite(suggestedMeal)} 
              onToggleFavorite={onToggleFavorite}
              onAdd={onAddMeal}
           />
        </div>
      )}

      {/* Popular Menu (Horizontal Scroll) */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800 text-lg">เมนูยอดนิยม</h3>
          <span className="text-pink-500 text-sm">ดูทั้งหมด</span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 custom-scrollbar md:grid md:grid-cols-3 md:overflow-visible md:mx-0 md:px-0">
           {popularMeals.map((meal, idx) => (
             <div key={idx} className="min-w-[280px]">
                <MealCard 
                  meal={meal} 
                  isFavorite={isFavorite(meal)}
                  onToggleFavorite={onToggleFavorite}
                />
             </div>
           ))}
        </div>
      </div>

    </div>
  );
};

export default Home;