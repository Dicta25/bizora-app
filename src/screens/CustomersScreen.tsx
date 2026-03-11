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
    <div className="px-4 pt-6 pb-24 relative">
      <h1 className="text-2xl font-extrabold mb-4 text-foreground">My Customers</h1>

      {/* Total Owed */}
      {totalOwed > 0 && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 mb-4">
          <p className="text-sm font-bold text-destructive">Total Owed: {formatCurrency(totalOwed)}</p>
        </div>
      )}

      {customers.length === 0 ? (
        <div className="text-center py-16">
          <Users size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-semibold text-foreground mb-1">No customers yet</p>
          <p className="text-muted-foreground">Add your first one</p>
        </div>
      ) : (
        <div className="space-y-3">
          {customers.map(c => (
            <motion.div key={c.id} layout
              onClick={() => navigate(`/customers/${c.id}`)}
              className="bg-card rounded-xl border p-4 kente-border border-l-[3px] border-l-primary cursor-pointer active:scale-[0.98] transition-transform">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-foreground text-[17px] truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.phone}</p>
                  {c.lastPurchaseDate && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Last: {new Date(c.lastPurchaseDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </p>
                  )}
                </div>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${c.balance > 0 ? 'bg-destructive text-destructive-foreground' : 'bg-primary/15 text-primary'}`}>
                  {c.balance > 0 ? `Owes ${formatCurrency(c.balance)}` : 'Paid Up'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* FAB */}
      <button onClick={() => setShowModal(true)}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-accent text-accent-foreground shadow-lg flex items-center justify-center text-2xl active:scale-90 transition-transform z-40">
        <Plus size={28} />
      </button>

      {/* Add Customer Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/40 z-50 flex items-end justify-center" onClick={() => setShowModal(false)}>
            <motion.div initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }}
              transition={{ type: 'spring', damping: 25 }} onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-card rounded-t-2xl p-6">
              <h2 className="text-xl font-extrabold mb-5 text-foreground">Add Customer</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)}
                  className="w-full h-12 rounded-lg border border-input bg-background px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary" />
                <input type="tel" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full h-12 rounded-lg border border-input bg-background px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary" />
                <input type="text" placeholder="Location (optional)" value={location} onChange={e => setLocation(e.target.value)}
                  className="w-full h-12 rounded-lg border border-input bg-background px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary" />
                <button onClick={handleAdd} disabled={!name || !phone}
                  className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-bold text-lg tap-target disabled:opacity-40 active:scale-[0.98]">
                  Save Customer
                </button>
                <button onClick={() => setShowModal(false)}
                  className="w-full text-center text-muted-foreground font-medium tap-target">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
