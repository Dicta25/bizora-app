import { NavLink, useLocation } from 'react-router-dom';
import { Home, Receipt, Package, Users, BarChart3 } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const tabs = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/record/sale', icon: Receipt, label: 'Record' },
  { to: '/inventory', icon: Package, label: 'Inventory', showLowStock: true },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
];

export default function BottomNav() {
  const location = useLocation();
  const { lowStockProducts } = useApp();

  return (
    <nav className="bottom-nav">
      <div className="flex items-stretch h-16">
        {tabs.map(tab => {
          const isActive = tab.to === '/' ? location.pathname === '/' : location.pathname.startsWith(tab.to);
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className="flex-1 flex flex-col items-center justify-center relative tap-target"
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[3px] rounded-full bg-accent" />
              )}
              <div className="relative">
                <tab.icon size={20} className={isActive ? 'text-primary' : 'text-muted-foreground'} />
                {tab.showLowStock && lowStockProducts.length > 0 && (
                  <div className="absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full bg-destructive" />
                )}
              </div>
              <span className={`text-[10px] mt-0.5 font-semibold ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {tab.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
