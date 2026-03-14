import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../src/context/AppContext';
import { Receipt, Minus, Plus, ChevronDown, CreditCard, DollarSign, Smartphone, Landmark } from 'lucide-react-native';
import { useState, useMemo } from 'react';
import MobileTopBar from '../../src/components/MobileTopBar';
import { useRouter } from 'expo-router';

const PAYMENT_METHODS = [
  { key: 'cash', label: 'Cash', icon: DollarSign, color: '#0A6640' },
  { key: 'momo', label: 'MoMo', icon: Smartphone, color: '#F2A115' },
  { key: 'bank', label: 'Bank', icon: Landmark, color: '#3b82f6' },
  { key: 'credit', label: 'Credit', icon: CreditCard, color: '#ef4444' },
];

export default function SaleScreen() {
  const { products, darkMode, addSale, updateProductStock, customers } = useApp();
  const router = useRouter();
  
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const total = quantity * (parseFloat(pricePerUnit) || 0);

  const bgClass = darkMode ? 'bg-slate-950' : 'bg-slate-50';
  const cardBgClass = darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';
  const textClass = darkMode ? 'text-white' : 'text-slate-900';
  const mutedTextClass = darkMode ? 'text-slate-400' : 'text-slate-500';
  const inputBgClass = darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';

  const handleSelectProduct = (p: any) => {
    setSelectedProductId(p.id);
    setPricePerUnit(p.price.toString());
    setShowProductDropdown(false);
  };

  const handleRecordSale = () => {
    if (!selectedProductId || !pricePerUnit || quantity < 1) {
      Alert.alert('Missing Info', 'Please select a product and set price/quantity.');
      return;
    }

    if (selectedProduct && selectedProduct.stock < quantity) {
      Alert.alert('Low Stock', `Only ${selectedProduct.stock} items left in stock.`);
      return;
    }

    addSale({
      productName: selectedProduct?.name || 'Unknown',
      quantity,
      pricePerUnit: parseFloat(pricePerUnit),
      totalPrice: total,
      date: new Date().toISOString(),
      paymentMethod: paymentMethod as any,
    });

    updateProductStock(selectedProductId, -quantity);
    
    Alert.alert('Success', 'Sale recorded successfully!', [
      { text: 'OK', onPress: () => router.push('/(tabs)') }
    ]);

    // Reset form
    setSelectedProductId('');
    setQuantity(1);
    setPricePerUnit('');
  };

  return (
    <SafeAreaView className={`flex-1 ${bgClass}`} edges={['top']}>
      <MobileTopBar />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6 pt-4">
          <View className="mb-6">
            <Text className={`text-2xl font-black ${textClass}`}>New Sale</Text>
            <Text className={`${mutedTextClass} text-xs font-bold uppercase tracking-widest`}>Record a transaction</Text>
          </View>

          {/* Product Selection */}
          <View className="mb-6">
            <Text className={`${mutedTextClass} text-[10px] font-black uppercase tracking-widest mb-2 ml-1`}>Select Product</Text>
            <TouchableOpacity 
              onPress={() => setShowProductDropdown(!showProductDropdown)}
              className={`h-14 px-4 rounded-2xl border ${inputBgClass} flex-row items-center justify-between`}
            >
              <Text className={`font-bold ${selectedProduct ? textClass : 'text-slate-400'}`}>
                {selectedProduct ? selectedProduct.name : 'Choose a product...'}
              </Text>
              <ChevronDown size={20} color="#94a3b8" />
            </TouchableOpacity>

            {showProductDropdown && (
              <View className={`mt-2 rounded-2xl border ${cardBgClass} overflow-hidden shadow-xl`}>
                {products.map(p => (
                  <TouchableOpacity 
                    key={p.id} 
                    onPress={() => handleSelectProduct(p)}
                    className="p-4 border-b border-slate-50 dark:border-slate-800 flex-row justify-between"
                  >
                    <Text className={`font-bold ${textClass}`}>{p.name}</Text>
                    <Text className="text-primary font-black text-xs">{p.stock} left</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Quantity and Price */}
          <View className="flex-row gap-4 mb-6">
            <View className="flex-1">
              <Text className={`${mutedTextClass} text-[10px] font-black uppercase tracking-widest mb-2 ml-1`}>Quantity</Text>
              <View className={`h-14 rounded-2xl border ${inputBgClass} flex-row items-center px-2`}>
                <TouchableOpacity 
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 items-center justify-center"
                >
                  <Minus size={18} color={darkMode ? '#94a3b8' : '#64748b'} />
                </TouchableOpacity>
                <TextInput 
                  keyboardType="numeric"
                  className={`flex-1 text-center font-black text-lg ${textClass}`}
                  value={quantity.toString()}
                  onChangeText={v => setQuantity(parseInt(v) || 0)}
                />
                <TouchableOpacity 
                  onPress={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 items-center justify-center"
                >
                  <Plus size={18} color={darkMode ? '#94a3b8' : '#64748b'} />
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-1">
              <Text className={`${mutedTextClass} text-[10px] font-black uppercase tracking-widest mb-2 ml-1`}>Price (Unit)</Text>
              <View className={`h-14 px-4 rounded-2xl border ${inputBgClass} flex-row items-center`}>
                <Text className="text-primary font-black mr-1">₵</Text>
                <TextInput 
                  placeholder="0.00"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  className={`flex-1 font-black text-lg ${textClass}`}
                  value={pricePerUnit}
                  onChangeText={setPricePerUnit}
                />
              </View>
            </View>
          </View>

          {/* Payment Method */}
          <View className="mb-8">
            <Text className={`${mutedTextClass} text-[10px] font-black uppercase tracking-widest mb-3 ml-1`}>Payment Method</Text>
            <View className="flex-row flex-wrap gap-3">
              {PAYMENT_METHODS.map(method => (
                <TouchableOpacity 
                  key={method.key}
                  onPress={() => setPaymentMethod(method.key)}
                  className={`flex-1 min-w-[80px] p-3 rounded-2xl border items-center justify-center ${paymentMethod === method.key ? 'bg-primary border-primary' : cardBgClass}`}
                >
                  <method.icon size={20} color={paymentMethod === method.key ? '#fff' : method.color} />
                  <Text className={`mt-1 text-[10px] font-black uppercase ${paymentMethod === method.key ? 'text-white' : mutedTextClass}`}>
                    {method.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Grand Total Summary */}
          <View className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 items-center justify-center mb-10">
            <Text className="text-primary text-xs font-black uppercase tracking-[0.2em] mb-2">Total Amount</Text>
            <Text className="text-primary text-5xl font-black tabular-nums">GH₵ {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
          </View>

          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={handleRecordSale}
            className="h-20 bg-primary rounded-[2rem] items-center justify-center shadow-xl shadow-primary/30 mb-20"
          >
            <Text className="text-white text-xl font-black">Complete Sale</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
