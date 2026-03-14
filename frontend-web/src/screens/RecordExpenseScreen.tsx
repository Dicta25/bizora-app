import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

const CATEGORIES = ['Stock', 'Transport', 'Rent', 'Utilities', 'Other'];

export default function RecordExpenseScreen() {
  const { addExpense } = useApp();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const handleSave = () => {
    if (!amount || !description || !category) return;
    addExpense({ amount: parseFloat(amount), description, category, date: new Date().toISOString() });
    toast.success('Expense saved');
    navigate('/');
  };

  return (
    <div className="px-4 pt-6 pb-24">
      <button onClick={() => navigate(-1)} className="tap-target mb-4 text-muted-foreground">
        <ArrowLeft size={24} />
      </button>
      <h1 className="text-2xl font-extrabold mb-6 text-foreground">New Expense</h1>
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold mb-1.5 text-foreground">Amount (GH₵)</label>
          <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)}
            className="w-full h-12 rounded-lg border border-input bg-card px-4 text-base focus:outline-none focus:ring-2 focus:ring-destructive" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1.5 text-foreground">Description</label>
          <input type="text" placeholder="e.g. Bought tomatoes" value={description} onChange={e => setDescription(e.target.value)}
            className="w-full h-12 rounded-lg border border-input bg-card px-4 text-base focus:outline-none focus:ring-2 focus:ring-destructive" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1.5 text-foreground">Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="w-full h-12 rounded-lg border border-input bg-card px-4 text-base focus:outline-none focus:ring-2 focus:ring-destructive appearance-none">
            <option value="">Select category...</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button onClick={handleSave} disabled={!amount || !description || !category}
          className="w-full h-14 rounded-xl bg-destructive text-destructive-foreground font-bold text-lg tap-target disabled:opacity-40 transition-all active:scale-[0.98]">
          Save Expense
        </button>
      </div>
    </div>
  );
}
