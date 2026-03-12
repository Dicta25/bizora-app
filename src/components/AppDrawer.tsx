import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Receipt, Package, BarChart3, LogOut, X, Truck, Palette, Bell, Lock, Share2 } from 'lucide-react';
import { useState } from 'react';
import { formatCurrency } from '@/lib/format';

interface AppDrawerProps {
  open: boolean;
  onClose: () => void;
}

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

const menuItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Receipt, label: 'Sales', path: '/record/sale' },
  { icon: Package, label: 'Inventory', path: '/inventory' },
  { icon: BarChart3, label: 'Reports', path: '/reports' },
];

export default function AppDrawer({ open, onClose }: AppDrawerProps) {
  const { user, logout, products, themeColor, setThemeColor, reminderEnabled, setReminderEnabled, reminderTime, setReminderTime, pin, setPin } = useApp();
  const navigate = useNavigate();
  const [showTheme, setShowTheme] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [notifDenied, setNotifDenied] = useState(false);

  const handleNav = (path: string) => { navigate(path); onClose(); };

  const handleLogout = () => {
    onClose();
    logout();
    // Replace history so back button can't return to dashboard
    window.history.replaceState(null, '', '/');
  };

  const handleShareCatalog = () => {
    const inStock = products.filter(p => p.stock > 0);
    if (inStock.length === 0) return;
    const lines = [
      `${(user?.businessName || 'My Business').toUpperCase()} — Product Catalog`,
      `${user?.location || ''} | ${user?.phone || ''}`,
      '─────────────────────────────',
      ...inStock.map((p, i) => `${i + 1}. ${p.name} — ${formatCurrency(p.price)}`),
      '─────────────────────────────',
      'To order, contact us on WhatsApp',
      'Powered by Bizora',
    ];
    window.open(`https://wa.me/?text=${encodeURIComponent(lines.join('\n'))}`, '_blank');
    onClose();
  };

  const handlePinAction = () => {
    if (pin) {
      // Remove PIN
      setPin(null);
    } else {
      // Open PIN setup screen via custom event
      onClose();
      setTimeout(() => window.dispatchEvent(new Event('open-pin-setup')), 100);
    }
  };

  const handleReminderToggle = async () => {
    if (!reminderEnabled) {
      // Check if iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        // iOS doesn't support push notifications well - just enable the state for banner fallback
        setReminderEnabled(true);
        setNotifDenied(false);
        return;
      }

      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setReminderEnabled(true);
          setNotifDenied(false);
        } else {
          setNotifDenied(true);
        }
      } else {
        // No notification API - enable for iOS-style banner fallback
        setReminderEnabled(true);
      }
    } else {
      setReminderEnabled(false);
      setNotifDenied(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }} className="fixed inset-0 z-[60] bg-foreground/50" onClick={onClose} />
          <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 left-0 bottom-0 z-[70] w-72 bg-card shadow-2xl flex flex-col overflow-y-auto">
            {/* Header */}
            <div className="p-5 pb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-foreground">{user?.businessName || 'Bizora'}</h2>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>
              {user?.businessType && <p className="text-sm font-medium text-muted-foreground">{user.businessType}</p>}
              {user?.phone && <p className="text-xs text-muted-foreground mt-0.5">{user.phone}</p>}
            </div>

            <div className="h-px bg-border mx-5" />

            {/* Menu */}
            <nav className="py-3">
              {menuItems.map(item => (
                <button key={item.path} onClick={() => handleNav(item.path)}
                  className="w-full flex items-center gap-3 px-5 py-3.5 text-left text-sm font-semibold text-foreground hover:bg-secondary/60 active:bg-secondary transition-colors">
                  <item.icon size={18} className="text-muted-foreground" /> {item.label}
                </button>
              ))}
            </nav>

            <div className="h-px bg-border mx-5" />

            {/* Tools */}
            <div className="py-3">
              <button onClick={() => { navigate('/suppliers'); onClose(); }}
                className="w-full flex items-center gap-3 px-5 py-3.5 text-left text-sm font-semibold text-foreground hover:bg-secondary/60 transition-colors">
                <Truck size={18} className="text-muted-foreground" /> My Suppliers
              </button>
              <button onClick={handleShareCatalog}
                className="w-full flex items-center gap-3 px-5 py-3.5 text-left text-sm font-semibold text-foreground hover:bg-secondary/60 transition-colors">
                <Share2 size={18} className="text-muted-foreground" /> Share Product Catalog
              </button>
            </div>

            <div className="h-px bg-border mx-5" />

            {/* Settings */}
            <div className="py-3">
              {/* Theme Color */}
              <button onClick={() => setShowTheme(!showTheme)}
                className="w-full flex items-center gap-3 px-5 py-3.5 text-left text-sm font-semibold text-foreground hover:bg-secondary/60 transition-colors">
                <Palette size={18} className="text-muted-foreground" /> Brand Color
                <div className="w-4 h-4 rounded-full ml-auto border" style={{ backgroundColor: `hsl(${themeColor})` }} />
              </button>
              {showTheme && (
                <div className="px-5 pb-3 grid grid-cols-4 gap-2">
                  {THEME_COLORS.map(c => (
                    <button key={c.hsl} onClick={() => setThemeColor(c.hsl)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${themeColor === c.hsl ? 'border-accent scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: `hsl(${c.hsl})` }} title={c.name} />
                  ))}
                </div>
              )}

              {/* Reminders */}
              <button onClick={() => setShowReminder(!showReminder)}
                className="w-full flex items-center gap-3 px-5 py-3.5 text-left text-sm font-semibold text-foreground hover:bg-secondary/60 transition-colors">
                <Bell size={18} className="text-muted-foreground" /> Daily Reminder
                <span className={`ml-auto text-xs ${reminderEnabled ? 'text-primary' : 'text-muted-foreground'}`}>
                  {reminderEnabled ? 'On' : 'Off'}
                </span>
              </button>
              {showReminder && (
                <div className="px-5 pb-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Enable</span>
                    <button onClick={handleReminderToggle} className={`w-12 h-7 rounded-full transition-colors ${reminderEnabled ? 'bg-primary' : 'bg-muted'}`}>
                      <div className={`w-5 h-5 rounded-full bg-card shadow transition-transform mx-1 mt-1 ${reminderEnabled ? 'translate-x-5' : ''}`} />
                    </button>
                  </div>
                  {notifDenied && (
                    <p className="text-xs text-destructive">Please enable notifications in your browser settings</p>
                  )}
                  {reminderEnabled && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Time:</span>
                      <input type="time" value={reminderTime} onChange={e => setReminderTime(e.target.value)}
                        className="h-9 rounded-lg border border-input bg-background px-3 text-sm" />
                    </div>
                  )}
                </div>
              )}

              {/* PIN */}
              <button onClick={handlePinAction}
                className="w-full flex items-center gap-3 px-5 py-3.5 text-left text-sm font-semibold text-foreground hover:bg-secondary/60 transition-colors">
                <Lock size={18} className="text-muted-foreground" /> {pin ? 'Change PIN' : 'Set PIN'}
              </button>
            </div>

            <div className="flex-1" />
            <div className="h-px bg-border mx-5" />

            {/* Logout */}
            <div className="p-5">
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 py-3 px-4 rounded-lg text-sm font-bold text-destructive hover:bg-destructive/10 transition-colors">
                <LogOut size={18} /> Log Out
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
