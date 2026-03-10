import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AppProvider, useApp } from "./context/AppContext";
import OnboardingScreen from "./screens/OnboardingScreen";
import DashboardScreen from "./screens/DashboardScreen";
import RecordSaleScreen from "./screens/RecordSaleScreen";
import RecordExpenseScreen from "./screens/RecordExpenseScreen";
import InventoryScreen from "./screens/InventoryScreen";
import ReportsScreen from "./screens/ReportsScreen";
import BottomNav from "./components/BottomNav";

function AppRoutes() {
  const { user } = useApp();

  if (!user) return <OnboardingScreen />;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background">
      <Routes>
        <Route path="/" element={<DashboardScreen />} />
        <Route path="/record/sale" element={<RecordSaleScreen />} />
        <Route path="/record/expense" element={<RecordExpenseScreen />} />
        <Route path="/inventory" element={<InventoryScreen />} />
        <Route path="/reports" element={<ReportsScreen />} />
        <Route path="*" element={<DashboardScreen />} />
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
