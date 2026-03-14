import { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatCurrency, formatCompact } from '@/lib/format';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { Download, Share2, TrendingUp, TrendingDown } from 'lucide-react';

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
  sales.forEach((s: any) => {
    lines.push(`${s.date.split('T')[0]},${s.productName},${s.quantity},${s.pricePerUnit},${s.totalPrice},${s.paymentMethod || 'cash'}`);
  });
  lines.push('');
  lines.push('--- EXPENSES ---');
  lines.push('Date,Description,Category,Amount');
  expenses.forEach((e: any) => {
    lines.push(`${e.date.split('T')[0]},${e.description},${e.category},${e.amount}`);
  });
  return lines.join('\n');
}

const EXPENSE_COLORS: Record<string, string> = {
  'Stock': '#0A6640',
  'Transport': '#F2A115',
  'Rent': '#1565C0',
  'Utilities': '#E65100',
  'Other': '#7A736A',
};

function getExpenseColor(category: string): string {
  return EXPENSE_COLORS[category] || EXPENSE_COLORS['Other'];
}

export default function ReportsScreen() {
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

  const paymentBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filteredSales.forEach(s => { map[s.paymentMethod || 'cash'] = (map[s.paymentMethod || 'cash'] || 0) + s.totalPrice; });
    return map;
  }, [filteredSales]);

  const paymentColors: Record<string, string> = { cash: 'text-primary', momo: 'text-accent', bank: 'text-info', credit: 'text-destructive' };
  const paymentLabels: Record<string, string> = { cash: 'Cash', momo: 'MoMo', bank: 'Bank Transfer', credit: 'Credit' };

  // Expense breakdown for pie chart
  const expensePieData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredExpenses.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  const expenseTotal = filteredExpenses.reduce((s, e) => s + e.amount, 0);

  const forecast = useMemo(() => {
    let strongestDay = { name: '', amount: 0 };
    let quietestDay = { name: '', amount: Infinity };
    const last7: number[] = [];
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
    if (daysWithData < 3) return { amount: 0, enough: false, strongest: strongestDay, quietest: quietestDay };
    const avg = last7.reduce((a, b) => a + b, 0) / 7;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dow = tomorrow.getDay();
    let mult = 1.0;
    if (dow === 5) mult = 1.2;
    else if (dow === 6) mult = 1.3;
    else if (dow === 1) mult = 0.8;
    else if (dow === 0) mult = 0.6;
    return { amount: avg * mult, enough: true, strongest: strongestDay, quietest: quietestDay };
  }, [sales]);

  // Monthly comparison
  const monthlyComparison = useMemo(() => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const thisMonthSales = sales.filter(s => new Date(s.date) >= thisMonthStart).reduce((sum, s) => sum + s.totalPrice, 0);
    const thisMonthExpenses = expenses.filter(e => new Date(e.date) >= thisMonthStart).reduce((sum, e) => sum + e.amount, 0);
    const thisMonthTransactions = sales.filter(s => new Date(s.date) >= thisMonthStart).length + expenses.filter(e => new Date(e.date) >= thisMonthStart).length;

    const lastMonthSales = sales.filter(s => { const d = new Date(s.date); return d >= lastMonthStart && d <= lastMonthEnd; }).reduce((sum, s) => sum + s.totalPrice, 0);
    const lastMonthExpenses = expenses.filter(e => { const d = new Date(e.date); return d >= lastMonthStart && d <= lastMonthEnd; }).reduce((sum, e) => sum + e.amount, 0);
    const lastMonthTransactions = sales.filter(s => { const d = new Date(s.date); return d >= lastMonthStart && d <= lastMonthEnd; }).length + expenses.filter(e => { const d = new Date(e.date); return d >= lastMonthStart && d <= lastMonthEnd; }).length;

    const hasLastMonth = lastMonthSales > 0 || lastMonthExpenses > 0;

    return {
      hasLastMonth,
      thisMonth: { sales: thisMonthSales, expenses: thisMonthExpenses, profit: thisMonthSales - thisMonthExpenses, transactions: thisMonthTransactions },
      lastMonth: { sales: lastMonthSales, expenses: lastMonthExpenses, profit: lastMonthSales - lastMonthExpenses, transactions: lastMonthTransactions },
    };
  }, [sales, expenses]);

  const pctChange = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  };

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

  const ComparisonRow = ({ label, thisVal, lastVal }: { label: string; thisVal: number; lastVal: number }) => {
    const change = pctChange(thisVal, lastVal);
    const isUp = change >= 0;
    return (
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-foreground">{label}</span>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-foreground currency">{formatCompact(thisVal)}</span>
          <span className="text-xs text-muted-foreground">vs {formatCompact(lastVal)}</span>
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${isUp ? 'text-primary' : 'text-destructive'}`}>
            {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {change > 0 ? '+' : ''}{change}%
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="px-4 pb-24 md:pb-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Analytics Overview</h2>
          <p className="text-sm text-muted-foreground mt-1">Data from {dateRange}</p>
        </div>
        
        <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-xl w-fit">
          <button onClick={() => setPeriod('week')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${period === 'week' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}>
            LAST 7 DAYS
          </button>
          <button onClick={() => setPeriod('month')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${period === 'month' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}>
            LAST 30 DAYS
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Stats Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card rounded-2xl border p-5 shadow-sm">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-1">Total Sales</p>
              <p className="text-2xl font-black text-primary currency tabular-nums">{formatCurrency(totalSales)}</p>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary/10 w-fit px-2 py-0.5 rounded-full">
                <TrendingUp size={10} />
                <span>ACTIVE</span>
              </div>
            </div>
            <div className="bg-card rounded-2xl border p-5 shadow-sm">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-1">Total Expenses</p>
              <p className="text-2xl font-black text-destructive currency tabular-nums">{formatCurrency(totalExpenses)}</p>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-destructive bg-destructive/10 w-fit px-2 py-0.5 rounded-full">
                <TrendingDown size={10} />
                <span>SPENT</span>
              </div>
            </div>
            <div className="bg-card rounded-2xl border p-5 shadow-sm">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-1">Net Profit</p>
              <p className={`text-2xl font-black currency tabular-nums ${profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {formatCurrency(profit)}
              </p>
              <div className={`mt-3 flex items-center gap-1.5 text-[10px] font-bold w-fit px-2 py-0.5 rounded-full ${profit >= 0 ? 'text-primary bg-primary/10' : 'text-destructive bg-destructive/10'}`}>
                <span>{profit >= 0 ? 'PROFIT' : 'LOSS'}</span>
              </div>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="bg-card rounded-2xl border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Performance Trend</h3>
              <div className="flex items-center gap-4 text-[10px] font-bold">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span className="text-muted-foreground">SALES</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
                  <span className="text-muted-foreground">EXPENSES</span>
                </div>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#888' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#888' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  />
                  <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={period === 'week' ? 32 : 8} />
                  <Bar dataKey="expenses" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} barSize={period === 'week' ? 32 : 8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Comparison */}
          {monthlyComparison.hasLastMonth && (
            <div className="bg-card rounded-2xl border p-6 shadow-sm">
              <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-4">Monthly Growth</h3>
              <div className="space-y-1 divide-y">
                <ComparisonRow label="Revenue" thisVal={monthlyComparison.thisMonth.sales} lastVal={monthlyComparison.lastMonth.sales} />
                <ComparisonRow label="Spending" thisVal={monthlyComparison.thisMonth.expenses} lastVal={monthlyComparison.lastMonth.expenses} />
                <ComparisonRow label="Total Profit" thisVal={monthlyComparison.thisMonth.profit} lastVal={monthlyComparison.lastMonth.profit} />
              </div>
            </div>
          )}
        </div>

        {/* Breakdown & Actions Column */}
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleExportCSV}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-card border hover:bg-secondary transition-all group">
              <div className="p-2 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <Download size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground">EXPORT CSV</span>
            </button>
            <button onClick={handleShareWhatsApp}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-card border hover:bg-secondary transition-all group">
              <div className="p-2 rounded-full bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-all">
                <Share2 size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground">SHARE WHATSAPP</span>
            </button>
          </div>

          {/* Payment Breakdown */}
          <div className="bg-card rounded-2xl border p-6 shadow-sm">
            <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-6">Payment Methods</h3>
            <div className="space-y-4">
              {Object.keys(paymentBreakdown).length > 0 ? (
                Object.entries(paymentBreakdown).map(([method, amount]) => (
                  <div key={method} className="space-y-1.5">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-bold text-muted-foreground uppercase">{paymentLabels[method] || method}</span>
                      <span className={`text-sm font-black currency ${paymentColors[method] || 'text-foreground'}`}>{formatCurrency(amount)}</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${paymentColors[method]?.replace('text-', 'bg-') || 'bg-foreground'}`}
                        style={{ width: `${(amount / totalSales) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic py-4 text-center">No sales data for this period</p>
              )}
            </div>
          </div>

          {/* AI Insights / Forecast */}
          <div className="bg-primary kente-border rounded-2xl p-6 text-primary-foreground shadow-lg shadow-primary/20">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} />
              <h3 className="text-sm font-black uppercase tracking-widest">Business Insight</h3>
            </div>
            {forecast.enough ? (
              <div className="space-y-4">
                <p className="text-sm leading-relaxed opacity-90">
                  Your strongest day is <span className="font-black underline">{forecast.strongest.name}</span>. Tomorrow's projected revenue is around <span className="font-black underline">{formatCurrency(forecast.amount)}</span>.
                </p>
                <div className="p-3 bg-white/10 rounded-lg text-xs font-bold border border-white/10">
                  TIP: Consider restocking today to meet tomorrow's expected demand.
                </div>
              </div>
            ) : (
              <p className="text-sm opacity-90 italic">Keep recording your daily sales. Once you have 3 days of data, I can give you growth insights!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
