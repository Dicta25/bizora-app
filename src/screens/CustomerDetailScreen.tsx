import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/format';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Receipt } from 'lucide-react';

const paymentBadge: Record<string, { label: string; cls: string }> = {
  cash: { label: 'Cash', cls: 'bg-primary/15 text-primary' },
  momo: { label: 'MoMo', cls: 'bg-accent/20 text-accent-foreground' },
  bank: { label: 'Bank', cls: 'bg-info/15 text-info' },
  credit: { label: 'Credit', cls: 'bg-destructive/15 text-destructive' },
};

export default function CustomerDetailScreen() {
  const { customers, sales, user } = useApp();
  const { id } = useParams();
  const navigate = useNavigate();

  const customer = customers.find(c => c.id === id);

  const customerSales = useMemo(() =>
    sales.filter(s => s.customerId === id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [sales, id]
  );

  if (!customer) {
    return (
      <div className="px-4 pt-6 pb-24">
        <button onClick={() => navigate(-1)} className="tap-target mb-4 text-muted-foreground"><ArrowLeft size={24} /></button>
        <p className="text-center text-muted-foreground py-16">Customer not found</p>
      </div>
    );
  }

  const reminderText = `Hello ${customer.name}, you have an outstanding balance of ${formatCurrency(customer.balance)} at ${user?.businessName || 'our business'}. Kindly settle at your earliest convenience. Thank you — Bizora`;
  const reminderUrl = `https://wa.me/${customer.phone.replace(/\s/g, '')}?text=${encodeURIComponent(reminderText)}`;

  return (
    <div className="px-4 pt-6 pb-24">
      <button onClick={() => navigate(-1)} className="tap-target mb-4 text-muted-foreground">
        <ArrowLeft size={24} />
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-foreground">{customer.name}</h1>
        <p className="text-sm text-muted-foreground">{customer.phone}</p>
        {customer.location && <p className="text-sm text-muted-foreground">{customer.location}</p>}
      </div>

      {/* Balance */}
      <div className={`rounded-xl p-4 mb-6 text-center ${customer.balance > 0 ? 'bg-destructive/10 border border-destructive/20' : 'bg-primary/10 border border-primary/20'}`}>
        <p className="text-sm text-muted-foreground mb-1">Outstanding Balance</p>
        <p className={`text-3xl font-extrabold currency ${customer.balance > 0 ? 'text-destructive' : 'text-primary'}`}>
          {formatCurrency(customer.balance)}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button onClick={() => navigate('/record/sale')}
          className="h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-transform">
          <Receipt size={18} /> Record Sale
        </button>
        {customer.balance > 0 && (
          <a href={reminderUrl} target="_blank" rel="noopener noreferrer"
            className="h-12 rounded-xl bg-accent text-accent-foreground font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-transform">
            <MessageSquare size={18} /> Send Reminder
          </a>
        )}
      </div>

      {/* Transaction History */}
      <h3 className="font-bold text-base mb-3 text-foreground">Purchase History</h3>
      {customerSales.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No purchases yet</p>
      ) : (
        <div className="space-y-2">
          {customerSales.map(s => {
            const badge = paymentBadge[s.paymentMethod] || paymentBadge.cash;
            return (
              <div key={s.id} className="bg-card rounded-lg border p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate text-foreground">{s.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · Qty {s.quantity}
                  </p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${badge.cls}`}>{badge.label}</span>
                <p className="font-bold text-sm text-foreground currency">{formatCurrency(s.totalPrice)}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
