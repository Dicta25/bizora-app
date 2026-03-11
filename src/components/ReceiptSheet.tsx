import { formatCurrency } from '@/lib/format';
import type { Sale } from '@/context/types';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  sale: Sale | null;
  onClose: () => void;
}

function generateReceiptNumber(id: string): string {
  const num = parseInt(id, 36) % 99999;
  return `#BZ-${String(num).padStart(5, '0')}`;
}

function formatReceiptDate(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
  };
}

const paymentLabels: Record<string, string> = {
  cash: 'Cash', momo: 'MTN MoMo', bank: 'Bank Transfer', credit: 'Credit',
};

export default function ReceiptSheet({ sale, onClose }: Props) {
  const { user } = useApp();
  if (!sale) return null;

  const { date, time } = formatReceiptDate(sale.date);
  const receiptNo = generateReceiptNumber(sale.id);
  const businessName = user?.businessName || 'Bizora';
  const customerDisplay = sale.customerName || 'Walk-in Customer';

  const receiptText = `Hello ${customerDisplay}, here is your receipt from ${businessName}. Receipt No: ${receiptNo} — Total: ${formatCurrency(sale.totalPrice)} — Date: ${date}. Official digital receipts coming soon on Bizora.`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(receiptText)}`;

  return (
    <AnimatePresence>
      {sale && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-foreground/40 z-50 flex items-end justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 400 }}
            animate={{ y: 0 }}
            exit={{ y: 400 }}
            transition={{ type: 'spring', damping: 25 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md bg-card rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto"
          >
            <div className="font-mono text-center">
              <h2 className="text-2xl font-extrabold text-foreground tracking-wider">
                {businessName.toUpperCase()}
              </h2>
              {user?.location && (
                <p className="text-xs text-muted-foreground mt-1">{user.location}</p>
              )}
              {user?.phone && (
                <p className="text-xs text-muted-foreground">{user.phone}</p>
              )}
              <div className="my-3 border-t-2 border-dashed border-muted" />

              <p className="text-sm text-muted-foreground mb-2">{customerDisplay}</p>

              <div className="text-left space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Item</span>
                  <span className="font-semibold text-foreground">{sale.productName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity</span>
                  <span className="font-semibold text-foreground">{sale.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price/unit</span>
                  <span className="font-semibold text-foreground currency">{formatCurrency(sale.pricePerUnit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment</span>
                  <span className="font-semibold text-foreground">{paymentLabels[sale.paymentMethod] || 'Cash'}</span>
                </div>
              </div>

              <div className="my-3 border-t-2 border-dashed border-muted" />

              <div className="flex justify-between text-base font-extrabold">
                <span className="text-foreground">Total</span>
                <span className="text-primary currency">{formatCurrency(sale.totalPrice)}</span>
              </div>

              <div className="my-3 border-t-2 border-dashed border-muted" />

              <div className="text-left text-xs text-muted-foreground space-y-1">
                <p>Date: {date}</p>
                <p>Time: {time}</p>
                <p>Receipt: {receiptNo}</p>
              </div>

              <p className="mt-4 text-xs text-primary font-medium">Thank you for your business</p>
              <p className="mt-1 text-[10px] text-muted-foreground">Powered by Bizora</p>
            </div>

            <div className="mt-6 space-y-3">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                className="block w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-center leading-[48px] tap-target">
                Share via WhatsApp
              </a>
              <p className="text-[10px] text-center text-muted-foreground">Full digital receipts available when Bizora launches</p>
              <button onClick={onClose}
                className="w-full h-12 rounded-xl bg-secondary text-foreground font-semibold tap-target">
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
