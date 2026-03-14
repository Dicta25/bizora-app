import { View, Text, ScrollView, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../src/context/AppContext';
import { BarChart3, ChevronLeft, TrendingUp, TrendingDown, Download, Share2 } from 'lucide-react-native';
import MobileTopBar from '../src/components/MobileTopBar';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

export default function ReportsScreen() {
  const { sales, expenses, darkMode } = useApp();
  const router = useRouter();
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  const stats = useMemo(() => {
    const totalSales = sales.reduce((sum, s) => sum + s.totalPrice, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const profit = totalSales - totalExpenses;
    
    // Payment Breakdown
    const paymentBreakdown: Record<string, number> = {};
    sales.forEach(s => {
      paymentBreakdown[s.paymentMethod] = (paymentBreakdown[s.paymentMethod] || 0) + s.totalPrice;
    });

    return { totalSales, totalExpenses, profit, paymentBreakdown };
  }, [sales, expenses]);

  const formatCurrency = (amt: number) => `GH₵ ${amt.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Bizora Business Report\nTotal Sales: ${formatCurrency(stats.totalSales)}\nTotal Expenses: ${formatCurrency(stats.totalExpenses)}\nNet Profit: ${formatCurrency(stats.profit)}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const bgClass = darkMode ? 'bg-slate-950' : 'bg-slate-50';
  const cardBgClass = darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';
  const textClass = darkMode ? 'text-white' : 'text-slate-900';
  const mutedTextClass = darkMode ? 'text-slate-400' : 'text-slate-500';

  const paymentLabels: Record<string, string> = { cash: 'Cash', momo: 'MoMo', bank: 'Bank', credit: 'Credit' };
  const paymentColors: Record<string, string> = { cash: '#0A6640', momo: '#F2A115', bank: '#3b82f6', credit: '#ef4444' };

  return (
    <SafeAreaView className={`flex-1 ${bgClass}`} edges={['top']}>
      <MobileTopBar showBack={true} />
      
      <View className="px-6 py-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-4">
          <View>
            <Text className={`text-2xl font-black ${textClass}`}>Reports</Text>
            <Text className={`${mutedTextClass} text-xs font-bold uppercase tracking-widest`}>Business Analytics</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleShare} className="w-10 h-10 items-center justify-center">
          <Share2 size={22} color={darkMode ? '#94a3b8' : '#64748b'} />
        </TouchableOpacity>
      </View>

      {/* Period Switcher */}
      <View className="px-6 mb-6">
        <View className={`flex-row p-1 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
          <TouchableOpacity 
            onPress={() => setPeriod('week')}
            className={`flex-1 py-3 rounded-xl items-center justify-center ${period === 'week' ? (darkMode ? 'bg-slate-800 shadow-sm' : 'bg-white shadow-sm') : ''}`}
          >
            <Text className={`text-xs font-black uppercase tracking-widest ${period === 'week' ? textClass : mutedTextClass}`}>Weekly</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setPeriod('month')}
            className={`flex-1 py-3 rounded-xl items-center justify-center ${period === 'month' ? (darkMode ? 'bg-slate-800 shadow-sm' : 'bg-white shadow-sm') : ''}`}
          >
            <Text className={`text-xs font-black uppercase tracking-widest ${period === 'month' ? textClass : mutedTextClass}`}>Monthly</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-6">
        <View className="space-y-6 pb-10">
          {/* Summary Cards */}
          <View className="space-y-3">
            <View className={`p-5 rounded-[2rem] border ${cardBgClass} shadow-sm flex-row items-center justify-between`}>
              <View className="flex-row items-center gap-4">
                <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                  <TrendingUp size={20} color="#0A6640" />
                </View>
                <View>
                  <Text className={`${mutedTextClass} text-[10px] font-black uppercase tracking-widest`}>Total Sales</Text>
                  <Text className={`text-xl font-black ${textClass}`}>{formatCurrency(stats.totalSales)}</Text>
                </View>
              </View>
            </View>

            <View className={`p-5 rounded-[2rem] border ${cardBgClass} shadow-sm flex-row items-center justify-between`}>
              <View className="flex-row items-center gap-4">
                <View className="w-10 h-10 rounded-xl bg-destructive/10 items-center justify-center">
                  <TrendingDown size={20} color="#E65100" />
                </View>
                <View>
                  <Text className={`${mutedTextClass} text-[10px] font-black uppercase tracking-widest`}>Total Expenses</Text>
                  <Text className={`text-xl font-black ${textClass}`}>{formatCurrency(stats.totalExpenses)}</Text>
                </View>
              </View>
            </View>

            <View className={`p-6 rounded-[2.5rem] border ${stats.profit >= 0 ? 'bg-primary border-primary' : 'bg-destructive border-destructive'} shadow-lg shadow-primary/20 items-center justify-center`}>
              <Text className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-1">Net Profit</Text>
              <Text className="text-white text-4xl font-black tabular-nums">{formatCurrency(stats.profit)}</Text>
            </View>
          </View>

          {/* Payment Breakdown */}
          <View className={`p-6 rounded-[2rem] border ${cardBgClass} shadow-sm`}>
            <Text className={`text-lg font-black ${textClass} mb-6`}>Payment Methods</Text>
            <View className="space-y-4">
              {Object.entries(stats.paymentBreakdown).map(([method, amount]) => (
                <View key={method} className="space-y-2">
                  <View className="flex-row justify-between items-end">
                    <Text className={`text-xs font-bold ${mutedTextClass} uppercase`}>{paymentLabels[method] || method}</Text>
                    <Text className={`text-sm font-black ${textClass}`}>{formatCurrency(amount)}</Text>
                  </View>
                  <View className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <View 
                      className="h-full rounded-full" 
                      style={{ 
                        backgroundColor: paymentColors[method] || '#64748b',
                        width: `${(amount / stats.totalSales) * 100}%` 
                      }} 
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Business Insights Card */}
          <View className="p-6 bg-accent rounded-[2rem] border border-accent shadow-lg shadow-accent/20">
            <View className="flex-row items-center gap-3 mb-3">
              <BarChart3 size={20} color="#000" strokeWidth={3} />
              <Text className="text-foreground font-black uppercase text-xs tracking-widest">Business Insight</Text>
            </View>
            <Text className="text-foreground/80 font-bold leading-relaxed">
              Your business is showing healthy margins this {period}. You spent {((stats.totalExpenses / stats.totalSales) * 100).toFixed(0)}% of your revenue on expenses.
            </Text>
            <View className="mt-4 p-3 bg-white/30 rounded-xl border border-white/20">
              <Text className="text-foreground text-[10px] font-black uppercase tracking-tight">Tip: Review your recurring costs to increase profit next month.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
