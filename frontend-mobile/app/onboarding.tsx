import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useApp } from '../src/context/AppContext';
import { useRouter } from 'expo-router';
import { ArrowLeft, Building2, Phone, MapPin, Briefcase } from 'lucide-react-native';

const BUSINESS_TYPES = ['Trader', 'Salon', 'Food Vendor', 'Seamstress', 'Other'];

export default function OnboardingScreen() {
  const { setUser } = useApp();
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [location, setLocation] = useState('');

  const canSubmit = phone.length >= 10 && businessName && businessType && location;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setUser({ phone, businessName, businessType, location });
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mt-4 w-10 h-10 items-center justify-center rounded-full bg-white border border-secondary"
          >
            <ArrowLeft size={24} color="#666" />
          </TouchableOpacity>

          <View className="mt-8 mb-10">
            <Text className="text-3xl font-black text-foreground">Setup your business</Text>
            <Text className="text-muted-foreground mt-2 text-lg">Tell us a bit about what you do.</Text>
          </View>

          <View className="space-y-6">
            <View>
              <Text className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 ml-1">Phone Number</Text>
              <View className="flex-row items-center bg-white border border-secondary rounded-2xl px-4 h-14">
                <Phone size={20} color="#0A6640" className="mr-3" />
                <TextInput 
                  placeholder="024 123 4567"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  className="flex-1 text-base font-bold"
                />
              </View>
            </View>

            <View>
              <Text className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 ml-1">Business Name</Text>
              <View className="flex-row items-center bg-white border border-secondary rounded-2xl px-4 h-14">
                <Building2 size={20} color="#0A6640" className="mr-3" />
                <TextInput 
                  placeholder="e.g. Akua's Store"
                  value={businessName}
                  onChangeText={setBusinessName}
                  className="flex-1 text-base font-bold"
                />
              </View>
            </View>

            <View>
              <Text className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 ml-1">Business Type</Text>
              <View className="flex-row flex-wrap gap-2">
                {BUSINESS_TYPES.map(type => (
                  <TouchableOpacity 
                    key={type}
                    onPress={() => setBusinessType(type)}
                    className={`px-4 py-2 rounded-full border ${businessType === type ? 'bg-primary border-primary' : 'bg-white border-secondary'}`}
                  >
                    <Text className={`font-bold ${businessType === type ? 'text-white' : 'text-muted-foreground'}`}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 ml-1">Location</Text>
              <View className="flex-row items-center bg-white border border-secondary rounded-2xl px-4 h-14">
                <MapPin size={20} color="#0A6640" className="mr-3" />
                <TextInput 
                  placeholder="e.g. Kantamanto, Accra"
                  value={location}
                  onChangeText={setLocation}
                  className="flex-1 text-base font-bold"
                />
              </View>
            </View>
          </View>

          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={handleSubmit}
            disabled={!canSubmit}
            className={`h-16 rounded-2xl items-center justify-center mt-10 mb-10 shadow-lg ${canSubmit ? 'bg-primary shadow-primary/30' : 'bg-muted'}`}
          >
            <Text className="text-white text-lg font-black">Create My Business</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
