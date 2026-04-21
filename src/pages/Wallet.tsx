import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Landmark, Calendar, FileCheck, Loader2, Plus, Info, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Wallet() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'online' | 'offline'>('online');
  const [utr, setUtr] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [upi, setUpi] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleOfflineRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/wallet/offline-request', {
        utrNumber: utr,
        amount: parseFloat(amount),
        paymentDate: date,
        upiId: upi
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setUtr('');
        setAmount('');
        setDate('');
        setUpi('');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-blue-600 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <p className="text-blue-100 text-sm font-semibold uppercase tracking-widest mb-1">Total Balance</p>
          <p className="text-4xl font-black italic">₹{user?.balance.toFixed(2)}</p>
        </div>
        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
          <CreditCard size={32} />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-50">
          <button
            onClick={() => setActiveTab('online')}
            className={`flex-1 py-5 font-bold transition-all ${activeTab === 'online' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/20' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Online Load
          </button>
          <button
            onClick={() => setActiveTab('offline')}
            className={`flex-1 py-5 font-bold transition-all ${activeTab === 'offline' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/20' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Offline Load (UTR)
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'online' ? (
            <div className="text-center py-12">
               <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Landmark size={32} />
               </div>
               <h3 className="text-xl font-bold text-gray-900 mb-2">Automated Online Payment</h3>
               <p className="text-gray-500 max-w-sm mx-auto mb-8 text-sm">Transfer funds instantly using cards, UPI, or Net Banking via our secure gateway.</p>
               
               <div className="max-w-xs mx-auto space-y-4">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                    <input type="number" placeholder="Enter Amount" className="w-full pl-8 pr-4 py-3.5 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-100 font-bold text-lg" />
                  </div>
                  <button className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center">
                    Pay with Payment Gateway <Plus size={18} className="ml-2" />
                  </button>
               </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto space-y-6">
               <div className="bg-orange-50 text-orange-700 p-4 rounded-2xl flex gap-3 text-sm border border-orange-100">
                  <Info size={20} className="shrink-0 mt-0.5" />
                  <p>Submit your payment details below. Admin will verify and update your balance within 1-2 hours.</p>
               </div>

               {success && (
                 <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-2 font-bold animate-in zoom-in">
                    <CheckCircle2 size={20} /> Request Submitted Successfully
                 </div>
               )}

               <form onSubmit={handleOfflineRequest} className="space-y-4">
                  {error && <div className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-lg">{error}</div>}
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">UTR / Transaction ID</label>
                    <input
                      required
                      placeholder="Enter 12 digit UTR"
                      className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 font-semibold"
                      value={utr}
                      onChange={(e) => setUtr(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Amount</label>
                        <input
                          required
                          type="number"
                          placeholder="Ex: 500"
                          className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 font-bold"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Date</label>
                        <input
                          required
                          type="date"
                          className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 font-semibold"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                        />
                     </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Your UPI ID</label>
                    <input
                      required
                      placeholder="username@bank"
                      className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 font-semibold"
                      value={upi}
                      onChange={(e) => setUpi(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : 'Submit Proof of Payment'}
                  </button>
               </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
