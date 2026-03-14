import { useApp } from '@/context/AppContext';
import { Moon, Sun, Menu, Search, Bell, Plus, Calculator } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const { user, darkMode, toggleDarkMode } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Map routes to titles
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/record/sale')) return 'Record Sale';
    if (path.startsWith('/record/expense')) return 'Record Expense';
    if (path.startsWith('/inventory')) return 'Inventory';
    if (path.startsWith('/customers')) return 'Customers';
    if (path.startsWith('/reports')) return 'Reports';
    if (path.startsWith('/suppliers')) return 'Suppliers';
    return 'Bizora';
  };

  return (
    <header className={cn(
      "sticky top-0 z-40 w-full transition-all duration-200 border-b",
      scrolled 
        ? "bg-background/80 backdrop-blur-md shadow-sm border-border" 
        : "bg-background border-transparent"
    )}>
      <div className="px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden rounded-full"
            onClick={onMenuClick}
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Page Title / Context */}
          <div className="hidden md:block">
            <h1 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
              {getPageTitle()}
            </h1>
          </div>
          
          <div className="md:hidden">
            <span className="font-bold text-lg tracking-tight">{user?.businessName || 'Bizora'}</span>
          </div>
        </div>

        {/* Desktop Search & Actions */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search products, customers..."
              className="w-full h-10 bg-secondary/50 border-transparent rounded-full pl-10 pr-4 text-sm focus:bg-background focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Quick Action Desktop */}
          <Button 
            variant="default" 
            size="sm" 
            className="hidden md:flex rounded-full gap-2 px-4 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
            onClick={() => navigate('/record/sale')}
          >
            <Calculator className="w-4 h-4" />
            <span>New Sale</span>
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full text-muted-foreground hover:text-foreground"
          >
            <Bell className="w-5 h-5" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={toggleDarkMode}
          >
            {darkMode ? <Sun className="w-5 h-5 text-accent" /> : <Moon className="w-5 h-5 text-muted-foreground" />}
          </Button>

          <div className="hidden md:flex items-center gap-3 pl-4 border-l">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-xs">
              {user?.businessName?.charAt(0) || 'B'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
