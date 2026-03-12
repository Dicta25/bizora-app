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
    <div className="px-4 pt-6 pb-24">
      <h1 className="text-2xl font-extrabold mb-4 text-foreground">Reports</h1>

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

      {/* Expense Categories Pie Chart */}
      {expensePieData.length > 0 ? (
        <div className="bg-card rounded-xl border p-4 mb-6">
          <h3 className="font-bold text-sm mb-3 text-foreground">Where Your Money Goes</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={expensePieData}
                cx="50%"
                cy="50%"
                outerRadius={70}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
                fontSize={11}
              >
                {expensePieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getExpenseColor(entry.name)} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-3">
            {expensePieData.map(item => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getExpenseColor(item.name) }} />
                  <span className="text-foreground">{item.name}</span>
                </div>
                <span className="text-muted-foreground">
                  {formatCurrency(item.value)} — {expenseTotal > 0 ? Math.round((item.value / expenseTotal) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-xl border p-4 mb-6">
          <h3 className="font-bold text-sm mb-2 text-foreground">Where Your Money Goes</h3>
          <p className="text-sm text-muted-foreground">No expenses recorded yet</p>
        </div>
      )}

      <div className="bg-card rounded-xl border p-4 mb-6 border-l-[3px] border-l-primary">
        <h3 className="font-bold text-sm mb-2 text-foreground">Tomorrow's Forecast</h3>
        {forecast.enough ? (
          <>
            <p className="text-2xl font-extrabold text-accent currency mb-1">{formatCurrency(forecast.amount)}</p>
            <p className="text-xs text-muted-foreground mb-2">Based on your last 7 days of sales</p>
            {forecast.strongest.name && forecast.strongest.amount > 0 && (
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

      {/* Monthly Comparison */}
      <div className="bg-card rounded-xl border p-4 mb-6">
        <h3 className="font-bold text-sm mb-3 text-foreground">Monthly Comparison</h3>
        {monthlyComparison.hasLastMonth ? (
          <>
            <ComparisonRow label="Total Sales" thisVal={monthlyComparison.thisMonth.sales} lastVal={monthlyComparison.lastMonth.sales} />
            <div className="h-px bg-border" />
            <ComparisonRow label="Total Expenses" thisVal={monthlyComparison.thisMonth.expenses} lastVal={monthlyComparison.lastMonth.expenses} />
            <div className="h-px bg-border" />
            <ComparisonRow label="Net Profit" thisVal={monthlyComparison.thisMonth.profit} lastVal={monthlyComparison.lastMonth.profit} />
            <div className="h-px bg-border" />
            <ComparisonRow label="Transactions" thisVal={monthlyComparison.thisMonth.transactions} lastVal={monthlyComparison.lastMonth.transactions} />
            <div className="mt-3 pt-2 border-t border-border">
              {(() => {
                const salesChange = pctChange(monthlyComparison.thisMonth.sales, monthlyComparison.lastMonth.sales);
                return (
                  <p className={`text-sm font-semibold ${salesChange >= 0 ? 'text-primary' : 'text-destructive'}`}>
                    {salesChange >= 0
                      ? `You are ${salesChange}% ahead of last month`
                      : `You are ${Math.abs(salesChange)}% behind last month`}
                  </p>
                );
              })()}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No data for last month yet. Keep recording to see your progress</p>
        )}
      </div>

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
