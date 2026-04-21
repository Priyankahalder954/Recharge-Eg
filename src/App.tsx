import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Wallet from './pages/Wallet';
import MobileRecharge from './pages/MobileRecharge';
import AdminPanel from './pages/AdminPanel';
import Security from './pages/Security';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import Sidebar from './components/Sidebar';
import { 
  Home, 
  History, 
  User as UserIcon, 
  LayoutDashboard, 
  PlusCircle, 
  ShieldCheck, 
  LogOut, 
  Settings, 
  ChevronRight,
  Bell,
  Smartphone,
  Zap,
  Tv,
  Bus,
  ShieldAlert,
  Menu,
  X,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

// --- Placeholder Components ---
const Dashboard = () => {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Hi, {user?.name} 👋</h2>
          <p className="text-sm text-gray-500">Welcome back to your dashboard</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Available Balance</p>
          <p className="text-3xl font-bold text-blue-600">₹{user?.balance.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Smartphone, label: 'Mobile', color: 'bg-blue-50 text-blue-600', path: '/recharge/mobile' },
          { icon: Tv, label: 'DTH', color: 'bg-orange-50 text-orange-600', path: '#', comingSoon: true },
          { icon: Zap, label: 'Electric', color: 'bg-yellow-50 text-yellow-600', path: '#', comingSoon: true },
          { icon: Bus, label: 'Fastrack', color: 'bg-green-50 text-green-600', path: '#', comingSoon: true },
        ].map((service, idx) => (
          <Link key={idx} to={service.path} className={cn("flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-blue-100 hover:shadow-md transition-all relative overflow-hidden group", service.comingSoon && "opacity-60 cursor-not-allowed")}>
             <div className={cn("p-4 rounded-xl mb-3 transition-transform group-hover:scale-110", service.color)}>
               <service.icon size={24} />
             </div>
             <span className="font-semibold text-gray-700">{service.label}</span>
             {service.comingSoon && <span className="absolute top-2 right-2 text-[10px] font-bold bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">Coming Soon</span>}
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900">Wallet Actions</h3>
          </div>
          <div className="flex gap-4">
            <Link to="/wallet" className="flex-1 flex items-center justify-center p-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100">
              <PlusCircle className="mr-2" size={20} /> Add Balance
            </Link>
            <Link to="/reports" className="flex-1 flex items-center justify-center p-4 bg-gray-50 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors border border-gray-100">
              <History className="mr-2" size={20} /> Transactions
            </Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900">Security & KYC</h3>
          </div>
          <div className="space-y-3">
             <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
               <div className="flex items-center">
                 <ShieldCheck className="text-green-600 mr-3" size={20} />
                 <div>
                   <p className="text-sm font-semibold">KYC Status</p>
                   {user?.role === 'admin' ? <p className="text-xs text-green-600 font-medium">Verified</p> : <p className="text-xs text-orange-600 font-medium">Pending Verification</p>}
                 </div>
               </div>
               <ChevronRight size={16} className="text-gray-400" />
             </div>
             <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
               <div className="flex items-center">
                 <ShieldAlert className="text-blue-600 mr-3" size={20} />
                 <div>
                   <p className="text-sm font-semibold">Security MPIN</p>
                   <p className="text-xs text-gray-500">Enable 4-digit PIN for transactions</p>
                 </div>
               </div>
               <ChevronRight size={16} className="text-gray-400" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Home', path: '/' },
    { icon: History, label: 'Reports', path: '/reports' },
    { icon: UserIcon, label: 'Profile', path: '/profile' },
    { icon: ShieldCheck, label: 'Security', path: '/security' },
  ];

  if (user?.role === 'admin') {
    menuItems.push({ icon: Settings, label: 'Admin Panel', path: '/admin' });
  }

  const isAdmin = user?.role?.toLowerCase().trim() === 'admin';
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden relative">
        {/* Only show header for Retailers. Admins get a floating menu button. */}
        {!isAdmin && (
          <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-8 shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu size={24} />
              </button>
              <div className="hidden lg:block">
                 <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors relative">
                <Bell size={22} />
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"></span>
              </button>
              <div className="w-10 h-10 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 cursor-pointer" onClick={() => navigate('/profile')}>
                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt="Avatar" />
              </div>
            </div>
          </header>
        )}

        {/* Floating Menu button for Admins (Mobile & Desktop if Sidebar closed) */}
        {isAdmin && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden fixed top-4 left-4 p-3 bg-white/80 backdrop-blur-md border border-gray-100 text-gray-900 rounded-2xl shadow-xl z-50 transform active:scale-95 transition-all"
          >
            <Menu size={24} />
          </button>
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
           <Routes>
             <Route path="/" element={<Dashboard />} />
             <Route path="/recharge/mobile" element={<MobileRecharge />} />
             <Route path="/wallet" element={<Wallet />} />
             <Route path="/reports" element={<Reports />} />
             <Route path="/profile" element={<Profile />} />
             <Route path="/security" element={<Security />} />
             {isAdmin && (
               <Route path="/admin" element={<AdminPanel />} />
             )}
             <Route path="*" element={<Navigate to="/" replace />} />
           </Routes>
        </div>

        {/* Bottom Nav ONLY for Retailers */}
        {!isAdmin && (
          <nav className="lg:hidden h-20 bg-white border-t border-gray-100 flex items-stretch shrink-0">
             {menuItems.slice(0, 3).map((item) => (
               <Link
                 key={item.path}
                 to={item.path}
                 className={cn(
                   "flex-1 flex flex-col items-center justify-center transition-colors",
                   location.pathname === item.path ? "text-blue-600" : "text-gray-400"
                 )}
               >
                 <item.icon size={22} />
                 <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">{item.label}</span>
               </Link>
             ))}
          </nav>
        )}
      </main>
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, token, loading } = useAuth();
  
  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
  if (!token || !user) return <Navigate to="/login" replace />;
  
  return <ProtectedLayout>{children}</ProtectedLayout>;
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div /> 
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
