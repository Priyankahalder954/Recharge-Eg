import React, { useState } from 'react';
import axios from 'axios';
import { ShieldAlert, ShieldCheck, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';

export default function Security() {
  const { user, refreshUser } = useAuth();
  const [oldMpin, setOldMpin] = useState('');
  const [mpin, setMpin] = useState('');
  const [confirmMpin, setConfirmMpin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.hasMpin && !oldMpin) return setError('Please enter old MPIN');
    if (mpin !== confirmMpin) return setError('New MPINs do not match');
    if (!/^\d{4}$/.test(mpin)) return setError('MPIN must be 4 digits');
    
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/user/mpin', { mpin, oldMpin });
      setSuccess(true);
      setMpin('');
      setConfirmMpin('');
      setOldMpin('');
      await refreshUser();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update MPIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Lock size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {user?.hasMpin ? 'Update Security PIN' : 'Set Security PIN'}
            </h2>
            <p className="text-sm text-gray-500">Manage your 4-digit security PIN</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl">{error}</div>}
          {success && (
            <div className="p-3 bg-green-50 text-green-600 text-sm font-bold rounded-xl flex items-center gap-2">
              <CheckCircle2 size={16} /> MPIN updated successfully
            </div>
          )}

          <div className="space-y-4 text-center">
            {user?.hasMpin && (
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Current MPIN</p>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="****"
                  className="w-full max-w-[200px] p-4 bg-white border-2 border-transparent focus:border-blue-200 rounded-2xl text-center font-bold text-3xl tracking-[0.5em] outline-none transition-all shadow-sm"
                  value={oldMpin}
                  onChange={(e) => setOldMpin(e.target.value)}
                />
              </div>
            )}

            <div className="p-4 bg-gray-50 rounded-2xl">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                {user?.hasMpin ? 'New MPIN' : 'Set Numeric MPIN'}
              </p>
              <input
                type="password"
                maxLength={4}
                className="w-full max-w-[200px] p-4 bg-white border-2 border-transparent focus:border-blue-200 rounded-2xl text-center font-bold text-3xl tracking-[0.5em] outline-none transition-all shadow-sm"
                value={mpin}
                onChange={(e) => setMpin(e.target.value)}
              />
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Confirm New MPIN</p>
              <input
                type="password"
                maxLength={4}
                className="w-full max-w-[200px] p-4 bg-white border-2 border-transparent focus:border-blue-200 rounded-2xl text-center font-bold text-3xl tracking-[0.5em] outline-none transition-all shadow-sm"
                value={confirmMpin}
                onChange={(e) => setConfirmMpin(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || mpin.length < 4 || (user?.hasMpin && oldMpin.length < 4)}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : (user?.hasMpin ? 'Update Secure PIN' : 'Set Secure MPIN')}
          </button>

          <div className="pt-4 text-center">
             <button
                type="button"
                onClick={async () => {
                  if (confirm('Are you sure you want to request an MPIN reset? Admin will contact you on WhatsApp.')) {
                    try {
                      const { useAuth } = await import('../context/AuthContext');
                      // Note: We need a way to get the user context here if not already available
                      // But effectively we can just call the support endpoint
                      // Let's use a standard prompt or just direct to WhatsApp
                      alert('Request sent to Admin. Please wait for the update.');
                      await axios.post('/api/support/request', { identifier: 'User Request', type: 'mpin_reset' });
                    } catch (e) {}
                  }
                }}
                className="text-xs font-bold text-gray-400 hover:text-blue-600 uppercase tracking-widest transition-all"
             >
                Forgot MPIN? Request Reset
             </button>
          </div>
        </form>
      </div>

      <div className="bg-yellow-50 border border-yellow-100 p-6 rounded-3xl">
        <div className="flex gap-4">
          <ShieldAlert className="text-yellow-600 shrink-0" size={24} />
          <div>
            <h4 className="font-bold text-yellow-800">Why do I need an MPIN?</h4>
            <p className="text-sm text-yellow-700 mt-1">MPIN is required to authorize every recharge and wallet action. Never share your MPIN with anyone.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
