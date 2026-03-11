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
  supplierId?: string;
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
  location?: string;
  balance: number; // positive means they owe
  purchaseCount: number;
  lastPurchaseDate?: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  products: string;
  location?: string;
  notes?: string;
}

export interface StockHistoryEntry {
  id: string;
  productId: string;
  delta: number;
  reason: string;
  date: string;
  customerName?: string;
}

export interface CashFloat {
  date: string;
  openingCash: number;
}

export interface AppState {
  user: User | null;
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  customers: Customer[];
  suppliers: Supplier[];
  stockHistory: StockHistoryEntry[];
  isDemo: boolean;
  cashFloat: CashFloat | null;
  darkMode: boolean;
  themeColor: string;
  pin: string | null;
  reminderEnabled: boolean;
  reminderTime: string; // HH:MM
}

export interface AppContextType extends AppState {
  setUser: (user: User) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  updateProductStock: (id: string, delta: number, reason?: string, customerName?: string) => void;
  deleteProduct: (id: string) => void;
  addSale: (sale: Omit<Sale, 'id'>) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'balance' | 'purchaseCount'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  deleteSupplier: (id: string) => void;
  enterDemoMode: () => void;
  logout: () => void;
  setCashFloat: (amount: number) => void;
  toggleDarkMode: () => void;
  setThemeColor: (color: string) => void;
  setPin: (pin: string | null) => void;
  setReminderEnabled: (enabled: boolean) => void;
  setReminderTime: (time: string) => void;
  lowStockProducts: Product[];
}
