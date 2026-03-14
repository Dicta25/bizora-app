import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/format';
import { Plus, Minus, Trash2, Package, Camera, X, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function ImageViewer({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/80 z-50 flex items-center justify-center p-6" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-primary-foreground z-50"><X size={28} /></button>
      <img src={src} alt="Product" className="max-w-full max-h-full rounded-xl object-contain" />
    </motion.div>
  );
}

export default function InventoryScreen() {
  const { products, addProduct, updateProduct, updateProductStock, deleteProduct, lowStockProducts, stockHistory, suppliers } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newStock, setNewStock] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newImage, setNewImage] = useState<string | undefined>(undefined);
  const [newRestockLevel, setNewRestockLevel] = useState('5');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [showLowStockBanner, setShowLowStockBanner] = useState(true);
  const [historyProductId, setHistoryProductId] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setNewImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAdd = () => {
    if (!newName || !newStock || !newPrice) return;
    addProduct({ name: newName, stock: parseInt(newStock), price: parseFloat(newPrice), image: newImage, restockLevel: parseInt(newRestockLevel) || 5 });
    setNewName(''); setNewStock(''); setNewPrice(''); setNewImage(undefined); setNewRestockLevel('5');
    setShowModal(false);
  };

  const stockColor = (stock: number, restockLevel: number) => {
    if (stock === 0) return 'bg-destructive text-destructive-foreground';
    if (stock <= restockLevel) return 'bg-accent text-accent-foreground';
    return 'bg-primary/15 text-primary';
  };

  const stockLabel = (stock: number) => stock === 0 ? 'Out of Stock' : `${stock} in stock`;

  const productHistory = historyProductId ? stockHistory.filter(h => h.productId === historyProductId).slice(0, 20) : [];

  return (
    <div className="px-4 pb-24 md:pb-8 max-w-6xl mx-auto relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">Stock Overview</h2>
        <button onClick={() => setShowModal(true)}
          className="hidden md:flex h-10 px-4 rounded-lg bg-accent text-accent-foreground font-bold items-center gap-2 hover:opacity-90 transition-opacity text-sm">
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Low Stock Banner */}
      {showLowStockBanner && lowStockProducts.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-xl bg-destructive text-destructive-foreground px-4 py-3 text-sm font-semibold flex items-start justify-between gap-2 shadow-lg">
          <div className="flex items-center gap-2">
            <Package size={18} className="shrink-0" />
            <span>
              ⚠️ Low stock:{' '}
              {lowStockProducts.map((p, i) => (
                <span key={p.id}>{p.name} ({p.stock}){i < lowStockProducts.length - 1 ? ', ' : ''}</span>
              ))}
            </span>
          </div>
          <button onClick={() => setShowLowStockBanner(false)} className="shrink-0 font-bold text-white/80 hover:text-white">✕</button>
        </motion.div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-24 bg-card rounded-2xl border border-dashed border-muted-foreground/20">
          <Package size={64} className="mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-xl font-bold text-foreground mb-2">No products yet</p>
          <p className="text-muted-foreground mb-6">Start building your inventory to track sales</p>
          <button onClick={() => setShowModal(true)} className="h-12 px-8 rounded-lg bg-primary text-primary-foreground font-bold">
            Add Your First Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(p => {
            const linkedSupplier = suppliers.find(s => s.products.toLowerCase().includes(p.name.toLowerCase().split(' ')[0]));
            return (
              <motion.div key={p.id} layout className="bg-card rounded-xl border p-5 hover:shadow-md transition-shadow group relative">
                <div className="flex items-start gap-4 mb-4">
                  {p.image ? (
                    <button onClick={() => setViewImage(p.image!)} className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border shadow-sm">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    </button>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center shrink-0 border border-dashed">
                      <Camera size={24} className="text-muted-foreground/50" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-foreground truncate text-lg group-hover:text-primary transition-colors">{p.name}</p>
                    </div>
                    <p className="text-base text-primary currency font-bold mt-0.5">{formatCurrency(p.price)} <span className="text-[10px] text-muted-foreground font-normal">per unit</span></p>
                    <span className={`inline-block mt-2 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${stockColor(p.stock, p.restockLevel)}`}>
                      {stockLabel(p.stock)}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-border/50 mb-4" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1 border">
                    <button onClick={() => updateProductStock(p.id, -1)} disabled={p.stock === 0}
                      className="w-8 h-8 rounded-md hover:bg-background flex items-center justify-center active:scale-90 transition-all disabled:opacity-30">
                      <Minus size={16} />
                    </button>
                    <span className="text-lg font-black w-8 text-center text-foreground tabular-nums">{p.stock}</span>
                    <button onClick={() => updateProductStock(p.id, 1, 'Stock added')}
                      className="w-8 h-8 rounded-md hover:bg-background flex items-center justify-center active:scale-90 transition-all">
                      <Plus size={16} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button onClick={() => setHistoryProductId(p.id)} title="Stock History"
                      className="w-9 h-9 rounded-full hover:bg-accent hover:text-accent-foreground flex items-center justify-center text-muted-foreground transition-colors">
                      <History size={18} />
                    </button>
                    <button onClick={() => setDeleteId(p.id)} title="Delete Product"
                      className="w-9 h-9 rounded-full hover:bg-destructive/10 hover:text-destructive flex items-center justify-center text-muted-foreground transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Quick Restock WhatsApp Link */}
                {p.stock <= p.restockLevel && p.stock > 0 && linkedSupplier && (
                  <div className="mt-4 pt-4 border-t border-dashed border-border/50">
                    <a href={`https://wa.me/${linkedSupplier.phone.replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-2 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold hover:bg-green-500/20 transition-colors">
                      WhatsApp {linkedSupplier.name.split(' ')[0]} to Restock
                    </a>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* FAB Mobile Only */}
      <button onClick={() => setShowModal(true)}
        className="md:hidden fixed bottom-24 right-5 w-14 h-14 rounded-full bg-accent text-accent-foreground shadow-lg flex items-center justify-center text-2xl active:scale-90 transition-transform z-40">
        <Plus size={28} />
      </button>

      {/* Add Product Modal (Responsive: Mobile Sheet, Desktop Dialog) */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-card rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-foreground">Add New Product</h2>
                <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="shrink-0">
                    {newImage ? (
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border shadow-inner">
                        <img src={newImage} alt="Preview" className="w-full h-full object-cover" />
                        <button onClick={() => setNewImage(undefined)}
                          className="absolute top-1 right-1 bg-destructive/90 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">✕</button>
                      </div>
                    ) : (
                      <label className="w-20 h-20 rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all text-muted-foreground">
                        <Camera size={24} />
                        <span className="text-[10px] font-bold mt-1 uppercase">Photo</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-bold text-foreground">Product Details</p>
                    <p className="text-xs text-muted-foreground">Upload an image to make identifying items easier.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">Name</label>
                    <input type="text" placeholder="e.g. Blue Kente Cloth" value={newName} onChange={e => setNewName(e.target.value)}
                      className="w-full h-12 rounded-lg border border-input bg-background px-4 text-base focus:ring-2 focus:ring-accent outline-none" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">Initial Stock</label>
                      <input type="number" placeholder="0" value={newStock} onChange={e => setNewStock(e.target.value)}
                        className="w-full h-12 rounded-lg border border-input bg-background px-4 text-base focus:ring-2 focus:ring-accent outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">Price (GH₵)</label>
                      <input type="number" placeholder="0.00" value={newPrice} onChange={e => setNewPrice(e.target.value)}
                        className="w-full h-12 rounded-lg border border-input bg-background px-4 text-base focus:ring-2 focus:ring-accent outline-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">Restock Alert Level</label>
                    <input type="number" placeholder="5" value={newRestockLevel} onChange={e => setNewRestockLevel(e.target.value)}
                      className="w-full h-12 rounded-lg border border-input bg-background px-4 text-base focus:ring-2 focus:ring-accent outline-none" />
                  </div>
                </div>
              </div>
              <div className="p-6 bg-secondary/30 flex gap-3">
                <button onClick={() => setShowModal(false)} className="flex-1 h-12 rounded-lg font-bold text-muted-foreground hover:bg-secondary transition-colors">
                  Cancel
                </button>
                <button onClick={handleAdd} disabled={!newName || !newStock || !newPrice}
                  className="flex-[2] h-12 rounded-lg bg-accent text-accent-foreground font-bold shadow-lg hover:opacity-90 disabled:opacity-40 transition-all">
                  Create Product
                </button>
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
              <h3 className="text-lg font-bold mb-2 text-foreground">Delete Product?</h3>
              <p className="text-muted-foreground mb-5">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 h-12 rounded-xl bg-secondary font-semibold text-foreground">Cancel</button>
                <button onClick={() => { deleteProduct(deleteId); setDeleteId(null); }}
                  className="flex-1 h-12 rounded-xl bg-destructive text-destructive-foreground font-semibold">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stock History Modal */}
      <AnimatePresence>
        {historyProductId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/40 z-50 flex items-end justify-center" onClick={() => setHistoryProductId(null)}>
            <motion.div initial={{ y: 400 }} animate={{ y: 0 }} exit={{ y: 400 }}
              transition={{ type: 'spring', damping: 25 }} onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-card rounded-t-2xl p-6 max-h-[60vh] overflow-y-auto">
              <h2 className="text-lg font-extrabold mb-4 text-foreground">Stock History</h2>
              {productHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No history yet</p>
              ) : (
                <div className="space-y-2">
                  {productHistory.map(h => (
                    <div key={h.id} className="flex items-center gap-3 text-sm">
                      <span className={`font-bold ${h.delta > 0 ? 'text-primary' : 'text-destructive'}`}>
                        {h.delta > 0 ? '+' : ''}{h.delta}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground truncate">
                          {h.reason}{h.customerName ? ` — ${h.customerName}` : ''}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(h.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })},{' '}
                          {new Date(h.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => setHistoryProductId(null)}
                className="w-full h-12 rounded-xl bg-secondary text-foreground font-semibold mt-4">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-screen image viewer */}
      <AnimatePresence>
        {viewImage && <ImageViewer src={viewImage} onClose={() => setViewImage(null)} />}
      </AnimatePresence>
    </div>
  );
}
