import { motion } from 'framer-motion';
import { 
  Shield, 
  Users, 
  TrendingUp, 
  Activity, 
  Building2,
  Package,
  AlertTriangle,
  UserPlus,
  Zap,
  Megaphone
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/format';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await api.get('/admin/stats');
      return res.data;
    },
    refetchInterval: 30000 // Refresh every 30s
  });

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-8 pb-20 animate-pulse">
        <div className="h-12 w-48 bg-secondary rounded-xl mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-secondary rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
              <Shield size={14} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Super Admin Control</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter">System Pulse</h1>
        </div>
      </header>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Registered Businesses', value: stats?.totalUsers || '0', icon: Building2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Total Sales Recorded', value: stats?.totalSalesCount || '0', icon: Users, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Global Revenue', value: formatCurrency(stats?.totalRevenue || 0), icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: 'System Health', value: stats?.systemHealth === 'ok' ? 'Healthy' : 'Issues', icon: Activity, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border rounded-2xl p-5 shadow-sm hover:border-primary/40 transition-colors group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon size={20} />
              </div>
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-black mt-1 group-hover:text-primary transition-colors">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions Section */}
      <div className="bg-card border rounded-[32px] p-6 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6 ml-2">Quick Command</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/admin/users')}
            className="h-20 rounded-2xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-all flex flex-col items-center justify-center gap-1 group"
          >
            <UserPlus size={20} className="text-primary group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Create Admin</span>
          </button>
          
          <button 
            onClick={() => navigate('/admin/users')}
            className="h-20 rounded-2xl bg-secondary/50 border border-border hover:bg-secondary transition-all flex flex-col items-center justify-center gap-1 group"
          >
            <Building2 size={20} className="text-foreground group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Onboard Business</span>
          </button>

          <button 
            onClick={() => navigate('/admin/broadcast')}
            className="h-20 rounded-2xl bg-secondary/50 border border-border hover:bg-secondary transition-all flex flex-col items-center justify-center gap-1 group"
          >
            <Megaphone size={20} className="text-foreground group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">New Broadcast</span>
          </button>

          <button 
            onClick={() => navigate('/admin/settings')}
            className="h-20 rounded-2xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-all flex flex-col items-center justify-center gap-1 group"
          >
            <Zap size={20} className="text-red-500 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">System Lockdown</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-card border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black tracking-tight">Active Businesses</h3>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Last 7 Days (Sales Activity)</p>
            </div>
          </div>
          
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.activity || []}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#888' }} 
                  dy={10}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(var(--primary), 0.05)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar 
                  dataKey="active" 
                  fill="hsl(var(--primary))" 
                  radius={[6, 6, 0, 0]} 
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts Center */}
        <div className="bg-card border rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="text-orange-500" size={18} />
            <h3 className="text-lg font-black tracking-tight">Active Alerts</h3>
          </div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mb-6">Immediate Attention</p>
          
          <div className="space-y-4 flex-1">
            <div className="p-4 bg-orange-500/5 rounded-2xl border border-orange-500/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase text-orange-600">Stock Alerts</p>
                <p className="text-sm font-bold text-orange-700">{stats?.alertsCount || 0} items low on stock</p>
              </div>
              <Package size={20} className="text-orange-500" />
            </div>

            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase text-primary">System</p>
                <p className="text-sm font-bold">API performing optimally</p>
              </div>
              <Activity size={20} className="text-primary" />
            </div>
          </div>

          <button className="w-full mt-6 h-12 rounded-xl bg-secondary text-foreground font-black text-[10px] uppercase tracking-[0.2em] hover:bg-secondary/80 transition-all">
            View All Notifications
          </button>
        </div>
      </div>
    </div>
  );
}
