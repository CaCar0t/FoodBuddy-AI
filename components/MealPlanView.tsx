"use client";

import React, { useState, useEffect } from 'react';
import { UserProfile, DayPlan, WeeklyPlan, Meal, HistoryItem } from '../types';
import { generateDailyPlan, generateWeeklyPlan } from '../services/geminiService';
import MealCard from './MealCard';
import { RefreshCw, CalendarDays, CheckCircle, XCircle, Lock, Save } from 'lucide-react';
import { calculateTargetCalories } from '../utils/calculations';

interface MealPlanViewProps {
  profile: UserProfile;
  savedMeals: Meal[];
  history: HistoryItem[];
  isFavorite: (meal: Meal) => boolean;
  onToggleFavorite: (meal: Meal) => void;
  onPlanGenerated: (plan: DayPlan) => void;
}

const MealPlanView: React.FC<MealPlanViewProps> = ({ 
  profile, 
  savedMeals, 
  history,
  isFavorite, 
  onToggleFavorite,
  onPlanGenerated
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');
  const [dailyPlan, setDailyPlan] = useState<DayPlan | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const targetCalories = profile.tdee ? calculateTargetCalories(profile.tdee, profile.goal) : 2000;
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (activeTab === 'daily') {
      const todayPlan = history.find(h => h.date === todayStr);
      if (todayPlan) {
        setDailyPlan(todayPlan.plan);
        setIsLocked(true);
      } else {
        setIsLocked(false);
        if (!dailyPlan) fetchDailyPlan();
      }
    }
  }, [history, activeTab, todayStr]);

  const fetchDailyPlan = async () => {
    if (isLocked) return; 

    setLoading(true);
    setError(null);
    try {
      const data = await generateDailyPlan(profile, targetCalories, savedMeals, history);
      setDailyPlan(data);
    } catch (err) {
      setError("ไม่สามารถสร้างแผนอาหารได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const confirmDailyPlan = () => {
    if (dailyPlan) {
      onPlanGenerated(dailyPlan);
      setIsLocked(true);
    }
  };

  const fetchWeeklyPlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateWeeklyPlan(profile, targetCalories, savedMeals);
      setWeeklyPlan(data);
    } catch (err) {
      setError("ไม่สามารถสร้างแผนอาหารได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'weekly' && !weeklyPlan) fetchWeeklyPlan();
  }, [activeTab]);

  return (
    <div className="space-y-6 p-6 pb-24">
      <h1 className="text-2xl font-bold text-gray-800">แผนอาหาร</h1>
      <div className="flex items-center justify-between">
        <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'daily' ? 'bg-pink-500 text-white shadow-md shadow-pink-200' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            รายวัน
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'weekly' ? 'bg-pink-500 text-white shadow-md shadow-pink-200' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            รายสัปดาห์
          </button>
        </div>
        
        {activeTab === 'weekly' && (
          <button 
            onClick={fetchWeeklyPlan}
            className="p-2 text-pink-500 hover:bg-pink-50 rounded-xl transition-colors"
            disabled={loading}
          >
            <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-3xl text-center text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-4">
          <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
          <p>AI กำลังจัดสรรเมนูเพื่อคุณ...</p>
        </div>
      ) : (
        <div className="animate-fade-in">
          {activeTab === 'daily' && dailyPlan && (
            <div className="space-y-6">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                 <div>
                    <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                        {isLocked ? <Lock size={20} className="text-pink-500"/> : <CalendarDays size={20} className="text-gray-500"/>}
                        {isLocked ? "แผนวันนี้ถูกบันทึกแล้ว" : "แผนแนะนำวันนี้"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        เป้าหมาย: {dailyPlan.totalCalories} / {targetCalories} kcal
                    </p>
                 </div>
                 <div className="flex items-center gap-3">
                    {!isLocked ? (
                         <div className="flex gap-2 w-full md:w-auto">
                            <button 
                                onClick={fetchDailyPlan}
                                className="flex-1 flex justify-center items-center gap-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition-colors text-sm font-medium"
                            >
                                <XCircle size={18} /> สุ่มใหม่
                            </button>
                            <button 
                                onClick={confirmDailyPlan}
                                className="flex-1 flex justify-center items-center gap-1 px-6 py-3 bg-pink-500 text-white rounded-2xl hover:bg-pink-600 shadow-lg shadow-pink-200 transition-all text-sm font-medium"
                            >
                                <CheckCircle size={18} /> ยอมรับแผนนี้
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 px-4 py-2 bg-pink-50 text-pink-600 rounded-2xl font-medium text-sm cursor-default border border-pink-100">
                             <CheckCircle size={16} /> บันทึกแล้ว
                        </div>
                    )}
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MealCard 
                  type="มื้อเช้า" 
                  meal={dailyPlan.breakfast} 
                  isFavorite={isFavorite(dailyPlan.breakfast)}
                  onToggleFavorite={onToggleFavorite}
                />
                <MealCard 
                  type="มื้อเที่ยง" 
                  meal={dailyPlan.lunch} 
                  isFavorite={isFavorite(dailyPlan.lunch)}
                  onToggleFavorite={onToggleFavorite}
                />
                <MealCard 
                  type="มื้อเย็น" 
                  meal={dailyPlan.dinner} 
                  isFavorite={isFavorite(dailyPlan.dinner)}
                  onToggleFavorite={onToggleFavorite}
                />
                {dailyPlan.snack && (
                  <MealCard 
                    type="อาหารว่าง" 
                    meal={dailyPlan.snack} 
                    isFavorite={isFavorite(dailyPlan.snack)}
                    onToggleFavorite={onToggleFavorite}
                  />
                )}
              </div>
            </div>
          )}

          {activeTab === 'weekly' && weeklyPlan && (
            <div className="space-y-8">
              {weeklyPlan.days.map((day, index) => (
                <div key={index} className="border-b border-gray-100 pb-8 last:border-0 last:pb-0">
                   <div className="flex items-center gap-2 mb-4 sticky top-0 bg-gray-50/95 py-3 z-10 backdrop-blur-sm">
                      <div className="bg-pink-100 p-2 rounded-xl text-pink-500">
                        <CalendarDays size={20} />
                      </div>
                      <h3 className="font-bold text-lg text-gray-800">{day.day}</h3>
                      <div className="flex-1 text-right">
                        <span className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1 rounded-full">
                          ~{day.totalCalories} kcal
                        </span>
                      </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <MealCard type="เช้า" meal={day.breakfast} isFavorite={isFavorite(day.breakfast)} onToggleFavorite={onToggleFavorite} />
                      <MealCard type="เที่ยง" meal={day.lunch} isFavorite={isFavorite(day.lunch)} onToggleFavorite={onToggleFavorite} />
                      <MealCard type="เย็น" meal={day.dinner} isFavorite={isFavorite(day.dinner)} onToggleFavorite={onToggleFavorite} />
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MealPlanView;