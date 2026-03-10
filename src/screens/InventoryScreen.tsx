import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/format';
import { Plus, Minus, Trash2, Package, Camera, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function ImageViewer({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/80 z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <button onClick={onClose} className="absolute top-4 right-4 text-primary-foreground z-50">
        <X size={28} />
      </button>
      <img src={src} alt="Product" className="max-w-full max-h-full rounded-xl object-contain" />
    </motion.div>
  );
}

export default function InventoryScreen() {
  const { products, addProduct, updateProductStock, deleteProduct, lowStockProducts } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newStock, setNewStock] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newImage, setNewImage] = useState<string | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [showLowStockBanner, setShowLowStockBanner] = useState(true);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setNewImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAdd = () => {
    if (!newName || !newStock || !newPrice) return;
    addProduct({ name: newName, stock: parseInt(newStock), price: parseFloat(newPrice), image: newImage });
    setNewName(''); setNewStock(''); setNewPrice(''); setNewImage(undefined);
    setShowModal(false);
  };

  const stockColor = (stock: number) => {
    if (stock === 0) return 'bg-destructive text-destructive-foreground';
    if (stock <= 5) return 'bg-accent text-accent-foreground';
    return 'bg-primary/15 text-primary';
  };

  const stockLabel = (stock: number) => {
    if (stock === 0) return 'Out of Stock';
    return `${stock} in stock`;
  };

  return (
    <div className="px-4 pt-6 pb-24 relative">
      <h1 className="text-2xl font-extrabold mb-4 text-foreground">Inventory</h1>

      {/* Low Stock Banner */}
      {showLowStockBanner && lowStockProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-xl bg-destructive text-destructive-foreground px-4 py-3 text-sm font-semibold flex items-start justify-between gap-2"
        >
          <div>
            ⚠️ Low stock:{' '}
            {lowStockProducts.map((p, i) => (
              <span key={p.id}>
                {p.name} has only {p.stock} left{i < lowStockProducts.length - 1 ? ', ' : '!'}
              </span>
            ))}
          </div>
          <button onClick={() => setShowLowStockBanner(false)} className="shrink-0 font-bold text-destructive-foreground/80">✕</button>
        </motion.div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-16">
          <Package size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-semibold text-foreground mb-1">No products yet</p>
          <p className="text-muted-foreground">Add your first item! 📦</p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map(p => (
            <motion.div
              key={p.id}
              layout
              className="bg-card rounded-xl border p-4 kente-border border-l-[3px] border-l-primary"
            >
              <div className="flex items-center gap-3 mb-2">
                {/* Product thumbnail */}
                {p.image ? (
                  <button
                    onClick={() => setViewImage(p.image!)}
                    className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border"
                  >
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  </button>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0 border">
                    <Camera size={18} className="text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground truncate text-[17px]">{p.name}</p>
                  <p className="text-sm text-primary currency font-medium">{formatCurrency(p.price)} / unit</p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${stockColor(p.stock)}`}>
                  {stockLabel(p.stock)}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => updateProductStock(p.id, -1)}
                  disabled={p.stock === 0}
                  className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center active:scale-95 transition-transform disabled:opacity-30 border"
                >
                  <Minus size={18} />
                </button>
                <span className="text-lg font-extrabold w-10 text-center text-foreground">{p.stock}</span>
                <button
                  onClick={() => updateProductStock(p.id, 1)}
                  className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center active:scale-95 transition-transform border"
                >
                  <Plus size={18} />
                </button>
                <div className="flex-1" />
                <button
                  onClick={() => setDeleteId(p.id)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-destructive active:scale-95 transition-transform"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-accent text-accent-foreground shadow-lg flex items-center justify-center text-2xl active:scale-90 transition-transform z-40"
      >
        <Plus size={28} />
      </button>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/40 z-50 flex items-end justify-center"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-card rounded-t-2xl p-6 max-h-[70vh] overflow-y-auto"
            >
              <h2 className="text-xl font-extrabold mb-5 text-foreground">Add Product</h2>
              <div className="space-y-4">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-foreground">Photo (optional)</label>
                  <div className="flex items-center gap-3">
                    {newImage ? (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden border">
                        <img src={newImage} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          onClick={() => setNewImage(undefined)}
                          className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-bl-lg w-5 h-5 flex items-center justify-center text-xs"
                        >✕</button>
                      </div>
                    ) : (
                      <label className="w-16 h-16 rounded-lg border-2 border-dashed border-input flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                        <Camera size={22} className="text-muted-foreground" />
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                    )}
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Product name"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full h-12 rounded-lg border border-input bg-background px-4 text-base focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <input
                  type="number"
                  placeholder="Starting stock"
                  value={newStock}
                  onChange={e => setNewStock(e.target.value)}
                  className="w-full h-12 rounded-lg border border-input bg-background px-4 text-base focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <input
                  type="number"
                  placeholder="Price per unit (GH₵)"
                  value={newPrice}
                  onChange={e => setNewPrice(e.target.value)}
                  className="w-full h-12 rounded-lg border border-input bg-background px-4 text-base focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button
                  onClick={handleAdd}
                  disabled={!newName || !newStock || !newPrice}
                  className="w-full h-14 rounded-xl bg-accent text-accent-foreground font-bold text-lg tap-target disabled:opacity-40 transition-all active:scale-[0.98]"
                >
                  Add Product
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full text-center text-muted-foreground font-medium tap-target"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center px-6"
            onClick={() => setDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-card rounded-2xl p-6 w-full max-w-sm"
            >
              <h3 className="text-lg font-bold mb-2 text-foreground">Delete Product?</h3>
              <p className="text-muted-foreground mb-5">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 h-12 rounded-xl bg-secondary font-semibold tap-target text-foreground">Cancel</button>
                <button
                  onClick={() => { deleteProduct(deleteId); setDeleteId(null); }}
                  className="flex-1 h-12 rounded-xl bg-destructive text-destructive-foreground font-semibold tap-target"
                >
                  Delete
                </button>
              </div>
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
