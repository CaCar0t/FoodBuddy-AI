"use client";

import React, { useState, useEffect, useRef } from 'react';
import Auth from '../components/Auth';
import Onboarding from '../components/Onboarding';
import Dashboard from '../components/Dashboard';
import { UserProfile } from '../types';
import { supabase } from '../utils/supabaseClient';

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const lastUserId = useRef<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // Initial Auth Check
  useEffect(() => {
    // Safety timeout: If data fetching takes too long, stop loading to prevent infinite spinner
    const safetyTimeout = setTimeout(() => {
        if (isMounted.current && loading) {
            console.warn("Loading timed out, forcing render.");
            setLoading(false);
        }
    }, 5000);

    let subscription: any = null;

    const initAuth = async () => {
      // 1. Check active session immediately to prevent flash
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      
      if (isMounted.current) {
        if (initialSession) {
          setSession(initialSession);
          if (initialSession.user.id !== lastUserId.current) {
            lastUserId.current = initialSession.user.id;
            await fetchUserProfile(initialSession.user.id);
          }
        } else {
          setLoading(false);
        }
      }

      // 2. Listen for auth changes
      const { data } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
        if (!isMounted.current) return;
        
        setSession(currentSession);

        if (currentSession) {
          if (currentSession.user.id !== lastUserId.current) {
            setLoading(true);
            lastUserId.current = currentSession.user.id;
            await fetchUserProfile(currentSession.user.id);
          }
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setLoading(false);
          lastUserId.current = null;
        } else if (!currentSession) {
          setLoading(false);
        }
      });
      subscription = data.subscription;
    };

    initAuth();

    return () => {
        clearTimeout(safetyTimeout);
        if (subscription) subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Fetch profile from 'profiles' table
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!isMounted.current) return;

      if (error) {
        if (error.code === 'PGRST116') {
          setProfile(null);
        } else {
          console.error("Error fetching profile:", error.message || error);
          setIsError(true);
        }
        return;
      }

      // Check if profile exists and has minimal required data
      if (data && data.age !== null && data.weight !== null && data.height !== null) {
        const userProfile: UserProfile = {
          name: data.name,
          email: data.email, // Read email from DB
          age: data.age,
          gender: data.gender,
          height: data.height,
          weight: data.weight,
          activityLevel: data.activity_level,
          goal: data.goal,
          dietaryRestrictions: data.dietary_restrictions || [],
          customActivity: data.custom_activity,
          customGoal: data.custom_goal,
          bmr: data.bmr,
          tdee: data.tdee
        };
        setProfile(userProfile);
      } else {
        // Profile incomplete or missing -> User needs to do Onboarding
        setProfile(null);
      }
    } catch (e) {
      console.error("Profile fetch exception:", e);
      setIsError(true);
    } finally {
      // Always ensure loading stops
      setLoading(false);
    }
  };

  const handleSetupComplete = async (newProfile: UserProfile) => {
    if (!session?.user) return;
    setLoading(true);

    try {
      // Explicit column mapping
      const profileData = {
        id: session.user.id,
        email: session.user.email, // Save email to DB
        name: newProfile.name,
        age: newProfile.age,
        gender: newProfile.gender,
        height: newProfile.height,
        weight: newProfile.weight,
        activity_level: newProfile.activityLevel,
        goal: newProfile.goal,
        dietary_restrictions: newProfile.dietaryRestrictions || [],
        custom_activity: newProfile.customActivity || null,
        custom_goal: newProfile.customGoal || null,
        bmr: newProfile.bmr,
        tdee: newProfile.tdee
      };

      const { error } = await supabase.from('profiles').upsert(profileData);

      if (error) throw error;
      setProfile({ ...newProfile, email: session.user.email });

    } catch (error: any) {
      console.error("Save Profile Error:", error);
      alert("บันทึกข้อมูลไม่สำเร็จ: " + (error.message || "Unknown error"));
    } finally {
      // Ensure spinner stops even if error
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    // 1. Immediate UI update
    setProfile(null);
    setSession(null);
    setLoading(false);

    // 2. Perform Supabase signout in background
    try {
        const { error } = await supabase.auth.signOut();
        if (error) console.error("SignOut Error:", error);
    } catch (e) {
        console.error("SignOut Exception:", e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col gap-4">
        <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm animate-pulse">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col gap-4 p-6 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-2">
            <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="text-xl font-bold text-gray-800">เกิดข้อผิดพลาดในการโหลดข้อมูล</h2>
        <p className="text-gray-500">ไม่สามารถดึงข้อมูลโปรไฟล์ได้ กรุณาลองใหม่อีกครั้ง</p>
        <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-pink-500 text-white rounded-2xl font-bold shadow-lg shadow-pink-200 hover:bg-pink-600 transition-all mt-4"
        >
            ลองใหม่
        </button>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  if (!profile) {
    return <Onboarding onComplete={handleSetupComplete} onLogout={handleLogout} />;
  }

  return <Dashboard profile={profile} userId={session.user.id} onLogout={handleLogout} />;
}