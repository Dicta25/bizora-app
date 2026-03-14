import { Search, Bell, User, Menu, Zap, Moon, Sun } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface AdminTopBarProps {
  onMenuClick: () => void;
}

export default function AdminTopBar({ onMenuClick }: AdminTopBarProps) {
  const { darkMode, toggleDarkMode } = useApp();

  return (
    <header className="h-20 bg-card border-b border-border px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground"
        >
          <Menu size={20} />
        </button>
        
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">System Live</span>
        </div>
      </div>

      <div className="flex-1 max-w-xl mx-8 hidden lg:block">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Global search (Businesses, Transactions, Logs)..." 
            className="w-full h-11 bg-background border border-input rounded-xl pl-12 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={toggleDarkMode}
          className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-all"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground relative">
          <Bell size={20} />
          <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary border-2 border-card" />
        </button>
        
        <div className="h-10 w-[1px] bg-border mx-2" />
        
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-foreground leading-none">Super Admin</p>
            <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-tighter">Root Access</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
}
