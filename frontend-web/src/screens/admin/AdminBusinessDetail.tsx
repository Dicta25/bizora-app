import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Phone, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Package, 
  Receipt,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Shield,
  Trash2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/format';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function AdminBusinessDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/admin/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Business account permanently deleted');
      navigate('/admin/users');
    }
  });

  const promoteMutation = useMutation({
    mutationFn: (isSuper: boolean) => api.put(`/admin/users/${id}/plan`, { isSuperadmin: isSuper }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-user', id] });
      const status = res.data.isSuperadmin ? 'Promoted to Super Admin' : 'Demoted to Standard User';
      toast.success(status);
    }
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to PERMANENTLY delete this business? All sales, products, and customer data will be lost. This cannot be undone.')) {
      deleteMutation.mutate();
    }
  };

  const { data: business, isLoading: userLoading } = useQuery({
    queryKey: ['admin-user', id],
    queryFn: async () => {
      const res = await api.get(`/admin/users/${id}`);
      return res.data;
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-user-stats', id],
    queryFn: async () => {
      const res = await api.get(`/admin/users/${id}/stats`);
      return res.data;
    }
  });

  const { data: products = [] } = useQuery({
    queryKey: ['admin-user-products', id],
    queryFn: async () => {
      const res = await api.get(`/admin/users/${id}/products`);
      return res.data;
    }
  });

  if (userLoading) return <div className="p-12 animate-pulse font-black uppercase text-xs tracking-widest text-muted-foreground">Loading Entity...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-20">
      <header className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/users')}
          className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black tracking-tighter">Entity Control</h1>
          <p className="text-muted-foreground font-medium">Detailed oversight for {business?.businessName}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Business Vitals */}
        <div className="space-y-6">
          <div className="bg-card border rounded-[32px] p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full" />
            
            <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 mb-6">
              <Building2 size={40} />
            </div>

            <h2 className="text-2xl font-black tracking-tight mb-1">{business?.businessName}</h2>
            <p className="text-primary font-black text-[10px] uppercase tracking-widest mb-6">{business?.businessType}</p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm font-bold">
                <Phone size={16} className="text-muted-foreground" />
                {business?.phone}
              </div>
              <div className="flex items-center gap-3 text-sm font-bold">
                <MapPin size={16} className="text-muted-foreground" />
                {business?.location}
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground">
                <Calendar size={16} />
                Joined {new Date(business?.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="mt-8 pt-8 border-t space-y-3">
              <button className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                <ExternalLink size={14} /> View as Business
              </button>
              
              <button 
                onClick={() => promoteMutation.mutate(!business?.isSuperadmin)}
                disabled={promoteMutation.isPending}
                className={cn(
                  "w-full h-12 rounded-xl border font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                  business?.isSuperadmin 
                    ? "border-orange-500/20 text-orange-500 hover:bg-orange-500/10" 
                    : "border-primary/20 text-primary hover:bg-primary/5"
                )}
              >
                <Shield size={14} /> 
                {promoteMutation.isPending ? 'Processing...' : (business?.isSuperadmin ? 'Demote to User' : 'Promote to Admin')}
              </button>

              <button 
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="w-full h-12 rounded-xl border border-destructive/20 text-destructive font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-destructive/10 transition-all disabled:opacity-50"
              >
                <Trash2 size={14} /> {deleteMutation.isPending ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>

        {/* Performance & Inventory */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Total Revenue', value: formatCurrency(stats?.totalRevenue || 0), icon: TrendingUp, color: 'text-green-500' },
              { label: 'Sales Count', value: stats?.totalSalesCount || 0, icon: Receipt, color: 'text-blue-500' },
              { label: 'Products', value: stats?.totalProducts || 0, icon: Package, color: 'text-purple-500' },
            ].map((stat, i) => (
              <div key={i} className="bg-card border rounded-3xl p-6 shadow-sm">
                <div className={`w-10 h-10 rounded-xl bg-secondary flex items-center justify-center ${stat.color} mb-4`}>
                  <stat.icon size={20} />
                </div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                <p className="text-xl font-black mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-card border rounded-[32px] overflow-hidden shadow-sm">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-black tracking-tight">Product Inventory</h3>
              <button className="text-primary font-black text-[10px] uppercase tracking-widest">Manage All</button>
            </div>
            
            <div className="divide-y max-h-[400px] overflow-y-auto custom-scrollbar">
              {products.map((product: any) => (
                <div key={product.id} className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground">
                      <Package size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-black">{product.name}</p>
                      <p className="text-xs text-muted-foreground font-medium">{formatCurrency(product.price)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Stock</p>
                      <p className={`text-sm font-black ${product.stock <= product.restockLevel ? 'text-red-500' : 'text-green-500'}`}>
                        {product.stock}
                      </p>
                    </div>
                    <button className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
              
              {products.length === 0 && (
                <div className="p-12 text-center text-muted-foreground italic font-medium">
                  No products added by this business yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
