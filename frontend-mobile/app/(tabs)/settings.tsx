import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../src/context/AppContext';
import { 
  User, 
  Building2, 
  Palette, 
  Bell, 
  Shield, 
  LogOut, 
  Download, 
  ChevronRight, 
  Moon, 
  Sun,
  X,
  Check,
  MapPin,
  Phone
} from 'lucide-react-native';
import { useState } from 'react';
import MobileTopBar from '../../src/components/MobileTopBar';

export default function SettingsScreen() {
  const { user, setUser, logout, darkMode, toggleDarkMode } = useApp();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // Edit State
  const [editName, setEditName] = useState(user?.businessName || '');
  const [editLocation, setEditLocation] = useState(user?.location || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');

  const bgClass = darkMode ? 'bg-slate-950' : 'bg-slate-50';
  const cardBgClass = darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';
  const textClass = darkMode ? 'text-white' : 'text-slate-900';
  const mutedTextClass = darkMode ? 'text-slate-400' : 'text-slate-500';
  const inputBgClass = darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';

  const handleUpdateProfile = () => {
    if (user) {
      setUser({
        ...user,
        businessName: editName,
        location: editLocation,
        phone: editPhone
      });
      setIsEditModalVisible(false);
      Alert.alert('Profile Updated', 'Your business details have been saved.');
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out? Your data will remain on this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout }
    ]);
  };

  const SettingItem = ({ icon: Icon, label, value, onPress, isSwitch, switchValue, onSwitchChange }: any) => (
    <TouchableOpacity 
      onPress={onPress}
      disabled={isSwitch}
      activeOpacity={0.7}
      className={`flex-row items-center justify-between p-5 border-b border-slate-50 dark:border-slate-800 ${cardBgClass}`}
    >
      <View className="flex-row items-center gap-4">
        <View className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 items-center justify-center">
          <Icon size={20} color={darkMode ? '#94a3b8' : '#64748b'} />
        </View>
        <Text className={`font-bold text-base ${textClass}`}>{label}</Text>
      </View>
      {isSwitch ? (
        <Switch 
          value={switchValue} 
          onValueChange={onSwitchChange}
          trackColor={{ false: '#e2e8f0', true: '#0A6640' }}
        />
      ) : (
        <View className="flex-row items-center gap-2">
          {value && <Text className={mutedTextClass}>{value}</Text>}
          <ChevronRight size={18} color="#94a3b8" />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className={`flex-1 ${bgClass}`} edges={['top']}>
      <MobileTopBar />
      
      <ScrollView className="flex-1 px-6">
        <View className="py-6">
          <Text className={`text-2xl font-black ${textClass} mb-6`}>Settings</Text>

          {/* User Profile Summary */}
          <View className={`rounded-[2rem] p-6 border ${cardBgClass} shadow-sm mb-8`}>
            <View className="flex-row items-center gap-4 mb-6">
              <View className="w-20 h-20 rounded-3xl bg-primary items-center justify-center shadow-lg shadow-primary/20">
                <Text className="text-white text-3xl font-black italic">{user?.businessName?.charAt(0)}</Text>
              </View>
              <View className="flex-1">
                <Text className={`text-xl font-black ${textClass}`}>{user?.businessName}</Text>
                <Text className={`${mutedTextClass} font-bold`}>{user?.phone}</Text>
                <Text className={`${mutedTextClass} text-xs mt-1`}>{user?.location}</Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={() => setIsEditModalVisible(true)}
              className="h-12 bg-primary/10 rounded-xl items-center justify-center border border-primary/20"
            >
              <Text className="text-primary font-black uppercase text-xs tracking-widest">Edit Business Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Preferences Section */}
          <Text className={`${mutedTextClass} text-[10px] font-black uppercase tracking-widest mb-3 ml-1`}>Preferences</Text>
          <View className={`rounded-[2rem] border overflow-hidden mb-8 ${darkMode ? 'border-slate-800' : 'border-slate-100'} shadow-sm`}>
            <SettingItem 
              icon={darkMode ? Sun : Moon} 
              label="Dark Mode" 
              isSwitch={true} 
              switchValue={darkMode} 
              onSwitchChange={toggleDarkMode}
            />
            <SettingItem 
              icon={Palette} 
              label="Brand Colors" 
              value="Kente Green"
            />
            <SettingItem 
              icon={Bell} 
              label="Reminders" 
              value="18:00 PM"
            />
          </View>

          {/* Security & Data */}
          <Text className={`${mutedTextClass} text-[10px] font-black uppercase tracking-widest mb-3 ml-1`}>Security & Data</Text>
          <View className={`rounded-[2rem] border overflow-hidden mb-8 ${darkMode ? 'border-slate-800' : 'border-slate-100'} shadow-sm`}>
            <SettingItem 
              icon={Shield} 
              label="App PIN Lock" 
              value={user ? "Protected" : "None"}
            />
            <SettingItem 
              icon={Download} 
              label="Export Data" 
              value="CSV / PDF"
            />
          </View>

          {/* Danger Zone */}
          <TouchableOpacity 
            onPress={handleLogout}
            className="h-16 bg-destructive/10 rounded-[2rem] flex-row items-center justify-center border border-destructive/20 mb-10"
          >
            <LogOut size={20} color="#E65100" />
            <Text className="text-destructive text-lg font-black ml-2 uppercase tracking-widest">Log Out</Text>
          </TouchableOpacity>

          <Text className={`${mutedTextClass} text-center text-xs font-bold uppercase tracking-widest mb-10`}>
            Bizora v1.0.0 (Native)
          </Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditModalVisible}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className={`rounded-t-[3rem] p-8 ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
            <View className="flex-row justify-between items-center mb-8">
              <Text className={`text-2xl font-black ${textClass}`}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <X size={24} color={darkMode ? '#94a3b8' : '#000'} />
              </TouchableOpacity>
            </View>

            <View className="space-y-4">
              <View>
                <Text className={`${mutedTextClass} text-[10px] font-black uppercase tracking-widest mb-2 ml-1`}>Business Name</Text>
                <View className={`h-14 px-4 rounded-2xl border ${inputBgClass} flex-row items-center`}>
                  <Building2 size={18} color="#0A6640" className="mr-3" />
                  <TextInput 
                    className={`flex-1 font-bold ${textClass}`}
                    value={editName}
                    onChangeText={setEditName}
                  />
                </View>
              </View>

              <View>
                <Text className={`${mutedTextClass} text-[10px] font-black uppercase tracking-widest mb-2 ml-1`}>Phone Number</Text>
                <View className={`h-14 px-4 rounded-2xl border ${inputBgClass} flex-row items-center`}>
                  <Phone size={18} color="#0A6640" className="mr-3" />
                  <TextInput 
                    keyboardType="phone-pad"
                    className={`flex-1 font-bold ${textClass}`}
                    value={editPhone}
                    onChangeText={setEditPhone}
                  />
                </View>
              </View>

              <View>
                <Text className={`${mutedTextClass} text-[10px] font-black uppercase tracking-widest mb-2 ml-1`}>Location</Text>
                <View className={`h-14 px-4 rounded-2xl border ${inputBgClass} flex-row items-center`}>
                  <MapPin size={18} color="#0A6640" className="mr-3" />
                  <TextInput 
                    className={`flex-1 font-bold ${textClass}`}
                    value={editLocation}
                    onChangeText={setEditLocation}
                  />
                </View>
              </View>

              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={handleUpdateProfile}
                className="h-16 bg-primary rounded-2xl items-center justify-center mt-6 shadow-lg shadow-primary/20"
              >
                <Text className="text-white text-lg font-black">Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
