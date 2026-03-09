import { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/format';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { Lock, Sparkles } from 'lucide-react';

export default function ReportsScreen() {
  const { sales, expenses } = useApp();
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  const now = new Date();
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

  // Chart data - daily
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

  // Expense breakdown
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
        <motion.div variants={fadeUp} className="stat-card bg-primary/10 border-primary/20 kente-border">
          <p className="text-xs font-medium text-muted-foreground mb-1">Sales</p>
          <p className="text-base font-extrabold text-primary currency">{formatCurrency(totalSales)}</p>
        </motion.div>
        <motion.div variants={fadeUp} className="stat-card bg-destructive/10 border-destructive/20 kente-border">
          <p className="text-xs font-medium text-muted-foreground mb-1">Expenses</p>
          <p className="text-base font-extrabold text-destructive currency">{formatCurrency(totalExpenses)}</p>
        </motion.div>
        <motion.div variants={fadeUp} className={`stat-card border kente-border ${profit >= 0 ? 'bg-primary/10 border-primary/20' : 'bg-destructive/10 border-destructive/20'}`}>
          <p className="text-xs font-medium text-muted-foreground mb-1">Profit</p>
          <p className={`text-base font-extrabold currency ${profit >= 0 ? 'text-primary' : 'text-destructive'}`}>{formatCurrency(profit)}</p>
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

      {/* AI Insights Teaser */}
      <div className="relative rounded-xl border border-accent/30 bg-accent/5 p-5 overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-[1px]" />
        <div className="relative flex items-start gap-3 opacity-60">
          <Sparkles size={24} className="text-accent mt-0.5" />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-foreground">AI Insights</h3>
              <Lock size={14} className="text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Smart tips for your business. Coming soon in Bizora Pro ✨</p>
          </div>
        </div>
      </div>
    </div>
  );
}
