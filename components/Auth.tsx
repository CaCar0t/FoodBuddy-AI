"use client";

import React, { useState } from 'react';
import { ChefHat, ArrowRight, Loader2, Mail, Lock, UserPlus, LogIn } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useRouter } from 'next/navigation';

interface AuthProps {
  onLogin?: () => void;
  onRegister?: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onRegister }) => {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'register') {
        if (password !== confirmPassword) {
          throw new Error('รหัสผ่านไม่ตรงกัน');
        }
        if (password.length < 6) {
          throw new Error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
        }

        // 1. Sign Up Only
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          alert('สมัครสมาชิกสำเร็จ! ยินดีต้อนรับสู่ FoodBuddy AI');
          if (onRegister) onRegister();
        }

      } else {
        // Login Logic
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        // Check if user is admin
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();
          
          if (profile?.role === 'admin') {
            router.push('/admin');
            return;
          }
        }

        if (onLogin) onLogin();
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      
      // Robust Error Translation
      const rawMsg = err.message || '';
      const msg = rawMsg.toLowerCase();
      let displayMsg = rawMsg;

      if (msg.includes('invalid login credentials')) {
          displayMsg = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
      } 
      else if (msg.includes('user already registered') || msg.includes('unique constraint') || msg.includes('already registered')) {
          displayMsg = 'อีเมลนี้ถูกลงทะเบียนแล้ว';
      }
      else if (msg.includes('rate limit') || msg.includes('too many requests')) {
          displayMsg = 'ทำรายการเร็วเกินไป กรุณารอสักครู่';
      }
      else if (msg.includes('password should be at least')) {
          displayMsg = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
      }
      
      setError(displayMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex flex-col items-center justify-center p-6 font-prompt">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-pink-100 overflow-hidden border border-white">
        
        {/* Header Section */}
        <div className="bg-pink-500 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/food.png')] opacity-10"></div>
            <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-pink-500 mb-4 shadow-lg shadow-pink-600/20">
                    <ChefHat size={40} strokeWidth={2.5} />
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">FoodBuddy AI</h1>
                <p className="text-pink-100 text-sm mt-1">เพื่อนคู่ใจเรื่องโภชนาการ</p>
            </div>
        </div>

        {/* Auth Toggle */}
        <div className="flex p-2 m-4 bg-gray-100 rounded-2xl">
            <button
                onClick={() => { setMode('login'); setError(null); }}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    mode === 'login' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
            >
                <LogIn size={16} /> เข้าสู่ระบบ
            </button>
            <button
                onClick={() => { setMode('register'); setError(null); }}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    mode === 'register' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
            >
                <UserPlus size={16} /> สมัครสมาชิก
            </button>
        </div>

        {/* Form */}
        <div className="p-8 pt-2">
            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-500 rounded-2xl text-sm text-center border border-red-100 flex items-center justify-center gap-2 animate-pulse">
                   <span>⚠️</span> {error}
                </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 ml-1">อีเมล</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="email" 
                            required
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:bg-white transition-all text-gray-700"
                            placeholder="name@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 ml-1">รหัสผ่าน</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="password" 
                            required
                            minLength={6}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:bg-white transition-all text-gray-700"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                {mode === 'register' && (
                    <div className="space-y-1 animate-fade-in">
                        <label className="text-xs font-bold text-gray-500 ml-1">ยืนยันรหัสผ่าน</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input 
                                type="password" 
                                required
                                minLength={6}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:bg-white transition-all text-gray-700"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-pink-200 hover:shadow-xl hover:scale-[1.02] transition-all mt-6 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="animate-spin" /> : (mode === 'login' ? 'เข้าใช้งาน' : 'ลงทะเบียน')}
                    {!loading && <ArrowRight size={20} />}
                </button>
            </form>
        </div>
      </div>
      
      <p className="mt-8 text-xs text-gray-400">
         © 2024 FoodBuddy AI. All rights reserved.
      </p>
    </div>
  );
};

export default Auth;