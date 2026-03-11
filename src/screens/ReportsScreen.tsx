import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { formatCurrency, formatCompact } from '@/lib/format';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { Download, Share2 } from 'lucide-react';

function generateCSV(businessName: string, sales: any[], expenses: any[], dateRange: string, totalS: number, totalE: number, profit: number) {
  const lines: string[] = [];
  lines.push('Bizora Weekly Report');
  lines.push(`Business: ${businessName}`);
  lines.push(`Period: ${dateRange}`);
  lines.push(`Total Sales: ${formatCurrency(totalS)}`);
  lines.push(`Total Expenses: ${formatCurrency(totalE)}`);
  lines.push(`Net Profit: ${formatCurrency(profit)}`);
  lines.push('');
  lines.push('--- SALES ---');
  lines.push('Date,Product,Quantity,Price/Unit,Total,Payment');
  sales.forEach(s => {
    lines.push(`${s.date.split('T')[0]},${s.productName},${s.quantity},${s.pricePerUnit},${s.totalPrice},${s.paymentMethod || 'cash'}`);
  });
  lines.push('');
  lines.push('--- EXPENSES ---');
  lines.push('Date,Description,Category,Amount');
  expenses.forEach(e => {
    lines.push(`${e.date.split('T')[0]},${e.description},${e.category},${e.amount}`);
  });
  return lines.join('\n');
}

export default function ReportsScreen() {
  const { sales, expenses, user } = useApp();
  const [period, setPeriod] = useMemo(() => ['week' as const, () => {}], []);
  // Actually need state:
  const { useState } = require('react');

  return <ReportsScreenInner />;
}

function ReportsScreenInner() {
  const { sales, expenses, user } = useApp();
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

  // Payment method breakdown
  const paymentBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filteredSales.forEach(s => { map[s.paymentMethod || 'cash'] = (map[s.paymentMethod || 'cash'] || 0) + s.totalPrice; });
    return map;
  }, [filteredSales]);

  const paymentColors: Record<string, string> = { cash: 'text-primary', momo: 'text-accent', bank: 'text-info', credit: 'text-destructive' };
  const paymentLabels: Record<string, string> = { cash: 'Cash', momo: 'MoMo', bank: 'Bank Transfer', credit: 'Credit' };

  const expenseBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filteredExpenses.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredExpenses]);

  // Sales Forecast
  const forecast = useMemo(() => {
    const last7 = [];
    let strongestDay = { name: '', amount: 0 };
    let quietestDay = { name: '', amount: Infinity };
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-GB', { weekday: 'long' });
      const dayTotal = sales.filter(s => s.date.split('T')[0] === key).reduce((sum, s) => sum + s.totalPrice, 0);
      last7.push(dayTotal);
      if (dayTotal > strongestDay.amount) strongestDay = { name: dayName, amount: dayTotal };
      if (dayTotal < quietestDay.amount) quietestDay = { name: dayName, amount: dayTotal };
    }
    if (quietestDay.amount === Infinity) quietestDay = { name: '', amount: 0 };
    const daysWithData = last7.filter(d => d > 0).length;
    if (daysWithData < 7) return { amount: 0, enough: false, strongest: strongestDay, quietest: quietestDay };
    const avg = last7.reduce((a, b) => a + b, 0) / 7;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayOfWeek = tomorrow.getDay();
    let multiplier = 1.0;
    if (dayOfWeek === 5) multiplier = 1.2;
    else if (dayOfWeek === 6) multiplier = 1.3;
    else if (dayOfWeek === 1) multiplier = 0.8;
    else if (dayOfWeek === 0) multiplier = 0.6;
    return { amount: avg * multiplier, enough: true, strongest: strongestDay, quietest: quietestDay };
  }, [sales]);

  const dateRange = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - (period === 'week' ? 7 : 30));
    return `${start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }, [period]);

  const handleExportCSV = () => {
    const csv = generateCSV(user?.businessName || 'Bizora', filteredSales, filteredExpenses, dateRange, totalSales, totalExpenses, profit);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `bizora-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const handleShareWhatsApp = () => {
    const text = [
      `Bizora Report - ${user?.businessName || 'My Business'}`,
      `Period: ${dateRange}`,
      `Sales: ${formatCurrency(totalSales)}`,
      `Expenses: ${formatCurrency(totalExpenses)}`,
      `Profit: ${formatCurrency(profit)}`,
      '', 'Generated by Bizora',
    ].join('\n');
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <div className="px-4 pt-6 pb-24">
      <h1 className="text-2xl font-extrabold mb-4 text-foreground">Reports</h1>

      {/* Period Toggle */}
      <div className="flex bg-secondary rounded-full p-1 mb-6">
        <button onClick={() => setPeriod('week')}
          className={`flex-1 h-10 rounded-full font-semibold text-sm transition-all ${period === 'week' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
          This Week
        </button>
        <button onClick={() => setPeriod('month')}
          className={`flex-1 h-10 rounded-full font-semibold text-sm transition-all ${period === 'month' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
          This Month
        </button>
      </div>

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

      {/* Summary Cards */}
      <motion.div variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }} initial="hidden" animate="show" className="grid grid-cols-3 gap-3 mb-6">
        <motion.div variants={fadeUp} className="stat-card bg-primary kente-border">
          <p className="text-xs font-medium text-primary-foreground/70 mb-1">Sales</p>
          <p className="text-base font-extrabold text-primary-foreground currency">{formatCompact(totalSales)}</p>
        </motion.div>
        <motion.div variants={fadeUp} className="stat-card bg-destructive kente-border">
          <p className="text-xs font-medium text-destructive-foreground/70 mb-1">Expenses</p>
          <p className="text-base font-extrabold text-destructive-foreground currency">{formatCompact(totalExpenses)}</p>
        </motion.div>
        <motion.div variants={fadeUp} className={`stat-card kente-border ${profit >= 0 ? 'bg-primary' : 'bg-destructive'}`}>
          <p className={`text-xs font-medium mb-1 ${profit >= 0 ? 'text-primary-foreground/70' : 'text-destructive-foreground/70'}`}>Profit</p>
          <p className={`text-base font-extrabold currency ${profit >= 0 ? 'text-primary-foreground' : 'text-destructive-foreground'}`}>{formatCompact(profit)}</p>
        </motion.div>
      </motion.div>

      {/* Payment Breakdown */}
      {Object.keys(paymentBreakdown).length > 0 && (
        <div className="bg-card rounded-xl border p-4 mb-6">
          <h3 className="font-bold text-sm mb-3 text-foreground">Payment Methods</h3>
          <div className="space-y-2">
            {Object.entries(paymentBreakdown).map(([method, amt]) => (
              <div key={method} className="flex justify-between items-center">
                <span className="text-sm text-foreground">{paymentLabels[method] || method}</span>
                <span className={`text-sm font-bold currency ${paymentColors[method] || 'text-foreground'}`}>{formatCompact(amt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expense Breakdown */}
      {expenseBreakdown.length > 0 && (
        <div className="bg-card rounded-xl border p-4 mb-6">
          <h3 className="font-bold text-sm mb-3 text-foreground">Expense Breakdown</h3>
          <div className="space-y-2">
            {expenseBreakdown.map(([cat, amt]) => (
              <div key={cat} className="flex justify-between items-center">
                <span className="text-sm text-foreground">{cat}</span>
                <span className="text-sm font-bold text-destructive currency">{formatCompact(amt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sales Forecast */}
      <div className="bg-card rounded-xl border p-4 mb-6 border-l-[3px] border-l-primary">
        <h3 className="font-bold text-sm mb-2 text-foreground">Tomorrow's Forecast</h3>
        {forecast.enough ? (
          <>
            <p className="text-2xl font-extrabold text-accent currency mb-1">{formatCurrency(forecast.amount)}</p>
            <p className="text-xs text-muted-foreground mb-2">Based on your last 7 days of sales</p>
            {forecast.strongest.name && (
              <p className="text-xs text-muted-foreground">Strongest day: {forecast.strongest.name} with {formatCurrency(forecast.strongest.amount)}</p>
            )}
            {forecast.quietest.name && (
              <p className="text-xs text-muted-foreground">Quietest day: {forecast.quietest.name} with {formatCurrency(forecast.quietest.amount)}</p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Record at least 7 days of sales for a forecast</p>
        )}
      </div>

      {/* Export Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button onClick={handleExportCSV}
          className="h-12 rounded-xl bg-accent text-accent-foreground font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-transform tap-target">
          <Download size={18} /> Export CSV
        </button>
        <button onClick={handleShareWhatsApp}
          className="h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-transform tap-target">
          <Share2 size={18} /> WhatsApp
        </button>
      </div>
    </div>
  );
}
