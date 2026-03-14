import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  LayoutDashboard, 
  Layers, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  ArrowLeft,
  Activity,
  Database,
  Building2,
  Receipt,
  Crown,
  Megaphone,
  Terminal,
  LifeBuoy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';

const adminNavItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Pulse' },
  { to: '/admin/users', icon: Building2, label: 'Businesses' },
  { to: '/admin/staff', icon: Shield, label: 'Staff' },
  { to: '/admin/ledger', icon: Receipt, label: 'Ledger' },
  { to: '/admin/subscriptions', icon: Crown, label: 'Plans' },
  { to: '/admin/broadcast', icon: Megaphone, label: 'Broadcast' },
  { to: '/admin/support', icon: LifeBuoy, label: 'Support' },
  { to: '/admin/health', icon: Activity, label: 'Health' },
  { to: '/admin/audit', icon: Terminal, label: 'Logs' },
  { to: '/admin/settings', icon: Settings, label: 'System' },
];

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <aside 
      className={cn(
        "flex flex-col h-full border-r bg-card transition-all duration-300 ease-in-out relative",
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

      {/* Header */}
      <div className={cn(
        "p-6 flex items-center transition-all duration-300 shrink-0",
        isCollapsed ? "justify-center" : "gap-3"
      )}>
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
          <Shield size={20} className="text-primary-foreground" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="font-black text-2xl tracking-tighter text-foreground leading-none text-primary">Bizora</span>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1">Super Admin</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <nav className="space-y-1.5 w-full">
          {adminNavItems.map((item) => {
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
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/10" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className={cn("shrink-0", isCollapsed ? "w-5 h-5" : "w-4 h-4")} />
                {!isCollapsed && (
                  <span className="truncate text-sm font-bold">{item.label}</span>
                )}
                
                {isCollapsed && (
                  <div className="absolute left-16 px-3 py-1.5 bg-foreground text-background text-[10px] font-black uppercase tracking-widest rounded-md opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap z-[100] shadow-xl">
                    {item.label}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="shrink-0 p-3 border-t bg-secondary/5 mt-auto">
        <button 
          onClick={handleLogout}
          className={cn(
            "w-full rounded-xl transition-all group relative flex items-center",
            isCollapsed 
              ? "justify-center w-12 h-12 mx-auto text-muted-foreground hover:bg-destructive hover:text-destructive" 
              : "gap-3 px-3 h-11 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          )}
        >
          <LogOut className={cn("shrink-0", isCollapsed ? "w-5 h-5" : "w-4 h-4")} />
          {!isCollapsed && <span className="font-bold text-xs uppercase tracking-widest">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
