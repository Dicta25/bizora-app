import { useApp } from '@/context/AppContext';
import { formatCurrency, formatCompact } from '@/lib/format';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Receipt, Package, Moon, Sun, Menu } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReceiptSheet from '@/components/ReceiptSheet';
import AppDrawer from '@/components/AppDrawer';
import PWAInstallBanner from '@/components/PWAInstallBanner';
import type { Sale } from '@/context/types';

function AmountPopup({ amount, onClose }: { amount: number; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30" onClick={onClose}>
      <div className="bg-card rounded-xl px-6 py-4 shadow-xl text-center" onClick={e => e.stopPropagation()}>
        <p className="text-xs text-muted-foreground mb-1">Full Amount</p>
        <p className="text-2xl font-extrabold text-foreground currency">{formatCurrency(amount)}</p>
        <button onClick={onClose} className="mt-3 text-sm text-primary font-semibold">Close</button>
      </div>
    </motion.div>
  );
}

function DailyTip({ tip }: { tip: string }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || !tip) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-accent/10 border border-accent/20 p-4 mb-4 border-l-[3px] border-l-accent">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-accent mb-1">Today's Tip</p>
          <p className="text-sm text-foreground">{tip}</p>
        </div>
        <button onClick={() => setDismissed(true)} className="text-muted-foreground text-sm shrink-0 ml-2">✕</button>
      </div>
    </motion.div>
  );
}

function DailySummaryCard({ todaySales, todayExpenses, todaySalesTotal, todayExpensesTotal, products }: {
  todaySales: Sale[];
  todayExpenses: number;
  todaySalesTotal: number;
  todayExpensesTotal: number;
  products: { name: string }[];
}) {
  const todayKey = new Date().toISOString().split('T')[0];
  const dismissKey = `bizora_summary_dismissed_${todayKey}`;
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(dismissKey) === '1');
  const hour = new Date().getHours();

  // Only show after 6 PM
  if (hour < 18 || dismissed) return null;

  const net = todaySalesTotal - todayExpensesTotal;
  const paymentMap: Record<string, number> = {};
  todaySales.forEach(s => { paymentMap[s.paymentMethod || 'cash'] = (paymentMap[s.paymentMethod || 'cash'] || 0) + s.totalPrice; });
  const paymentLabels: Record<string, string> = { cash: 'Cash', momo: 'MoMo', bank: 'Bank', credit: 'Credit' };

  // Best selling product
  const productUnits: Record<string, number> = {};
  todaySales.forEach(s => { productUnits[s.productName] = (productUnits[s.productName] || 0) + s.quantity; });
  const bestSeller = Object.entries(productUnits).sort((a, b) => b[1] - a[1])[0];

  const handleDismiss = () => {
    localStorage.setItem(dismissKey, '1');
    setDismissed(true);
  };

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-l-[3px] border-l-primary p-4 mb-4 bg-accent/5 dark:bg-[hsl(240,3%,18%)]">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-foreground">Today's Summary</h3>
          <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <button onClick={handleDismiss} className="text-muted-foreground text-sm">✕</button>
      </div>
      {todaySales.length === 0 ? (
        <p className="text-sm text-muted-foreground">No sales recorded today. Tomorrow is a new day</p>
      ) : (
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Sales</span>
            <span className="font-bold text-primary">{formatCurrency(todaySalesTotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Expenses</span>
            <span className="font-bold text-destructive">{formatCurrency(todayExpensesTotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Net Profit</span>
            <span className={`font-bold ${net >= 0 ? 'text-primary' : 'text-destructive'}`}>{formatCurrency(net)}</span>
          </div>
          {bestSeller && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Best Seller</span>
              <span className="font-bold text-foreground">{bestSeller[0]} — {bestSeller[1]} units</span>
            </div>
          )}
          {Object.keys(paymentMap).length > 0 && (
            <div className="pt-1 text-xs text-muted-foreground">
              {Object.entries(paymentMap).map(([m, a]) => `${paymentLabels[m] || m} ${formatCurrency(a)}`).join(' · ')}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

function IOSReminderBanner({ businessName }: { businessName: string }) {
  const [show, setShow] = useState(false);
  const { reminderEnabled } = useApp();
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  useEffect(() => {
    if (!reminderEnabled || !isIOS) return;
    const now = new Date();
    // Show banner if it's after 5 PM
    if (now.getHours() >= 17) {
      const dismissKey = `bizora_ios_reminder_${now.toISOString().split('T')[0]}`;
      if (!localStorage.getItem(dismissKey)) {
        setShow(true);
      }
    }
  }, [reminderEnabled, isIOS]);

  if (!show) return null;

  const handleDismiss = () => {
    localStorage.setItem(`bizora_ios_reminder_${new Date().toISOString().split('T')[0]}`, '1');
    setShow(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-accent/10 border border-accent/20 p-3 mb-4 flex items-center justify-between">
      <p className="text-sm text-foreground">🔔 Don't forget to record today's sales, {businessName}. Close strong</p>
      <button onClick={handleDismiss} className="text-muted-foreground text-sm shrink-0 ml-2">✕</button>
    </motion.div>
  );
}

export default function DashboardScreen() {
  const { user, sales, expenses, cashFloat, setCashFloat, darkMode, toggleDarkMode, products, customers, reminderEnabled, reminderTime } = useApp();
  const navigate = useNavigate();
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [popupAmount, setPopupAmount] = useState<number | null>(null);
  const [editingFloat, setEditingFloat] = useState(false);
  const [floatInput, setFloatInput] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const totalSales = useMemo(() => sales.reduce((s, x) => s + x.totalPrice, 0), [sales]);
  const totalExpenses = useMemo(() => expenses.reduce((s, x) => s + x.amount, 0), [expenses]);
  const profit = totalSales - totalExpenses;

  const todayKey = new Date().toISOString().split('T')[0];
  const todaySales = useMemo(() => sales.filter(s => s.date.split('T')[0] === todayKey), [sales, todayKey]);
  const todaySalesTotal = useMemo(() => todaySales.reduce((s, x) => s + x.totalPrice, 0), [todaySales]);
  const todayExpensesTotal = useMemo(() => expenses.filter(e => e.date.split('T')[0] === todayKey).reduce((s, x) => s + x.amount, 0), [expenses, todayKey]);

  const floatToday = cashFloat?.date === todayKey ? cashFloat.openingCash : 0;
  const expectedCash = floatToday + todaySalesTotal - todayExpensesTotal;

  // Payment breakdown for today
  const paymentBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    todaySales.forEach(s => { map[s.paymentMethod || 'cash'] = (map[s.paymentMethod || 'cash'] || 0) + s.totalPrice; });
    return map;
  }, [todaySales]);

  const paymentColors: Record<string, string> = { cash: 'text-primary', momo: 'text-accent', bank: 'text-info', credit: 'text-destructive' };
  const paymentLabels: Record<string, string> = { cash: 'Cash', momo: 'MoMo', bank: 'Bank', credit: 'Credit' };

  // Schedule browser notification for reminder
  useEffect(() => {
    if (!reminderEnabled || !('Notification' in window) || Notification.permission !== 'granted') return;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) return; // iOS uses banner instead

    const check = () => {
      const now = new Date();
      const [h, m] = (reminderTime || '18:00').split(':').map(Number);
      const notifKey = `bizora_notif_${now.toISOString().split('T')[0]}`;
      if (now.getHours() === h && now.getMinutes() === m && !localStorage.getItem(notifKey)) {
        localStorage.setItem(notifKey, '1');
        new Notification('Bizora', {
          body: `Don't forget to record today's sales, ${user?.businessName || 'Boss'}. Close strong`,
          icon: '/favicon.ico',
        });
      }
    };
    const id = setInterval(check, 30000); // check every 30s
    check();
    return () => clearInterval(id);
  }, [reminderEnabled, reminderTime, user?.businessName]);

  // Daily tip logic
  const dailyTip = useMemo(() => {
    const day = new Date().getDay();
    const hour = new Date().getHours();
    const lowStockP = products.find(p => p.stock > 0 && p.stock <= p.restockLevel);
    if (lowStockP) return `Your ${lowStockP.name} stock is low. Consider restocking before your next market day`;
    if (todayExpensesTotal > todaySalesTotal && todaySalesTotal > 0) return 'Your expenses exceeded sales today. Review your costs carefully';
    const debtCustomer = customers.find(c => {
      if (c.balance <= 0 || !c.lastPurchaseDate) return false;
      const diff = Date.now() - new Date(c.lastPurchaseDate).getTime();
      return diff > 7 * 86400000;
    });
    if (debtCustomer) return `${debtCustomer.name} has an outstanding balance. Consider sending a reminder today`;
    if (day === 5) return 'Fridays are usually busy. Make sure your stock is ready';
    if (day === 1) return 'Slow start to the week is normal. Focus on your best selling items';
    if (hour >= 12 && todaySales.length === 0) return 'No sales recorded this morning. Consider your pricing or product placement';
    if (todaySalesTotal > 0 && todayExpensesTotal === 0) return 'Remember to record your expenses for an accurate profit figure';
    if (todaySalesTotal > 0 && todayExpensesTotal > 0 && (todaySalesTotal - todayExpensesTotal) / todaySalesTotal > 0.5)
      return 'Great margins today. Your pricing is working well';
    return '';
  }, [products, todaySalesTotal, todayExpensesTotal, todaySales, customers]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const todayDate = useMemo(() =>
    new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), []);

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
    if (!isNaN(val) && val >= 0) { setCashFloat(val); setEditingFloat(false); setFloatInput(''); }
  };

  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
  const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <div className="px-4 pt-6 pb-24">
      <AppDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setDrawerOpen(true)} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center tap-target">
            <Menu size={20} className="text-foreground" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {greeting}, {user?.businessName?.split("'")[0] || 'Boss'} 👋
            </h2>
            <p className="text-sm text-muted-foreground">{todayDate}</p>
          </div>
        </div>
        <button onClick={toggleDarkMode} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center tap-target">
          {darkMode ? <Sun size={20} className="text-accent" /> : <Moon size={20} className="text-muted-foreground" />}
        </button>
      </div>

      {/* iOS Reminder Banner */}
      <IOSReminderBanner businessName={user?.businessName || 'Boss'} />

      {/* Daily Summary Card (after 6 PM) */}
      <DailySummaryCard
        todaySales={todaySales}
        todayExpenses={todayExpensesTotal}
        todaySalesTotal={todaySalesTotal}
        todayExpensesTotal={todayExpensesTotal}
        products={products}
      />

      {/* Cash Float Card */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 rounded-xl bg-card border p-4 kente-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-foreground">Today's Float</h3>
          <button onClick={() => { setEditingFloat(true); setFloatInput(floatToday.toString()); }} className="text-xs text-primary font-semibold">
            {floatToday > 0 ? 'Edit' : 'Set'}
          </button>
        </div>
        {editingFloat ? (
          <div className="flex gap-2">
            <input type="number" value={floatInput} onChange={e => setFloatInput(e.target.value)} placeholder="Opening cash"
              className="flex-1 h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" autoFocus />
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
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-3 gap-3 mb-4">
        <motion.div variants={fadeUp} className="stat-card bg-primary kente-border cursor-pointer" onClick={() => setPopupAmount(totalSales)}>
          <p className="text-xs font-medium text-primary-foreground/70 mb-1">Sales</p>
          <p className="text-[22px] leading-tight font-[800] text-primary-foreground currency">{formatCompact(totalSales)}</p>
        </motion.div>
        <motion.div variants={fadeUp} className="stat-card bg-destructive kente-border cursor-pointer" onClick={() => setPopupAmount(totalExpenses)}>
          <p className="text-xs font-medium text-destructive-foreground/70 mb-1">Expenses</p>
          <p className="text-[22px] leading-tight font-[800] text-destructive-foreground currency">{formatCompact(totalExpenses)}</p>
        </motion.div>
        <motion.div variants={fadeUp} className={`stat-card kente-border cursor-pointer ${profit >= 0 ? 'bg-primary' : 'bg-destructive'}`} onClick={() => setPopupAmount(profit)}>
          <p className={`text-xs font-medium mb-1 ${profit >= 0 ? 'text-primary-foreground/70' : 'text-destructive-foreground/70'}`}>Profit</p>
          <p className={`text-[22px] leading-tight font-[800] currency ${profit >= 0 ? 'text-primary-foreground' : 'text-destructive-foreground'}`}>
            {formatCompact(profit)}
          </p>
        </motion.div>
      </motion.div>

      {/* Today's Payments */}
      {Object.keys(paymentBreakdown).length > 0 && (
        <div className="bg-card rounded-xl border p-4 mb-4">
          <h3 className="text-sm font-bold text-foreground mb-2">Today's Payments</h3>
          <div className="space-y-1">
            {Object.entries(paymentBreakdown).map(([method, amount]) => (
              <div key={method} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{paymentLabels[method] || method}</span>
                <span className={`font-bold currency ${paymentColors[method] || 'text-foreground'}`}>{formatCurrency(amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {todaySales.length === 0 && (
        <div className="bg-card rounded-xl border p-4 mb-4">
          <h3 className="text-sm font-bold text-foreground mb-1">Today's Payments</h3>
          <p className="text-sm text-muted-foreground">No payments recorded yet today</p>
        </div>
      )}

      {/* Daily Tip */}
      <DailyTip tip={dailyTip} />

      {/* Action Buttons */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 gap-3 mb-8">
        <motion.button variants={fadeUp} onClick={() => navigate('/record/sale')}
          className="h-20 rounded-xl bg-primary text-primary-foreground font-bold text-base flex items-center justify-center gap-2 active:scale-[0.97] transition-transform">
          <Receipt size={22} /> Record Sale
        </motion.button>
        <motion.button variants={fadeUp} onClick={() => navigate('/record/expense')}
          className="h-20 rounded-xl bg-destructive text-destructive-foreground font-bold text-base flex items-center justify-center gap-2 active:scale-[0.97] transition-transform">
          <TrendingDown size={22} /> Record Expense
        </motion.button>
        <motion.button variants={fadeUp} onClick={() => navigate('/inventory')}
          className="col-span-2 h-16 rounded-xl bg-accent text-accent-foreground font-bold text-base flex items-center justify-center gap-2 active:scale-[0.97] transition-transform">
          <Package size={22} /> Inventory
        </motion.button>
      </motion.div>

      {/* Recent Activity */}
      <div>
        <h3 className="font-bold text-base mb-3 text-foreground">Recent Activity</h3>
        <div className="kente-divider mb-3" />
        {recentActivity.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No sales yet today. Let's make money 💪</p>
        ) : (
          <div className="space-y-2">
            {recentActivity.map((item, i) => (
              <div key={i}
                className={`flex items-center gap-3 bg-card rounded-lg p-3 border ${item.type === 'sale' ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''}`}
                onClick={() => item.type === 'sale' && item.sale && setSelectedSale(item.sale)}>
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

      <ReceiptSheet sale={selectedSale} onClose={() => setSelectedSale(null)} />
      {popupAmount !== null && <AmountPopup amount={popupAmount} onClose={() => setPopupAmount(null)} />}
      <PWAInstallBanner />
    </div>
  );
}
