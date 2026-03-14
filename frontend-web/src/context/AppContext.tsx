import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AppContextType, Product, Sale, Expense, Customer, Supplier, StockHistoryEntry, User } from './types';
import { MOCK_USER, MOCK_PRODUCTS, MOCK_SALES, MOCK_EXPENSES, MOCK_CUSTOMERS, MOCK_SUPPLIERS, todayKey } from './mockData';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';

// Re-export types for convenience
export type { User, Product, Sale, Expense, Customer, Supplier, StockHistoryEntry, CashFloat } from './types';

const AppContext = createContext<AppContextType | null>(null);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const DEFAULT_UI_STATE = {
  isDemo: false,
  cashFloat: null,
  darkMode: false,
  themeColor: '153 82% 22%',
  pin: null,
  reminderEnabled: false,
  reminderTime: '18:00',
};

function loadUIState() {
  try {
    const raw = localStorage.getItem('bizora_ui_state');
    if (raw) return { ...DEFAULT_UI_STATE, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_UI_STATE;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContextContent>{children}</AppContextContent>
    </QueryClientProvider>
  );
}

function AppContextContent({ children }: { children: React.ReactNode }) {
  const [uiState, setUiState] = useState(loadUIState);
  const queryClient = useQueryClient();

  // Persist UI state
  useEffect(() => {
    localStorage.setItem('bizora_ui_state', JSON.stringify(uiState));
  }, [uiState]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', uiState.darkMode);
  }, [uiState.darkMode]);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary', uiState.themeColor);
  }, [uiState.themeColor]);

  // Queries
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      if (uiState.isDemo) return MOCK_USER;
      const res = await api.get('/auth/me');
      const userData = res.data;
      // Normalization shim
      if (userData && userData.is_superadmin !== undefined && userData.isSuperadmin === undefined) {
        userData.isSuperadmin = userData.is_superadmin;
      }
      return userData;
    },
    enabled: !!localStorage.getItem('bizora_token') || uiState.isDemo,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      if (uiState.isDemo) return MOCK_PRODUCTS;
      const res = await api.get('/products/');
      return res.data;
    },
    enabled: !!user,
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      if (uiState.isDemo) return MOCK_SALES;
      const res = await api.get('/sales/');
      return res.data;
    },
    enabled: !!user,
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      if (uiState.isDemo) return MOCK_EXPENSES;
      const res = await api.get('/expenses/');
      return res.data;
    },
    enabled: !!user,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      if (uiState.isDemo) return MOCK_CUSTOMERS;
      const res = await api.get('/customers/');
      return res.data;
    },
    enabled: !!user,
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      if (uiState.isDemo) return MOCK_SUPPLIERS;
      const res = await api.get('/suppliers/');
      return res.data;
    },
    enabled: !!user,
  });

  const { data: stockHistory = [] } = useQuery({
    queryKey: ['stockHistory'],
    queryFn: async () => {
      if (uiState.isDemo) return [];
      const res = await api.get('/products/history');
      return res.data;
    },
    enabled: !!user,
  });

  // Mutations
  const setUserMutation = useMutation({
    mutationFn: (user: User) => api.post('/auth/profile', user),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user'] }),
  });

  const addProductMutation = useMutation({
    mutationFn: (product: Omit<Product, 'id'>) => api.post('/products/', product),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Product> }) => api.put(`/products/${id}`, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  const addSaleMutation = useMutation({
    mutationFn: (sale: Omit<Sale, 'id'>) => api.post('/sales/', sale),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['stockHistory'] });
    },
  });

  const addExpenseMutation = useMutation({
    mutationFn: (expense: Omit<Expense, 'id'>) => api.post('/expenses/', expense),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
  });

  const addCustomerMutation = useMutation({
    mutationFn: (customer: Omit<Customer, 'id' | 'balance' | 'purchaseCount'>) => api.post('/customers/', customer),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });

  const updateCustomerMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Customer> }) => api.put(`/customers/${id}`, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });

  const addSupplierMutation = useMutation({
    mutationFn: (supplier: Omit<Supplier, 'id'>) => api.post('/suppliers/', supplier),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suppliers'] }),
  });

  // Wrapper functions to match original context API
  const setUser = (user: User) => setUserMutation.mutate(user);
  const addProduct = (product: Omit<Product, 'id'>) => addProductMutation.mutate(product);
  const updateProduct = (id: string, updates: Partial<Product>) => updateProductMutation.mutate({ id, updates });
  const deleteProduct = (id: string) => deleteProductMutation.mutate(id);
  const addSale = (sale: Omit<Sale, 'id'>) => addSaleMutation.mutate(sale);
  const addExpense = (expense: Omit<Expense, 'id'>) => addExpenseMutation.mutate(expense);
  const addCustomer = (customer: Omit<Customer, 'id' | 'balance' | 'purchaseCount'>) => addCustomerMutation.mutate(customer);
  const updateCustomer = (id: string, updates: Partial<Customer>) => updateCustomerMutation.mutate({ id, updates });
  const addSupplier = (supplier: Omit<Supplier, 'id'>) => addSupplierMutation.mutate(supplier);
  
  const updateProductStock = (id: string, delta: number, reason = 'Manual adjustment') => {
    const product = products.find(p => p.id === id);
    if (product) {
      updateProduct(id, { stock: Math.max(0, product.stock + delta) });
    }
  };

  const logout = useCallback(async () => {
    localStorage.removeItem('bizora_token');
    localStorage.removeItem('bizora_ui_state');
    setUiState(DEFAULT_UI_STATE);
    queryClient.clear();
  }, [queryClient]);

  const enterDemoMode = useCallback(() => {
    setUiState(prev => ({ ...prev, isDemo: true }));
  }, []);

  const toggleDarkMode = () => setUiState(prev => ({ ...prev, darkMode: !prev.darkMode }));
  const setThemeColor = (color: string) => setUiState(prev => ({ ...prev, themeColor: color }));
  const setPin = (pin: string | null) => setUiState(prev => ({ ...prev, pin }));
  const setReminderEnabled = (enabled: boolean) => setUiState(prev => ({ ...prev, reminderEnabled: enabled }));
  const setReminderTime = (time: string) => setUiState(prev => ({ ...prev, reminderTime: time }));
  const setCashFloat = (amount: number) => setUiState(prev => ({ ...prev, cashFloat: { date: todayKey(), openingCash: amount } }));

  const lowStockProducts = products.filter(p => p.stock <= p.restockLevel && p.stock > 0);

  const value: AppContextType = {
    user: user || null,
    products,
    sales,
    expenses,
    customers,
    suppliers,
    stockHistory,
    ...uiState,
    setUser,
    addProduct,
    updateProduct,
    updateProductStock,
    deleteProduct,
    addSale,
    addExpense,
    addCustomer,
    updateCustomer,
    deleteCustomer: (id: string) => {}, // Implement if needed
    addSupplier,
    deleteSupplier: (id: string) => {}, // Implement if needed
    enterDemoMode,
    logout,
    setCashFloat,
    toggleDarkMode,
    setThemeColor,
    setPin,
    setReminderEnabled,
    setReminderTime,
    lowStockProducts,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
