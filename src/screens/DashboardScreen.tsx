import { useApp } from '@/context/AppContext';
import { formatCurrency, formatCompact } from '@/lib/format';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Receipt, Package, Moon, Sun, Menu } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReceiptSheet from '@/components/ReceiptSheet';
import AppDrawer from '@/components/AppDrawer';
import PWAInstallBanner from '@/components/PWAInstallBanner';
import type { Sale } from '@/context/AppContext';

function AmountPopup({ amount, onClose }: { amount: number; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30"
      onClick={onClose}
    >
      <div className="bg-card rounded-xl px-6 py-4 shadow-xl text-center" onClick={e => e.stopPropagation()}>
        <p className="text-xs text-muted-foreground mb-1">Full Amount</p>
        <p className="text-2xl font-extrabold text-foreground currency">{formatCurrency(amount)}</p>
        <button onClick={onClose} className="mt-3 text-sm text-primary font-semibold">Close</button>
      </div>
    </motion.div>
  );
}

export default function DashboardScreen() {
  const { user, sales, expenses, cashFloat, setCashFloat, darkMode, toggleDarkMode } = useApp();
  const navigate = useNavigate();
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [popupAmount, setPopupAmount] = useState<number | null>(null);
  const [editingFloat, setEditingFloat] = useState(false);
  const [floatInput, setFloatInput] = useState('');

  const totalSales = useMemo(() => sales.reduce((s, x) => s + x.totalPrice, 0), [sales]);
  const totalExpenses = useMemo(() => expenses.reduce((s, x) => s + x.amount, 0), [expenses]);
  const profit = totalSales - totalExpenses;

  const todayKey = new Date().toISOString().split('T')[0];
  const todaySales = useMemo(() => sales.filter(s => s.date.split('T')[0] === todayKey).reduce((s, x) => s + x.totalPrice, 0), [sales, todayKey]);
  const todayExpenses = useMemo(() => expenses.filter(e => e.date.split('T')[0] === todayKey).reduce((s, x) => s + x.amount, 0), [expenses, todayKey]);

  const floatToday = cashFloat?.date === todayKey ? cashFloat.openingCash : 0;
  const expectedCash = floatToday + todaySales - todayExpenses;

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const todayDate = useMemo(() => {
    return new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }, []);

  const recentActivity = useMemo(() => {
    const items = [
      ...sales.map(s => ({ type: 'sale' as const, name: s.productName, amount: s.totalPrice, date: s.date, sale: s })),
      ...expenses.map(e => ({ type: 'expense' as const, name: e.description, amount: e.amount, date: e.date, sale: null })),
    ];
    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return items.slice(0, 5);
  }, [sales, expenses]);

  const handleFloatSave = () => {
    const val = parseFloat(floatInput);
    if (!isNaN(val) && val >= 0) {
      setCashFloat(val);
      setEditingFloat(false);
      setFloatInput('');
    }
  };

  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
  const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <div className="px-4 pt-6 pb-24">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {greeting}, {user?.businessName?.split("'")[0] || 'Boss'} 👋
          </h2>
          <p className="text-sm text-muted-foreground">{todayDate}</p>
        </div>
        <button
          onClick={toggleDarkMode}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center tap-target"
        >
          {darkMode ? <Sun size={20} className="text-accent" /> : <Moon size={20} className="text-muted-foreground" />}
        </button>
      </div>

      {/* Cash Float Card */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 rounded-xl bg-card border p-4 kente-border"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-foreground">Today's Float 💵</h3>
          <button
            onClick={() => { setEditingFloat(true); setFloatInput(floatToday.toString()); }}
            className="text-xs text-primary font-semibold"
          >
            {floatToday > 0 ? 'Edit' : 'Set'}
          </button>
        </div>
        {editingFloat ? (
          <div className="flex gap-2">
            <input
              type="number"
              value={floatInput}
              onChange={e => setFloatInput(e.target.value)}
              placeholder="Opening cash"
              className="flex-1 h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            <button onClick={handleFloatSave} className="h-10 px-4 rounded-lg bg-primary text-primary-foreground font-semibold text-sm">Save</button>
            <button onClick={() => setEditingFloat(false)} className="h-10 px-3 rounded-lg bg-secondary text-foreground text-sm">✕</button>
          </div>
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-muted-foreground">GH₵ {floatToday.toFixed(0)} + Sales − Expenses =</span>
            <span className="text-lg font-extrabold text-accent currency">{formatCurrency(expectedCash)}</span>
          </div>
        )}
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-3 gap-3 mb-6">
        <motion.div variants={fadeUp} className="stat-card bg-primary kente-border cursor-pointer" onClick={() => setPopupAmount(totalSales)}>
          <p className="text-xs font-medium text-primary-foreground/70 mb-1">💰 Sales</p>
          <p className="text-[22px] leading-tight font-[800] text-primary-foreground currency">{formatCompact(totalSales)}</p>
        </motion.div>
        <motion.div variants={fadeUp} className="stat-card bg-destructive kente-border cursor-pointer" onClick={() => setPopupAmount(totalExpenses)}>
          <p className="text-xs font-medium text-destructive-foreground/70 mb-1">💸 Expenses</p>
          <p className="text-[22px] leading-tight font-[800] text-destructive-foreground currency">{formatCompact(totalExpenses)}</p>
        </motion.div>
        <motion.div variants={fadeUp} className={`stat-card kente-border cursor-pointer ${profit >= 0 ? 'bg-primary' : 'bg-destructive'}`} onClick={() => setPopupAmount(profit)}>
          <p className={`text-xs font-medium mb-1 ${profit >= 0 ? 'text-primary-foreground/70' : 'text-destructive-foreground/70'}`}>📈 Profit</p>
          <p className={`text-[22px] leading-tight font-[800] currency ${profit >= 0 ? 'text-primary-foreground' : 'text-destructive-foreground'}`}>
            {formatCompact(profit)}
          </p>
        </motion.div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 gap-3 mb-8">
        <motion.button
          variants={fadeUp}
          onClick={() => navigate('/record/sale')}
          className="h-20 rounded-xl bg-primary text-primary-foreground font-bold text-base flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
        >
          <Receipt size={22} /> Record Sale
        </motion.button>
        <motion.button
          variants={fadeUp}
          onClick={() => navigate('/record/expense')}
          className="h-20 rounded-xl bg-destructive text-destructive-foreground font-bold text-base flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
        >
          <TrendingDown size={22} /> Record Expense
        </motion.button>
        <motion.button
          variants={fadeUp}
          onClick={() => navigate('/inventory')}
          className="col-span-2 h-16 rounded-xl bg-accent text-accent-foreground font-bold text-base flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
        >
          <Package size={22} /> Inventory
        </motion.button>
      </motion.div>

      {/* Recent Activity */}
      <div>
        <h3 className="font-bold text-base mb-3 text-foreground">Recent Activity</h3>
        <div className="kente-divider mb-3" />
        {recentActivity.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No sales yet today. Let's make money! 💪</p>
        ) : (
          <div className="space-y-2">
            {recentActivity.map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 bg-card rounded-lg p-3 border ${item.type === 'sale' ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''}`}
                onClick={() => item.type === 'sale' && item.sale && setSelectedSale(item.sale)}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.type === 'sale' ? 'bg-primary/10' : 'bg-destructive/10'}`}>
                  {item.type === 'sale' ? <TrendingUp size={18} className="text-primary" /> : <TrendingDown size={18} className="text-destructive" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                </div>
                <p className={`font-bold text-sm currency ${item.type === 'sale' ? 'text-primary' : 'text-destructive'}`}>
                  {item.type === 'sale' ? '+' : '-'}{formatCompact(item.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Receipt Bottom Sheet */}
      <ReceiptSheet sale={selectedSale} onClose={() => setSelectedSale(null)} businessName={user?.businessName || 'Bizora'} />

      {/* Amount Popup */}
      {popupAmount !== null && <AmountPopup amount={popupAmount} onClose={() => setPopupAmount(null)} />}
    </div>
  );
}
