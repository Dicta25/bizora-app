import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Building2, MapPin, Store, CheckCircle2 } from 'lucide-react';

const BUSINESS_TYPES = ['Trader', 'Salon', 'Food Vendor', 'Seamstress', 'Other'];

export default function OnboardingScreen() {
  const { setUser, user } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [location, setLocation] = useState('');

  // Protect the route: if already has profile, go home. If no session, go to login.
  useEffect(() => {
    if (user?.businessName) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleProfileSubmit = async () => {
    if (!businessName || !businessType || !location) return;
    setLoading(true);
    try {
      const { data: { user: sbUser } } = await supabase.auth.getUser();
      if (!sbUser) throw new Error('No session found');
      
      await setUser({ 
        id: sbUser.id,
        phone: sbUser.phone || '', 
        businessName, 
        businessType, 
        location 
      });
      toast.success('Business profile created!');
      navigate('/', { replace: true });
    } catch (error: any) {
      toast.error(error.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-background relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm z-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-accent rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-accent/20">
            <Store size={32} className="text-accent-foreground" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-foreground leading-tight">Almost there!</h1>
          <p className="mt-2 text-muted-foreground font-medium text-sm">Tell us about your business</p>
        </div>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-1 ml-1 text-muted-foreground">Business Name</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                type="text" 
                placeholder="Akua's Enterprise" 
                value={businessName} 
                onChange={e => setBusinessName(e.target.value)}
                className="w-full h-14 rounded-2xl border-2 border-input bg-card pl-12 pr-4 text-base font-bold focus:outline-none focus:ring-2 focus:ring-primary transition-all" 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-1 ml-1 text-muted-foreground">Business Type</label>
            <select 
              value={businessType} 
              onChange={e => setBusinessType(e.target.value)}
              className="w-full h-14 rounded-2xl border-2 border-input bg-card px-4 text-base font-bold focus:outline-none focus:ring-2 focus:ring-primary appearance-none transition-all cursor-pointer"
            >
              <option value="">Select type...</option>
              {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-1 ml-1 text-muted-foreground">Location</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                type="text" 
                placeholder="Kantamanto, Accra" 
                value={location} 
                onChange={e => setLocation(e.target.value)}
                className="w-full h-14 rounded-2xl border-2 border-input bg-card pl-12 pr-4 text-base font-bold focus:outline-none focus:ring-2 focus:ring-primary transition-all" 
              />
            </div>
          </div>

          <button 
            onClick={handleProfileSubmit} 
            disabled={loading || !businessName || !businessType || !location}
            className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-lg mt-6 shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-40 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Setting up...' : (
              <>
                Finish Setup <CheckCircle2 size={20} />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
