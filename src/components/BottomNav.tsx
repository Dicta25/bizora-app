import { NavLink, useLocation } from 'react-router-dom';
import { Home, Receipt, Package, BarChart3, Crown } from 'lucide-react';

const tabs = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/record/sale', icon: Receipt, label: 'Record' },
  { to: '/inventory', icon: Package, label: 'Inventory' },
  { to: '/reports', icon: BarChart3, label: 'Reports', crown: true },
];

export default function BottomNav() {
  const location = useLocation();

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
                <tab.icon size={22} className={isActive ? 'text-primary' : 'text-muted-foreground'} />
                {tab.crown && (
                  <Crown size={10} className="absolute -top-1.5 -right-2 text-accent" />
                )}
              </div>
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
