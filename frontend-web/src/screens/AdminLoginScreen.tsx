import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';

export default function AdminLoginScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    try {
      // Standard OAuth2 form data
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const res = await api.post('/auth/login', formData);
      const { access_token } = res.data;

      localStorage.setItem('bizora_token', access_token);
      
      toast.success('Admin authentication successful');
      
      // Redirect to admin pulse
      window.location.href = '/admin';
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-[#050505] relative overflow-hidden text-white">
      {/* Premium dark background effect */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm z-10"
      >
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-primary rounded-[24px] mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-primary/40 rotate-3 hover:rotate-0 transition-transform duration-500">
            <ShieldCheck size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white leading-tight">Master Access</h1>
          <p className="mt-2 text-white/40 font-bold uppercase tracking-[0.2em] text-[10px]">Super Admin Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-white/40">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input 
                type="email" 
                placeholder="admin@bizora.app" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                className="w-full h-14 rounded-2xl border-2 border-white/5 bg-white/5 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-primary transition-all text-white placeholder:text-white/10" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-white/40">Security Key</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                className="w-full h-14 rounded-2xl border-2 border-white/5 bg-white/5 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-primary transition-all text-white placeholder:text-white/10" 
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading || !email || !password}
            className="w-full h-16 rounded-2xl bg-primary text-white font-black text-lg mt-6 shadow-2xl shadow-primary/30 active:scale-[0.98] disabled:opacity-40 transition-all flex items-center justify-center gap-3"
          >
            {loading ? 'Authorizing...' : (
              <>
                Confirm Access <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <button 
          onClick={() => navigate('/login')}
          className="w-full text-center text-xs font-black text-white/30 uppercase tracking-widest mt-10 hover:text-white transition-colors"
        >
          Standard User Login
        </button>
      </motion.div>
    </div>
  );
}
