import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Crown, 
  Zap, 
  Search, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  X,
  Plus,
  ArrowRight
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const PLAN_COLORS: Record<string, string> = {
  Free: 'bg-slate-500/10 text-slate-600',
  Pro: 'bg-primary/10 text-primary',
  Enterprise: 'bg-purple-500/10 text-purple-600',
};

export default function AdminSubscriptions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users-subs'],
    queryFn: async () => {
      const res = await api.get('/admin/users');
      return res.data;
    }
  });

  const updatePlanMutation = useMutation({
    mutationFn: ({ userId, plan, expiry }: { userId: string, plan: string, expiry: string | null }) => 
      api.put(`/admin/users/${userId}/plan`, { subscriptionPlan: plan, subscriptionExpiry: expiry }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-subs'] });
      toast.success('Subscription updated successfully');
      setSelectedUser(null);
    }
  });

  // Dummy data fallback
  const dummyUsers = [
    { id: '1', businessName: 'Kente Fashions', subscriptionPlan: 'Pro', subscriptionExpiry: '2024-12-31', phone: '0244123456' },
    { id: '2', businessName: 'Mama Africa Kitchen', subscriptionPlan: 'Free', subscriptionExpiry: null, phone: '0555987654' },
    { id: '3', businessName: 'Glow Up Salon', subscriptionPlan: 'Enterprise', subscriptionExpiry: '2025-06-30', phone: '0200111222' },
  ];

  const displayUsers = users.length > 0 ? users : dummyUsers;
  const filteredUsers = displayUsers.filter((u: any) => 
    u.businessName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Plan Manager</h1>
          <p className="text-muted-foreground font-medium">Control tier access and system revenue.</p>
        </div>
        <div className="flex items-center gap-4 px-6 py-3 bg-primary/5 border border-primary/10 rounded-2xl">
          <Crown className="text-primary" size={24} />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Pro/Ent</p>
            <p className="text-xl font-black">{displayUsers.filter((u: any) => u.subscriptionPlan !== 'Free').length}</p>
          </div>
        </div>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input 
          type="text" 
          placeholder="Search business by name..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-14 bg-card border rounded-2xl pl-12 pr-4 font-bold focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user: any, i: number) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border rounded-[32px] p-6 shadow-sm hover:border-primary/40 transition-all flex flex-col group"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary">
                <Building2 size={24} />
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${PLAN_COLORS[user.subscriptionPlan] || PLAN_COLORS.Free}`}>
                {user.subscriptionPlan}
              </span>
            </div>

            <h3 className="text-xl font-black tracking-tight mb-1">{user.businessName}</h3>
            <p className="text-xs text-muted-foreground font-medium mb-6">{user.phone}</p>

            <div className="mt-auto space-y-4">
              <div className="p-4 bg-secondary/30 rounded-2xl">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar size={14} />
                  <span className="text-[10px] font-black uppercase tracking-tighter">Access Expiry</span>
                </div>
                <p className="text-sm font-bold">
                  {user.subscriptionExpiry ? new Date(user.subscriptionExpiry).toLocaleDateString() : 'Lifetime / Permanent'}
                </p>
              </div>

              <button 
                onClick={() => setSelectedUser(user)}
                className="w-full h-12 rounded-xl bg-foreground text-background font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-white transition-all"
              >
                Change Plan <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Plan Update Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-card border rounded-[32px] shadow-2xl overflow-hidden p-8"
            >
              <h2 className="text-2xl font-black tracking-tight mb-2">Update Tier</h2>
              <p className="text-muted-foreground text-sm font-medium mb-8">Modifying access for <span className="text-foreground font-bold">{selectedUser.businessName}</span></p>

              <div className="space-y-3 mb-8">
                {['Free', 'Pro', 'Enterprise'].map(plan => (
                  <button 
                    key={plan}
                    onClick={() => updatePlanMutation.mutate({ userId: selectedUser.id, plan, expiry: plan === 'Free' ? null : '2025-12-31' })}
                    className={cn(
                      "w-full h-16 rounded-2xl border-2 flex items-center justify-between px-6 transition-all",
                      selectedUser.subscriptionPlan === plan ? "border-primary bg-primary/5" : "border-transparent bg-secondary/50 hover:border-primary/30"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      {plan === 'Free' && <Zap size={20} className="text-slate-400" />}
                      {plan === 'Pro' && <Crown size={20} className="text-primary" />}
                      {plan === 'Enterprise' && <CreditCard size={20} className="text-purple-500" />}
                      <span className="font-black uppercase tracking-widest text-sm">{plan}</span>
                    </div>
                    {selectedUser.subscriptionPlan === plan && <CheckCircle2 size={20} className="text-primary" />}
                  </button>
                ))}
              </div>

              <button onClick={() => setSelectedUser(null)} className="w-full h-12 rounded-xl text-muted-foreground font-black text-xs uppercase tracking-widest">
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { cn } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';
