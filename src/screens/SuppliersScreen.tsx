import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, Plus, Truck, MessageSquare, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function SuppliersScreen() {
  const { suppliers, addSupplier, deleteSupplier } = useApp();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [products, setProducts] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!name || !phone || !products) return;
    addSupplier({ name, phone, products, location: location || undefined, notes: notes || undefined });
    setName(''); setPhone(''); setProducts(''); setLocation(''); setNotes('');
    setShowModal(false);
  };

  return (
    <div className="px-4 pt-6 pb-24 relative">
      <button onClick={() => navigate(-1)} className="tap-target mb-4 text-muted-foreground">
        <ArrowLeft size={24} />
      </button>
      <h1 className="text-2xl font-extrabold mb-4 text-foreground">My Suppliers</h1>

      {suppliers.length === 0 ? (
        <div className="text-center py-16">
          <Truck size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-semibold text-foreground mb-1">No suppliers saved yet</p>
          <p className="text-muted-foreground">Add your first one</p>
        </div>
      ) : (
        <div className="space-y-3">
          {suppliers.map(s => (
            <div key={s.id} className="bg-card rounded-xl border p-4 kente-border border-l-[3px] border-l-primary">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-foreground text-[17px]">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.phone}</p>
                  {s.location && <p className="text-xs text-muted-foreground">{s.location}</p>}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {s.products.split(',').map((p, i) => (
                      <span key={i} className="text-[10px] bg-secondary px-2 py-0.5 rounded-full text-foreground font-medium">
                        {p.trim()}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <a href={`https://wa.me/${s.phone.replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MessageSquare size={16} className="text-primary" />
                  </a>
                  <button onClick={() => setDeleteId(s.id)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-destructive">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAB */}
      <button onClick={() => setShowModal(true)}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-accent text-accent-foreground shadow-lg flex items-center justify-center active:scale-90 transition-transform z-40">
        <Plus size={28} />
      </button>

      {/* Add Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/40 z-50 flex items-end justify-center" onClick={() => setShowModal(false)}>
            <motion.div initial={{ y: 400 }} animate={{ y: 0 }} exit={{ y: 400 }}
              transition={{ type: 'spring', damping: 25 }} onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-card rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-extrabold mb-5 text-foreground">Add Supplier</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Supplier Name" value={name} onChange={e => setName(e.target.value)}
                  className="w-full h-12 rounded-lg border border-input bg-background px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary" />
                <input type="tel" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full h-12 rounded-lg border border-input bg-background px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary" />
                <input type="text" placeholder="Products Supplied (comma separated)" value={products} onChange={e => setProducts(e.target.value)}
                  className="w-full h-12 rounded-lg border border-input bg-background px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary" />
                <input type="text" placeholder="Location (optional)" value={location} onChange={e => setLocation(e.target.value)}
                  className="w-full h-12 rounded-lg border border-input bg-background px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary" />
                <textarea placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                <button onClick={handleAdd} disabled={!name || !phone || !products}
                  className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-bold text-lg tap-target disabled:opacity-40 active:scale-[0.98]">
                  Save Supplier
                </button>
                <button onClick={() => setShowModal(false)}
                  className="w-full text-center text-muted-foreground font-medium tap-target">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center px-6" onClick={() => setDeleteId(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()} className="bg-card rounded-2xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-bold mb-2 text-foreground">Delete Supplier?</h3>
              <p className="text-muted-foreground mb-5">This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 h-12 rounded-xl bg-secondary font-semibold text-foreground">Cancel</button>
                <button onClick={() => { deleteSupplier(deleteId); setDeleteId(null); }}
                  className="flex-1 h-12 rounded-xl bg-destructive text-destructive-foreground font-semibold">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
