import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  UserPlus, 
  Search, 
  Mail, 
  Phone, 
  Lock, 
  X, 
  CheckCircle2,
  Trash2,
  Key
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function AdminStaff() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Form State
  const [form, setForm] = useState({
    email: '',
    phone: '',
    password: '',
    businessName: ''
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-staff'],
    queryFn: async () => {
      const res = await api.get('/admin/users');
      return res.data.filter((u: any) => u.isSuperadmin || u.is_superadmin);
    }
  });

  const createAdminMutation = useMutation({
    mutationFn: (data: any) => api.post(`/admin/create-admin?password=${data.password}`, {
      email: data.email,
      phone: data.phone,
      businessName: data.businessName || 'System Admin',
      businessType: 'Internal Admin',
      location: 'HQ',
      id: crypto.randomUUID()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-staff'] });
      toast.success('Administrator created successfully');
      setShowAddModal(false);
      setForm({ email: '', phone: '', password: '', businessName: '' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create admin');
    }
  });

  const filteredAdmins = users.filter((u: any) => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.phone?.includes(searchTerm) ||
    u.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Internal Team</h1>
          <p className="text-muted-foreground font-medium">Manage platform administrators and access levels.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-primary-foreground h-14 px-8 rounded-2xl font-black flex items-center gap-3 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
        >
          <UserPlus size={20} />
          Add Administrator
        </button>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input 
          type="text" 
          placeholder="Search by email, phone or name..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-14 bg-card border rounded-2xl pl-12 pr-4 font-bold focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAdmins.map((admin: any, i: number) => (
          <motion.div
            key={admin.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border rounded-[32px] p-6 shadow-sm relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full" />
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight leading-none">{admin.businessName}</h3>
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Master Admin</span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm font-bold">
                <Mail size={14} className="text-muted-foreground" />
                {admin.email || 'No Email'}
              </div>
              <div className="flex items-center gap-2 text-sm font-bold">
                <Phone size={14} className="text-muted-foreground" />
                {admin.phone || 'No Phone'}
              </div>
            </div>

            <button className="w-full h-11 rounded-xl border border-destructive/10 text-destructive/40 hover:text-destructive hover:bg-destructive/5 transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <Trash2 size={14} /> Revoke Access
            </button>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-card border rounded-[32px] shadow-2xl overflow-hidden p-8"
            >
              <h2 className="text-2xl font-black tracking-tight mb-6 flex items-center gap-2">
                <Key size={24} className="text-primary" /> New Admin Access
              </h2>

              <form onSubmit={(e) => { e.preventDefault(); createAdminMutation.mutate(form); }} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Admin Name</label>
                  <input type="text" value={form.businessName} onChange={e => setForm({...form, businessName: e.target.value})}
                    placeholder="e.g. Finance Head" className="w-full h-12 bg-background border rounded-xl px-4 font-bold focus:ring-2 focus:ring-primary" required />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                    placeholder="024 XXX XXXX" className="w-full h-12 bg-background border rounded-xl px-4 font-bold focus:ring-2 focus:ring-primary" required />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    placeholder="admin@bizora.app" className="w-full h-12 bg-background border rounded-xl px-4 font-bold focus:ring-2 focus:ring-primary" required />
                </div>

                <div className="space-y-1.5 pb-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Temporary Password</label>
                  <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                    placeholder="••••••••" className="w-full h-12 bg-background border rounded-xl px-4 font-bold focus:ring-2 focus:ring-primary" required />
                </div>

                <button type="submit" disabled={createAdminMutation.isPending}
                  className="w-full h-14 bg-primary text-white rounded-2xl font-black text-lg shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-40 transition-all flex items-center justify-center gap-2">
                  {createAdminMutation.isPending ? 'Authorizing...' : <>Initialize Admin <CheckCircle2 size={20} /></>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
