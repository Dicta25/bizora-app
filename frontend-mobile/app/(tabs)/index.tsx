import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp, Sale, Expense, Product } from '../../src/context/AppContext';
import { TrendingUp, TrendingDown, Package, Plus, Receipt, ChevronRight } from 'lucide-react-native';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'expo-router';
import MobileTopBar from '../../src/components/MobileTopBar';
import MobileDrawer from '../../src/components/MobileDrawer';

export default function DashboardScreen() {
  const { user, sales, expenses, products, darkMode, enterDemoMode } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // Auto-init demo if needed
  useEffect(() => {
    if (!user) enterDemoMode();
  }, [user]);

  const todayKey = new Date().toISOString().split('T')[0];
  
  const todaySalesTotal = useMemo(() => 
    sales.filter((s: Sale) => s.date.startsWith(todayKey))
         .reduce((sum: number, s: Sale) => sum + s.totalPrice, 0),
    [sales, todayKey]
  );

  const todayExpensesTotal = useMemo(() => 
    expenses.filter((e: Expense) => e.date.startsWith(todayKey))
            .reduce((sum: number, e: Expense) => sum + e.amount, 0),
    [expenses, todayKey]
  );

  const recentActivity = useMemo(() => {
    const all = [
      ...sales.map((s: Sale) => ({ ...s, type: 'sale' as const })),
      ...expenses.map((e: Expense) => ({ ...e, type: 'expense' as const, totalPrice: e.amount, productName: e.description }))
    ];
    return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [sales, expenses]);

  const lowStockCount = useMemo(() => 
    products.filter((p: Product) => p.stock <= p.restockLevel).length,
    [products]
  );

  const formatCurrency = (amt: number) => `GH₵ ${amt.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  const bgClass = darkMode ? 'bg-slate-950' : 'bg-slate-50';
  const cardBgClass = darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';
  const textClass = darkMode ? 'text-white' : 'text-slate-900';
  const mutedTextClass = darkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <View 
      className={`flex-1 ${bgClass}`} 
      style={{ 
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <MobileDrawer />
      <MobileTopBar />
      <ScrollView 
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {}} />}
      >
        <View className="px-6 pt-6 pb-10">
          {/* Welcome Section */}
          <View className="mb-8">
            <Text className={`${mutedTextClass} text-xs font-black uppercase tracking-widest`}>Welcome back</Text>
            <Text className={`text-3xl font-black ${textClass}`}>{user?.businessName || 'Boss'} 👋</Text>
          </View>

          {/* Today's Stats Cards */}
          <View className="flex-row gap-4 mb-6">
            <View className="flex-1 bg-primary rounded-[2rem] p-5 shadow-lg shadow-primary/20">
              <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mb-3">
                <TrendingUp size={16} color="white" />
              </View>
              <Text className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-1">Today's Sales</Text>
              <Text className="text-white text-xl font-black tabular-nums" numberOfLines={1}>
                {formatCurrency(todaySalesTotal)}
              </Text>
            </View>
            
            <View className="flex-1 bg-destructive rounded-[2rem] p-5 shadow-lg shadow-destructive/20">
              <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mb-3">
                <TrendingDown size={16} color="white" />
              </View>
              <Text className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-1">Expenses</Text>
              <Text className="text-white text-xl font-black tabular-nums" numberOfLines={1}>
                {formatCurrency(todayExpensesTotal)}
              </Text>
            </View>
          </View>

          {/* Low Stock Alert Banner */}
          {lowStockCount > 0 && (
            <TouchableOpacity 
              onPress={() => router.push('/inventory')}
              className={`border rounded-2xl p-4 mb-6 flex-row items-center ${darkMode ? 'bg-orange-500/10 border-orange-500/20' : 'bg-accent/10 border-accent/30'}`}
            >
              <View className="w-10 h-10 rounded-xl bg-accent items-center justify-center mr-4 shadow-sm">
                <Package size={20} color="#000" />
              </View>
              <View className="flex-1">
                <Text className={`font-black ${darkMode ? 'text-orange-400' : 'text-foreground'}`}>{lowStockCount} Items Low in Stock</Text>
                <Text className={`${mutedTextClass} text-xs font-bold`}>Tap to view and restock</Text>
              </View>
              <ChevronRight size={20} color={darkMode ? '#475569' : '#94a3b8'} />
            </TouchableOpacity>
          )}

          {/* Recent Activity Section */}
          <View className="mb-8">
            <View className="flex-row justify-between items-end mb-4">
              <Text className={`text-lg font-black ${textClass}`}>Recent Activity</Text>
              <TouchableOpacity onPress={() => router.push('/reports')}>
                <Text className="text-primary text-xs font-black uppercase tracking-widest">See All</Text>
              </TouchableOpacity>
            </View>

            {recentActivity.length === 0 ? (
              <View className={`rounded-[2rem] p-10 border items-center justify-center ${cardBgClass}`}>
                <Receipt size={48} color={darkMode ? '#1e293b' : '#e2e8f0'} />
                <Text className={`${mutedTextClass} mt-4 font-bold text-center`}>No sales yet today. Let's grow! 🚀</Text>
              </View>
            ) : (
              <View className={`rounded-[2rem] border overflow-hidden ${cardBgClass}`}>
                {recentActivity.map((item: any, idx: number) => (
                  <View key={idx} className={`p-4 flex-row items-center border-b ${darkMode ? 'border-slate-800' : 'border-slate-50'} ${idx === recentActivity.length - 1 ? 'border-b-0' : ''}`}>
                    <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${item.type === 'sale' ? 'bg-primary/10' : 'bg-destructive/10'}`}>
                      {item.type === 'sale' ? <TrendingUp size={18} color="#0A6640" /> : <TrendingDown size={18} color="#E65100" />}
                    </View>

                    <View className="flex-1">
                      <Text className={`font-bold ${textClass}`} numberOfLines={1}>{item.productName}</Text>
                      <Text className={`${mutedTextClass} text-xs`}>{new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                    <Text className={`font-black tabular-nums ${item.type === 'sale' ? 'text-primary' : 'text-destructive'}`}>
                      {item.type === 'sale' ? '+' : '-'}{formatCurrency(item.totalPrice)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Floating Action Hint */}
          <TouchableOpacity 
            onPress={() => router.push('/sale')}
            activeOpacity={0.9}
            className="h-20 bg-accent rounded-[2rem] flex-row items-center justify-center shadow-xl shadow-accent/40"
          >
            <View className="bg-white/30 rounded-full p-2 mr-3">
              <Plus size={24} color="#000" strokeWidth={4} />
            </View>
            <Text className="text-foreground text-xl font-black">Record New Sale</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
