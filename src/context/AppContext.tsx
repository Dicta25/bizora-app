import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Types
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
}

export interface Sale {
  id: string;
  productName: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  date: string;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
}

interface AppState {
  user: User | null;
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  isDemo: boolean;
}

interface AppContextType extends AppState {
  setUser: (user: User) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProductStock: (id: string, delta: number) => void;
  deleteProduct: (id: string) => void;
  addSale: (sale: Omit<Sale, 'id'>) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  enterDemoMode: () => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const uid = () => Math.random().toString(36).slice(2, 10);

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const MOCK_USER: User = {
  phone: '0241234567',
  businessName: "Akua's Store",
  businessType: 'Trader',
  location: 'Kantamanto, Accra',
};

const MOCK_PRODUCTS: Product[] = [
  { id: uid(), name: 'Tomatoes (crate)', stock: 12, price: 150 },
  { id: uid(), name: 'Hair Relaxer', stock: 4, price: 35 },
  { id: uid(), name: 'Jollof Rice Pack', stock: 0, price: 25 },
  { id: uid(), name: 'Fabric Roll', stock: 8, price: 280 },
];

const MOCK_SALES: Sale[] = [
  { id: uid(), productName: 'Tomatoes (crate)', quantity: 3, pricePerUnit: 150, totalPrice: 450, date: daysAgo(0) },
  { id: uid(), productName: 'Hair Relaxer', quantity: 2, pricePerUnit: 35, totalPrice: 70, date: daysAgo(1) },
  { id: uid(), productName: 'Fabric Roll', quantity: 1, pricePerUnit: 280, totalPrice: 280, date: daysAgo(2) },
  { id: uid(), productName: 'Jollof Rice Pack', quantity: 5, pricePerUnit: 25, totalPrice: 125, date: daysAgo(3) },
  { id: uid(), productName: 'Tomatoes (crate)', quantity: 2, pricePerUnit: 150, totalPrice: 300, date: daysAgo(5) },
  { id: uid(), productName: 'Hair Relaxer', quantity: 4, pricePerUnit: 35, totalPrice: 140, date: daysAgo(6) },
];

const MOCK_EXPENSES: Expense[] = [
  { id: uid(), amount: 200, description: 'Bought tomatoes wholesale', category: 'Stock', date: daysAgo(0) },
  { id: uid(), amount: 50, description: 'Trotro to market', category: 'Transport', date: daysAgo(1) },
  { id: uid(), amount: 100, description: 'Electricity bill', category: 'Utilities', date: daysAgo(3) },
  { id: uid(), amount: 80, description: 'New packaging bags', category: 'Stock', date: daysAgo(5) },
];

function loadState(): AppState {
  try {
    const raw = localStorage.getItem('bizora_state');
    if (raw) return JSON.parse(raw);
  } catch {}
  return { user: null, products: [], sales: [], expenses: [], isDemo: false };
}

function saveState(state: AppState) {
  localStorage.setItem('bizora_state', JSON.stringify(state));
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const setUser = useCallback((user: User) => {
    setState(prev => ({ ...prev, user }));
  }, []);

  const addProduct = useCallback((product: Omit<Product, 'id'>) => {
    setState(prev => ({ ...prev, products: [...prev.products, { ...product, id: uid() }] }));
  }, []);

  const updateProductStock = useCallback((id: string, delta: number) => {
    setState(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p),
    }));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setState(prev => ({ ...prev, products: prev.products.filter(p => p.id !== id) }));
  }, []);

  const addSale = useCallback((sale: Omit<Sale, 'id'>) => {
    setState(prev => ({ ...prev, sales: [{ ...sale, id: uid() }, ...prev.sales] }));
  }, []);

  const addExpense = useCallback((expense: Omit<Expense, 'id'>) => {
    setState(prev => ({ ...prev, expenses: [{ ...expense, id: uid() }, ...prev.expenses] }));
  }, []);

  const enterDemoMode = useCallback(() => {
    setState({
      user: MOCK_USER,
      products: MOCK_PRODUCTS,
      sales: MOCK_SALES,
      expenses: MOCK_EXPENSES,
      isDemo: true,
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('bizora_state');
    setState({ user: null, products: [], sales: [], expenses: [], isDemo: false });
  }, []);

  return (
    <AppContext.Provider value={{ ...state, setUser, addProduct, updateProductStock, deleteProduct, addSale, addExpense, enterDemoMode, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
