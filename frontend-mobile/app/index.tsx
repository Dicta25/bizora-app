import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowRight, Package, Receipt } from 'lucide-react-native';
import { useApp } from '../src/context/AppContext';
import { useEffect } from 'react';
import { MotiView } from 'moti';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, enterDemoMode } = useApp();

  // Stagger helper
  const delay = (index: number) => index * 100 + 300;

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  const handleDemo = async () => {
    await enterDemoMode();
    router.replace('/(tabs)');
  };

  return (
    <View 
      className="flex-1 bg-background"
      style={{ 
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <View className="flex-1 px-8 justify-center">
        {/* Logo Section */}
        <MotiView 
          from={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring' }}
          className="items-center mb-12"
        >
          <View className="w-20 h-20 bg-primary rounded-3xl items-center justify-center shadow-xl">
            <Text className="text-white text-4xl font-black italic">B</Text>
          </View>
          <Text className="text-4xl font-black tracking-tighter mt-4 text-foreground">Bizora</Text>
          <View className="flex-row mt-2">
            <View className="h-1 w-6 bg-primary rounded-l-full" />
            <View className="h-1 w-6 bg-accent" />
            <View className="h-1 w-6 bg-destructive rounded-r-full" />
          </View>
        </MotiView>

        {/* Hero Text */}
        <MotiView 
          from={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 200 }}
          className="mb-12"
        >
          <Text className="text-3xl font-black leading-tight text-center">
            Your business in your pocket.
          </Text>
          <Text className="text-muted-foreground text-center mt-4 text-lg">
            Track sales, manage inventory, and grow your profit anywhere.
          </Text>
        </MotiView>

        {/* Features Quick List */}
        <View className="mb-12">
          <MotiView 
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ delay: 400 }}
            className="flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-secondary mb-4"
          >
            <View className="w-10 h-10 bg-primary/10 rounded-xl items-center justify-center">
              <Receipt size={20} color="#0A6640" />
            </View>
            <Text className="font-bold text-base flex-1">Record Sales & Expenses</Text>
          </MotiView>
          
          <MotiView 
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ delay: 500 }}
            className="flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-secondary"
          >
            <View className="w-10 h-10 bg-accent/10 rounded-xl items-center justify-center">
              <Package size={20} color="#F2A115" />
            </View>
            <Text className="font-bold text-base flex-1">Inventory Management</Text>
          </MotiView>
        </View>

        {/* Actions */}
        <MotiView 
          from={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 700 }}
          className="gap-4"
        >
          <TouchableOpacity 
            activeOpacity={0.8}
            className="h-16 bg-primary rounded-2xl items-center justify-center flex-row shadow-lg"
            onPress={() => router.push('/onboarding')}
          >
            <Text className="text-white text-lg font-black mr-2">Get Started</Text>
            <ArrowRight size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.6}
            className="h-16 border-2 border-secondary rounded-2xl items-center justify-center"
            onPress={handleDemo}
          >
            <Text className="text-foreground text-lg font-bold">Try Demo Mode</Text>
          </TouchableOpacity>
        </MotiView>
      </View>
      
      <View className="p-8 items-center">
        <Text className="text-muted-foreground text-xs font-medium uppercase tracking-widest">
          Build for Modern African Business
        </Text>
      </View>
    </View>
  );
}
