import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';

const BUSINESS_TYPES = ['Trader', 'Salon', 'Food Vendor', 'Seamstress', 'Other'];

export default function OnboardingScreen() {
  const { setUser, enterDemoMode, addProduct, addSale, addExpense } = useApp();
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [location, setLocation] = useState('');

  const canSubmit = phone.length >= 10 && businessName && businessType && location;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setUser({ phone, businessName, businessType, location });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Bizora
          </h1>
          <div className="mx-auto mt-2 h-1 w-20 rounded-full bg-gradient-to-r from-primary via-accent to-destructive" />
          <p className="mt-3 text-muted-foreground text-sm">Track your business, grow your profit</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-foreground">Phone Number</label>
            <input
              type="tel"
              placeholder="024 123 4567"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full h-12 rounded-lg border border-input bg-card px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5 text-foreground">Business Name</label>
            <input
              type="text"
              placeholder="e.g. Akua's Store"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              className="w-full h-12 rounded-lg border border-input bg-card px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5 text-foreground">Business Type</label>
            <select
              value={businessType}
              onChange={e => setBusinessType(e.target.value)}
              className="w-full h-12 rounded-lg border border-input bg-card px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
            >
              <option value="">Select type...</option>
              {BUSINESS_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5 text-foreground">Location</label>
            <input
              type="text"
              placeholder="e.g. Kantamanto, Accra"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full h-12 rounded-lg border border-input bg-card px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-bold text-lg mt-4 tap-target disabled:opacity-40 transition-all active:scale-[0.98]"
          >
            Get Started 🚀
          </button>

          <button
            onClick={enterDemoMode}
            className="w-full text-center text-sm text-muted-foreground underline underline-offset-2 mt-2 tap-target"
          >
            Try Demo Mode
          </button>
        </div>
      </motion.div>
    </div>
  );
}
