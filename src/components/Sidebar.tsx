import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, History, User as UserIcon, ShieldCheck, Settings, LogOut, Smartphone, 
  Users, CreditCard, Bell, TrendingUp, HelpCircle, Image as ImageIcon
} from 'lucide-react';
import { motion } from 'motion/react';
import axios from 'axios';
import { cn } from '../lib/utils';

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [logo, setLogo] = useState('');

  useEffect(() => {
    axios.get('/api/settings').then(res => setLogo(res.data.logo));
  }, []);

  const isAdmin = user?.role?.toLowerCase().trim() === 'admin';
  const isAdminPath = location.pathname.startsWith('/admin');

  const commonItems = [
    { icon: LayoutDashboard, label: 'Retailer Dashboard', path: '/' },
    { icon: History, label: 'Reports', path: '/reports' },
    { icon: UserIcon, label: 'Profile', path: '/profile' },
    { icon: ShieldCheck, label: 'Security', path: '/security' },
  ];

  const adminItems = [
    { icon: TrendingUp, label: 'Admin Dashboard', path: '/admin', tab: 'dashboard' },
    { icon: Users, label: 'Manage Users', path: '/admin', tab: 'users' },
    { icon: CreditCard, label: 'Wallet Requests', path: '/admin', tab: 'wallet' },
    { icon: Smartphone, label: 'Recharge Plans', path: '/admin', tab: 'plans' },
    { icon: History, label: 'Commissions', path: '/admin', tab: 'commissions' },
    { icon: ShieldCheck, label: 'KYC Verification', path: '/admin', tab: 'kyc' },
    { icon: Bell, label: 'Send Alerts', path: '/admin', tab: 'notifications' },
    { icon: HelpCircle, label: 'Support Requests', path: '/admin', tab: 'support' },
    { icon: Settings, label: 'API Settings', path: '/admin', tab: 'settings' },
  ];

  const renderLink = (item: any) => {
    const searchParams = new URLSearchParams(location.search);
    const activeTab = searchParams.get('tab') || 'dashboard';
    const isActive = location.pathname === item.path && (!item.tab || activeTab === item.tab);

    return (
      <Link
        key={item.label + item.path + (item.tab || '')}
        to={item.tab ? `${item.path}?tab=${item.tab}` : item.path}
        onClick={onClose}
        className={cn(
          "flex items-center px-4 py-3 rounded-xl font-bold transition-all group mb-1",
          isActive
            ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
            : "text-gray-400 hover:bg-gray-50 hover:text-gray-900"
        )}
      >
        <item.icon className={cn("mr-4", isActive ? "text-white" : "text-gray-400 group-hover:text-gray-900")} size={20} />
        <span className="text-sm tracking-tight">{item.label}</span>
      </Link>
    );
  };

  return (
    <motion.aside
      className={cn(
        "fixed lg:relative inset-y-0 left-0 w-72 bg-white border-r border-gray-100 z-50 flex flex-col transition-transform duration-300 transform",
        !isOpen && "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="p-8 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm">
           <img src={logo || 'https://seeklogo.com/images/R/recharge-logo-7DA7D8A17F-seeklogo.com.png'} alt="Logo" className="w-full h-full object-contain" />
        </div>
        <span className="text-xl font-black italic tracking-tighter text-blue-600">RechargePro</span>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto pt-2">
        {isAdminPath ? (
           <div className="mb-6">
             <div className="flex justify-between items-center px-4 mb-3">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Control Center</p>
             </div>
             {adminItems.map(renderLink)}
           </div>
        ) : (
           <div className="mb-6">
             <p className="text-[10px] font-black text-gray-400 uppercase px-4 mb-3 tracking-widest">Main Menu</p>
             {commonItems.map(renderLink)}
           </div>
        )}
      </nav>

      <div className="p-4 border-t border-gray-50 space-y-2">
        {isAdmin && (
           <button
             onClick={() => {
                navigate(isAdminPath ? '/' : '/admin');
                onClose();
             }}
             className="w-full flex items-center px-4 py-3 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all"
           >
             <Settings className="mr-4" size={20} /> 
             {isAdminPath ? 'Switch to Retailer' : 'Switch to Admin Mode'}
           </button>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center px-4 py-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl font-bold transition-all"
        >
          <LogOut className="mr-4" size={22} /> Logout
        </button>
      </div>
    </motion.aside>
  );
}
