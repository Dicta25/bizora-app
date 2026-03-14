import React from 'react';
import { View, Text, TouchableOpacity, Modal, Dimensions, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  X, 
  LayoutDashboard, 
  Receipt, 
  Package, 
  Users, 
  BarChart3, 
  TrendingDown, 
  Truck, 
  HelpCircle, 
  LogOut,
} from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { useRouter, usePathname } from 'expo-router';
import { MotiView, MotiPressable } from 'moti';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.8;

export default function MobileDrawer() {
  const { isDrawerOpen, setDrawerOpen, user, logout, darkMode } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigate = (path: string) => {
    setDrawerOpen(false);
    setTimeout(() => {
      try {
        if (path.startsWith('/(tabs)')) {
          router.replace(path as any);
        } else {
          router.push(path as any);
        }
      } catch (e) {
        console.error("Navigation Error", e);
      }
    }, 300);
  };

  const bgClass = darkMode ? 'bg-slate-950' : 'bg-white';
  const textClass = darkMode ? 'text-white' : 'text-foreground';
  const mutedTextClass = darkMode ? 'text-slate-400' : 'text-muted-foreground';
  const borderClass = darkMode ? 'border-slate-800' : 'border-slate-100';

  const NavItem = ({ label, icon: Icon, path, exact = false }: any) => {
    const isActive = exact ? pathname === path : pathname.startsWith(path);
    return (
      <TouchableOpacity
        onPress={() => handleNavigate(path)}
        className={`flex-row items-center gap-4 p-4 rounded-xl ${isActive ? 'bg-primary/10' : ''}`}
      >
        <Icon size={20} color={isActive ? '#0A6640' : (darkMode ? '#94a3b8' : '#64748b')} />
        <Text className={`font-bold ${isActive ? 'text-primary' : textClass}`}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      transparent
      visible={isDrawerOpen}
      onRequestClose={() => setDrawerOpen(false)}
      animationType="none"
    >
      <View className="flex-1 flex-row">
        {/* Animated Backdrop */}
        {isDrawerOpen && (
          <MotiPressable
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onPress={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
        )}

        {/* Animated Drawer */}
        <MotiView 
          from={{ translateX: -DRAWER_WIDTH }}
          animate={{ translateX: isDrawerOpen ? 0 : -DRAWER_WIDTH }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          style={{ 
            width: DRAWER_WIDTH,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          }}
          className={`h-full ${bgClass} shadow-2xl`}
        >
          <View className={`p-6 pt-12 border-b ${borderClass}`}>
            <View className="flex-row justify-between items-start mb-6">
              <View className="w-14 h-14 rounded-2xl bg-primary items-center justify-center shadow-lg shadow-primary/20">
                <Text className="text-white text-2xl font-black italic">{user?.businessName?.charAt(0) || 'B'}</Text>
              </View>
              <TouchableOpacity onPress={() => setDrawerOpen(false)}>
                <X size={24} color={darkMode ? '#94a3b8' : '#000'} />
              </TouchableOpacity>
            </View>
            <Text className={`text-xl font-black ${textClass}`}>{user?.businessName || 'Bizora'}</Text>
            <Text className={`${mutedTextClass} font-bold text-xs uppercase tracking-widest mt-1`}>{user?.phone || '000 000 0000'}</Text>
          </View>

          <ScrollView className="flex-1 p-4">
            <View className="space-y-1">
              <NavItem label="Dashboard" icon={LayoutDashboard} path="/(tabs)" exact={true} />
              <NavItem label="Inventory" icon={Package} path="/(tabs)/inventory" />
              <NavItem label="Record Sale" icon={Receipt} path="/(tabs)/sale" />
              <NavItem label="Expenses" icon={TrendingDown} path="/expenses" />
              <NavItem label="Customers" icon={Users} path="/(tabs)/customers" />
              <NavItem label="Reports" icon={BarChart3} path="/reports" />
              <NavItem label="Suppliers" icon={Truck} path="/suppliers" />
            </View>

            <View className={`mt-6 pt-6 border-t ${borderClass}`}>
              <TouchableOpacity className="flex-row items-center gap-4 p-4">
                <HelpCircle size={20} color={darkMode ? '#94a3b8' : '#64748b'} />
                <Text className={`font-bold ${textClass}`}>Help & Support</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View className={`p-6 border-t ${borderClass} mb-6`}>
            <TouchableOpacity 
              onPress={() => {
                setDrawerOpen(false);
                logout();
              }}
              className="flex-row items-center gap-4 p-2"
            >
              <LogOut size={20} color="#E65100" />
              <Text className="text-destructive font-black uppercase text-xs tracking-widest">Sign Out</Text>
            </TouchableOpacity>
          </View>
        </MotiView>
      </View>
    </Modal>
  );
}
