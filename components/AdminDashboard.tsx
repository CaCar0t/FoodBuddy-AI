"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Users, Activity, PieChart, Search, Trash2, RefreshCw, LogOut, LayoutDashboard, Shield, ShieldCheck, Edit, Loader2, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  goal: string;
  created_at?: string;
  role?: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview');
  const [stats, setStats] = useState({ totalUsers: 0, totalPlans: 0, totalFavorites: 0 });
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [debugRole, setDebugRole] = useState<string>('-');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchStats = async () => {
    try {
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: planCount } = await supabase.from('meal_history').select('*', { count: 'exact', head: true });
      const { count: favCount } = await supabase.from('favorites').select('*', { count: 'exact', head: true });
      
      setStats({
        totalUsers: userCount || 0,
        totalPlans: planCount || 0,
        totalFavorites: favCount || 0
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, name, goal, created_at, role')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      if (data) setUsers(data as any);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError((error as any).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
      if(!confirm("คุณแน่ใจหรือไม่ที่จะลบข้อมูลผู้ใช้นี้? การกระทำนี้ไม่สามารถย้อนกลับได้")) return;
      
      try {
        const { error } = await supabase.from('profiles').delete().eq('id', userId);
        if (error) throw error;
        
        setUsers(users.filter(u => u.id !== userId));
        fetchStats(); // Update stats
        alert("ลบผู้ใช้งานเรียบร้อยแล้ว");
      } catch (error: any) {
        alert("เกิดข้อผิดพลาดในการลบ: " + error.message);
      }
  };

  const handleToggleRole = async (userId: string, currentRole: string = 'user') => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      if (error) throw error;

      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      alert(`เปลี่ยนสิทธิ์ผู้ใช้เป็น ${newRole} เรียบร้อยแล้ว`);
    } catch (error: any) {
      alert("เกิดข้อผิดพลาดในการเปลี่ยนสิทธิ์: " + error.message);
    }
  };

  const handleEditGoal = async (userId: string, currentGoal: string) => {
    const newGoal = prompt("แก้ไขเป้าหมาย (Goal):", currentGoal);
    if (newGoal === null || newGoal === currentGoal) return;

    try {
      const { error } = await supabase.from('profiles').update({ goal: newGoal }).eq('id', userId);
      if (error) throw error;

      setUsers(users.map(u => u.id === userId ? { ...u, goal: newGoal } : u));
    } catch (error: any) {
      alert("เกิดข้อผิดพลาดในการแก้ไข: " + error.message);
    }
  };

  useEffect(() => {
    const initData = async () => {
      // 1. ตรวจสอบ Session ก่อนดึงข้อมูลเสมอ
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        router.replace('/');
        return;
      }

      // เช็ค Role จริงๆ จาก DB
      const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      
      if (data?.role !== 'admin') {
        router.replace('/');
        return;
      }

      setCurrentUser(session.user);
      setDebugRole(data?.role || 'not found');
      setIsAuthorized(true);

      fetchStats();
      if (activeTab === 'users') fetchUsers();
    };
    initData();
  }, [activeTab]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
      </div>
    );
  }

  const filteredUsers = users.filter(u => 
    (u.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (u.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row font-sans relative">
      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 z-30 shadow-sm">
         <div className="flex items-center gap-3">
           <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
             A
           </div>
           <h1 className="text-lg font-bold text-gray-800">Admin Panel</h1>
         </div>
         <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
         </button>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:sticky md:top-0 md:h-screen shrink-0`}>
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
           <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
             A
           </div>
           <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
           <button 
             onClick={() => setActiveTab('overview')}
             className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${activeTab === 'overview' ? 'bg-pink-50 text-pink-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
           >
             <LayoutDashboard size={20} /> ภาพรวมระบบ
           </button>
           <button 
             onClick={() => setActiveTab('users')}
             className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${activeTab === 'users' ? 'bg-pink-50 text-pink-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
           >
             <Users size={20} /> จัดการผู้ใช้งาน
           </button>
        </nav>
        <div className="p-4 border-t border-gray-100">
            <button onClick={() => router.push('/')} className="w-full flex items-center gap-3 p-3 text-gray-500 hover:bg-gray-50 rounded-xl transition-all font-medium">
                <LogOut size={20} /> กลับสู่หน้าหลัก
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden w-full">
         {activeTab === 'overview' ? (
             <div className="space-y-8 max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-800">Dashboard Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="ผู้ใช้งานทั้งหมด" value={stats.totalUsers} icon={<Users className="text-blue-500" size={24} />} color="bg-blue-50" />
                    <StatCard title="แผนอาหารที่สร้างแล้ว" value={stats.totalPlans} icon={<Activity className="text-green-500" size={24} />} color="bg-green-50" />
                    <StatCard title="เมนูที่ถูกบันทึก" value={stats.totalFavorites} icon={<PieChart className="text-purple-500" size={24} />} color="bg-purple-50" />
                </div>
             </div>
         ) : (
             <div className="space-y-6 max-w-6xl mx-auto">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-gray-800">User Management</h2>
                    <button onClick={fetchUsers} className="p-2 text-gray-500 hover:bg-white hover:shadow-md rounded-full transition-all"><RefreshCw size={20} /></button>
                </div>
                
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="ค้นหาชื่อ หรือ อีเมล..." 
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Error Message Display */}
                {error && (
                    <div className="bg-red-50 text-red-500 p-4 rounded-xl border border-red-100 flex items-center gap-2 text-sm">
                        <span>⚠️</span> เกิดข้อผิดพลาด: {error}
                    </div>
                )}

                {/* Users Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-5 font-semibold text-gray-600 text-sm uppercase tracking-wider">User Info</th>
                                <th className="p-5 font-semibold text-gray-600 text-sm uppercase tracking-wider">Goal</th>
                                <th className="p-5 font-semibold text-gray-600 text-sm uppercase tracking-wider">Joined Date</th>
                                <th className="p-5 font-semibold text-gray-600 text-sm uppercase tracking-wider">Role</th>
                                <th className="p-5 font-semibold text-gray-600 text-sm uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={4} className="p-10 text-center text-gray-400">Loading users...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan={4} className="p-10 text-center text-gray-400">No users found.</td></tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="p-5">
                                            <div className="font-bold text-gray-900">{user.name || 'Unknown'}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </td>
                                        <td className="p-5 text-gray-600">
                                            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">{user.goal || 'Not set'}</span>
                                        </td>
                                        <td className="p-5 text-gray-500 text-sm">
                                            {user.created_at ? new Date(user.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium flex w-fit items-center gap-1 ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                                                {user.role === 'admin' ? <ShieldCheck size={12} /> : <Users size={12} />}
                                                {user.role || 'user'}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => handleEditGoal(user.id, user.goal)}
                                                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                                title="Edit Goal"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleToggleRole(user.id, user.role)}
                                                className="p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-all"
                                                title="Toggle Admin Role"
                                            >
                                                <Shield size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                title="Delete User"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                  </div>
                </div>
                <div className="text-right text-xs text-gray-400">
                    Total Users: {filteredUsers.length}
                </div>
             </div>
         )}
      </main>
    </div>
  );
}

const StatCard = ({ title, value, icon, color }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
        <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center shadow-sm`}>
            {icon}
        </div>
        <div>
            <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-gray-800">{value.toLocaleString()}</h3>
        </div>
    </div>
);