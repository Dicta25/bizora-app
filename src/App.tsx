import { BrowserRouter, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AppProvider, useApp } from "./context/AppContext";
import OnboardingScreen from "./screens/OnboardingScreen";
import DashboardScreen from "./screens/DashboardScreen";
import RecordSaleScreen from "./screens/RecordSaleScreen";
import RecordExpenseScreen from "./screens/RecordExpenseScreen";
import InventoryScreen from "./screens/InventoryScreen";
import CustomersScreen from "./screens/CustomersScreen";
import CustomerDetailScreen from "./screens/CustomerDetailScreen";
import ReportsScreen from "./screens/ReportsScreen";
import SuppliersScreen from "./screens/SuppliersScreen";
import PINScreen from "./screens/PINScreen";
import BottomNav from "./components/BottomNav";
import { useState, useEffect } from "react";

function AppRoutes() {
  const { user, pin } = useApp();
  const [pinVerified, setPinVerified] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const navigate = useNavigate();

  // Listen for custom event to open PIN setup from drawer
  useEffect(() => {
    const handler = () => setShowPinSetup(true);
    window.addEventListener('open-pin-setup', handler);
    return () => window.removeEventListener('open-pin-setup', handler);
  }, []);

  // Reset pinVerified when user logs out
  useEffect(() => {
    if (!user) {
      setPinVerified(false);
      setShowPinSetup(false);
    }
  }, [user]);

  // Handle visibility change - require PIN re-entry when returning from background
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && pin && pinVerified) {
        setPinVerified(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [pin, pinVerified]);

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<OnboardingScreen />} />
      </Routes>
    );
  }

  if (pin && !pinVerified) {
    return <PINScreen mode="verify" onSuccess={() => setPinVerified(true)} />;
  }

  if (showPinSetup) {
    return (
      <PINScreen
        mode={pin ? 'change' : 'setup'}
        onSuccess={() => setShowPinSetup(false)}
        onSkip={() => setShowPinSetup(false)}
      />
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background">
      <Routes>
        <Route path="/" element={<DashboardScreen />} />
        <Route path="/record/sale" element={<RecordSaleScreen />} />
        <Route path="/record/expense" element={<RecordExpenseScreen />} />
        <Route path="/inventory" element={<InventoryScreen />} />
        <Route path="/customers" element={<CustomersScreen />} />
        <Route path="/customers/:id" element={<CustomerDetailScreen />} />
        <Route path="/reports" element={<ReportsScreen />} />
        <Route path="/suppliers" element={<SuppliersScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
