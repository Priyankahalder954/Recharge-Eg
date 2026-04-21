import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, Smartphone, ArrowLeft, Send, CheckCircle2, Loader2, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/support/request', { identifier, type: 'password' });
      setSuccess(true);
    } catch (err) {
      setError('Failed to send request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl text-center"
        >
           <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
           </div>
           <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Sent!</h2>
           <p className="text-gray-500 mb-8 leading-relaxed">
             Admin will review your request and send a temporary password to your registered <b>WhatsApp</b> number shortly.
           </p>
           <Link to="/login" className="inline-flex items-center text-blue-600 font-bold hover:gap-2 transition-all">
             <ArrowLeft size={20} className="mr-2" /> Back to Login
           </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      <div className="hidden lg:flex flex-col justify-center items-center bg-blue-600 text-white p-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md text-center"
        >
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8 backdrop-blur-md">
             <MessageSquare size={32} />
          </div>
          <h1 className="text-4xl font-bold mb-4">Account Recovery</h1>
          <p className="text-blue-100 text-lg">Requested credentials will be sent directly to your registered WhatsApp number for security.</p>
        </motion.div>
      </div>

      <div className="flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-sm">
          <Link to="/login" className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-blue-600 mb-10 transition-colors">
            <ArrowLeft size={16} className="mr-2" /> Back to Login
          </Link>

          <div className="mb-8">
             <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Forgot Password?</h2>
             <p className="text-gray-500 mt-2">Enter your email or mobile to receive recovery details</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
             {error && <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl">{error}</div>}
             
             <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Email or Mobile</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={18} className="text-gray-400" />
                   </div>
                   <input
                     type="text"
                     required
                     className="block w-full pl-10 pr-3 py-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-100 outline-none font-semibold transition-all"
                     placeholder="name@example.com / 9876543210"
                     value={identifier}
                     onChange={(e) => setIdentifier(e.target.value)}
                   />
                </div>
             </div>

             <button
               type="submit"
               disabled={loading}
               className="w-full flex items-center justify-center py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
             >
                {loading ? <Loader2 className="animate-spin mr-2" /> : <><Send size={18} className="mr-2" /> Request Temporary Password</>}
             </button>
          </form>
        </div>
      </div>
    </div>
  );
}
