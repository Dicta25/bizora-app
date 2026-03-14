import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  BarChart3, 
  Package, 
  Receipt, 
  Users, 
  ShieldCheck, 
  Smartphone,
  Monitor,
  Menu,
  TrendingUp,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function LandingScreen() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Receipt,
      title: "Record Sales & Expenses",
      description: "Quickly log daily transactions. Know exactly how much money came in and what you spent it on.",
      color: "text-primary",
      bg: "bg-primary/10"
    },
    {
      icon: Package,
      title: "Inventory Tracking",
      description: "Never run out of your best sellers. Track stock levels and get alerts when it's time to restock.",
      color: "text-accent",
      bg: "bg-accent/10"
    },
    {
      icon: Users,
      title: "Customer & Debt Management",
      description: "Keep a registry of your buyers. Easily track who owes you money and when they last paid.",
      color: "text-destructive",
      bg: "bg-destructive/10"
    },
    {
      icon: BarChart3,
      title: "Business Reports",
      description: "Generate weekly and monthly profit reports. See your business growth at a glance.",
      color: "text-info",
      bg: "bg-info/10"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-black text-lg">B</span>
            </div>
            <span className="font-black text-xl tracking-tight">Bizora</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden sm:inline-flex font-bold" onClick={() => navigate('/login')}>
              Sign In
            </Button>
            <Button className="rounded-full font-bold px-6" onClick={() => navigate('/login')}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 overflow-hidden relative">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8 relative z-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/80 border text-xs font-bold text-muted-foreground uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Built for African Businesses
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]">
              Manage your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">business</span> with ease.
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed">
              Bizora is the simple, powerful point-of-sale and inventory tracker designed specifically for traders, weavers, and small businesses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="lg" 
                className="h-14 rounded-full px-8 text-lg font-black bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                onClick={() => navigate('/login')}
              >
                Start for Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="h-14 rounded-full px-8 text-lg font-bold border-2"
                onClick={() => navigate('/login')}
              >
                Try Interactive Demo
              </Button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative flex items-center justify-center"
          >
            {/* Abstract Decorative Background */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-accent/10 to-transparent rounded-full blur-3xl" />
            
            {/* Mockup Container - Refined Height & Visibility */}
            <div className="relative w-full max-w-[340px] bg-card rounded-[3rem] border-[12px] border-secondary shadow-2xl overflow-hidden aspect-[9/19.5] flex flex-col scale-110 lg:scale-100 origin-center">
              {/* Mockup Header - Improved Contrast */}
              <div className="bg-primary p-8 pt-10 text-primary-foreground">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="font-bold text-xl mb-1">Good morning 👋</h3>
                    <p className="text-xs font-medium opacity-90 uppercase tracking-widest">Akua's Kente Store</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <Menu size={20} />
                  </div>
                </div>
                <div className="bg-white/15 rounded-2xl p-5 border border-white/20 shadow-inner">
                  <p className="text-xs font-black uppercase tracking-widest mb-2 opacity-80">Today's Sales</p>
                  <p className="text-4xl font-black tabular-nums">GH₵ 2,450.00</p>
                </div>
              </div>
              
              {/* Mockup Body - Content Simulation */}
              <div className="flex-1 p-6 space-y-6 bg-background overflow-hidden">
                <div className="flex gap-2">
                   <div className="flex-1 h-12 rounded-xl bg-primary text-white flex items-center justify-center text-[10px] font-black uppercase tracking-tighter">Record Sale</div>
                   <div className="flex-1 h-12 rounded-xl bg-destructive text-white flex items-center justify-center text-[10px] font-black uppercase tracking-tighter">Expense</div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Recent Activity</p>
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl border bg-card/50">
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", i === 2 ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary")}>
                        {i === 2 ? <TrendingUp className="rotate-180" size={18} /> : <TrendingUp size={18} />}
                      </div>
                      <div className="flex-1">
                        <div className="h-2 w-20 bg-muted rounded-full mb-2" />
                        <div className="h-1.5 w-12 bg-muted/50 rounded-full" />
                      </div>
                      <div className="h-2 w-10 bg-muted rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Floating Elements - Animated */}
            <motion.div 
              animate={{ y: [-10, 10, -10] }} 
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -right-4 top-1/4 bg-card border-2 shadow-2xl rounded-2xl p-5 flex items-center gap-4 z-20"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center shadow-inner">
                <Package className="text-accent" size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Low Stock Alert</p>
                <p className="font-bold text-foreground">Blue Kente (2)</p>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [10, -10, 10] }} 
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="absolute -left-12 bottom-1/4 bg-card border-2 shadow-2xl rounded-2xl p-5 flex items-center gap-4 z-20"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shadow-inner">
                <LayoutDashboard className="text-primary" size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">New Order</p>
                <p className="font-bold text-foreground">Ama Serwaa</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-secondary/30 px-6 border-y">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">Everything you need to grow</h2>
            <p className="text-muted-foreground text-lg">Say goodbye to paper record books. Bizora brings professional accounting and stock management to your fingertips.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-card rounded-3xl p-6 border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6", feature.bg, feature.color)}>
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cross-Platform Section */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative">
             <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl" />
             <div className="relative grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-12">
                  <div className="aspect-square rounded-3xl bg-card border shadow-sm flex flex-col items-center justify-center p-6 text-center gap-4">
                    <Smartphone size={40} className="text-primary" />
                    <p className="font-bold">Mobile App</p>
                  </div>
                  <div className="aspect-[4/3] rounded-3xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 flex flex-col items-center justify-center p-6 text-center gap-4">
                    <ShieldCheck size={40} />
                    <p className="font-bold">Offline Ready</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="aspect-[4/3] rounded-3xl bg-accent text-accent-foreground shadow-lg shadow-accent/20 flex flex-col items-center justify-center p-6 text-center gap-4">
                    <BarChart3 size={40} />
                    <p className="font-bold">Live Sync</p>
                  </div>
                  <div className="aspect-square rounded-3xl bg-card border shadow-sm flex flex-col items-center justify-center p-6 text-center gap-4">
                    <Monitor size={40} className="text-info" />
                    <p className="font-bold">Desktop Web</p>
                  </div>
                </div>
             </div>
          </div>
          <div className="order-1 lg:order-2 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Works wherever you work.</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Whether you are at the market using your phone, or at home reviewing reports on your laptop, Bizora keeps your data perfectly synced across all your devices.
            </p>
            <ul className="space-y-3 pt-4">
              {['Works offline on mobile', 'Instant sync when internet returns', 'Secure PIN protection', 'Share receipts via WhatsApp'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 font-semibold text-foreground">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Check size={14} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 border-t bg-card">
        <div className="max-w-4xl mx-auto bg-primary rounded-[3rem] p-12 text-center text-primary-foreground shadow-2xl relative overflow-hidden kente-border border-0">
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight">Ready to take control?</h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">Join hundreds of business owners who are growing their profits and managing their inventory the smart way.</p>
            <Button 
              size="lg" 
              className="h-16 rounded-full px-10 text-xl font-black bg-background text-foreground hover:bg-white hover:scale-105 transition-all"
              onClick={() => navigate('/login')}
            >
              Setup Your Business Now
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t bg-background text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-black text-xs">B</span>
          </div>
          <span className="font-black text-lg tracking-tight">Bizora</span>
        </div>
        <p className="text-sm text-muted-foreground font-medium">© {new Date().getFullYear()} Bizora. Built for modern businesses.</p>
      </footer>
    </div>
  );
}

// Temporary Check icon since it wasn't imported at top
function Check(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
