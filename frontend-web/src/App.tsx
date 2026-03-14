import { BrowserRouter, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AppProvider, useApp } from "./context/AppContext";
import AuthScreen from "./screens/AuthScreen";
import AdminLoginScreen from "./screens/AdminLoginScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import LandingScreen from "./screens/LandingScreen";
import DashboardScreen from "./screens/DashboardScreen";
import RecordSaleScreen from "./screens/RecordSaleScreen";
import RecordExpenseScreen from "./screens/RecordExpenseScreen";
import InventoryScreen from "./screens/InventoryScreen";
import CustomersScreen from "./screens/CustomersScreen";
import CustomerDetailScreen from "./screens/CustomerDetailScreen";
import ReportsScreen from "./screens/ReportsScreen";
import SuppliersScreen from "./screens/SuppliersScreen";
import ProfileScreen from "./screens/ProfileScreen";
import PINScreen from "./screens/PINScreen";
import AdminDashboard from "./screens/admin/AdminDashboard";
import AdminUsers from "./screens/admin/AdminUsers";
import AdminStaff from "./screens/admin/AdminStaff";
import AdminBusinessDetail from "./screens/admin/AdminBusinessDetail";
import AdminLedger from "./screens/admin/AdminLedger";
import AdminSubscriptions from "./screens/admin/AdminSubscriptions";
import AdminBroadcast from "./screens/admin/AdminBroadcast";
import AdminAudit from "./screens/admin/AdminAudit";
import AdminSupport from "./screens/admin/AdminSupport";
import AdminHealth from "./screens/admin/AdminHealth";
import AdminSettings from "./screens/admin/AdminSettings";
import AdminLayout from "./components/admin/AdminLayout";
import BottomNav from "./components/BottomNav";
import DesktopSidebar from "./components/DesktopSidebar";
import TopBar from "./components/TopBar";
import AppDrawer from "./components/AppDrawer";
import { useState, useEffect } from "react";

function AppRoutes() {
  const { user, pin, userLoading } = useApp();
  const [pinVerified, setPinVerified] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Reset pinVerified when user logs out
  useEffect(() => {
    if (!user) {
      setPinVerified(false);
      setShowPinSetup(false);
      setDrawerOpen(false);
    }
  }, [user]);

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
            <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Bizora is loading...</p>
        </div>
      </div>
    );
  }

  // 1. PUBLIC ROUTES
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<LandingScreen />} />
        <Route path="/login" element={<AuthScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // 2. ADMIN PORTAL (Strict RBAC)
  if (user.isSuperadmin || user.is_superadmin) {
    return (
      <AdminLayout>
        <Routes>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/users/:id" element={<AdminBusinessDetail />} />
          <Route path="/admin/staff" element={<AdminStaff />} />
          <Route path="/admin/ledger" element={<AdminLedger />} />
          <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
          <Route path="/admin/broadcast" element={<AdminBroadcast />} />
          <Route path="/admin/audit" element={<AdminAudit />} />
          <Route path="/admin/support" element={<AdminSupport />} />
          <Route path="/admin/health" element={<AdminHealth />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AdminLayout>
    );
  }

  // 3. ONBOARDING (New Users)
  if (!user.businessName) {
    return (
      <Routes>
        <Route path="/onboarding" element={<OnboardingScreen />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    );
  }

  // 4. SECURITY (PIN)
  if (pin && !pinVerified) {
    return <PINScreen mode="verify" onSuccess={() => setPinVerified(true)} />;
  }

  // 5. STANDARD USER APP
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <DesktopSidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <TopBar onMenuClick={() => setDrawerOpen(true)} />
        <AppDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        <main className="flex-1 w-full max-w-7xl mx-auto md:px-8 pb-20 md:pb-8 overflow-y-auto">
          <div className="max-w-md mx-auto md:max-w-none min-h-screen pt-4">
            <Routes>
              <Route path="/" element={<DashboardScreen />} />
              <Route path="/record/sale" element={<RecordSaleScreen />} />
              <Route path="/record/expense" element={<RecordExpenseScreen />} />
              <Route path="/inventory" element={<InventoryScreen />} />
              <Route path="/customers" element={<CustomersScreen />} />
              <Route path="/customers/:id" element={<CustomerDetailScreen />} />
              <Route path="/reports" element={<ReportsScreen />} />
              <Route path="/suppliers" element={<SuppliersScreen />} />
              <Route path="/profile" element={<ProfileScreen />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
        <div className="md:hidden">
          <BottomNav />
        </div>
      </div>
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
