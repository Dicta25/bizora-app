import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/format';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomersScreen() {
  const { customers, addCustomer } = useApp();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');

  const totalOwed = customers.reduce((s, c) => s + c.balance, 0);

  const handleAdd = () => {
    if (!name || !phone) return;
    addCustomer({ name, phone, location: location || undefined });
    setName(''); setPhone(''); setLocation('');
    setShowModal(false);
  };

  return (
    <div className="px-4 pb-24 md:pb-8 max-w-6xl mx-auto relative">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Active Relationships</h2>
          <p className="text-sm text-muted-foreground mt-1">Directory of your buyers and debtors</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="hidden md:flex h-10 px-4 rounded-lg bg-accent text-accent-foreground font-bold items-center gap-2 hover:opacity-90 transition-opacity text-sm">
          <Plus size={18} /> Add Customer
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Customer List */}
        <div className="lg:col-span-3 space-y-4">
          {customers.length === 0 ? (
            <div className="text-center py-24 bg-card rounded-2xl border border-dashed border-muted-foreground/20">
              <Users size={64} className="mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-xl font-bold text-foreground mb-2">Your registry is empty</p>
              <p className="text-muted-foreground mb-6">Add customers to track their debts and purchases</p>
              <button onClick={() => setShowModal(true)} className="h-12 px-8 rounded-lg bg-primary text-primary-foreground font-bold">
                Add Your First Customer
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customers.map(c => (
                <motion.div key={c.id} layout
                  onClick={() => navigate(`/customers/${c.id}`)}
                  className="bg-card rounded-xl border p-5 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter ${c.balance > 0 ? 'bg-destructive text-destructive-foreground' : 'bg-primary/10 text-primary'}`}>
                      {c.balance > 0 ? `OWES ${formatCurrency(c.balance)}` : 'PAID UP'}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="font-bold text-foreground text-lg truncate group-hover:text-primary transition-colors">{c.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{c.phone}</span>
                      {c.location && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                          <span className="truncate">{c.location}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-dashed flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <span>Recent Activity</span>
                    <span className="text-foreground">
                      {c.lastPurchaseDate 
                        ? new Date(c.lastPurchaseDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                        : 'No sales yet'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Sidebar Summary */}
        <div className="hidden lg:block space-y-6">
          <div className="bg-destructive kente-border rounded-2xl p-6 text-destructive-foreground shadow-lg shadow-destructive/20">
            <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">Total Outstanding</p>
            <p className="text-3xl font-black currency">{formatCurrency(totalOwed)}</p>
            <div className="mt-4 p-3 bg-white/10 rounded-lg text-[10px] font-bold border border-white/10 leading-relaxed">
              TIP: Follow up with customers who owe more than GH₵ 500.00 today.
            </div>
          </div>

          <div className="bg-card rounded-2xl border p-6 shadow-sm">
            <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-6 border-b pb-4">Registry Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-muted-foreground">TOTAL CUSTOMERS</span>
                <span className="text-base font-black text-foreground">{customers.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-muted-foreground">IN DEBT</span>
                <span className="text-base font-black text-destructive">{customers.filter(c => c.balance > 0).length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-muted-foreground">TOP CUSTOMER</span>
                <span className="text-sm font-black text-primary truncate max-w-[100px]">
                  {customers.sort((a, b) => b.purchaseCount - a.purchaseCount)[0]?.name || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAB Mobile Only */}
      <button onClick={() => setShowModal(true)}
        className="md:hidden fixed bottom-24 right-5 w-14 h-14 rounded-full bg-accent text-accent-foreground shadow-lg flex items-center justify-center text-2xl active:scale-90 transition-transform z-40">
        <Plus size={28} />
      </button>

      {/* Add Customer Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-card rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-foreground">Add New Customer</h2>
                <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">Full Name</label>
                  <input type="text" placeholder="e.g. Ama Serwaa" value={name} onChange={e => setName(e.target.value)}
                    className="w-full h-12 rounded-lg border border-input bg-background px-4 text-base focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">Phone Number</label>
                  <input type="tel" placeholder="024 XXX XXXX" value={phone} onChange={e => setPhone(e.target.value)}
                    className="w-full h-12 rounded-lg border border-input bg-background px-4 text-base focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">Location (optional)</label>
                  <input type="text" placeholder="e.g. Kumasi, Adum" value={location} onChange={e => setLocation(e.target.value)}
                    className="w-full h-12 rounded-lg border border-input bg-background px-4 text-base focus:ring-2 focus:ring-primary outline-none" />
                </div>
              </div>
              <div className="p-6 bg-secondary/30 flex gap-3">
                <button onClick={() => setShowModal(false)} className="flex-1 h-12 rounded-lg font-bold text-muted-foreground hover:bg-secondary transition-colors">
                  Cancel
                </button>
                <button onClick={handleAdd} disabled={!name || !phone}
                  className="flex-[2] h-12 rounded-lg bg-primary text-primary-foreground font-bold shadow-lg hover:opacity-90 disabled:opacity-40 transition-all">
                  Save Customer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
