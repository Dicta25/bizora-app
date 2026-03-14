import { Tabs } from 'expo-router';
import { LayoutDashboard, Package, Receipt, Users, Settings } from 'lucide-react-native';
import { useApp } from '../../src/context/AppContext';
import MobileDrawer from '../../src/components/MobileDrawer';

export default function TabLayout() {
  const { darkMode } = useApp();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0A6640',
        tabBarInactiveTintColor: darkMode ? '#475569' : '#94a3b8',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: darkMode ? '#1e293b' : '#f1f5f9',
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
          backgroundColor: darkMode ? '#020617' : '#fff',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
        headerStyle: {
          backgroundColor: '#0A6640',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '900',
          fontSize: 20,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Bizora',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          tabBarLabel: 'Stock',
          tabBarIcon: ({ color }) => <Package size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="sale"
        options={{
          title: 'Record Sale',
          tabBarLabel: 'Sale',
          tabBarIcon: ({ color }) => <Receipt size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: 'Customers',
          tabBarLabel: 'People',
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
