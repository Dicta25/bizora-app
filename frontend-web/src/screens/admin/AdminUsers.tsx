import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, 
  Search, 
  MoreVertical, 
  MapPin, 
  Phone, 
  Building2, 
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  X,
  Shield
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [filterAdmins, setFilterAdmins] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Form State
  const [form, setForm] = useState({
    phone: '',
    businessName: '',
    businessType: 'Trader',
    location: '',
    isSuperadmin: false
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await api.get('/admin/users');
      // Normalize snake_case to camelCase if needed
      return res.data.map((u: any) => ({
        ...u,
        businessName: u.businessName || u.business_name,
        businessType: u.businessType || u.business_type,
        location: u.location,
        isSuperadmin: u.isSuperadmin || u.is_superadmin,
        createdAt: u.createdAt || u.created_at
      }));
    }
  });

  const onboardMutation = useMutation({
    mutationFn: (data: any) => api.post('/admin/onboard', {
      ...data,
      id: crypto.randomUUID()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Business onboarded successfully!');
      setShowOnboardModal(false);
      setForm({ phone: '', businessName: '', businessType: 'Trader', location: '', isSuperadmin: false });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.detail || 'Failed to onboard business';
      toast.error(typeof msg === 'string' ? msg : 'Error during onboarding');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone || !form.businessName || !form.location) return;
    onboardMutation.mutate(form);
  };

  const filteredUsers = users.filter((u: any) => {
    const bName = u.businessName || '';
    const phone = u.phone || '';
    const loc = u.location || '';
    
    const matchesSearch = bName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           phone.includes(searchTerm) ||
           loc.toLowerCase().includes(searchTerm.toLowerCase());
           
    const matchesAdmin = filterAdmins ? u.isSuperadmin : true;
    
    return matchesSearch && matchesAdmin;
  });

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-8 pb-20 animate-pulse">
        <div className="h-12 w-64 bg-secondary rounded-xl" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-secondary rounded-3xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Business Directory</h1>
          <p className="text-muted-foreground font-medium">Control and monitor all platform participants.</p>
        </div>
        <button 
          onClick={() => setShowOnboardModal(true)}
          className="bg-primary text-primary-foreground h-14 px-8 rounded-2xl font-black flex items-center gap-3 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
        >
          <UserPlus size={20} />
          Onboard Business
        </button>
      </header>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input 
            type="text" 
            placeholder="Search by name, phone, or location..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 bg-card border rounded-2xl pl-12 pr-4 font-bold focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm"
          />
        </div>
        <button 
          onClick={() => setFilterAdmins(!filterAdmins)}
          className={`h-14 px-6 border rounded-2xl font-black flex items-center gap-2 transition-all shadow-sm ${filterAdmins ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground hover:bg-secondary'}`}
        >
          <Shield size={18} />
          {filterAdmins ? 'Admins Only' : 'All Users'}
        </button>
      </div>

      {/* Users Table/Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredUsers.length === 0 ? (
          <div className="p-20 text-center bg-card border rounded-[32px] border-dashed">
            <p className="text-muted-foreground font-bold italic">No businesses found matching your search.</p>
          </div>
        ) : (
          filteredUsers.map((user: any, i: number) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border rounded-3xl p-6 shadow-sm hover:border-primary/40 transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Building2 size={32} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-black tracking-tight">{user.businessName || 'Unnamed Business'}</h3>
                      {user.isSuperadmin && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest">
                          <Shield size={10} /> Super Admin
                        </span>
                      )}
                      <CheckCircle2 size={16} className="text-blue-500" />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground font-medium">
                      <span className="flex items-center gap-1.5"><MapPin size={14} /> {user.location || 'No Location'}</span>
                      <span className="flex items-center gap-1.5"><Phone size={14} /> {user.phone || 'No Phone'}</span>
                      <span className="bg-secondary px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest text-foreground">{user.businessType || 'Other'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right mr-4 hidden md:block">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Joined</p>
                    <p className="text-sm font-bold">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <button className="h-12 w-12 rounded-xl border flex items-center justify-center hover:bg-secondary transition-colors">
                    <ExternalLink size={18} />
                  </button>
                  <button 
                    onClick={() => navigate(`/admin/users/${user.id}`)}
                    className="h-12 px-6 rounded-xl bg-foreground text-background font-black text-xs uppercase tracking-widest hover:opacity-90 transition-opacity"
                  >
                    Manage
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Onboarding Modal Overlay */}
      <AnimatePresence>
        {showOnboardModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
              onClick={() => setShowOnboardModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-card border rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black tracking-tight">Manual Onboarding</h2>
                  <button onClick={() => setShowOnboardModal(false)} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex gap-3 text-primary">
                    <Clock size={20} className="shrink-0" />
                    <p className="text-xs font-bold leading-relaxed">Admin onboarding creates a profile instantly. The business owner can then login using their phone number.</p>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.1em] mb-1.5 ml-1 text-muted-foreground">Phone Number</label>
                        <input 
                          type="tel" 
                          value={form.phone}
                          onChange={e => setForm({...form, phone: e.target.value})}
                          className="w-full h-12 bg-background border rounded-xl px-4 font-bold focus:outline-none focus:ring-2 focus:ring-primary" 
                          placeholder="024 XXX XXXX" 
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.1em] mb-1.5 ml-1 text-muted-foreground">Business Type</label>
                        <select 
                          value={form.businessType}
                          onChange={e => setForm({...form, businessType: e.target.value})}
                          className="w-full h-12 bg-background border rounded-xl px-4 font-bold focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                        >
                          <option>Trader</option>
                          <option>Salon</option>
                          <option>Food Vendor</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.1em] mb-1.5 ml-1 text-muted-foreground">Business Name</label>
                      <input 
                        type="text" 
                        value={form.businessName}
                        onChange={e => setForm({...form, businessName: e.target.value})}
                        className="w-full h-12 bg-background border rounded-xl px-4 font-bold focus:outline-none focus:ring-2 focus:ring-primary" 
                        placeholder="e.g. Akua's Enterprises" 
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.1em] mb-1.5 ml-1 text-muted-foreground">Primary Location</label>
                      <input 
                        type="text" 
                        value={form.location}
                        onChange={e => setForm({...form, location: e.target.value})}
                        className="w-full h-12 bg-background border rounded-xl px-4 font-bold focus:outline-none focus:ring-2 focus:ring-primary" 
                        placeholder="e.g. Makola Market" 
                        required
                      />
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-2xl">
                      <input 
                        type="checkbox" 
                        id="isSuperadmin"
                        checked={form.isSuperadmin}
                        onChange={e => setForm({...form, isSuperadmin: e.target.checked})}
                        className="w-5 h-5 rounded border-input text-primary focus:ring-primary"
                      />
                      <label htmlFor="isSuperadmin" className="text-xs font-bold uppercase tracking-tight cursor-pointer">
                        Assign Super Admin Privileges
                      </label>
                    </div>

                    <button 
                      type="submit"
                      disabled={onboardMutation.isPending}
                      className="w-full h-14 bg-primary text-primary-foreground rounded-2xl font-black text-lg mt-2 shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-40 transition-all"
                    >
                      {onboardMutation.isPending ? 'Processing...' : 'Initialize Business'}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
