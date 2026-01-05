"use client";

import React, { useState } from 'react';
import { UserProfile, Gender, ActivityLevel, Goal } from '../types';
import { calculateBMR, calculateTDEE } from '../utils/calculations';
import { ChefHat, ArrowRight, Activity, User, Target, AlertCircle, Plus, Edit3, LogOut } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  onLogout?: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onLogout }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    dietaryRestrictions: [],
    gender: Gender.Male,
    activityLevel: ActivityLevel.Sedentary,
    goal: Goal.MaintainWeight,
  });
  
  const [isCustomActivity, setIsCustomActivity] = useState(false);
  const [isCustomGoal, setIsCustomGoal] = useState(false);
  const [newRestriction, setNewRestriction] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateStep = (currentStep: number) => {
    switch(currentStep) {
      case 1:
        return !!(formData.name && formData.age && formData.height && formData.weight);
      case 2:
        if (isCustomActivity) return !!formData.customActivity;
        return !!formData.activityLevel;
      case 3:
        if (isCustomGoal) return !!formData.customGoal;
        return !!formData.goal;
      default:
        return true;
    }
  };

  const isFieldValid = (field: keyof UserProfile) => !!formData[field];

  const handleNext = () => {
    if (step === 1) {
      setTouched(prev => ({ ...prev, name: true, age: true, height: true, weight: true }));
    }
    if (validateStep(step)) setStep((prev) => prev + 1);
  };

  const handleBack = () => setStep((prev) => prev - 1);

  const handleSubmit = () => {
    if (validateStep(1) && validateStep(2) && validateStep(3)) {
      const bmr = calculateBMR(formData as UserProfile);
      const tdee = calculateTDEE(bmr, formData.activityLevel as ActivityLevel);
      
      const fullProfile = {
          ...formData,
          bmr,
          tdee
      } as UserProfile;

      onComplete(fullProfile);
    }
  };

  const updateField = (field: keyof UserProfile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleRestriction = (restriction: string) => {
    const current = formData.dietaryRestrictions || [];
    if (current.includes(restriction)) {
      updateField('dietaryRestrictions', current.filter(r => r !== restriction));
    } else {
      updateField('dietaryRestrictions', [...current, restriction]);
    }
  };
  
  const addCustomRestriction = () => {
    if (newRestriction.trim()) {
      const val = newRestriction.trim();
      const current = formData.dietaryRestrictions || [];
      if (!current.includes(val)) updateField('dietaryRestrictions', [...current, val]);
      setNewRestriction('');
    }
  };
  
  const handleLogoutClick = async () => {
      if (onLogout) {
        onLogout();
      } else {
        await supabase.auth.signOut();
      }
  };

  const InputError = ({ field }: { field: string }) => {
    if (touched[field] && !isFieldValid(field as keyof UserProfile)) {
      return (
        <span className="text-xs text-red-500 flex items-center gap-1 mt-1 animate-pulse">
          <AlertCircle size={10} /> กรุณาระบุข้อมูล
        </span>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
          <button 
            onClick={handleLogoutClick}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
              <LogOut size={16} /> ออกจากระบบ
          </button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl p-8 max-w-lg w-full">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-pink-100 rounded-2xl text-pink-500">
            <ChefHat size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Setup Profile</h1>
            <p className="text-sm text-gray-500">ตั้งค่าข้อมูลเพื่อเริ่มใช้งาน</p>
          </div>
        </div>

        {/* Steps Progress */}
        <div className="mb-8">
            <div className="flex justify-between text-xs text-gray-400 mb-2 px-1">
                <span className={step >= 1 ? 'text-pink-500 font-bold' : ''}>ส่วนตัว</span>
                <span className={step >= 2 ? 'text-pink-500 font-bold' : ''}>กิจกรรม</span>
                <span className={step >= 3 ? 'text-pink-500 font-bold' : ''}>เป้าหมาย</span>
                <span className={step >= 4 ? 'text-pink-500 font-bold' : ''}>เพิ่มเติม</span>
            </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-pink-500 transition-all duration-300 ease-out"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="min-h-[320px]">
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
                <User size={20} className="text-pink-500" /> ข้อมูลพื้นฐาน
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อเล่น</label>
                <input 
                  type="text" 
                  className={`w-full p-3 border rounded-2xl focus:ring-2 outline-none transition-all ${
                    touched.name && !isFieldValid('name') 
                      ? 'border-red-300 focus:ring-red-200 bg-red-50' 
                      : 'border-gray-200 focus:ring-pink-500 focus:border-pink-500 bg-gray-50'
                  }`}
                  placeholder="เช่น น้องฟ้า"
                  value={formData.name || ''}
                  onChange={(e) => updateField('name', e.target.value)}
                  onBlur={() => setTouched(prev => ({...prev, name: true}))}
                />
                <InputError field="name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">อายุ (ปี)</label>
                  <input 
                    type="number" 
                    className={`w-full p-3 border rounded-2xl focus:ring-2 outline-none transition-all ${
                        touched.age && !isFieldValid('age') 
                          ? 'border-red-300 focus:ring-red-200 bg-red-50' 
                          : 'border-gray-200 focus:ring-pink-500 focus:border-pink-500 bg-gray-50'
                      }`}
                    value={formData.age || ''}
                    onChange={(e) => updateField('age', Number(e.target.value))}
                    onBlur={() => setTouched(prev => ({...prev, age: true}))}
                  />
                  <InputError field="age" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">เพศ</label>
                  <select 
                    className="w-full p-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none bg-gray-50"
                    value={formData.gender}
                    onChange={(e) => updateField('gender', e.target.value)}
                  >
                    <option value={Gender.Male}>ชาย</option>
                    <option value={Gender.Female}>หญิง</option>
                    <option value={Gender.Other}>อื่นๆ</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ส่วนสูง (ซม.)</label>
                  <input 
                    type="number" 
                    className={`w-full p-3 border rounded-2xl focus:ring-2 outline-none transition-all ${
                        touched.height && !isFieldValid('height') 
                          ? 'border-red-300 focus:ring-red-200 bg-red-50' 
                          : 'border-gray-200 focus:ring-pink-500 focus:border-pink-500 bg-gray-50'
                      }`}
                    value={formData.height || ''}
                    onChange={(e) => updateField('height', Number(e.target.value))}
                    onBlur={() => setTouched(prev => ({...prev, height: true}))}
                  />
                  <InputError field="height" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">น้ำหนัก (กก.)</label>
                  <input 
                    type="number" 
                    className={`w-full p-3 border rounded-2xl focus:ring-2 outline-none transition-all ${
                        touched.weight && !isFieldValid('weight') 
                          ? 'border-red-300 focus:ring-red-200 bg-red-50' 
                          : 'border-gray-200 focus:ring-pink-500 focus:border-pink-500 bg-gray-50'
                      }`}
                    value={formData.weight || ''}
                    onChange={(e) => updateField('weight', Number(e.target.value))}
                    onBlur={() => setTouched(prev => ({...prev, weight: true}))}
                  />
                  <InputError field="weight" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
                <Activity size={20} className="text-pink-500" /> กิจกรรมของคุณ
              </h2>
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {[
                  { val: ActivityLevel.Sedentary, label: 'นั่งทำงานเป็นหลัก', sub: 'แทบไม่ออกกำลังกาย', icon: '🛋️' },
                  { val: ActivityLevel.LightlyActive, label: 'ขยับตัวเล็กน้อย', sub: 'ออกกำลัง 1-3 วัน/สัปดาห์', icon: '🚶' },
                  { val: ActivityLevel.ModeratelyActive, label: 'ปานกลาง', sub: 'ออกกำลัง 3-5 วัน/สัปดาห์', icon: '🏃' },
                  { val: ActivityLevel.VeryActive, label: 'หนัก', sub: 'ออกกำลัง 6-7 วัน/สัปดาห์', icon: '🏋️' },
                  { val: ActivityLevel.SuperActive, label: 'หนักมาก', sub: 'นักกีฬา / งานใช้แรงงาน', icon: '🔥' },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    onClick={() => {
                        updateField('activityLevel', opt.val);
                        setIsCustomActivity(false);
                        updateField('customActivity', undefined);
                    }}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                      !isCustomActivity && formData.activityLevel === opt.val 
                        ? 'border-pink-500 bg-pink-50 text-pink-700 ring-1 ring-pink-500 shadow-sm' 
                        : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <div>
                        <div className="font-semibold text-sm">{opt.label}</div>
                        <div className="text-xs opacity-70">{opt.sub}</div>
                    </div>
                  </button>
                ))}
                
                 <button
                    onClick={() => {
                        setIsCustomActivity(true);
                        updateField('activityLevel', ActivityLevel.ModeratelyActive);
                    }}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                      isCustomActivity 
                        ? 'border-pink-500 bg-pink-50 text-pink-700 ring-1 ring-pink-500 shadow-sm' 
                        : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl">✏️</span>
                    <div>
                        <div className="font-semibold text-sm">ระบุเอง</div>
                        <div className="text-xs opacity-70">รูปแบบการใช้ชีวิตที่แตกต่าง</div>
                    </div>
                  </button>
                  
                  {isCustomActivity && (
                      <div className="pt-2 animate-fade-in">
                          <textarea
                             className="w-full p-3 border border-pink-300 rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none text-sm bg-gray-50"
                             rows={3}
                             placeholder="เช่น ทำงานก่อสร้าง และออกกำลังกายตอนเย็น..."
                             value={formData.customActivity || ''}
                             onChange={(e) => updateField('customActivity', e.target.value)}
                          />
                      </div>
                  )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
                <Target size={20} className="text-pink-500" /> เป้าหมายของคุณ
              </h2>
              <div className="grid grid-cols-1 gap-3 overflow-y-auto max-h-[350px] pr-1">
                 {[
                  { val: Goal.LoseWeight, label: 'ลดน้ำหนัก', desc: 'กินน้อยกว่าที่ใช้ (Deficit)', color: 'text-orange-600 bg-orange-50 border-orange-200 hover:border-orange-300' },
                  { val: Goal.MaintainWeight, label: 'รักษาน้ำหนัก', desc: 'กินเท่าที่ใช้ (Maintenance)', color: 'text-blue-600 bg-blue-50 border-blue-200 hover:border-blue-300' },
                  { val: Goal.GainMuscle, label: 'เพิ่มกล้ามเนื้อ', desc: 'กินมากกว่าที่ใช้ (Surplus)', color: 'text-purple-600 bg-purple-50 border-purple-200 hover:border-purple-300' },
                ].map((opt) => (
                   <button
                    key={opt.val}
                    onClick={() => {
                        updateField('goal', opt.val);
                        setIsCustomGoal(false);
                        updateField('customGoal', undefined);
                    }}
                    className={`w-full p-4 rounded-2xl border text-left transition-all ${
                      !isCustomGoal && formData.goal === opt.val 
                        ? `ring-2 ring-offset-1 ring-${opt.color.split(' ')[0].replace('text-', '')} ${opt.color}` 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-bold text-lg mb-1">{opt.label}</div>
                    <div className="text-sm opacity-80">{opt.desc}</div>
                  </button>
                ))}
                
                <button
                    onClick={() => {
                        setIsCustomGoal(true);
                        updateField('goal', Goal.MaintainWeight);
                    }}
                    className={`w-full p-4 rounded-2xl border text-left transition-all ${
                      isCustomGoal
                        ? 'ring-2 ring-offset-1 ring-gray-600 text-gray-800 bg-gray-50 border-gray-300' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                        <Edit3 size={18} />
                        <div className="font-bold text-lg">ระบุเอง</div>
                    </div>
                    <div className="text-sm opacity-80">เป้าหมายเฉพาะทางของคุณ</div>
                </button>
                
                {isCustomGoal && (
                      <div className="pt-1 animate-fade-in">
                          <textarea
                             className="w-full p-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-gray-500 outline-none text-sm bg-gray-50"
                             rows={3}
                             placeholder="เช่น ต้องการลดไขมันแต่รักษากล้ามเนื้อ..."
                             value={formData.customGoal || ''}
                             onChange={(e) => updateField('customGoal', e.target.value)}
                          />
                      </div>
                  )}
              </div>
            </div>
          )}

          {step === 4 && (
             <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-semibold text-gray-800">ข้อจำกัดทางอาหาร</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {['ไม่ทานเนื้อสัตว์', 'มังสวิรัติ (Vegan)', 'แพ้นมวัว', 'แพ้ถั่ว', 'แพ้อาหารทะเล', 'คีโต (Keto)', 'ฮาลาล (Halal)', 'ทานคลีน', 'ลดน้ำตาล', 'ลดเค็ม'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleRestriction(tag)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                      formData.dietaryRestrictions?.includes(tag)
                        ? 'bg-pink-500 text-white border-pink-600 shadow-md shadow-pink-100'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-pink-300 hover:bg-pink-50'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200">
                  <label className="text-xs text-gray-500 mb-2 block font-medium">เพิ่มข้อจำกัดอื่นๆ (ระบุเอง)</label>
                  <div className="flex gap-2">
                      <input 
                        type="text"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                        placeholder="เช่น ไม่ชอบผักชี..."
                        value={newRestriction}
                        onChange={(e) => setNewRestriction(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addCustomRestriction()}
                      />
                      <button 
                        onClick={addCustomRestriction}
                        className="bg-pink-500 text-white p-2 rounded-xl hover:bg-pink-600 transition-colors"
                        disabled={!newRestriction.trim()}
                      >
                          <Plus size={20} />
                      </button>
                  </div>
                   <div className="flex flex-wrap gap-2 mt-3">
                    {formData.dietaryRestrictions
                        ?.filter(r => !['ไม่ทานเนื้อสัตว์', 'มังสวิรัติ (Vegan)', 'แพ้นมวัว', 'แพ้ถั่ว', 'แพ้อาหารทะเล', 'คีโต (Keto)', 'ฮาลาล (Halal)', 'ทานคลีน', 'ลดน้ำตาล', 'ลดเค็ม'].includes(r))
                        .map(r => (
                         <button
                            key={r}
                            onClick={() => toggleRestriction(r)}
                            className="px-3 py-1 rounded-lg text-sm font-medium border bg-pink-100 text-pink-800 border-pink-200 flex items-center gap-1 hover:bg-red-50 hover:text-red-500 hover:border-red-200 group transition-all"
                          >
                            {r} <span className="text-xs opacity-50 group-hover:opacity-100">×</span>
                          </button>
                    ))}
                   </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
          <button 
            onClick={handleBack}
            className={`px-6 py-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
          >
            ย้อนกลับ
          </button>
          
          {step < 4 ? (
            <button 
              onClick={handleNext}
              className="px-6 py-3 bg-pink-500 text-white rounded-2xl shadow-lg shadow-pink-200 hover:bg-pink-600 hover:shadow-xl transition-all flex items-center gap-2"
            >
              ถัดไป <ArrowRight size={18} />
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-pink-200 hover:shadow-xl hover:scale-105 transition-all"
            >
              เริ่มต้นใช้งาน
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default Onboarding;