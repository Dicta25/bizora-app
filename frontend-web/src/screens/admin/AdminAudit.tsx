import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Terminal, 
  User, 
  Globe, 
  Clock,
  AlertCircle,
  FileSearch,
  Building2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

const ACTION_COLORS: Record<string, string> = {
  DELETE_PRODUCT: 'text-red-500 bg-red-500/10',
  UPDATE_PLAN: 'text-primary bg-primary/10',
  CREATE_USER: 'text-green-500 bg-green-500/10',
  AUTH_LOGIN: 'text-blue-500 bg-blue-500/10',
  MANUAL_STOCK_ADJUST: 'text-orange-500 bg-orange-500/10',
};

export default function AdminAudit() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: async () => {
      const res = await api.get('/admin/audit-logs');
      return res.data;
    }
  });

  const dummyLogs = [
    { id: '1', businessName: 'Kente Fashions', action: 'DELETE_PRODUCT', details: 'Deleted product "Silk Thread"', ipAddress: '192.168.1.1', createdAt: '2024-03-14T15:20:00' },
    { id: '2', businessName: 'Mama Africa Kitchen', action: 'UPDATE_PLAN', details: 'Upgraded to Pro Tier', ipAddress: '102.176.45.12', createdAt: '2024-03-14T14:45:00' },
    { id: '3', businessName: 'Bizora Admin', action: 'CREATE_USER', details: 'Onboarded "Glow Up Salon"', ipAddress: '127.0.0.1', createdAt: '2024-03-14T12:30:00' },
    { id: '4', businessName: 'Glow Up Salon', action: 'AUTH_LOGIN', details: 'Successful Login', ipAddress: '41.215.160.88', createdAt: '2024-03-14T11:15:00' },
  ];

  const displayLogs = logs.length > 0 ? logs : dummyLogs;
  const filteredLogs = displayLogs.filter((log: any) => 
    log.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Audit Trail</h1>
          <p className="text-muted-foreground font-medium">Permanent record of all high-privilege system actions.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/5 border border-red-500/10 rounded-xl text-red-500">
          <ShieldCheck size={18} />
          <span className="text-[10px] font-black uppercase tracking-widest">Tamper Proof Log</span>
        </div>
      </header>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input 
          type="text" 
          placeholder="Filter by business, action or details..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-14 bg-card border rounded-2xl pl-12 pr-4 font-bold focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm"
        />
      </div>

      <div className="bg-card border rounded-[32px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/30">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Timestamp</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Entity/Business</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Action</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Details</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Source IP</th>
              </tr>
            </thead>
            <tbody className="divide-y border-t">
              {filteredLogs.map((log: any, i: number) => (
                <motion.tr 
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="hover:bg-secondary/10 transition-colors"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock size={12} />
                      <span className="text-xs font-bold font-mono">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour12: false })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-muted-foreground" />
                      <span className="text-sm font-black">{log.businessName || 'System'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter ${ACTION_COLORS[log.action] || 'bg-secondary text-foreground'}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-medium text-foreground/80">{log.details}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe size={12} />
                      <span className="text-xs font-mono">{log.ipAddress}</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredLogs.length === 0 && (
          <div className="p-20 text-center">
            <FileSearch className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="text-muted-foreground font-bold italic">No audit records found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
