"use client";

import React, { useState, useEffect } from 'react';
import { UserProfile, Meal, HistoryItem, DayPlan } from '../types';
import Home from './Home';
import MealPlanView from './MealPlanView';
import ChatAssistant from './ChatAssistant';
import ProfileView from './ProfileView';
import HistoryView from './HistoryView';
import CameraView from './CameraView';
import { Home as HomeIcon, Calendar, MessageCircle, User, Camera, Scan, History } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

interface DashboardProps {
  profile: UserProfile;
  userId: string;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ profile, userId, onLogout }) => {
  const [currentTab, setCurrentTab] = useState<'home' | 'plan' | 'chat' | 'profile' | 'history'>('home');
  const [showCamera, setShowCamera] = useState(false);
  
  const [savedMeals, setSavedMeals] = useState<Meal[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (userId) {
        fetchData();
    }
  }, [userId]);

  const fetchData = async () => {
    try {
        // Fetch Favorites
        const { data: favData, error: favError } = await supabase
          .from('favorites')
          .select('meal')
          .eq('user_id', userId);
        
        if (favError) console.error("Error fetching favorites:", favError);
        if (favData) {
          setSavedMeals(favData.map((f: any) => f.meal));
        }

        // Fetch History
        const { data: histData, error: histError } = await supabase
          .from('meal_history')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (histError) console.error("Error fetching history:", histError);
        if (histData) {
          setHistory(histData.map((h: any) => ({
            id: h.id,
            date: h.date,
            timestamp: h.timestamp,
            plan: h.plan
          })));
        }
    } catch (e) {
        console.error("Fetch data error:", e);
    }
  };

  const isFavorite = (meal: Meal) => savedMeals.some(m => m.name === meal.name);

  const toggleFavorite = async (meal: Meal) => {
    try {
        if (isFavorite(meal)) {
          // Optimistic Update
          setSavedMeals(prev => prev.filter(m => m.name !== meal.name));
          
          // Delete from DB - Need to find the record first or use better matching
          const { data } = await supabase.from('favorites').select('id, meal').eq('user_id', userId);
          // Simple matching by name for now
          const match = data?.find((f: any) => f.meal.name === meal.name);
          if (match) {
            await supabase.from('favorites').delete().eq('id', match.id);
          }
        } else {
          // Optimistic Update
          setSavedMeals(prev => [...prev, meal]);
          
          // Insert to DB
          await supabase.from('favorites').insert({
            user_id: userId,
            meal: meal
          });
        }
    } catch (e) {
        console.error("Error toggling favorite:", e);
    }
  };
  
  const handleAddMeal = (meal: Meal) => {
      toggleFavorite(meal);
  };

  const handlePlanGenerated = async (plan: DayPlan) => {
    const today = new Date().toISOString().split('T')[0];
    const timestamp = Date.now();
    const newItem: HistoryItem = { id: crypto.randomUUID(), date: today, timestamp, plan };
    
    // Optimistic Update
    setHistory(prev => [newItem, ...prev.filter(h => h.date !== today)]);

    try {
        // Remove existing plan for today to avoid duplicates (assuming 1 plan per day rule)
        await supabase.from('meal_history').delete().eq('user_id', userId).eq('date', today);
        
        await supabase.from('meal_history').insert({
          user_id: userId,
          date: today,
          plan: plan,
          timestamp: timestamp
        });
    } catch (e) {
        console.error("Error saving plan:", e);
        alert("บันทึกแผนอาหารไม่สำเร็จ กรุณาลองใหม่");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row relative overflow-hidden h-screen w-full">
      
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 p-6 z-50 shadow-sm shrink-0">
         <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-pink-200">
              FB
            </div>
            <h1 className="font-bold text-xl text-gray-800 tracking-tight">FoodBuddy</h1>
         </div>

         <nav className="flex-1 space-y-2">
            <button onClick={() => setCurrentTab('home')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${currentTab === 'home' ? 'bg-pink-50 text-pink-500' : 'text-gray-500 hover:bg-gray-50'}`}>
               <HomeIcon size={20} strokeWidth={currentTab === 'home' ? 2.5 : 2} /> หน้าหลัก
            </button>
            <button onClick={() => setCurrentTab('plan')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${currentTab === 'plan' ? 'bg-pink-50 text-pink-500' : 'text-gray-500 hover:bg-gray-50'}`}>
               <Calendar size={20} strokeWidth={currentTab === 'plan' ? 2.5 : 2} /> แผนอาหาร
            </button>
            <button onClick={() => setCurrentTab('chat')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${currentTab === 'chat' ? 'bg-pink-50 text-pink-500' : 'text-gray-500 hover:bg-gray-50'}`}>
               <MessageCircle size={20} strokeWidth={currentTab === 'chat' ? 2.5 : 2} /> ปรึกษา
            </button>
            <button onClick={() => setCurrentTab('history')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${currentTab === 'history' ? 'bg-pink-50 text-pink-500' : 'text-gray-500 hover:bg-gray-50'}`}>
               <History size={20} strokeWidth={currentTab === 'history' ? 2.5 : 2} /> ประวัติ
            </button>
            <button onClick={() => setCurrentTab('profile')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${currentTab === 'profile' ? 'bg-pink-50 text-pink-500' : 'text-gray-500 hover:bg-gray-50'}`}>
               <User size={20} strokeWidth={currentTab === 'profile' ? 2.5 : 2} /> โปรไฟล์
            </button>
         </nav>

         <button onClick={() => setShowCamera(true)} className="mt-auto w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl shadow-lg shadow-pink-200 hover:shadow-xl transition-all flex items-center justify-center gap-2 font-bold">
             <Scan size={20} /> สแกนอาหาร
         </button>
      </aside>
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar bg-white/50 w-full">
        <div className="md:max-w-5xl md:mx-auto w-full h-full">
            {currentTab === 'home' && <Home profile={profile} onAddMeal={handleAddMeal} isFavorite={isFavorite} onToggleFavorite={toggleFavorite} />}
            {currentTab === 'plan' && <MealPlanView profile={profile} savedMeals={savedMeals} history={history} isFavorite={isFavorite} onToggleFavorite={toggleFavorite} onPlanGenerated={handlePlanGenerated} />}
            {currentTab === 'chat' && <ChatAssistant profile={profile} />}
            {currentTab === 'history' && <HistoryView history={history} isFavorite={isFavorite} onToggleFavorite={toggleFavorite} />}
            {currentTab === 'profile' && <ProfileView profile={profile} onLogout={onLogout} />}
        </div>
      </main>

      {/* Camera Modal */}
      {showCamera && (
        <CameraView 
            onAddMeal={handleAddMeal} 
            onCancel={() => setShowCamera(false)} 
        />
      )}

      {/* Bottom Navigation (Mobile Only) */}
      <div className="md:hidden bg-white border-t border-gray-100 p-2 flex justify-around items-end pb-6 pt-2 absolute bottom-0 w-full z-40 rounded-t-[2rem] shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
         <button 
           onClick={() => setCurrentTab('home')}
           className={`flex flex-col items-center gap-1 p-2 w-16 transition-all ${currentTab === 'home' ? 'text-pink-500' : 'text-gray-400'}`}
         >
            <HomeIcon size={24} strokeWidth={currentTab === 'home' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">หน้าหลัก</span>
         </button>

         <button 
           onClick={() => setCurrentTab('plan')}
           className={`flex flex-col items-center gap-1 p-2 w-16 transition-all ${currentTab === 'plan' ? 'text-pink-500' : 'text-gray-400'}`}
         >
            <Calendar size={24} strokeWidth={currentTab === 'plan' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">แผนอาหาร</span>
         </button>

         {/* FAB Camera Button */}
         <div className="relative -top-6">
            <button 
                onClick={() => setShowCamera(true)}
                className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-rose-400 rounded-full flex items-center justify-center text-white shadow-lg shadow-pink-200 border-4 border-gray-50 hover:scale-105 transition-transform"
            >
                <Scan size={28} />
            </button>
         </div>

         <button 
           onClick={() => setCurrentTab('chat')}
           className={`flex flex-col items-center gap-1 p-2 w-16 transition-all ${currentTab === 'chat' ? 'text-pink-500' : 'text-gray-400'}`}
         >
            <MessageCircle size={24} strokeWidth={currentTab === 'chat' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">ปรึกษา</span>
         </button>

         <button 
           onClick={() => setCurrentTab('profile')}
           className={`flex flex-col items-center gap-1 p-2 w-16 transition-all ${currentTab === 'profile' ? 'text-pink-500' : 'text-gray-400'}`}
         >
            <User size={24} strokeWidth={currentTab === 'profile' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">โปรไฟล์</span>
         </button>
      </div>

    </div>
  );
};

export default Dashboard;