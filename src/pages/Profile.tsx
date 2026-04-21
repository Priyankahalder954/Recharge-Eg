import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { User, Mail, Smartphone, Calendar, FileCheck, ShieldCheck, AlertCircle, Loader2, Camera } from 'lucide-react';
import { motion } from 'motion/react';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [aadhaar, setAadhaar] = useState('');
  const [pan, setPan] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/user/kyc', { aadhaar, pan });
      setSuccess(true);
      refreshUser();
    } catch (err: any) {
      setError(err.response?.data?.error || 'KYC submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6 pb-20">
      {/* Account Info */}
      <div className="md:col-span-1 space-y-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-3xl mx-auto mb-4 border border-gray-200 overflow-hidden relative group">
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt="Avatar" />
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer">
                  <Camera size={20} />
               </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-1 italic">{user?.role}</p>
            
            <div className="mt-8 pt-8 border-t border-gray-50 flex flex-col items-center">
               <p className="text-xs font-bold text-gray-400 uppercase mb-1">Current Balance</p>
               <p className="text-3xl font-black italic text-gray-900 leading-none">₹{user?.balance.toFixed(2)}</p>
            </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
           <div className="flex items-center gap-3">
              <Mail className="text-gray-400" size={18} />
              <div className="overflow-hidden">
                 <p className="text-[10px] font-bold text-gray-400 uppercase leading-none">Email Address</p>
                 <p className="text-sm font-semibold text-gray-700 truncate">{user?.email}</p>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <Smartphone className="text-gray-400" size={18} />
              <div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase leading-none">Mobile Number</p>
                 <p className="text-sm font-semibold text-gray-700">**********</p>
              </div>
           </div>
        </div>
      </div>

      {/* KYC System */}
      <div className="md:col-span-2 space-y-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
           <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                 <FileCheck size={24} />
              </div>
              <div>
                 <h2 className="text-xl font-bold text-gray-900">KYC Verification</h2>
                 <p className="text-sm text-gray-500">Enable full wallet limits and withdrawals</p>
              </div>
              {user?.role === 'admin' ? (
                 <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl text-xs font-bold">
                    <ShieldCheck size={16} /> Verified
                 </div>
              ) : (
                 <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-xl text-xs font-bold">
                    <AlertCircle size={16} /> Pending
                 </div>
              )}
           </div>

           {user?.role !== 'admin' && (
             <form onSubmit={handleKycSubmit} className="space-y-6">
                {error && <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl">{error}</div>}
                {success && <div className="p-3 bg-green-50 text-green-600 text-sm font-bold rounded-xl italic">KYC Details Submitted Successfully!</div>}
                
                <div className="grid md:grid-cols-2 gap-6">
                   <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Aadhaar Card Number</label>
                      <input
                        required
                        placeholder="12 digit Aadhaar"
                        className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-100 outline-none font-semibold transition-all"
                        value={aadhaar}
                        onChange={(e) => setAadhaar(e.target.value)}
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">PAN Card Number</label>
                      <input
                        required
                        placeholder="ABCDE1234F"
                        className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-100 outline-none font-semibold transition-all"
                        value={pan}
                        onChange={(e) => setPan(e.target.value)}
                      />
                   </div>
                </div>

                <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 flex gap-4 text-xs text-purple-700 font-medium">
                   <Info size={20} className="shrink-0" />
                   <p>By submitting, you agree to allow us to verify your identity. Your data is encrypted and secure.</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-lg flex items-center justify-center disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Submit KYC Documents'}
                </button>
             </form>
           )}

           {user?.role === 'admin' && (
             <div className="text-center py-8">
                <ShieldCheck size={64} className="mx-auto text-green-500 mb-4 opacity-20" />
                <h4 className="font-bold text-gray-400 italic">Identity Verified as Administrator</h4>
                <p className="text-xs text-gray-400 mt-2">No further KYC actions required for your account status.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

import { Info } from 'lucide-react';
