import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/format';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Minus, Plus } from 'lucide-react';

export default function RecordSaleScreen() {
  const { products, addSale } = useApp();
  const navigate = useNavigate();
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [pricePerUnit, setPricePerUnit] = useState('');

  const total = quantity * (parseFloat(pricePerUnit) || 0);

  const handleSelectProduct = (name: string) => {
    setProductName(name);
    const product = products.find(p => p.name === name);
    if (product) setPricePerUnit(product.price.toString());
  };

  const handleSave = () => {
    if (!productName || !pricePerUnit || quantity < 1) return;
    addSale({
      productName,
      quantity,
      pricePerUnit: parseFloat(pricePerUnit),
      totalPrice: total,
      date: new Date().toISOString(),
    });
    toast.success('Sale recorded! 🎉');
    navigate('/');
  };

  return (
    <div className="px-4 pt-6 pb-24">
      <button onClick={() => navigate(-1)} className="tap-target mb-4 text-muted-foreground">
        <ArrowLeft size={24} />
      </button>
      <h1 className="text-2xl font-extrabold mb-6 text-foreground">New Sale</h1>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold mb-1.5 text-foreground">Product Name</label>
          {products.length > 0 ? (
            <select
              value={productName}
              onChange={e => handleSelectProduct(e.target.value)}
              className="w-full h-12 rounded-lg border border-input bg-card px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
            >
              <option value="">Select product...</option>
              {products.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
              <option value="__custom">Type custom name...</option>
            </select>
          ) : null}
          {(products.length === 0 || productName === '__custom') && (
            <input
              type="text"
              placeholder="Enter product name"
              value={productName === '__custom' ? '' : productName}
              onChange={e => setProductName(e.target.value)}
              className="w-full h-12 rounded-lg border border-input bg-card px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary mt-2"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5 text-foreground">Quantity</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center active:scale-95 transition-transform border"
            >
              <Minus size={24} className="text-foreground" />
            </button>
            <input
              type="number"
              value={quantity}
              onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="flex-1 h-14 rounded-xl border border-input bg-card text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center active:scale-95 transition-transform border"
            >
              <Plus size={24} className="text-foreground" />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5 text-foreground">Price per Unit (GH₵)</label>
          <input
            type="number"
            placeholder="0.00"
            value={pricePerUnit}
            onChange={e => setPricePerUnit(e.target.value)}
            className="w-full h-12 rounded-lg border border-input bg-card px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Total */}
        <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Total</p>
          <p className="text-3xl font-extrabold text-primary currency">{formatCurrency(total)}</p>
        </div>

        <button
          onClick={handleSave}
          disabled={!productName || !pricePerUnit || quantity < 1}
          className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-bold text-lg tap-target disabled:opacity-40 transition-all active:scale-[0.98]"
        >
          Save Sale ✓
        </button>
      </div>
    </div>
  );
}
