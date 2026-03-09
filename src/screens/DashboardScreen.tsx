import { useApp } from '@/context/AppContext';
import { formatCurrency, formatDate } from '@/lib/format';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ShoppingBag, Receipt, Package } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DashboardScreen() {
  const { user, sales, expenses } = useApp();
  const navigate = useNavigate();

  const totalSales = useMemo(() => sales.reduce((s, x) => s + x.totalPrice, 0), [sales]);
  const totalExpenses = useMemo(() => expenses.reduce((s, x) => s + x.amount, 0), [expenses]);
  const profit = totalSales - totalExpenses;

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const recentActivity = useMemo(() => {
    const items = [
      ...sales.map(s => ({ type: 'sale' as const, name: s.productName, amount: s.totalPrice, date: s.date })),
      ...expenses.map(e => ({ type: 'expense' as const, name: e.description, amount: e.amount, date: e.date })),
    ];
    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return items.slice(0, 5);
  }, [sales, expenses]);

  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
  const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <div className="px-4 pt-6 pb-24">
      {/* Greeting */}
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-xl font-bold text-foreground">
          {greeting}, {user?.businessName?.split("'")[0] || 'Boss'} 👋
        </h2>
        <span className="text-2xl">🪙</span>
      </div>

      {/* Stat Cards */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-3 gap-3 mb-6">
        <motion.div variants={fadeUp} className="stat-card bg-primary/10 border-primary/20 kente-border">
          <p className="text-xs font-medium text-muted-foreground mb-1">Sales</p>
          <p className="text-lg font-extrabold text-primary currency">{formatCurrency(totalSales)}</p>
        </motion.div>
        <motion.div variants={fadeUp} className="stat-card bg-destructive/10 border-destructive/20 kente-border">
          <p className="text-xs font-medium text-muted-foreground mb-1">Expenses</p>
          <p className="text-lg font-extrabold text-destructive currency">{formatCurrency(totalExpenses)}</p>
        </motion.div>
        <motion.div variants={fadeUp} className={`stat-card border kente-border ${profit >= 0 ? 'bg-primary/10 border-primary/20' : 'bg-destructive/10 border-destructive/20'}`}>
          <p className="text-xs font-medium text-muted-foreground mb-1">Profit</p>
          <p className={`text-lg font-extrabold currency ${profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
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
          <p className="text-center text-muted-foreground py-8">No activity yet. Start recording! 📝</p>
        ) : (
          <div className="space-y-2">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-card rounded-lg p-3 border">
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
    </div>
  );
}
