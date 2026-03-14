import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Phone, ArrowRight, ShieldCheck, Lock } from 'lucide-react';

export default function AuthScreen() {
  const { enterDemoMode } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const handleSendOTP = async () => {
    if (phone.length < 9) return;
    setLoading(true);
    
    // Simulating sending a code. 
    // For standard users, they enter anything during dev.
    // For admins, they will enter their real password in the code field.
    setTimeout(() => {
      toast.success('Security check initialized for ' + phone);
      setStep('otp');
      setLoading(false);
    }, 600);
  };

  const handleVerifyOTP = async () => {
    if (otp.length < 4) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', phone);
      
      // We pass the 'otp' field as the password to our custom backend
      formData.append('password', otp);

      const res = await api.post('/auth/login', formData);
      const { access_token } = res.data;

      localStorage.setItem('bizora_token', access_token);
      
      // Fetch profile to determine where to send them
      const profileRes = await api.get('/auth/me');
      const userData = profileRes.data;

      if (userData.isSuperadmin || userData.is_superadmin) {
        window.location.href = '/admin';
      } else if (!userData.businessName) {
        window.location.href = '/onboarding';
      } else {
        window.location.href = '/';
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail;
      toast.error(typeof errorMsg === 'string' ? errorMsg : 'Incorrect credentials or access denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-background relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm z-10"
      >
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-primary/20">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground leading-tight">Bizora</h1>
          <p className="mt-2 text-muted-foreground font-medium">Identity Verification</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'phone' ? (
            <motion.div key="phone" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="relative">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 ml-1 text-muted-foreground">Phone Number</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground border-r pr-3 flex items-center gap-2">
                    <img src="https://flagcdn.com/w20/gh.png" alt="GH" className="w-4 rounded-sm" />
                    <span className="font-bold text-sm">+233</span>
                  </div>
                  <input type="tel" placeholder="24 123 4567" value={phone} onChange={e => setPhone(e.target.value)}
                    className="w-full h-14 rounded-2xl border-2 border-input bg-card pl-24 pr-4 text-lg font-black focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                </div>
              </div>
              <button onClick={handleSendOTP} disabled={loading || phone.length < 9}
                className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-lg mt-4 shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-40 transition-all flex items-center justify-center gap-2">
                {loading ? 'Processing...' : <>Continue <ArrowRight size={20} /></>}
              </button>
              <button onClick={() => { enterDemoMode(); navigate('/'); }}
                className="w-full text-center text-xs font-black text-muted-foreground uppercase tracking-widest mt-6 hover:text-foreground transition-colors">
                Try Demo Mode
              </button>
            </motion.div>
          ) : (
            <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-sm font-bold text-foreground">Verification required for</p>
                <p className="text-lg font-black text-primary">+233 {phone}</p>
              </div>
              <div className="relative">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-center text-muted-foreground">Enter Access Code</label>
                <input type="password" placeholder="••••" value={otp} onChange={e => setOtp(e.target.value)}
                  className="w-full h-20 rounded-2xl border-2 border-input bg-card px-4 text-center text-2xl font-black tracking-[0.2em] focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>
              <button onClick={handleVerifyOTP} disabled={loading || otp.length < 4}
                className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-lg shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-40 transition-all flex items-center justify-center gap-2">
                {loading ? 'Authenticating...' : <>Secure Login <Lock size={20} /></>}
              </button>
              <button onClick={() => setStep('phone')}
                className="w-full text-center text-xs font-black text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors">
                Change Phone Number
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
