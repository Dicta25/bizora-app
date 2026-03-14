import { NavLink, useLocation } from 'react-router-dom';
import { 
  Settings, 
  LogOut, 
  LayoutDashboard, 
  Calculator, 
  Receipt, 
  Package, 
  Users, 
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Truck,
  Shield,
  Layers
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { useState } from 'react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/record/sale', icon: Calculator, label: 'Record Sale' },
  { to: '/record/expense', icon: Receipt, label: 'Expenses' },
  { to: '/inventory', icon: Package, label: 'Stocks', showLowStock: true },
  { to: '/customers', icon: Users, label: 'People' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/suppliers', icon: Truck, label: 'Suppliers' },
  { to: '/profile', icon: Settings, label: 'Settings' },
];

const adminItems = [
  { to: '/admin', icon: Shield, label: 'Admin Dashboard' },
  { to: '/admin/users', icon: Layers, label: 'Directory' },
  { to: '/admin/settings', icon: Settings, label: 'System Settings' },
];

export default function DesktopSidebar() {
  const location = useLocation();
  const { lowStockProducts, user, logout } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const businessInitials = user?.businessName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'B';

  return (
    <aside 
      className={cn(
        "hidden md:flex flex-col h-screen border-r bg-card sticky top-0 left-0 transition-all duration-300 ease-in-out z-50",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-12 w-6 h-6 rounded-full border bg-background flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all shadow-sm z-[60]"
      >
        {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* 1. Header (Static) */}
      <div className={cn(
        "p-6 flex items-center transition-all duration-300 shrink-0",
        isCollapsed ? "justify-center" : "gap-3"
      )}>
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
          <span className="text-primary-foreground font-black text-xl">B</span>
        </div>
        {!isCollapsed && (
          <span className="font-black text-2xl tracking-tighter text-foreground truncate">Bizora</span>
        )}
      </div>

      {/* 2. Navigation (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-none">
        <nav className="space-y-1.5 w-full">
          {navItems.map((item) => {
            const isActive = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center rounded-xl transition-all relative group",
                  isCollapsed 
                    ? "justify-center w-12 h-12 mx-auto" 
                    : "gap-3 px-3 h-11",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/10" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className={cn("shrink-0", isCollapsed ? "w-5 h-5" : "w-4 h-4")} />
                {!isCollapsed && (
                  <span className="truncate text-sm font-bold">{item.label}</span>
                )}
                
                {item.showLowStock && lowStockProducts.length > 0 && (
                  <span className={cn(
                    "rounded-full bg-destructive ring-2 ring-card transition-all",
                    isCollapsed 
                      ? "absolute top-3 right-3 w-2 h-2" 
                      : "ml-auto w-2 h-2"
                  )} />
                )}
                
                {/* Collapsed Tooltip */}
                {isCollapsed && (
                  <div className="absolute left-16 px-3 py-1.5 bg-foreground text-background text-[10px] font-black uppercase tracking-widest rounded-md opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap z-[100] shadow-xl">
                    {item.label}
                  </div>
                )}
              </NavLink>
            );
          })}

          {/* Admin Section */}
          {user?.isSuperadmin && (
            <div className="mt-6 pt-6 border-t border-secondary/50">
              {!isCollapsed && (
                <p className="px-3 mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  Admin Panel
                </p>
              )}
              {adminItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex items-center rounded-xl transition-all relative group",
                      isCollapsed 
                        ? "justify-center w-12 h-12 mx-auto" 
                        : "gap-3 px-3 h-11",
                      isActive 
                        ? "bg-accent text-accent-foreground shadow-md shadow-accent/10" 
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <item.icon className={cn("shrink-0", isCollapsed ? "w-5 h-5" : "w-4 h-4")} />
                    {!isCollapsed && (
                      <span className="truncate text-sm font-bold">{item.label}</span>
                    )}
                    
                    {/* Collapsed Tooltip */}
                    {isCollapsed && (
                      <div className="absolute left-16 px-3 py-1.5 bg-accent text-accent-foreground text-[10px] font-black uppercase tracking-widest rounded-md opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap z-[100] shadow-xl">
                        {item.label}
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </div>
          )}
        </nav>
      </div>

      {/* 3. Footer (Sticky at bottom) */}
      <div className="shrink-0 p-3 border-t bg-secondary/5 mt-auto">
        <div className={cn(
          "flex items-center gap-3 rounded-2xl transition-all duration-300",
          isCollapsed ? "justify-center p-0 mb-4" : "bg-card border shadow-sm p-3 mb-3"
        )}>
          {/* Business Initials Avatar */}
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
            <span className="text-accent font-black text-xs">{businessInitials}</span>
          </div>
          
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-foreground truncate uppercase tracking-tighter leading-tight">
                {user?.businessName}
              </p>
              <p className="text-[9px] text-muted-foreground truncate uppercase tracking-widest mt-0.5">
                {user?.phone}
              </p>
            </div>
          )}
        </div>

        <button 
          onClick={logout}
          className={cn(
            "w-full rounded-xl transition-all group relative flex items-center",
            isCollapsed 
              ? "justify-center w-12 h-12 mx-auto text-muted-foreground hover:bg-destructive hover:text-destructive" 
              : "gap-3 px-3 h-11 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          )}
        >
          <LogOut className={cn("shrink-0", isCollapsed ? "w-5 h-5" : "w-4 h-4")} />
          {!isCollapsed && <span className="font-bold text-xs uppercase tracking-widest">Sign Out</span>}
          
          {isCollapsed && (
            <div className="absolute left-16 px-3 py-1.5 bg-destructive text-white text-[10px] font-black uppercase tracking-widest rounded-md opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap z-[100] shadow-xl">
              Sign Out
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
