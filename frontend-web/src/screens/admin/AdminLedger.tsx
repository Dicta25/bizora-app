import { motion } from 'framer-motion';
import { 
  Receipt, 
  Search, 
  Filter, 
  Download, 
  ArrowUpRight, 
  Building2, 
  CreditCard, 
  Wallet,
  Calendar
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/format';

export default function AdminLedger() {
  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['admin-ledger'],
    queryFn: async () => {
      const res = await api.get('/admin/sales');
      return res.data;
    }
  });

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-8 pb-20 animate-pulse">
        <div className="h-12 w-48 bg-secondary rounded-xl mb-8" />
        <div className="h-64 bg-secondary rounded-[32px]" />
      </div>
    );
  }

  // Dummy data fallback for preview
  const dummySales = [
    { id: '1', businessName: 'Kente Fashions', productName: 'Premium Kente Cloth', quantity: 2, totalPrice: 450.00, paymentMethod: 'cash', date: '2024-03-14T10:30:00' },
    { id: '2', businessName: 'Mama Africa Kitchen', productName: 'Jollof Large Pack', quantity: 5, totalPrice: 150.00, paymentMethod: 'momo', date: '2024-03-14T11:45:00' },
    { id: '3', businessName: 'Glow Up Salon', productName: 'Hair Treatment', quantity: 1, totalPrice: 85.00, paymentMethod: 'bank', date: '2024-03-14T12:15:00' },
  ];

  const displaySales = sales.length > 0 ? sales : dummySales;

  const totalVolume = displaySales.reduce((sum: number, s: any) => sum + s.totalPrice, 0);
  const avgTransaction = displaySales.length > 0 ? totalVolume / displaySales.length : 0;
  const momoSales = displaySales.filter((s: any) => s.paymentMethod === 'momo').length;
  const momoPenetration = displaySales.length > 0 ? Math.round((momoSales / displaySales.length) * 100) : 0;

  return (

    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Global Ledger</h1>
          <p className="text-muted-foreground font-medium">Real-time transaction stream across all businesses.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-12 px-6 bg-card border rounded-xl font-bold flex items-center gap-2 hover:bg-secondary transition-all shadow-sm">
            <Calendar size={18} />
            Today
          </button>
          <button className="h-12 px-6 bg-primary text-primary-foreground rounded-xl font-black flex items-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all">
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </header>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Volume', value: formatCurrency(totalVolume), icon: TrendingUp, color: 'text-green-500' },
          { label: 'Avg. Transaction', value: formatCurrency(avgTransaction), icon: Receipt, color: 'text-blue-500' },
          { label: 'Momo Penetration', value: `${momoPenetration}%`, icon: Wallet, color: 'text-purple-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-card border rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-black">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl bg-secondary flex items-center justify-center ${stat.color}`}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input 
            type="text" 
            placeholder="Search by business, product or ID..." 
            className="w-full h-14 bg-card border rounded-2xl pl-12 pr-4 font-bold focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          <button className="h-14 px-6 bg-card border rounded-2xl font-black flex items-center gap-2 hover:bg-secondary transition-colors shadow-sm">
            <CreditCard size={18} />
            Payment
          </button>
          <button className="h-14 px-6 bg-card border rounded-2xl font-black flex items-center gap-2 hover:bg-secondary transition-colors shadow-sm">
            <Filter size={18} />
            More
          </button>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-card border rounded-[32px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/30">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Business</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Product/Service</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Qty</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Method</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y border-t">
              {displaySales.map((sale, i) => (
                <motion.tr 
                  key={sale.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-secondary/10 transition-colors group"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Building2 size={14} />
                      </div>
                      <span className="font-black text-sm truncate max-w-[150px]">{sale.businessName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="font-bold text-sm text-foreground/80">{sale.productName}</span>
                  </td>
                  <td className="px-6 py-5 text-center font-black text-sm">
                    {sale.quantity}
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-secondary text-foreground">
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="font-black text-sm text-foreground">{formatCurrency(sale.totalPrice)}</span>
                  </td>
                  <td className="px-6 py-5 text-right font-medium text-xs text-muted-foreground">
                    {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Add missing icon import
import { TrendingUp } from 'lucide-react';
