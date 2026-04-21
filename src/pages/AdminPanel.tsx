import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, CreditCard, ShieldCheck, TrendingUp, Check, X, 
  Search, Filter, Loader2, MessageCircle, Settings, 
  Smartphone, Bell, Download, Plus, Trash2, Edit2, History, HelpCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { Link, useSearchParams } from 'react-router-dom';

type AdminTab = 'dashboard' | 'users' | 'wallet' | 'plans' | 'commissions' | 'kyc' | 'settings' | 'notifications' | 'support';

export default function AdminPanel() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [supportRequests, setSupportRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const activeTab = (searchParams.get('tab') as AdminTab) || 'dashboard';
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uResp, rResp, sResp, pResp, cResp, supResp] = await Promise.all([
        axios.get('/api/admin/users'),
        axios.get('/api/admin/wallet-requests'),
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/plans'),
        axios.get('/api/admin/commissions'),
        axios.get('/api/admin/support')
      ]);
      setUsers(uResp.data);
      setRequests(rResp.data);
      setStats(sResp.data);
      setPlans(pResp.data);
      setCommissions(cResp.data);
      setSupportRequests(supResp.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const setActiveTab = (tab: AdminTab) => {
    setSearchParams({ tab });
  };

  const handleApprove = async (id: number) => {
    try { await axios.post(`/api/admin/wallet-requests/${id}/approve`); fetchData(); }
    catch (err) { alert('Approval failed'); }
  };

  const tabs: { id: AdminTab; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Stats', icon: TrendingUp },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'wallet', label: 'Wallet', icon: CreditCard },
    { id: 'plans', label: 'Plans', icon: Smartphone },
    { id: 'commissions', label: 'Commissions', icon: History },
    { id: 'kyc', label: 'KYC', icon: ShieldCheck },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'support', label: 'Support', icon: HelpCircle },
    { id: 'settings', label: 'Setup', icon: Settings },
  ];

  const handleResolveSupport = async (id: number) => {
    try { await axios.post(`/api/admin/support/${id}/resolve`); fetchData(); }
    catch (err) { alert('Resolution failed'); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><div className="flex flex-col items-center gap-4"><Loader2 className="animate-spin text-blue-600" size={48} /><p className="text-gray-400 font-bold animate-pulse">Syncing Control Center...</p></div></div>;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-gray-900 tracking-tighter">ADMIN CONTROL</h1>
                <Link to="/" className="text-[10px] font-bold bg-blue-600 text-white px-3 py-1 rounded-full uppercase hover:bg-blue-700 transition-all shadow-md shadow-blue-100">Switch to Retailer</Link>
              </div>
              <p className="text-xs text-gray-400 font-black uppercase mt-1">Management Hub v2.0</p>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 scale-105' 
                    : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        {/* Dashboard/Stats */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Users', val: stats.totalUsers, icon: Users, color: 'blue' },
                { label: 'Today Txs', val: stats.todayTransactions, icon: History, color: 'green' },
                { label: 'Total Recharge', val: `₹${stats.totalRecharge}`, icon: Smartphone, color: 'purple' },
                { label: 'Commission', val: `₹${stats.totalCommission}`, icon: TrendingUp, color: 'orange' },
                { label: 'Wallet Req', val: stats.pendingWallet, icon: CreditCard, color: 'red' },
                { label: 'KYC Req', val: stats.pendingKyc, icon: ShieldCheck, color: 'indigo' },
                { label: 'Support', val: stats.pendingSupport, icon: MessageCircle, color: 'pink' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                  <div className={`w-12 h-12 rounded-2xl mb-4 flex items-center justify-center bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                    <stat.icon size={24} />
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase">{stat.label}</p>
                  <p className="text-2xl font-black text-gray-900 tracking-tighter">{stat.val}</p>
                </div>
              ))}
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
               <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-black mb-6">Recent Users</h3>
                  <div className="space-y-4">
                     {users.slice(0, 5).map(u => (
                       <div key={u.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase">{u.full_name[0]}</div>
                             <div>
                                <p className="text-sm font-black">{u.full_name}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">{u.mobile_number}</p>
                             </div>
                          </div>
                          <p className="text-xs font-black">₹{u.balance}</p>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3">
              <Search className="text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search by name, email or mobile..." 
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="p-3 bg-blue-600 text-white rounded-2xl"><Plus size={20} /></button>
            </div>
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-[10px] uppercase text-gray-400 font-black">
                    <th className="px-8 py-5">User Details</th>
                    <th className="px-8 py-5">Wallet</th>
                    <th className="px-8 py-5">KYC</th>
                    <th className="px-8 py-5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.filter(u => u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || u.mobile_number.includes(searchTerm)).map(u => (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <p className="text-sm font-black text-gray-900">{u.full_name}</p>
                        <p className="text-xs text-gray-400 font-bold">{u.email} • {u.mobile_number}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="bg-blue-50 px-3 py-1 rounded-full inline-block">
                           <span className="text-sm font-black text-blue-600">₹{u.balance.toFixed(2)}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                          u.kyc_status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {u.kyc_status}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex gap-2">
                           <button className="p-2 hover:bg-white rounded-xl transition-all"><Edit2 size={16} /></button>
                           <button className="p-2 text-red-500 hover:bg-white rounded-xl transition-all"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Wallet Tab */}
        {activeTab === 'wallet' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.length === 0 ? <div className="col-span-full py-20 text-center"><p className="text-gray-400 font-black uppercase tracking-widest text-sm">Clear Horizon • No Pending Requests</p></div> : 
              requests.map(req => (
                <div key={req.id} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6">
                     <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-full">PENDING</span>
                  </div>
                  <div className="mb-6">
                    <p className="text-xs text-gray-400 font-black uppercase mb-1">Requested Amount</p>
                    <h4 className="text-4xl font-black text-gray-900 tracking-tighter italic">₹{req.amount}</h4>
                  </div>
                  <div className="space-y-3 mb-8">
                    <div className="flex justify-between text-xs font-bold border-b border-gray-50 pb-2">
                       <span className="text-gray-400">USER</span>
                       <span className="text-gray-900 uppercase tracking-tighter">{users.find(u => u.id === req.user_id)?.full_name || 'System User'}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold border-b border-gray-50 pb-2">
                       <span className="text-gray-400">UTR NO</span>
                       <span className="text-gray-900 font-mono">{req.utr_number}</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => handleApprove(req.id)} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-100 text-xs font-black uppercase transform active:scale-95 transition-all">Approve Fund</button>
                    <a href={`https://wa.me/91${users.find(u => u.id === req.user_id)?.mobile_number}`} target="_blank" className="p-4 bg-green-500 text-white rounded-2xl flex items-center justify-center hover:bg-green-600 transition-all"><MessageCircle size={20} /></a>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {/* Support Tab */}
        {activeTab === 'support' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {supportRequests.length === 0 ? <div className="col-span-full py-20 text-center"><p className="text-gray-400 font-black uppercase tracking-widest text-sm">All Quiet • No Pending Support Requests</p></div> : 
              supportRequests.map(req => (
                <div key={req.id} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6">
                     <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-full uppercase">{req.type}</span>
                  </div>
                  <div className="mb-6">
                    <p className="text-xs text-gray-400 font-black uppercase mb-1">Issue Type</p>
                    <h4 className="text-lg font-black text-gray-900 tracking-tighter uppercase">{req.type.replace('_', ' ')}</h4>
                  </div>
                  <div className="space-y-3 mb-8">
                    <div className="flex justify-between text-xs font-bold border-b border-gray-50 pb-2">
                       <span className="text-gray-400">CONTACT</span>
                       <span className="text-gray-900">{req.email || req.mobile}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold border-b border-gray-50 pb-2">
                       <span className="text-gray-400">DATE</span>
                       <span className="text-gray-900">{format(new Date(req.created_at), 'dd MMM, hh:mm a')}</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => handleResolveSupport(req.id)} className="flex-1 py-4 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase hover:opacity-90 transition-all">Mark Resolved</button>
                    <a href={`https://wa.me/91${req.mobile || ''}`} target="_blank" className="p-4 bg-green-500 text-white rounded-2xl flex items-center justify-center hover:bg-green-600 transition-all"><MessageCircle size={20} /></a>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {/* Commissions Tab */}
        {activeTab === 'commissions' && (
           <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[50px] border border-gray-100 shadow-sm">
                 <h2 className="text-xl font-black mb-8 italic">Operator Commission</h2>
                 <div className="space-y-6">
                    {commissions.map(c => (
                       <div key={c.operator} className="flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900 font-black group-hover:bg-blue-600 group-hover:text-white transition-all">{c.operator[0]}</div>
                             <span className="font-black text-gray-900">{c.operator}</span>
                          </div>
                          <div className="flex items-center gap-4">
                             <div className="flex items-center bg-gray-100 rounded-xl px-4 py-2">
                                <input type="number" defaultValue={c.percentage} className="w-12 bg-transparent border-none text-center font-black p-0 focus:ring-0" />
                                <span className="text-xs font-black text-gray-400 ml-1">%</span>
                             </div>
                             <button className="p-3 bg-gray-900 text-white rounded-xl"><Edit2 size={16} /></button>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
           <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[50px] border border-gray-100 shadow-sm">
                 <h2 className="text-xl font-black mb-8 italic">API & Branding</h2>
                 <div className="space-y-8">
                    <div>
                        <label className="text-xs text-gray-400 font-black uppercase mb-3 block">Logo URL</label>
                        <div className="flex gap-4">
                           <input type="text" placeholder="https://..." className="flex-1 bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl text-sm font-bold" />
                           <button className="px-8 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs">Update</button>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 font-black uppercase mb-3 block">Recharge API Gateway</label>
                        <select className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl text-sm font-bold appearance-none">
                           <option>Mock Gateway (Active)</option>
                           <option>Cyrus Recharge API</option>
                           <option>E-Pay Gateway</option>
                        </select>
                    </div>
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}
