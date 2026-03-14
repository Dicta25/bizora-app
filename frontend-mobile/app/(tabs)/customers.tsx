import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../src/context/AppContext';
import { Users, Plus, Search, MessageSquare, Phone, MapPin, X, ChevronRight } from 'lucide-react-native';
import { useState, useMemo } from 'react';
import MobileTopBar from '../../src/components/MobileTopBar';

export default function CustomersScreen() {
  const { customers, darkMode, addCustomer } = useApp();
  const [search, setSearch] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  // New Customer State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const filteredCustomers = useMemo(() => 
    customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)),
    [customers, search]
  );

  const totalOwed = useMemo(() => 
    customers.reduce((sum, c) => sum + (c.balance || 0), 0),
    [customers]
  );

  const formatCurrency = (amt: number) => `GH₵ ${amt.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  const bgClass = darkMode ? 'bg-slate-950' : 'bg-slate-50';
  const cardBgClass = darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';
  const textClass = darkMode ? 'text-white' : 'text-slate-900';
  const mutedTextClass = darkMode ? 'text-slate-400' : 'text-slate-500';
  const inputBgClass = darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';

  const handleAddCustomer = () => {
    if (!newName || !newPhone) {
      Alert.alert('Missing Info', 'Name and phone number are required.');
      return;
    }
    // Note: addCustomer needs to be added to AppContext
    if (addCustomer) {
      addCustomer({ name: newName, phone: newPhone, balance: 0 });
    }
    setIsModalVisible(false);
    setNewName(''); setNewPhone(''); setNewLocation('');
  };

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\s/g, '');
    Linking.openURL(`whatsapp://send?phone=${cleanPhone}`);
  };

  return (
    <SafeAreaView className={`flex-1 ${bgClass}`} edges={['top']}>
      <MobileTopBar />
      
      <View className="px-6 py-4 flex-row items-center justify-between">
        <View>
          <Text className={`text-2xl font-black ${textClass}`}>People</Text>
          <Text className={`${mutedTextClass} text-xs font-bold uppercase tracking-widest`}>
            {customers.length} Customers
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => setIsModalVisible(true)}
          className="w-12 h-12 bg-accent rounded-2xl items-center justify-center shadow-lg shadow-accent/20"
        >
          <Plus size={24} color="#000" strokeWidth={3} />
        </TouchableOpacity>
      </View>

      {/* Summary Banner */}
      {totalOwed > 0 && (
        <View className="px-6 mb-6">
          <View className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 flex-row items-center justify-between">
            <View>
              <Text className="text-destructive text-[10px] font-black uppercase tracking-widest">Total Outstanding</Text>
              <Text className="text-destructive text-xl font-black">{formatCurrency(totalOwed)}</Text>
            </View>
            <View className="w-10 h-10 rounded-full bg-destructive/20 items-center justify-center">
              <Users size={20} color="#E65100" />
            </View>
          </View>
        </View>
      )}

      {/* Search Bar */}
      <View className="px-6 mb-6">
        <View className={`flex-row items-center px-4 h-12 rounded-2xl border ${inputBgClass}`}>
          <Search size={18} color={darkMode ? '#475569' : '#94a3b8'} />
          <TextInput 
            placeholder="Search by name or phone..."
            placeholderTextColor={darkMode ? '#475569' : '#94a3b8'}
            className={`flex-1 ml-3 font-bold ${textClass}`}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-6">
        {filteredCustomers.length === 0 ? (
          <View className="py-20 items-center justify-center">
            <Users size={64} color={darkMode ? '#1e293b' : '#e2e8f0'} />
            <Text className={`${mutedTextClass} mt-4 font-bold text-center`}>
              {search ? 'No customers found' : 'Your registry is empty. Add your first customer!'}
            </Text>
          </View>
        ) : (
          <View className="space-y-3">
            {filteredCustomers.map(customer => (
              <View key={customer.id} className={`p-5 rounded-[2rem] border ${cardBgClass} shadow-sm`}>
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-row items-center flex-1">
                    <View className="w-12 h-12 rounded-2xl bg-primary/10 items-center justify-center mr-4">
                      <Text className="text-primary font-black text-lg">{customer.name.charAt(0)}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className={`font-black text-lg ${textClass}`} numberOfLines={1}>{customer.name}</Text>
                      <Text className={`${mutedTextClass} text-xs font-bold`}>{customer.phone}</Text>
                    </View>
                  </View>
                  <View className={`px-3 py-1 rounded-full ${customer.balance > 0 ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                    <Text className={`text-[10px] font-black uppercase ${customer.balance > 0 ? 'text-destructive' : 'text-primary'}`}>
                      {customer.balance > 0 ? 'In Debt' : 'Paid Up'}
                    </Text>
                  </View>
                </View>

                {customer.balance > 0 && (
                  <View className="mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex-row justify-between items-center">
                    <Text className={`${mutedTextClass} text-xs font-bold`}>Owes you:</Text>
                    <Text className="text-destructive font-black text-base">{formatCurrency(customer.balance)}</Text>
                  </View>
                )}

                <View className="flex-row gap-2">
                  <TouchableOpacity 
                    onPress={() => handleWhatsApp(customer.phone)}
                    className="flex-1 h-12 bg-green-500/10 rounded-xl flex-row items-center justify-center border border-green-500/20"
                  >
                    <MessageSquare size={18} color="#22c55e" />
                    <Text className="text-green-600 font-black text-xs ml-2 uppercase">WhatsApp</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={() => Linking.openURL(`tel:${customer.phone}`)}
                    className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl items-center justify-center"
                  >
                    <Phone size={18} color={darkMode ? '#94a3b8' : '#64748b'} />
                  </TouchableOpacity>

                  <TouchableOpacity className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl items-center justify-center">
                    <ChevronRight size={18} color={darkMode ? '#94a3b8' : '#64748b'} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
        <View className="h-10" />
      </ScrollView>

      {/* Add Customer Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className={`rounded-t-[3rem] p-8 ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
            <View className="flex-row justify-between items-center mb-8">
              <Text className={`text-2xl font-black ${textClass}`}>New Customer</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <X size={24} color={darkMode ? '#94a3b8' : '#000'} />
              </TouchableOpacity>
            </View>

            <View className="space-y-4">
              <View>
                <Text className={`${mutedTextClass} text-[10px] font-black uppercase tracking-widest mb-2 ml-1`}>Full Name</Text>
                <TextInput 
                  placeholder="e.g. Ama Serwaa"
                  placeholderTextColor="#94a3b8"
                  className={`h-14 px-4 rounded-2xl border ${inputBgClass} font-bold ${textClass}`}
                  value={newName}
                  onChangeText={setNewName}
                />
              </View>

              <View>
                <Text className={`${mutedTextClass} text-[10px] font-black uppercase tracking-widest mb-2 ml-1`}>Phone Number</Text>
                <TextInput 
                  placeholder="024 XXX XXXX"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  className={`h-14 px-4 rounded-2xl border ${inputBgClass} font-bold ${textClass}`}
                  value={newPhone}
                  onChangeText={setNewPhone}
                />
              </View>

              <View>
                <Text className={`${mutedTextClass} text-[10px] font-black uppercase tracking-widest mb-2 ml-1`}>Location (Optional)</Text>
                <TextInput 
                  placeholder="e.g. Kumasi, Adum"
                  placeholderTextColor="#94a3b8"
                  className={`h-14 px-4 rounded-2xl border ${inputBgClass} font-bold ${textClass}`}
                  value={newLocation}
                  onChangeText={setNewLocation}
                />
              </View>

              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={handleAddCustomer}
                className="h-16 bg-primary rounded-2xl items-center justify-center mt-6 shadow-lg shadow-primary/20"
              >
                <Text className="text-white text-lg font-black">Save Customer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
