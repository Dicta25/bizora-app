import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Menu, Moon, Sun, Search, ArrowLeft } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { useRouter } from 'expo-router';

import MobileDrawer from './MobileDrawer';

interface MobileTopBarProps {
  showBack?: boolean;
}

export default function MobileTopBar({ showBack = false }: MobileTopBarProps) {
  const { user, darkMode, toggleDarkMode, setDrawerOpen } = useApp();
  const router = useRouter();

  const bgClass = darkMode ? 'bg-slate-950' : 'bg-white';
  const borderClass = darkMode ? 'border-slate-900' : 'border-slate-100';
  const textClass = darkMode ? 'text-white' : 'text-foreground';

  return (
    <>
      <MobileDrawer />
      <View className={`w-full border-b ${bgClass} ${borderClass} px-4 h-16 flex-row items-center justify-between`}>
      <View className="flex-row items-center gap-3">
        {showBack ? (
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full items-center justify-center"
          >
            <ArrowLeft size={20} color={darkMode ? '#fff' : '#000'} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            onPress={() => setDrawerOpen(true)}
            className="w-10 h-10 rounded-full items-center justify-center"
          >
            <Menu size={20} color={darkMode ? '#fff' : '#000'} />
          </TouchableOpacity>
        )}
        <Text className={`text-lg font-black tracking-tighter ${textClass}`}>
          {user?.businessName || 'Bizora'}
        </Text>
      </View>

      <View className="flex-row items-center gap-2">
        <TouchableOpacity className="w-9 h-9 rounded-full items-center justify-center">
          <Search size={18} color={darkMode ? '#94a3b8' : '#64748b'} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={toggleDarkMode}
          className="w-9 h-9 rounded-full items-center justify-center"
        >
          {darkMode ? <Sun size={18} color="#F2A115" /> : <Moon size={18} color="#64748b" />}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.push('/(tabs)/settings')}
          className="ml-1 w-8 h-8 rounded-full bg-primary items-center justify-center"
        >
          <Text className="text-white font-black text-xs">
            {user?.businessName?.charAt(0) || 'B'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
    </>
  );
}
