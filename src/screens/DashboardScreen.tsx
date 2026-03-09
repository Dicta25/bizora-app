import { useApp } from '@/context/AppContext';
import { formatCurrency, formatDate } from '@/lib/format';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Receipt, Package } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReceiptSheet from '@/components/ReceiptSheet';
import type { Sale } from '@/context/AppContext';

export default function DashboardScreen() {
  const { user, sales, expenses } = useApp();
  const navigate = useNavigate();
  const [showBanner, setShowBanner] = useState(true);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const totalSales = useMemo(() => sales.reduce((s, x) => s + x.totalPrice, 0), [sales]);
  const totalExpenses = useMemo(() => expenses.reduce((s, x) => s + x.amount, 0), [expenses]);
  const profit = totalSales - totalExpenses;

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

  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
  const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <div className="px-4 pt-6 pb-24">
      {/* Greeting */}
      <div className="mb-2">
        <h2 className="text-xl font-bold text-foreground">
          {greeting}, {user?.businessName?.split("'")[0] || 'Boss'} 👋
        </h2>
        <p className="text-sm text-muted-foreground">{todayDate}</p>
      </div>

      {/* Dismissable Banner */}
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          onClick={() => setShowBanner(false)}
          className="mb-4 rounded-xl bg-primary text-primary-foreground px-4 py-3 text-sm font-semibold border-l-4 border-accent cursor-pointer"
        >
          🚀 Bizora Pro is coming soon ✨
        </motion.div>
      )}

      {/* Stat Cards */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-3 gap-3 mb-6">
        <motion.div variants={fadeUp} className="stat-card bg-primary kente-border">
          <p className="text-xs font-medium text-primary-foreground/70 mb-1">💰 Sales</p>
          <p className="text-[32px] leading-tight font-[800] text-primary-foreground currency">{formatCurrency(totalSales)}</p>
        </motion.div>
        <motion.div variants={fadeUp} className="stat-card bg-destructive kente-border">
          <p className="text-xs font-medium text-destructive-foreground/70 mb-1">💸 Expenses</p>
          <p className="text-[32px] leading-tight font-[800] text-destructive-foreground currency">{formatCurrency(totalExpenses)}</p>
        </motion.div>
        <motion.div variants={fadeUp} className={`stat-card kente-border ${profit >= 0 ? 'bg-primary' : 'bg-destructive'}`}>
          <p className={`text-xs font-medium mb-1 ${profit >= 0 ? 'text-primary-foreground/70' : 'text-destructive-foreground/70'}`}>📈 Profit</p>
          <p className={`text-[32px] leading-tight font-[800] currency ${profit >= 0 ? 'text-primary-foreground' : 'text-destructive-foreground'}`}>
            {formatCurrency(profit)}
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
                  <p className="text-xs text-muted-foreground">{formatDate(item.date)}</p>
                </div>
                <p className={`font-bold text-sm currency ${item.type === 'sale' ? 'text-primary' : 'text-destructive'}`}>
                  {item.type === 'sale' ? '+' : '-'}{formatCurrency(item.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Receipt Bottom Sheet */}
      <ReceiptSheet sale={selectedSale} onClose={() => setSelectedSale(null)} businessName={user?.businessName || 'Bizora'} />
    </div>
  );
}
