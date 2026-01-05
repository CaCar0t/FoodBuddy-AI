"use client";

import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Check, X } from 'lucide-react';
import { analyzeFoodImage } from '../services/geminiService';
import { Meal } from '../types';
import MealCard from './MealCard';

interface CameraViewProps {
  onAddMeal: (meal: Meal) => void;
  onCancel: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onAddMeal, onCancel }) => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<Meal | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImage(base64String);
        // Remove data URL prefix for API
        const base64Data = base64String.split(',')[1];
        handleAnalyze(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async (base64Data: string) => {
    setAnalyzing(true);
    setResult(null);
    try {
      const meal = await analyzeFoodImage(base64Data);
      setResult(meal);
    } catch (error) {
      console.error("Failed to analyze image", error);
      alert("ไม่สามารถวิเคราะห์รูปภาพได้ กรุณาลองใหม่");
      setImage(null);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRetake = () => {
    setImage(null);
    setResult(null);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 flex justify-between items-center text-white bg-black/50 backdrop-blur-md absolute top-0 w-full z-10">
        <button onClick={onCancel} className="p-2 bg-white/20 rounded-full">
            <X size={24} />
        </button>
        <h3 className="font-bold">AI Food Scanner</h3>
        <div className="w-10"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center relative bg-gray-900">
        {!image ? (
          <div className="text-center space-y-6">
             <div className="w-64 h-64 border-2 border-pink-500 rounded-3xl flex items-center justify-center relative mx-auto">
                <div className="absolute inset-0 border-t-2 border-l-2 border-white w-8 h-8 rounded-tl-3xl -top-1 -left-1"></div>
                <div className="absolute inset-0 border-t-2 border-r-2 border-white w-8 h-8 rounded-tr-3xl -top-1 -right-1"></div>
                <div className="absolute inset-0 border-b-2 border-l-2 border-white w-8 h-8 rounded-bl-3xl -bottom-1 -left-1"></div>
                <div className="absolute inset-0 border-b-2 border-r-2 border-white w-8 h-8 rounded-br-3xl -bottom-1 -right-1"></div>
                <Camera size={48} className="text-white/50" />
             </div>
             <p className="text-white/80">ถ่ายรูปอาหารของคุณ <br/> เพื่อให้ AI คำนวณแคลอรี่</p>
             
             <div className="flex gap-4 justify-center mt-8">
               <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-pink-500 text-white p-4 rounded-full shadow-lg shadow-pink-500/50 hover:scale-110 transition-transform"
               >
                  <Camera size={32} />
               </button>
               <input 
                 type="file" 
                 accept="image/*" 
                 capture="environment"
                 className="hidden" 
                 ref={fileInputRef}
                 onChange={handleFileChange}
               />
             </div>
             <p className="text-xs text-gray-400 mt-4">รองรับทั้งการถ่ายสดและอัปโหลดรูป</p>
          </div>
        ) : (
          <div className="w-full h-full relative flex flex-col">
             <img src={image} alt="Captured" className="w-full h-full object-cover" />
             
             {/* Analysis Overlay */}
             <div className="absolute bottom-0 w-full bg-white rounded-t-[2rem] p-6 shadow-2xl animate-slide-up max-h-[60%] overflow-y-auto">
                {analyzing ? (
                   <div className="text-center py-8">
                      <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
                      <h3 className="text-xl font-bold text-gray-800">กำลังวิเคราะห์...</h3>
                      <p className="text-gray-500">AI กำลังตรวจสอบอาหารในจานของคุณ</p>
                   </div>
                ) : result ? (
                   <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-gray-800">ผลการวิเคราะห์</h3>
                        <button onClick={handleRetake} className="text-sm text-pink-500">ถ่ายใหม่</button>
                      </div>
                      <MealCard meal={result} />
                      <button 
                        onClick={() => {
                            onAddMeal(result);
                            onCancel();
                        }}
                        className="w-full py-3 bg-pink-500 text-white rounded-2xl font-bold shadow-lg shadow-pink-200 hover:bg-pink-600 transition-all flex items-center justify-center gap-2"
                      >
                         <Check size={20} /> บันทึกลงในไดอารี่
                      </button>
                   </div>
                ) : (
                    <div className="text-center py-4 text-red-500">
                        เกิดข้อผิดพลาด <button onClick={handleRetake} className="underline">ลองใหม่</button>
                    </div>
                )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraView;