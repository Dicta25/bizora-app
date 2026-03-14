import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/format';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Minus, Plus } from 'lucide-react';

const PAYMENT_METHODS = [
  { key: 'cash' as const, label: 'Cash', colorClass: 'bg-primary text-primary-foreground' },
  { key: 'momo' as const, label: 'MoMo', colorClass: 'bg-accent text-accent-foreground' },
  { key: 'bank' as const, label: 'Bank', colorClass: 'bg-info text-info-foreground' },
  { key: 'credit' as const, label: 'Credit', colorClass: 'bg-destructive text-destructive-foreground' },
];

export default function RecordSaleScreen() {
  const { products, customers, addSale } = useApp();
  const navigate = useNavigate();
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'momo' | 'bank' | 'credit'>('cash');
  const [customerId, setCustomerId] = useState('');

  // Check URL params for pre-filled customer
  const selectedCustomer = useMemo(() => customers.find(c => c.id === customerId), [customers, customerId]);
  const total = quantity * (parseFloat(pricePerUnit) || 0);

  const handleSelectProduct = (name: string) => {
    setProductName(name);
    const product = products.find(p => p.name === name);
    if (product) setPricePerUnit(product.price.toString());
  };

  const handleSave = () => {
    if (!productName || !pricePerUnit || quantity < 1) return;
    if (paymentMethod === 'credit' && !customerId) {
      toast.error('Please select a customer for credit sales');
      return;
    }
    addSale({
      productName,
      quantity,
      pricePerUnit: parseFloat(pricePerUnit),
      totalPrice: total,
      date: new Date().toISOString(),
      paymentMethod,
      customerId: customerId || undefined,
      customerName: selectedCustomer?.name,
    });
    toast.success('Sale recorded');
    navigate('/');
  };

  return (
    <div className="px-4 pb-24 md:pb-8 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Form Fields */}
        <div className="space-y-6">
          <div className="bg-card rounded-2xl border p-6 space-y-6 shadow-sm">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-2 ml-1">Product Details</label>
              <div className="space-y-3">
                {products.length > 0 ? (
                  <select value={productName} onChange={e => handleSelectProduct(e.target.value)}
                    className="w-full h-12 rounded-lg border border-input bg-background px-4 text-base focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer">
                    <option value="">Select a product...</option>
                    {products.map(p => <option key={p.id} value={p.name}>{p.name} ({p.stock} in stock)</option>)}
                    <option value="__custom">+ Manual Entry...</option>
                  </select>
                ) : null}
                
                {(products.length === 0 || productName === '__custom' || !products.find(p => p.name === productName)) && (
                  <input type="text" placeholder="Enter custom product name"
                    value={productName === '__custom' ? '' : productName}
                    onChange={e => setProductName(e.target.value)}
                    className="w-full h-12 rounded-lg border border-input bg-background px-4 text-base focus:ring-2 focus:ring-primary outline-none" />
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-2 ml-1">Quantity</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center active:scale-90 transition-all border shadow-sm">
                  <Minus size={20} className="text-foreground" />
                </button>
                <input type="number" value={quantity}
                  onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 h-12 rounded-lg border border-input bg-background text-center text-xl font-bold focus:ring-2 focus:ring-primary outline-none tabular-nums" />
                <button onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center active:scale-90 transition-all border shadow-sm">
                  <Plus size={20} className="text-foreground" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-2 ml-1">Price per Unit (GH₵)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">GH₵</span>
                <input type="number" placeholder="0.00" value={pricePerUnit}
                  onChange={e => setPricePerUnit(e.target.value)}
                  className="w-full h-12 rounded-lg border border-input bg-background pl-14 pr-4 text-base font-bold focus:ring-2 focus:ring-primary outline-none" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border p-6 space-y-6 shadow-sm">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-3 ml-1">Payment Method</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PAYMENT_METHODS.map(pm => (
                  <button key={pm.key} onClick={() => setPaymentMethod(pm.key)}
                    className={`h-10 rounded-lg text-xs font-bold transition-all border ${paymentMethod === pm.key ? pm.colorClass : 'bg-background text-muted-foreground hover:bg-secondary'}`}>
                    {pm.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-2 ml-1">Customer (optional)</label>
              <select value={customerId} onChange={e => setCustomerId(e.target.value)}
                className="w-full h-12 rounded-lg border border-input bg-background px-4 text-base focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer">
                <option value="">Walk-in customer</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} {c.balance > 0 ? `(Owes ${formatCurrency(c.balance)})` : ''}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Summary & Actions */}
        <div className="space-y-6">
          <div className="bg-primary/5 rounded-2xl border-2 border-dashed border-primary/20 p-8 flex flex-col items-center justify-center text-center space-y-2 sticky top-6">
            <p className="text-sm font-bold text-primary uppercase tracking-widest">Grand Total</p>
            <p className="text-5xl font-black text-primary currency tabular-nums">{formatCurrency(total)}</p>
            <div className="w-full h-px bg-primary/10 my-6" />
            
            <div className="w-full space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium">Item</span>
                <span className="text-foreground font-bold">{productName || '---'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium">Quantity</span>
                <span className="text-foreground font-bold">x{quantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium">Payment</span>
                <span className="text-foreground font-bold uppercase">{paymentMethod}</span>
              </div>
            </div>

            <button onClick={handleSave}
              disabled={!productName || !pricePerUnit || quantity < 1}
              className="w-full h-16 rounded-xl bg-primary text-primary-foreground font-black text-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-30 disabled:shadow-none">
              Record Sale
            </button>
            <p className="text-[10px] text-muted-foreground font-medium mt-4">
              Recording this sale will automatically update your inventory stock.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
