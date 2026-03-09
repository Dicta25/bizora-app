import { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/format';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { Lock, Crown } from 'lucide-react';

export default function ReportsScreen() {
  const { sales, expenses } = useApp();
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  const cutoff = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - (period === 'week' ? 7 : 30));
    return d;
  }, [period]);

  const filteredSales = useMemo(() => sales.filter(s => new Date(s.date) >= cutoff), [sales, cutoff]);
  const filteredExpenses = useMemo(() => expenses.filter(e => new Date(e.date) >= cutoff), [expenses, cutoff]);

  const totalSales = filteredSales.reduce((s, x) => s + x.totalPrice, 0);
  const totalExpenses = filteredExpenses.reduce((s, x) => s + x.amount, 0);
  const profit = totalSales - totalExpenses;

  const chartData = useMemo(() => {
    const days = period === 'week' ? 7 : 30;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-GB', { weekday: 'short' }).slice(0, 3);
      const daySales = sales.filter(s => s.date.split('T')[0] === key).reduce((sum, s) => sum + s.totalPrice, 0);
      const dayExpenses = expenses.filter(e => e.date.split('T')[0] === key).reduce((sum, e) => sum + e.amount, 0);
      data.push({ name: label, sales: daySales, expenses: dayExpenses });
    }
    return data;
  }, [sales, expenses, period]);

  const expenseBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filteredExpenses.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredExpenses]);

  const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <div className="px-4 pt-6 pb-24">
      <h1 className="text-2xl font-extrabold mb-4 text-foreground">Reports</h1>

      {/* Period Toggle */}
      <div className="flex bg-secondary rounded-full p-1 mb-6">
        <button
          onClick={() => setPeriod('week')}
          className={`flex-1 h-10 rounded-full font-semibold text-sm transition-all ${period === 'week' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
        >
          This Week
        </button>
        <button
          onClick={() => setPeriod('month')}
          className={`flex-1 h-10 rounded-full font-semibold text-sm transition-all ${period === 'month' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
        >
          This Month
        </button>
      </div>

      {/* Summary Cards */}
      <motion.div variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }} initial="hidden" animate="show" className="grid grid-cols-3 gap-3 mb-6">
        <motion.div variants={fadeUp} className="stat-card bg-primary kente-border">
          <p className="text-xs font-medium text-primary-foreground/70 mb-1">💰 Sales</p>
          <p className="text-base font-extrabold text-primary-foreground currency">{formatCurrency(totalSales)}</p>
        </motion.div>
        <motion.div variants={fadeUp} className="stat-card bg-destructive kente-border">
          <p className="text-xs font-medium text-destructive-foreground/70 mb-1">💸 Expenses</p>
          <p className="text-base font-extrabold text-destructive-foreground currency">{formatCurrency(totalExpenses)}</p>
        </motion.div>
        <motion.div variants={fadeUp} className={`stat-card kente-border ${profit >= 0 ? 'bg-primary' : 'bg-destructive'}`}>
          <p className={`text-xs font-medium mb-1 ${profit >= 0 ? 'text-primary-foreground/70' : 'text-destructive-foreground/70'}`}>📈 Profit</p>
          <p className={`text-base font-extrabold currency ${profit >= 0 ? 'text-primary-foreground' : 'text-destructive-foreground'}`}>{formatCurrency(profit)}</p>
        </motion.div>
      </motion.div>

      {/* Chart */}
      <div className="bg-card rounded-xl border p-4 mb-6 kente-border">
        <h3 className="font-bold text-sm mb-3 text-foreground">Daily Overview</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={40} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Bar dataKey="sales" fill="hsl(153, 82%, 22%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" fill="hsl(4, 65%, 46%)" radius={[4, 4, 0, 0]} opacity={0.6} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Expense Breakdown */}
      {expenseBreakdown.length > 0 && (
        <div className="bg-card rounded-xl border p-4 mb-6">
          <h3 className="font-bold text-sm mb-3 text-foreground">Expense Breakdown</h3>
          <div className="space-y-2">
            {expenseBreakdown.map(([cat, amt]) => (
              <div key={cat} className="flex justify-between items-center">
                <span className="text-sm text-foreground">{cat}</span>
                <span className="text-sm font-bold text-destructive currency">{formatCurrency(amt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bizora Pro Teaser Card */}
      <div className="relative rounded-xl bg-primary p-5 overflow-hidden" style={{ border: '2px solid hsl(37, 89%, 51%)' }}>
        <div className="absolute inset-0 backdrop-blur-[2px] pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Crown size={20} className="text-accent" />
            <h3 className="font-extrabold text-primary-foreground text-lg">Bizora Pro ✨</h3>
          </div>
          <p className="text-sm text-primary-foreground/80 mb-4">Unlock AI insights, sales forecasts & WhatsApp reports</p>

          <div className="space-y-2.5 mb-4 opacity-70">
            <div className="flex items-center gap-2 text-sm text-primary-foreground/90">
              <Lock size={14} className="text-accent" /> <span>Daily AI tip for your business</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-primary-foreground/90">
              <Lock size={14} className="text-accent" /> <span>Weekly profit forecast</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-primary-foreground/90">
              <Lock size={14} className="text-accent" /> <span>Send report to WhatsApp</span>
            </div>
          </div>

          <span className="inline-block bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">
            Coming Soon
          </span>
        </div>
      </div>
    </div>
  );
}
