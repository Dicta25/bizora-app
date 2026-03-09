import { NavLink, useLocation } from 'react-router-dom';
import { Home, Receipt, Package, BarChart3 } from 'lucide-react';

const tabs = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/record/sale', icon: Receipt, label: 'Record' },
  { to: '/inventory', icon: Package, label: 'Inventory' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      <div className="flex items-stretch">
        {tabs.map(tab => {
          const isActive = tab.to === '/' ? location.pathname === '/' : location.pathname.startsWith(tab.to);
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className="flex-1 flex flex-col items-center justify-center py-2 relative tap-target"
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-accent" />
              )}
              <tab.icon size={22} className={isActive ? 'text-primary' : 'text-muted-foreground'} />
              <span className={`text-[11px] mt-0.5 font-semibold ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {tab.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
