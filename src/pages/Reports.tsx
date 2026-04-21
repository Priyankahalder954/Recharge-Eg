import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { History, Download, Filter, Search, ArrowUpRight, ArrowDownRight, Smartphone, CreditCard, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function Reports() {
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchTxs = async () => {
      try {
        const resp = await axios.get('/api/user/transactions');
        setTxs(resp.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTxs();
  }, []);

  const filteredTxs = txs.filter(t => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  if (loading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
           <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
           <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{filteredTxs.length} Activities Found</p>
        </div>
        <div className="flex gap-2">
           <select 
             className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 outline-none hover:bg-gray-100 transition-colors"
             value={filter}
             onChange={(e) => setFilter(e.target.value)}
           >
              <option value="all">All Types</option>
              <option value="recharge">Recharges</option>
              <option value="add_balance">Wallet Loads</option>
              <option value="commission">Commission</option>
           </select>
           <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all">
              <Download size={16} className="mr-2" /> Export
           </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
         {filteredTxs.length === 0 ? (
           <div className="p-20 text-center">
              <div className="w-16 h-16 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                 <History size={32} />
              </div>
              <p className="text-gray-400 font-medium">No transactions match your criteria</p>
           </div>
         ) : (
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-gray-50/50 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                       <th className="px-6 py-4">Transaction Details</th>
                       <th className="px-6 py-4 text-center">Status</th>
                       <th className="px-6 py-4 text-right">Amount</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {filteredTxs.map(t => (
                      <tr key={t.id} className="hover:bg-gray-50/20 transition-colors">
                         <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                               <div className={cn(
                                 "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                 t.type === 'recharge' ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"
                               )}>
                                  {t.type === 'recharge' ? <Smartphone size={18} /> : <CreditCard size={18} />}
                               </div>
                               <div>
                                  <p className="text-sm font-bold text-gray-900">{t.description}</p>
                                  <p className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">{format(new Date(t.created_at), 'MMM dd, yyyy • hh:mm a')}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-5">
                            <div className="flex justify-center">
                               <span className={cn(
                                 "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter",
                                 t.status === 'success' ? "bg-green-100 text-green-700" : t.status === 'pending' ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                               )}>
                                  {t.status}
                               </span>
                            </div>
                         </td>
                         <td className="px-6 py-5 text-right">
                            <div className="flex flex-col items-end">
                               <p className={cn("text-base font-black italic", t.type === 'recharge' ? "text-red-500" : "text-green-600")}>
                                  {t.type === 'recharge' ? '-' : '+'}₹{t.amount.toFixed(2)}
                               </p>
                               {t.type === 'recharge' && <p className="text-[9px] font-bold text-gray-400 uppercase">Comm: ₹0.00</p>}
                            </div>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
         )}
      </div>
    </div>
  );
}

import { cn } from '../lib/utils';
