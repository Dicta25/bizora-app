import { motion } from 'framer-motion';
import { 
  Activity, 
  Cpu, 
  Database, 
  HardDrive, 
  RefreshCcw, 
  Zap, 
  ShieldCheck, 
  Server,
  Clock,
  Wifi,
  BarChart3
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function AdminHealth() {
  const { data: health, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin-health'],
    queryFn: async () => {
      const res = await api.get('/admin/health');
      return res.data;
    },
    refetchInterval: 5000 // Auto refresh every 5s
  });

  const getStatusColor = (value: number) => {
    if (value > 80) return 'text-red-500';
    if (value > 50) return 'text-orange-500';
    return 'text-green-500';
  };

  const getProgressColor = (value: number) => {
    if (value > 80) return 'bg-red-500';
    if (value > 50) return 'bg-orange-500';
    return 'bg-green-500';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">System Health</h1>
          <p className="text-muted-foreground font-medium">Real-time infrastructure vitals and performance monitoring.</p>
        </div>
        <button 
          onClick={() => refetch()}
          disabled={isFetching}
          className="h-12 px-6 bg-secondary rounded-xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
        >
          <RefreshCcw size={16} className={isFetching ? 'animate-spin' : ''} />
          {isFetching ? 'Refreshing...' : 'Refresh Pulse'}
        </button>
      </header>

      {/* Hardware Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'CPU Usage', value: health?.cpuUsage || 0, icon: Cpu },
          { label: 'Memory Usage', value: health?.memoryUsage || 0, icon: BarChart3 },
          { label: 'Disk Usage', value: health?.diskUsage || 0, icon: HardDrive },
        ].map((item, i) => (
          <div key={i} className="bg-card border rounded-[32px] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary">
                <item.icon size={24} />
              </div>
              <span className={`text-2xl font-black ${getStatusColor(item.value)}`}>{item.value}%</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">{item.label}</p>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${item.value}%` }}
                className={`h-full ${getProgressColor(item.value)}`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database Status */}
        <div className="bg-card border rounded-[32px] p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Database size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight">Database Engine</h3>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">PostgreSQL via Supabase</p>
            </div>
            <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black text-green-500 uppercase">{health?.dbStatus || 'Online'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-secondary/30 rounded-2xl">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Latency</p>
              <p className="text-lg font-black">{health?.dbLatencyMs || 0} ms</p>
            </div>
            <div className="p-4 bg-secondary/30 rounded-2xl">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Connections</p>
              <p className="text-lg font-black">Active Pool</p>
            </div>
          </div>
        </div>

        {/* API & Runtime */}
        <div className="bg-card border rounded-[32px] p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Zap size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight">API Runtime</h3>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">FastAPI (Python 3.13)</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl">
              <div className="flex items-center gap-3">
                <Clock size={16} className="text-muted-foreground" />
                <span className="text-xs font-bold uppercase">Uptime</span>
              </div>
              <span className="text-sm font-black">
                {health?.uptimeSeconds ? `${Math.floor(health.uptimeSeconds / 3600)}h ${Math.floor((health.uptimeSeconds % 3600) / 60)}m` : '0h 0m'}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl">
              <div className="flex items-center gap-3">
                <ShieldCheck size={16} className="text-muted-foreground" />
                <span className="text-xs font-bold uppercase">Version</span>
              </div>
              <span className="text-sm font-black">{health?.apiVersion || '1.0.0'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 bg-primary/5 border border-primary/10 rounded-[32px] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Server size={32} className="text-primary" />
          <div>
            <h4 className="font-black tracking-tight">Network Gateway</h4>
            <p className="text-sm text-muted-foreground font-medium">All incoming requests are being processed optimally.</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <Wifi size={16} className="text-primary" />
          <span className="text-xs font-black uppercase tracking-widest text-primary">Connected</span>
        </div>
      </div>
    </div>
  );
}
