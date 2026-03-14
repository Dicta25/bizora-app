import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../src/context/AppContext';
import { Package, Plus, Search, Minus, History, Trash2, Camera, X } from 'lucide-react-native';
import { useState, useMemo } from 'react';
import MobileTopBar from '../../src/components/MobileTopBar';

export default function InventoryScreen() {
  const { products, darkMode, addProduct } = useApp();
  const [search, setSearch] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // Modal State
  const [newName, setNewName] = useState('');
  const [newStock, setNewStock] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const filteredProducts = useMemo(() => 
    products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  );

  const formatCurrency = (amt: number) => `GH₵ ${amt.toLocaleString()}`;

  const bgClass = darkMode ? 'bg-slate-950' : 'bg-slate-50';
  const cardBgClass = darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';
  const textClass = darkMode ? 'text-white' : 'text-slate-900';
  const mutedTextClass = darkMode ? 'text-slate-400' : 'text-slate-500';
  const inputBgClass = darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';

  const stockColor = (stock: number, restockLevel: number) => {
    if (stock === 0) return 'text-destructive';
    if (stock <= restockLevel) return 'text-accent';
    return 'text-primary';
  };

  const handleAddProduct = () => {
    if (!newName || !newStock || !newPrice) {
      Alert.alert('Missing Fields', 'Please fill in all product details.');
      return;
    }
    // Logic to add product will go here (needs addProduct in context)
    setIsModalVisible(false);
    setNewName(''); setNewStock(''); setNewPrice('');
  };

  return (
    <SafeAreaView className={`flex-1 ${bgClass}`} edges={['top']}>
      <MobileTopBar />
      
      <View className="px-6 py-4 flex-row items-center justify-between">
        <View>
          <Text className={`text-2xl font-black ${textClass}`}>Stock</Text>
          <Text className={`${mutedTextClass} text-xs font-bold uppercase tracking-widest`}>
            {products.length} Products Total
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => setIsModalVisible(true)}
          className="w-12 h-12 bg-accent rounded-2xl items-center justify-center shadow-lg shadow-accent/20"
        >
          <Plus size={24} color="#000" strokeWidth={3} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="px-6 mb-6">
        <View className={`flex-row items-center px-4 h-12 rounded-2xl border ${inputBgClass}`}>
          <Search size={18} color={darkMode ? '#475569' : '#94a3b8'} />
          <TextInput 
            placeholder="Search products..."
            placeholderTextColor={darkMode ? '#475569' : '#94a3b8'}
            className={`flex-1 ml-3 font-bold ${textClass}`}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-6">
        {filteredProducts.length === 0 ? (
          <View className="py-20 items-center justify-center">
            <Package size={64} color={darkMode ? '#1e293b' : '#e2e8f0'} />
            <Text className={`${mutedTextClass} mt-4 font-bold text-center`}>
              {search ? 'No products match your search' : 'Your inventory is empty. Add your first product!'}
            </Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap justify-between">
            {filteredProducts.map(product => (
              <View key={product.id} className={`w-[48%] mb-4 p-4 rounded-3xl border ${cardBgClass} shadow-sm`}>
                <View className="w-full aspect-square bg-slate-100 rounded-2xl mb-3 items-center justify-center overflow-hidden">
                  {product.image ? (
                    <Image source={{ uri: product.image }} className="w-full h-full" />
                  ) : (
                    <Package size={32} color="#cbd5e1" />
                  )}
                </View>
                <Text className={`font-black ${textClass}`} numberOfLines={1}>{product.name}</Text>
                <Text className="text-primary font-black text-xs mt-1">{formatCurrency(product.price)}</Text>
                
                <View className="mt-3 pt-3 border-t border-slate-50 dark:border-slate-800 flex-row justify-between items-center">
                  <Text className={`text-[10px] font-black uppercase ${stockColor(product.stock, product.restockLevel)}`}>
                    {product.stock} in stock
                  </Text>
                  <TouchableOpacity>
                    <Plus size={16} color={darkMode ? '#94a3b8' : '#64748b'} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
        <View className="h-10" />
      </ScrollView>

      {/* Add Product Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className={`rounded-t-[3rem] p-8 ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
            <View className="flex-row justify-between items-center mb-8">
              <Text className={`text-2xl font-black ${textClass}`}>Add Product</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <X size={24} color={darkMode ? '#94a3b8' : '#000'} />
              </TouchableOpacity>
            </View>

            <View className="space-y-4">
              <View>
                <Text className={`${mutedTextClass} text-[10px] font-black uppercase tracking-widest mb-2 ml-1`}>Product Name</Text>
                <TextInput 
                  placeholder="e.g. Blue Kente Cloth"
                  placeholderTextColor="#94a3b8"
                  className={`h-14 px-4 rounded-2xl border ${inputBgClass} font-bold ${textClass}`}
                  value={newName}
                  onChangeText={setNewName}
                />
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className={`${mutedTextClass} text-[10px] font-black uppercase tracking-widest mb-2 ml-1`}>Initial Stock</Text>
                  <TextInput 
                    placeholder="0"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    className={`h-14 px-4 rounded-2xl border ${inputBgClass} font-bold ${textClass}`}
                    value={newStock}
                    onChangeText={setNewStock}
                  />
                </View>
                <View className="flex-1">
                  <Text className={`${mutedTextClass} text-[10px] font-black uppercase tracking-widest mb-2 ml-1`}>Price (GH₵)</Text>
                  <TextInput 
                    placeholder="0.00"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    className={`h-14 px-4 rounded-2xl border ${inputBgClass} font-bold ${textClass}`}
                    value={newPrice}
                    onChangeText={setNewPrice}
                  />
                </View>
              </View>

              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={handleAddProduct}
                className="h-16 bg-primary rounded-2xl items-center justify-center mt-6 shadow-lg shadow-primary/20"
              >
                <Text className="text-white text-lg font-black">Save Product</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
