import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
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
import { useState } from "react";

function AppRoutes() {
  const { user, pin } = useApp();
  const [pinVerified, setPinVerified] = useState(false);

  if (!user) return <OnboardingScreen />;

  if (pin && !pinVerified) {
    return <PINScreen mode="verify" onSuccess={() => setPinVerified(true)} />;
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
