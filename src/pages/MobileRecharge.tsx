import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Smartphone, Zap, Search, CreditCard, ChevronRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const operators = [
  { name: 'Jio', id: 'jio', logo: 'https://seeklogo.com/images/J/jio-logo-A27AA49B74-seeklogo.com.png' },
  { name: 'Airtel', id: 'airtel', logo: 'https://seeklogo.com/images/A/airtel-logo-BC5B545642-seeklogo.com.png' },
  { name: 'VI', id: 'vi', logo: 'https://seeklogo.com/images/V/vi-logo-B76296181E-seeklogo.com.png' },
  { name: 'BSNL', id: 'bsnl', logo: 'https://seeklogo.com/images/B/bsnl-logo-A8AEBF948D-seeklogo.com.png' }
];

const circles = [
  'West Bengal', 'Kolkata', 'Delhi', 'Mumbai', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Bihar', 'Uttar Pradesh'
];

export default function MobileRecharge() {
  const { user, refreshUser } = useAuth();
  const [mobileNumber, setMobileNumber] = useState('');
  const [operator, setOperator] = useState('');
  const [circle, setCircle] = useState('');
  const [amount, setAmount] = useState('');
  const [mpin, setMpin] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Auto detect logic (simplified mock)
  useEffect(() => {
    if (mobileNumber.length === 10) {
      const firstDigit = mobileNumber[0];
      if (firstDigit === '9') setOperator('airtel');
      else if (firstDigit === '8') setOperator('jio');
      else if (firstDigit === '7') setOperator('vi');
      else setOperator('bsnl');
      
      setCircle('West Bengal');
    }
  }, [mobileNumber]);

  const handleProceed = () => {
    if (!mobileNumber || !operator || !circle || !amount) {
      return setError('Please fill all fields');
    }
    setError('');
    setShowConfirm(true);
  };

  const handleRecharge = async () => {
    if (!mpin) return setError('Enter 4-digit MPIN');
    setLoading(true);
    try {
      await axios.post('/api/recharge/proceed', {
        mobile: mobileNumber,
        operator,
        circle,
        amount: parseFloat(amount),
        mpin
      });
      setSuccess(true);
      refreshUser();
      setTimeout(() => {
        setSuccess(false);
        setMobileNumber('');
        setAmount('');
        setMpin('');
        setShowConfirm(false);
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Recharge failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto bg-white p-12 rounded-3xl shadow-xl flex flex-col items-center text-center animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Recharge Successful!</h2>
        <p className="text-gray-500 mb-6">Your recharge of ₹{amount} for {mobileNumber} has been processed.</p>
        <div className="w-full p-4 bg-gray-50 rounded-xl space-y-2 text-sm">
           <div className="flex justify-between font-medium"><span>Transaction ID:</span> <span className="font-mono">TXN{Math.floor(Math.random()*1000000)}</span></div>
           <div className="flex justify-between font-medium"><span>New Balance:</span> <span className="text-blue-600 font-bold">₹{(user?.balance || 0) - parseFloat(amount)}</span></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Smartphone size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Mobile Recharge</h2>
            <p className="text-sm text-gray-500">Quickly top up any mobile number</p>
          </div>
        </div>

        <div className="space-y-6">
          {error && !showConfirm && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-xl">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div>
             <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Mobile Number</label>
             <input
               type="tel"
               maxLength={10}
               placeholder="Enter 10 digit number"
               className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all font-semibold outline-none"
               value={mobileNumber}
               onChange={(e) => setMobileNumber(e.target.value)}
             />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Operator</label>
                <select
                  className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all font-semibold appearance-none"
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                >
                  <option value="">Select Operator</option>
                  {operators.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
                </select>
             </div>
             <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Circle</label>
                <select
                  className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all font-semibold appearance-none"
                  value={circle}
                  onChange={(e) => setCircle(e.target.value)}
                >
                  <option value="">Select Circle</option>
                  {circles.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>
          </div>

          <div>
             <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Recharge Amount</label>
             <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                <input
                  type="number"
                  placeholder="299"
                  className="w-full p-4 pl-8 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all font-bold text-xl"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
             </div>
          </div>

          <button
            onClick={handleProceed}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl mt-4 flex items-center justify-center"
          >
            Proceed to Pay <ChevronRight className="ml-2" size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showConfirm && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
              onClick={() => !loading && setShowConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                   <h3 className="font-bold text-gray-900">Confirm Payment</h3>
                   <button onClick={() => setShowConfirm(false)} className="text-gray-400 hover:text-gray-900"><Zap size={20} /></button>
                </div>
                
                <div className="p-8 space-y-4">
                   <div className="text-center mb-8">
                      <p className="text-gray-500 text-sm font-medium">Recharge Amount</p>
                      <p className="text-4xl font-black text-gray-900">₹{amount}</p>
                   </div>
                   
                   <div className="space-y-3 pb-6 border-b border-gray-100">
                      <div className="flex justify-between text-sm">
                         <span className="text-gray-500">Mobile Number</span>
                         <span className="font-bold">{mobileNumber}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                         <span className="text-gray-500">Operator</span>
                         <span className="font-bold uppercase">{operator}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                         <span className="text-gray-500">Wallet Balance</span>
                         <span className="font-bold text-blue-600">₹{user?.balance.toFixed(2)}</span>
                      </div>
                   </div>

                   {error && (
                     <div className="text-xs text-red-600 bg-red-50 p-3 rounded-lg text-center font-medium">
                       {error}
                     </div>
                   )}

                   <div>
                      <label className="block text-center text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest leading-none">Security MPIN</label>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="••••"
                        className="w-full p-4 border-2 border-gray-100 focus:border-blue-500 rounded-2xl text-center font-bold text-2xl tracking-[1em] outline-none transition-all placeholder:text-gray-200"
                        value={mpin}
                        onChange={(e) => setMpin(e.target.value)}
                      />
                   </div>

                   <button
                     onClick={handleRecharge}
                     disabled={loading || mpin.length < 4}
                     className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center"
                   >
                     {loading ? <Loader2 className="animate-spin mr-2" /> : 'Pay Securely'}
                   </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
