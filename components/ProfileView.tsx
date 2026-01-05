"use client";

import React from 'react';
import { UserProfile, Goal } from '../types';
import { User, Settings, LogOut, ChevronRight, Heart, History, Shield, Info } from 'lucide-react';

interface ProfileViewProps {
  profile: UserProfile;
  onLogout: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile, onLogout }) => {
  const menuItems = [
    { icon: <Heart size={20} />, label: 'เมนูโปรด', desc: 'รายการอาหารที่คุณชอบ' },
    { icon: <History size={20} />, label: 'ประวัติการกิน', desc: 'ย้อนดูแคลอรี่ที่ผ่านมา' },
    { icon: <Shield size={20} />, label: 'ข้อมูลสุขภาพ', desc: 'น้ำหนัก, ส่วนสูง, BMI' },
    { icon: <Settings size={20} />, label: 'ตั้งค่า', desc: 'การแจ้งเตือน, ภาษา' },
    { icon: <Info size={20} />, label: 'เกี่ยวกับแอป', desc: 'เวอร์ชั่น 1.0.0' },
  ];

  return (
    <div className="p-6 pb-24 md:pb-6 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800">โปรไฟล์</h1>
      
      {/* Profile Card */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
         <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 text-3xl border-4 border-pink-50">
            <User size={32} />
         </div>
         <div>
            <h2 className="text-xl font-bold text-gray-800">{profile.name}</h2>
            <div className="text-sm text-gray-500 mt-1">
               {profile.age} ปี • {profile.gender === 'Male' ? 'ชาย' : 'หญิง'}
            </div>
            <div className="flex gap-2 mt-2">
                <span className="px-2 py-0.5 bg-pink-50 text-pink-600 text-xs rounded-lg border border-pink-100">
                    {profile.goal}
                </span>
            </div>
         </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4">
         <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 text-center">
             <div className="text-gray-400 text-xs mb-1">น้ำหนัก</div>
             <div className="text-xl font-bold text-gray-800">{profile.weight} <span className="text-xs font-normal">กก.</span></div>
         </div>
         <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 text-center">
             <div className="text-gray-400 text-xs mb-1">ส่วนสูง</div>
             <div className="text-xl font-bold text-gray-800">{profile.height} <span className="text-xs font-normal">ซม.</span></div>
         </div>
      </div>

      {/* Menu List */}
      <div className="space-y-3">
         {menuItems.map((item, idx) => (
             <button key={idx} className="w-full bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                   <div className="p-2 bg-gray-50 rounded-xl text-gray-600">
                      {item.icon}
                   </div>
                   <div className="text-left">
                      <div className="font-semibold text-gray-800 text-sm">{item.label}</div>
                      <div className="text-xs text-gray-400">{item.desc}</div>
                   </div>
                </div>
                <ChevronRight size={18} className="text-gray-300" />
             </button>
         ))}
      </div>

      {/* Logout */}
      <button 
        onClick={onLogout}
        className="w-full p-4 rounded-2xl border border-red-100 text-red-500 bg-red-50 hover:bg-red-100 transition-colors font-semibold flex items-center justify-center gap-2"
      >
         <LogOut size={20} /> ออกจากระบบ
      </button>

    </div>
  );
};

export default ProfileView;