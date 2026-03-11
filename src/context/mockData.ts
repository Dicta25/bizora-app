import type { User, Product, Sale, Expense, Customer, Supplier, StockHistoryEntry } from './types';

const uid = () => Math.random().toString(36).slice(2, 10);

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export const MOCK_USER: User = {
  phone: '0241234567',
  businessName: "Akua's Store",
  businessType: 'Trader',
  location: 'Kantamanto, Accra',
};

export const MOCK_PRODUCTS: Product[] = [
  { id: uid(), name: 'Tomatoes (crate)', stock: 12, price: 150, restockLevel: 5 },
  { id: uid(), name: 'Hair Relaxer', stock: 4, price: 35, restockLevel: 5 },
  { id: uid(), name: 'Jollof Rice Pack', stock: 0, price: 25, restockLevel: 5 },
  { id: uid(), name: 'Fabric Roll', stock: 8, price: 280, restockLevel: 5 },
];

const customerIds = { abena: uid(), kofi: uid(), fatima: uid() };

export const MOCK_CUSTOMERS: Customer[] = [
  { id: customerIds.abena, name: 'Abena Mensah', phone: '0244123456', balance: 200, purchaseCount: 2, lastPurchaseDate: daysAgo(1) },
  { id: customerIds.kofi, name: 'Kofi Asante', phone: '0557891234', balance: 0, purchaseCount: 3, lastPurchaseDate: daysAgo(2) },
  { id: customerIds.fatima, name: 'Fatima Ibrahim', phone: '0201456789', balance: 85, purchaseCount: 1, lastPurchaseDate: daysAgo(3) },
];

export const MOCK_SALES: Sale[] = [
  { id: uid(), productName: 'Tomatoes (crate)', quantity: 3, pricePerUnit: 150, totalPrice: 450, date: daysAgo(0), paymentMethod: 'momo', customerId: customerIds.abena, customerName: 'Abena Mensah' },
  { id: uid(), productName: 'Hair Relaxer', quantity: 2, pricePerUnit: 35, totalPrice: 70, date: daysAgo(1), paymentMethod: 'cash' },
  { id: uid(), productName: 'Fabric Roll', quantity: 1, pricePerUnit: 280, totalPrice: 280, date: daysAgo(2), paymentMethod: 'momo', customerId: customerIds.kofi, customerName: 'Kofi Asante' },
  { id: uid(), productName: 'Jollof Rice Pack', quantity: 5, pricePerUnit: 25, totalPrice: 125, date: daysAgo(3), paymentMethod: 'bank' },
  { id: uid(), productName: 'Tomatoes (crate)', quantity: 2, pricePerUnit: 150, totalPrice: 300, date: daysAgo(5), paymentMethod: 'momo' },
  { id: uid(), productName: 'Hair Relaxer', quantity: 4, pricePerUnit: 35, totalPrice: 140, date: daysAgo(6), paymentMethod: 'cash', customerId: customerIds.fatima, customerName: 'Fatima Ibrahim' },
];

export const MOCK_EXPENSES: Expense[] = [
  { id: uid(), amount: 200, description: 'Bought tomatoes wholesale', category: 'Stock', date: daysAgo(0) },
  { id: uid(), amount: 50, description: 'Trotro to market', category: 'Transport', date: daysAgo(1) },
  { id: uid(), amount: 100, description: 'Electricity bill', category: 'Utilities', date: daysAgo(3) },
  { id: uid(), amount: 80, description: 'New packaging bags', category: 'Stock', date: daysAgo(5) },
];

export const MOCK_SUPPLIERS: Supplier[] = [
  { id: uid(), name: 'Kwame Distributors', phone: '0201234567', products: 'Tomatoes, Pepper, Onions', location: 'Agbogbloshie Market' },
  { id: uid(), name: 'Beauty World Supplies', phone: '0557654321', products: 'Hair Relaxer, Shampoo', location: 'Accra Central' },
  { id: uid(), name: 'Rice & Grains Ltd', phone: '0244987654', products: 'Rice, Flour, Sugar', location: 'Tema' },
];

export const MOCK_STOCK_HISTORY: StockHistoryEntry[] = [
  { id: uid(), productId: '', delta: -3, reason: 'Sale', date: daysAgo(0), customerName: 'Abena Mensah' },
  { id: uid(), productId: '', delta: 10, reason: 'Stock added', date: daysAgo(1) },
];

export function todayKey() {
  return new Date().toISOString().split('T')[0];
}
