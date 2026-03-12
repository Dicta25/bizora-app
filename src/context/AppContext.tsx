import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AppState, AppContextType, Product, Sale, Expense, Customer, Supplier, StockHistoryEntry } from './types';
import { MOCK_USER, MOCK_PRODUCTS, MOCK_SALES, MOCK_EXPENSES, MOCK_CUSTOMERS, MOCK_SUPPLIERS, todayKey } from './mockData';

// Re-export types for convenience
export type { User, Product, Sale, Expense, Customer, Supplier, StockHistoryEntry, CashFloat } from './types';

const AppContext = createContext<AppContextType | null>(null);
const uid = () => Math.random().toString(36).slice(2, 10);

const DEFAULT_STATE: AppState = {
  user: null, products: [], sales: [], expenses: [], customers: [], suppliers: [],
  stockHistory: [], isDemo: false, cashFloat: null, darkMode: false,
  themeColor: '153 82% 22%', pin: null, reminderEnabled: false, reminderTime: '18:00',
};

function loadState(): AppState {
  try {
    const raw = localStorage.getItem('bizora_state');
    if (raw) {
      const p = JSON.parse(raw);
      return {
        ...DEFAULT_STATE, ...p,
        customers: p.customers ?? [], suppliers: p.suppliers ?? [],
        stockHistory: p.stockHistory ?? [], themeColor: p.themeColor ?? '153 82% 22%',
        pin: p.pin ?? null, reminderEnabled: p.reminderEnabled ?? false,
        reminderTime: p.reminderTime ?? '18:00',
        // Migrate old sales without paymentMethod
        sales: (p.sales || []).map((s: any) => ({ ...s, paymentMethod: s.paymentMethod || 'cash' })),
        products: (p.products || []).map((pr: any) => ({ ...pr, restockLevel: pr.restockLevel ?? 5 })),
      };
    }
  } catch {}
  return DEFAULT_STATE;
}

function saveState(state: AppState) {
  localStorage.setItem('bizora_state', JSON.stringify(state));
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => { saveState(state); }, [state]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.darkMode);
  }, [state.darkMode]);

  // Apply theme color as CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty('--primary', state.themeColor);
  }, [state.themeColor]);

  const setUser = useCallback((user: AppState['user']) => {
    setState(prev => ({ ...prev, user: user! }));
  }, []);

  const addProduct = useCallback((product: Omit<Product, 'id'>) => {
    setState(prev => ({ ...prev, products: [...prev.products, { ...product, id: uid() }] }));
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setState(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === id ? { ...p, ...updates } : p),
    }));
  }, []);

  const updateProductStock = useCallback((id: string, delta: number, reason = 'Manual adjustment', customerName?: string) => {
    setState(prev => {
      const entry: StockHistoryEntry = {
        id: uid(), productId: id, delta, reason, date: new Date().toISOString(), customerName,
      };
      return {
        ...prev,
        products: prev.products.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p),
        stockHistory: [entry, ...prev.stockHistory].slice(0, 500),
      };
    });
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setState(prev => ({ ...prev, products: prev.products.filter(p => p.id !== id) }));
  }, []);

  const addSale = useCallback((sale: Omit<Sale, 'id'>) => {
    setState(prev => {
      const newSale = { ...sale, id: uid() };
      let customers = prev.customers;
      if (sale.paymentMethod === 'credit' && sale.customerId) {
        customers = customers.map(c =>
          c.id === sale.customerId
            ? { ...c, balance: c.balance + sale.totalPrice, purchaseCount: c.purchaseCount + 1, lastPurchaseDate: sale.date }
            : c
        );
      } else if (sale.customerId) {
        customers = customers.map(c =>
          c.id === sale.customerId
            ? { ...c, purchaseCount: c.purchaseCount + 1, lastPurchaseDate: sale.date }
            : c
        );
      }
      const product = prev.products.find(p => p.name === sale.productName);
      let products = prev.products;
      let stockHistory = prev.stockHistory;
      if (product) {
        products = products.map(p => p.name === sale.productName ? { ...p, stock: Math.max(0, p.stock - sale.quantity) } : p);
        stockHistory = [{
          id: uid(), productId: product.id, delta: -sale.quantity,
          reason: 'Sale', date: sale.date, customerName: sale.customerName,
        }, ...stockHistory].slice(0, 500);
      }
      return { ...prev, sales: [newSale, ...prev.sales], customers, products, stockHistory };
    });
  }, []);

  const addExpense = useCallback((expense: Omit<Expense, 'id'>) => {
    setState(prev => ({ ...prev, expenses: [{ ...expense, id: uid() }, ...prev.expenses] }));
  }, []);

  const addCustomer = useCallback((customer: Omit<Customer, 'id' | 'balance' | 'purchaseCount'>) => {
    setState(prev => ({
      ...prev,
      customers: [...prev.customers, { ...customer, id: uid(), balance: 0, purchaseCount: 0 }],
    }));
  }, []);

  const updateCustomer = useCallback((id: string, updates: Partial<Customer>) => {
    setState(prev => ({
      ...prev,
      customers: prev.customers.map(c => c.id === id ? { ...c, ...updates } : c),
    }));
  }, []);

  const deleteCustomer = useCallback((id: string) => {
    setState(prev => ({ ...prev, customers: prev.customers.filter(c => c.id !== id) }));
  }, []);

  const addSupplier = useCallback((supplier: Omit<Supplier, 'id'>) => {
    setState(prev => ({ ...prev, suppliers: [...prev.suppliers, { ...supplier, id: uid() }] }));
  }, []);

  const deleteSupplier = useCallback((id: string) => {
    setState(prev => ({ ...prev, suppliers: prev.suppliers.filter(s => s.id !== id) }));
  }, []);

  const setCashFloat = useCallback((amount: number) => {
    setState(prev => ({ ...prev, cashFloat: { date: todayKey(), openingCash: amount } }));
  }, []);

  const toggleDarkMode = useCallback(() => {
    setState(prev => ({ ...prev, darkMode: !prev.darkMode }));
  }, []);

  const setThemeColor = useCallback((color: string) => {
    setState(prev => ({ ...prev, themeColor: color }));
  }, []);

  const setPin = useCallback((pin: string | null) => {
    setState(prev => ({ ...prev, pin }));
  }, []);

  const setReminderEnabled = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, reminderEnabled: enabled }));
  }, []);

  const setReminderTime = useCallback((time: string) => {
    setState(prev => ({ ...prev, reminderTime: time }));
  }, []);

  const enterDemoMode = useCallback(() => {
    setState({
      ...DEFAULT_STATE,
      user: MOCK_USER, products: MOCK_PRODUCTS, sales: MOCK_SALES,
      expenses: MOCK_EXPENSES, customers: MOCK_CUSTOMERS, suppliers: MOCK_SUPPLIERS,
      stockHistory: [], isDemo: true, cashFloat: { date: todayKey(), openingCash: 500 },
    });
  }, []);

  const logout = useCallback(() => {
    // Clear ALL localStorage completely
    localStorage.clear();
    setState({ ...DEFAULT_STATE });
  }, []);

  const lowStockProducts = state.products.filter(p => p.stock <= p.restockLevel && p.stock > 0);

  return (
    <AppContext.Provider value={{
      ...state, setUser, addProduct, updateProduct, updateProductStock, deleteProduct,
      addSale, addExpense, addCustomer, updateCustomer, deleteCustomer,
      addSupplier, deleteSupplier, enterDemoMode, logout, setCashFloat,
      toggleDarkMode, setThemeColor, setPin, setReminderEnabled, setReminderTime,
      lowStockProducts,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
