import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Receipt, Package, BarChart3, LogOut, X } from 'lucide-react';

interface AppDrawerProps {
  open: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: Home, label: '🏠 Home', path: '/' },
  { icon: Receipt, label: '🧾 Sales', path: '/record/sale' },
  { icon: Package, label: '📦 Inventory', path: '/inventory' },
  { icon: BarChart3, label: '📊 Reports', path: '/reports' },
];

export default function AppDrawer({ open, onClose }: AppDrawerProps) {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    onClose();
    logout();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 z-[60] bg-foreground/50"
            onClick={onClose}
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 left-0 bottom-0 z-[70] w-72 bg-card shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-5 pb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-foreground">{user?.businessName || 'Bizora'}</h2>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>
              {user?.businessType && (
                <p className="text-sm font-medium text-muted-foreground">{user.businessType}</p>
              )}
              {user?.phone && (
                <p className="text-xs text-muted-foreground mt-0.5">{user.phone}</p>
              )}
            </div>

            <div className="h-px bg-border mx-5" />

            {/* Menu Items */}
            <nav className="flex-1 py-3">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className="w-full flex items-center gap-3 px-5 py-3.5 text-left text-sm font-semibold text-foreground hover:bg-secondary/60 active:bg-secondary transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="h-px bg-border mx-5" />

            {/* Logout */}
            <div className="p-5">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 py-3 px-4 rounded-lg text-sm font-bold text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut size={18} />
                🚪 Log Out
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
