import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { 
  User as UserIcon, 
  Building2, 
  Palette, 
  Lock, 
  Bell, 
  Trash2, 
  LogOut, 
  Camera, 
  Check, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard,
  ChevronRight,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const THEME_COLORS = [
  { name: 'Kente Green', hsl: '153 82% 22%' },
  { name: 'Royal Blue', hsl: '213 82% 42%' },
  { name: 'Ankara Red', hsl: '4 65% 46%' },
  { name: 'Deep Purple', hsl: '274 100% 36%' },
  { name: 'Ocean Teal', hsl: '170 100% 24%' },
  { name: 'Sunset Orange', hsl: '22 100% 45%' },
  { name: 'Hot Pink', hsl: '340 74% 43%' },
  { name: 'Midnight Black', hsl: '240 6% 12%' },
];

export default function ProfileScreen() {
  const { 
    user, setUser, logout, themeColor, setThemeColor, 
    reminderEnabled, setReminderEnabled, reminderTime, setReminderTime,
    pin, setPin 
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user || {
    businessName: '',
    businessType: '',
    phone: '',
    location: '',
    ownerName: '',
    email: '',
    tin: '',
  });

  const handleSaveProfile = () => {
    setUser(formData);
    setIsEditing(false);
    toast.success('Profile updated successfully');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFormData(prev => ({ ...prev, logo: result }));
      setUser({ ...formData, logo: result });
      toast.success('Logo updated');
    };
    reader.readAsDataURL(file);
  };

  const handleToggleReminder = async () => {
    if (!reminderEnabled) {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setReminderEnabled(true);
        } else {
          toast.error('Please enable notifications in your browser');
        }
      } else {
        setReminderEnabled(true);
      }
    } else {
      setReminderEnabled(false);
    }
  };

  const handlePinAction = () => {
    if (pin) {
      setPin(null);
      toast.success('PIN security removed');
    } else {
      window.dispatchEvent(new Event('open-pin-setup'));
    }
  };

  const sectionClasses = "bg-card rounded-2xl border p-6 shadow-sm space-y-6";
  const labelClasses = "text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1";
  const inputClasses = "w-full h-11 rounded-lg border border-input bg-background px-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all";

  return (
    <div className="px-4 pb-24 md:pb-8 max-w-4xl mx-auto space-y-8">
      {/* Profile Header Card */}
      <div className="bg-primary kente-border rounded-3xl p-8 text-primary-foreground relative overflow-hidden shadow-xl shadow-primary/20">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/30 flex items-center justify-center overflow-hidden shadow-inner">
              {formData.logo ? (
                <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Building2 size={40} className="text-white/80" />
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform">
              <Camera size={16} />
              <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
            </label>
          </div>

          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-black tracking-tight">{formData.businessName || 'Your Business'}</h1>
            <p className="text-white/70 font-medium flex items-center justify-center md:justify-start gap-2 mt-1">
              <MapPin size={14} /> {formData.location || 'Location not set'}
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
              <span className="px-3 py-1 rounded-full bg-white/10 text-[10px] font-black uppercase tracking-tighter border border-white/10">
                {formData.businessType || 'General'}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-[10px] font-black uppercase tracking-tighter border border-white/10">
                {formData.phone}
              </span>
            </div>
          </div>

          <Button 
            onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
            className={cn(
              "rounded-xl px-6 font-black uppercase tracking-widest text-xs h-11",
              isEditing ? "bg-accent text-accent-foreground" : "bg-white text-primary hover:bg-white/90"
            )}
          >
            {isEditing ? <><Check size={16} className="mr-2" /> Save Changes</> : 'Edit Profile'}
          </Button>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Business Details */}
        <div className={sectionClasses}>
          <div className="flex items-center gap-2 border-b pb-4 mb-2">
            <Building2 size={18} className="text-primary" />
            <h3 className="text-sm font-black uppercase tracking-widest">Business Info</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className={labelClasses}>Business Name</label>
              <input 
                disabled={!isEditing}
                className={inputClasses}
                value={formData.businessName}
                onChange={e => setFormData({...formData, businessName: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelClasses}>Owner Name</label>
              <input 
                disabled={!isEditing}
                placeholder="Manager Name"
                className={inputClasses}
                value={formData.ownerName || ''}
                onChange={e => setFormData({...formData, ownerName: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={labelClasses}>Business TIN</label>
                <input 
                  disabled={!isEditing}
                  placeholder="C00XXXXXXX"
                  className={inputClasses}
                  value={formData.tin || ''}
                  onChange={e => setFormData({...formData, tin: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelClasses}>Currency</label>
                <select 
                  disabled={!isEditing}
                  className={inputClasses}
                  value={formData.currency || 'GHS'}
                  onChange={e => setFormData({...formData, currency: e.target.value})}
                >
                  <option value="GHS">GHS (₵)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Branding & Personalization */}
        <div className={sectionClasses}>
          <div className="flex items-center gap-2 border-b pb-4 mb-2">
            <Palette size={18} className="text-primary" />
            <h3 className="text-sm font-black uppercase tracking-widest">App Branding</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className={labelClasses}>Brand Accent Color</label>
              <div className="grid grid-cols-4 gap-3">
                {THEME_COLORS.map(c => (
                  <button 
                    key={c.hsl} 
                    onClick={() => setThemeColor(c.hsl)}
                    className={cn(
                      "w-full aspect-square rounded-xl border-2 transition-all flex items-center justify-center",
                      themeColor === c.hsl ? "border-primary scale-105 shadow-md" : "border-transparent"
                    )}
                    style={{ backgroundColor: `hsl(${c.hsl})` }}
                  >
                    {themeColor === c.hsl && <Check size={16} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-secondary/30 border space-y-2">
              <p className="text-xs font-bold text-foreground">Current Selection: {THEME_COLORS.find(c => c.hsl === themeColor)?.name}</p>
              <p className="text-[10px] text-muted-foreground italic">This color will be used for buttons, totals, and primary highlights across the app.</p>
            </div>
          </div>
        </div>

        {/* Security & Access */}
        <div className={sectionClasses}>
          <div className="flex items-center gap-2 border-b pb-4 mb-2">
            <ShieldCheck size={18} className="text-primary" />
            <h3 className="text-sm font-black uppercase tracking-widest">Security</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border bg-background hover:bg-secondary/20 transition-all group cursor-pointer" onClick={handlePinAction}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                  <Lock size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{pin ? 'PIN Security Active' : 'Set Entry PIN'}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Require PIN on startup</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border bg-background opacity-50 cursor-not-allowed">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                  <Smartphone size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Biometrics</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Available on Mobile App</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications & Reminders */}
        <div className={sectionClasses}>
          <div className="flex items-center gap-2 border-b pb-4 mb-2">
            <Bell size={18} className="text-primary" />
            <h3 className="text-sm font-black uppercase tracking-widest">Alerts</h3>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-foreground">Daily Sales Reminder</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Notify me to record sales</p>
              </div>
              <button 
                onClick={handleToggleReminder}
                className={cn(
                  "w-12 h-7 rounded-full transition-all relative p-1",
                  reminderEnabled ? "bg-primary" : "bg-muted"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded-full bg-white shadow-sm transition-all",
                  reminderEnabled ? "translate-x-5" : "translate-x-0"
                )} />
              </button>
            </div>

            {reminderEnabled && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2">
                <label className={labelClasses}>Reminder Time</label>
                <input 
                  type="time" 
                  value={reminderTime} 
                  onChange={e => setReminderTime(e.target.value)}
                  className={cn(inputClasses, "mt-1.5")} 
                />
              </motion.div>
            )}
          </div>
        </div>

        {/* Data & Danger Zone */}
        <div className={cn(sectionClasses, "md:col-span-2 border-destructive/20 bg-destructive/5")}>
          <div className="flex items-center justify-between border-b border-destructive/10 pb-4 mb-2">
            <div className="flex items-center gap-2">
              <Trash2 size={18} className="text-destructive" />
              <h3 className="text-sm font-black uppercase tracking-widest text-destructive">Account & Data</h3>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <Button 
              variant="outline"
              className="flex-1 rounded-xl h-12 border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground font-black uppercase tracking-widest text-[10px]"
              onClick={() => {
                if (confirm('Are you sure you want to log out? Local data will remain on this device.')) {
                  logout();
                }
              }}
            >
              <LogOut size={16} className="mr-2" /> Log Out
            </Button>
            
            <Button 
              variant="outline"
              className="flex-1 rounded-xl h-12 border-muted-foreground/20 text-muted-foreground font-black uppercase tracking-widest text-[10px]"
              disabled
            >
              Export Data (CSV)
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center">App Version: 1.0.0-web | Bizora Kente Tally</p>
        </div>
      </div>
    </div>
  );
}
