import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Shield, 
  Lock, 
  Bell, 
  Database, 
  Globe, 
  Cpu, 
  Terminal,
  Save,
  AlertTriangle,
  ToggleLeft as Toggle,
  CheckCircle2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function AdminSettings() {
  const queryClient = useQueryClient();
  
  // In a real app, these would come from the /admin/settings endpoint
  const [localSettings, setLocalSettings] = useState({
    maintenanceMode: false,
    publicRegistration: true,
    smsGatewayEnabled: true,
    enforceStrongPasswords: true
  });

  const { data: health } = useQuery({
    queryKey: ['admin-health-summary'],
    queryFn: async () => {
      const res = await api.get('/admin/health');
      return res.data;
    }
  });

  const handleToggle = (key: keyof typeof localSettings) => {
    setLocalSettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success(`System parameter updated.`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-20">
      <header>
        <h1 className="text-4xl font-black tracking-tighter">System Settings</h1>
        <p className="text-muted-foreground font-medium">Configure global platform behavior and security protocols.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border rounded-[32px] overflow-hidden shadow-sm">
            <div className="p-6 border-b bg-secondary/10 flex items-center gap-3">
              <Shield className="text-primary" size={20} />
              <h2 className="text-lg font-black tracking-tight">Platform Control</h2>
            </div>
            
            <div className="p-2">
              {[
                { 
                  id: 'maintenanceMode', 
                  label: 'Maintenance Mode', 
                  desc: 'Disable user access to the platform for system updates.',
                  icon: AlertTriangle,
                  danger: true
                },
                { 
                  id: 'publicRegistration', 
                  label: 'Public Registration', 
                  desc: 'Allow new businesses to sign up without admin intervention.',
                  icon: Globe
                },
                { 
                  id: 'smsGatewayEnabled', 
                  label: 'SMS Gateway', 
                  desc: 'Enable or disable outgoing SMS for authentication and alerts.',
                  icon: Bell
                },
                { 
                  id: 'enforceStrongPasswords', 
                  label: 'Security Hardening', 
                  desc: 'Enforce complex password requirements for all users.',
                  icon: Lock
                },
              ].map((item) => (
                <div key={item.id} className="p-6 flex items-center justify-between hover:bg-secondary/20 transition-colors rounded-2xl">
                  <div className="flex gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.danger ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
                      <item.icon size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black">{item.label}</p>
                      <p className="text-xs text-muted-foreground font-medium max-w-xs">{item.desc}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleToggle(item.id as any)}
                    className={`w-12 h-6 rounded-full transition-all relative ${localSettings[item.id as keyof typeof localSettings] ? 'bg-primary' : 'bg-secondary'}`}
                  >
                    <motion.div 
                      animate={{ x: localSettings[item.id as keyof typeof localSettings] ? 24 : 4 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/10 rounded-[32px] p-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CheckCircle2 size={32} className="text-primary" />
              <div>
                <h4 className="font-black tracking-tight">Configuration Synced</h4>
                <p className="text-sm text-muted-foreground font-medium">All changes are applied instantly to the production environment.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Infrastructure Sidebar */}
        <div className="space-y-6">
          <div className="bg-card border rounded-[32px] p-6 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
              <Database size={16} /> Infrastructure
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-secondary/30 rounded-2xl">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Environment</p>
                <p className="text-sm font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" /> Development (Local)
                </p>
              </div>
              
              <div className="p-4 bg-secondary/30 rounded-2xl">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">API Version</p>
                <p className="text-sm font-bold">{health?.apiVersion || '1.0.0'}</p>
              </div>

              <div className="p-4 bg-secondary/30 rounded-2xl">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Database Mode</p>
                <p className="text-sm font-bold">Transaction Pooler</p>
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-[32px] p-6 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full h-12 rounded-xl bg-secondary text-foreground font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-secondary/80 transition-all">
                <Terminal size={14} /> Clear Cache
              </button>
              <button className="w-full h-12 rounded-xl bg-secondary text-foreground font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-secondary/80 transition-all">
                <Save size={14} /> Download Backup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
