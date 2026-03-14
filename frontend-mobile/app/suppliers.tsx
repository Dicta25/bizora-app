import { View, Text, ScrollView, TouchableOpacity, TextInput, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../src/context/AppContext';
import { Truck, Plus, Search, MessageSquare, Phone, ChevronLeft } from 'lucide-react-native';
import { useState } from 'react';
import MobileTopBar from '../src/components/MobileTopBar';
import { useRouter } from 'expo-router';

export default function SuppliersScreen() {
  const { darkMode } = useApp();
  const router = useRouter();
  const [search, setSearch] = useState('');

  // Dummy suppliers for now
  const suppliers = [
    { id: '1', name: 'Kente Thread Wholesalers', phone: '024 111 2222', location: 'Kumasi' },
    { id: '2', name: 'Silk Import Ltd', phone: '055 333 4444', location: 'Accra' },
  ];

  const filteredSuppliers = suppliers.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const bgClass = darkMode ? 'bg-slate-950' : 'bg-slate-50';
  const cardBgClass = darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';
  const textClass = darkMode ? 'text-white' : 'text-slate-900';
  const mutedTextClass = darkMode ? 'text-slate-400' : 'text-slate-500';
  const inputBgClass = darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';

  return (
    <SafeAreaView className={`flex-1 ${bgClass}`} edges={['top']}>
      <MobileTopBar showBack={true} />
      
      <View className="px-6 py-4 flex-row items-center gap-4">
        <View>
          <Text className={`text-2xl font-black ${textClass}`}>Suppliers</Text>
          <Text className={`${mutedTextClass} text-xs font-bold uppercase tracking-widest`}>Inventory Sources</Text>
        </View>
      </View>

      <View className="px-6 mb-6">
        <View className={`flex-row items-center px-4 h-12 rounded-2xl border ${inputBgClass}`}>
          <Search size={18} color={darkMode ? '#475569' : '#94a3b8'} />
          <TextInput 
            placeholder="Search suppliers..."
            placeholderTextColor={darkMode ? '#475569' : '#94a3b8'}
            className={`flex-1 ml-3 font-bold ${textClass}`}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-6">
        <View className="space-y-3">
          {filteredSuppliers.map(s => (
            <View key={s.id} className={`p-5 rounded-[2rem] border ${cardBgClass} shadow-sm`}>
              <View className="flex-row items-center mb-4">
                <View className="w-12 h-12 rounded-2xl bg-accent/10 items-center justify-center mr-4">
                  <Truck size={24} color="#F2A115" />
                </View>
                <View className="flex-1">
                  <Text className={`font-black text-lg ${textClass}`} numberOfLines={1}>{s.name}</Text>
                  <Text className={`${mutedTextClass} text-xs font-bold uppercase tracking-widest`}>{s.location}</Text>
                </View>
              </View>
              
              <View className="flex-row gap-2">
                <TouchableOpacity 
                  onPress={() => Linking.openURL(`whatsapp://send?phone=${s.phone}`)}
                  className="flex-1 h-12 bg-green-500/10 rounded-xl flex-row items-center justify-center border border-green-500/20"
                >
                  <MessageSquare size={18} color="#22c55e" />
                  <Text className="text-green-600 font-black text-xs ml-2 uppercase">WhatsApp</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => Linking.openURL(`tel:${s.phone}`)}
                  className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl items-center justify-center"
                >
                  <Phone size={18} color={darkMode ? '#94a3b8' : '#64748b'} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
