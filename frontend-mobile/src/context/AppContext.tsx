import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

export interface User {
  phone: string;
  businessName: string;
  businessType: string;
  location: string;
}

export interface Product {
  id: string;
  name: string;
  stock: number;
  price: number;
  image?: string;
  restockLevel: number;
}

export interface Sale {
  id: string;
  productName: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  date: string;
  paymentMethod: 'cash' | 'momo' | 'bank' | 'credit';
  customerId?: string;
  customerName?: string;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  balance: number;
}

interface AppContextType {
  user: User | null;
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  customers: Customer[];
  setUser: (user: User | null) => void;
  isLoading: boolean;
  logout: () => void;
  enterDemoMode: () => void;
  addSale: (sale: Omit<Sale, 'id'>) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateProductStock: (id: string, delta: number) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

const today = new Date().toISOString().split('T')[0];

const MOCK_DATA = {
  products: [
    { id: '1', name: 'Blue Kente Cloth', stock: 12, price: 450, restockLevel: 5 },
    { id: '2', name: 'Golden Thread', stock: 3, price: 85, restockLevel: 10 },
    { id: '3', name: 'Red Ankara Fabric', stock: 25, price: 120, restockLevel: 8 },
  ],
  sales: [
    { id: 's1', productName: 'Blue Kente Cloth', quantity: 1, pricePerUnit: 450, totalPrice: 450, date: `${today}T10:30:00Z`, paymentMethod: 'cash' as const },
    { id: 's2', productName: 'Red Ankara Fabric', quantity: 2, pricePerUnit: 120, totalPrice: 240, date: `${today}T11:45:00Z`, paymentMethod: 'momo' as const },
    { id: 's3', productName: 'Golden Thread', quantity: 5, pricePerUnit: 85, totalPrice: 425, date: `${today}T14:20:00Z`, paymentMethod: 'cash' as const },
    { id: 's4', productName: 'Silk Weaving Kit', quantity: 1, pricePerUnit: 150, totalPrice: 150, date: `${today}T15:10:00Z`, paymentMethod: 'bank' as const },
    { id: 's5', productName: 'Custom Dye Set', quantity: 1, pricePerUnit: 75, totalPrice: 75, date: `${today}T16:00:00Z`, paymentMethod: 'cash' as const },
  ],
  expenses: [
    { id: 'e1', amount: 50, description: 'Transport to market', category: 'Transport', date: `${today}T08:00:00Z` },
    { id: 'e2', amount: 15, description: 'Lunch', category: 'Food', date: `${today}T13:00:00Z` },
    { id: 'e3', amount: 120, description: 'Shop Electricity', category: 'Utilities', date: `${today}T09:30:00Z` },
  ],
  customers: [
    { id: 'c1', name: 'Ama Serwaa', phone: '024 444 5555', balance: 120 },
    { id: 'c2', name: 'Kofi Mensah', phone: '055 123 9999', balance: 0 },
  ]
};

const MOCK_USER: User = {
  phone: '024 123 4567',
  businessName: "Akua's Kente Store",
  businessType: 'Trader',
  location: 'Kantamanto, Accra',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [savedUser, savedProducts, savedSales, savedExpenses, savedCustomers, savedDarkMode] = await Promise.all([
        SecureStore.getItemAsync('bizora_user'),
        SecureStore.getItemAsync('bizora_products'),
        SecureStore.getItemAsync('bizora_sales'),
        SecureStore.getItemAsync('bizora_expenses'),
        SecureStore.getItemAsync('bizora_customers'),
        SecureStore.getItemAsync('bizora_darkmode'),
      ]);

      if (savedUser) {
        setUserState(JSON.parse(savedUser));
        if (savedProducts) setProducts(JSON.parse(savedProducts));
        if (savedSales) setSales(JSON.parse(savedSales));
        if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
        if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
      } else {
        // First time? Auto-load demo for easier review
        await enterDemoMode();
      }
      
      if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));
    } catch (e) {
      console.error('Failed to load data', e);
    } finally {
      setIsLoading(false);
    }
  }

  const saveData = async (key: string, data: any) => {
    try {
      await SecureStore.setItemAsync(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Failed to save ${key}`, e);
    }
  };

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    saveData('bizora_darkmode', next);
  };

  const setUser = async (newUser: User | null) => {
    setUserState(newUser);
    if (newUser) await saveData('bizora_user', newUser);
    else await SecureStore.deleteItemAsync('bizora_user');
  };

  const addSale = (sale: Omit<Sale, 'id'>) => {
    const newSale = { ...sale, id: Math.random().toString(36).substr(2, 9) };
    const updated = [newSale, ...sales];
    setSales(updated);
    saveData('bizora_sales', updated);
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = { ...expense, id: Math.random().toString(36).substr(2, 9) };
    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    saveData('bizora_expenses', updated);
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: Math.random().toString(36).substr(2, 9) };
    const updated = [...products, newProduct];
    setProducts(updated);
    saveData('bizora_products', updated);
  };

  const addCustomer = (customer: Omit<Customer, 'id'>) => {
    const newCustomer = { ...customer, id: Math.random().toString(36).substr(2, 9) };
    const updated = [...customers, newCustomer];
    setCustomers(updated);
    saveData('bizora_customers', updated);
  };

  const updateProductStock = (id: string, delta: number) => {
    const updated = products.map(p => 
      p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p
    );
    setProducts(updated);
    saveData('bizora_products', updated);
  };

  const logout = () => {
    setUser(null);
    setProducts([]);
    setSales([]);
    setExpenses([]);
    setCustomers([]);
  };

  const enterDemoMode = async () => {
    // Explicitly update state
    setUserState(MOCK_USER);
    setProducts(MOCK_DATA.products);
    setSales(MOCK_DATA.sales);
    setExpenses(MOCK_DATA.expenses);
    setCustomers(MOCK_DATA.customers);
    
    // Force write to SecureStore
    try {
      await SecureStore.setItemAsync('bizora_user', JSON.stringify(MOCK_USER));
      await SecureStore.setItemAsync('bizora_products', JSON.stringify(MOCK_DATA.products));
      await SecureStore.setItemAsync('bizora_sales', JSON.stringify(MOCK_DATA.sales));
      await SecureStore.setItemAsync('bizora_expenses', JSON.stringify(MOCK_DATA.expenses));
      await SecureStore.setItemAsync('bizora_customers', JSON.stringify(MOCK_DATA.customers));
    } catch (e) {
      console.error("Critical: Failed to persist demo data", e);
    }
  };

  return (
    <AppContext.Provider value={{
      user, products, sales, expenses, customers,
      setUser, isLoading, logout, enterDemoMode,
      addSale, addExpense, addProduct, addCustomer, updateProductStock,
      darkMode, toggleDarkMode,
      isDrawerOpen, setDrawerOpen
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
