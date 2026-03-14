import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../src/context/AppContext';
import { TrendingDown, Plus, ChevronLeft } from 'lucide-react-native';
import { useState, useMemo } from 'react';
import MobileTopBar from '../src/components/MobileTopBar';
import { useRouter } from 'expo-router';

export default function ExpensesScreen() {
  const { expenses, darkMode, addExpense } = useApp();
  const router = useRouter();

  const formatCurrency = (amt: number) => `GH₵ ${amt.toLocaleString()}`;

  const bgClass = darkMode ? 'bg-slate-950' : 'bg-slate-50';
  const cardBgClass = darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';
  const textClass = darkMode ? 'text-white' : 'text-slate-900';
  const mutedTextClass = darkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <SafeAreaView className={`flex-1 ${bgClass}`} edges={['top']}>
      <MobileTopBar showBack={true} />
      
      <View className="px-6 py-4 flex-row items-center gap-4">
        <View>
          <Text className={`text-2xl font-black ${textClass}`}>Expenses</Text>
          <Text className={`${mutedTextClass} text-xs font-bold uppercase tracking-widest`}>
            {expenses.length} Records
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6">
        {expenses.length === 0 ? (
          <View className="py-20 items-center justify-center">
            <TrendingDown size={64} color={darkMode ? '#1e293b' : '#e2e8f0'} />
            <Text className={`${mutedTextClass} mt-4 font-bold text-center`}>No expenses recorded yet.</Text>
          </View>
        ) : (
          <View className="space-y-3">
            {expenses.map(expense => (
              <View key={expense.id} className={`p-5 rounded-[2rem] border ${cardBgClass} shadow-sm flex-row items-center justify-between`}>
                <View className="flex-row items-center flex-1">
                  <View className="w-12 h-12 rounded-2xl bg-destructive/10 items-center justify-center mr-4">
                    <TrendingDown size={20} color="#E65100" />
                  </View>
                  <View className="flex-1">
                    <Text className={`font-black text-base ${textClass}`} numberOfLines={1}>{expense.description}</Text>
                    <Text className={`${mutedTextClass} text-xs font-bold`}>{expense.category}</Text>
                  </View>
                </View>
                <Text className="text-destructive font-black tabular-nums">{formatCurrency(expense.amount)}</Text>
              </View>
            ))}
          </View>
        )}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
