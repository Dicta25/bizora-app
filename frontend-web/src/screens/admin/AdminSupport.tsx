import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LifeBuoy, 
  Search, 
  Filter, 
  MessageCircle, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Bug,
  Lightbulb,
  MoreVertical,
  Building2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const PRIORITY_COLORS: Record<string, string> = {
  Low: 'text-slate-500 bg-secondary',
  Medium: 'text-blue-500 bg-blue-500/10',
  High: 'text-orange-500 bg-orange-500/10',
  Critical: 'text-red-500 bg-red-500/10',
};

const TYPE_ICONS: Record<string, any> = {
  Bug: Bug,
  Feature: Lightbulb,
  Question: MessageCircle,
  Feedback: MessageCircle,
};

export default function AdminSupport() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['admin-tickets'],
    queryFn: async () => {
      const res = await api.get('/admin/tickets');
      return res.data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: string, status: string }) => 
      api.put(`/admin/tickets/${ticketId}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
      toast.success('Ticket status updated');
    }
  });

  const dummyTickets = [
    { id: '1', businessName: 'Kente Fashions', subject: 'Printer not connecting', message: 'I cannot connect my bluetooth printer to the web app.', ticketType: 'Bug', priority: 'High', status: 'Open', createdAt: '2024-03-14T10:00:00', phone: '0244123456' },
    { id: '2', businessName: 'Mama Africa Kitchen', subject: 'Request: Multiple Currencies', message: 'I want to be able to track sales in USD as well.', ticketType: 'Feature', priority: 'Medium', status: 'Pending', createdAt: '2024-03-13T15:30:00', phone: '0555987654' },
    { id: '3', businessName: 'Glow Up Salon', subject: 'How to delete a sale?', message: 'I made a mistake in a record, how do I remove it?', ticketType: 'Question', priority: 'Low', status: 'Resolved', createdAt: '2024-03-14T08:15:00', phone: '0200111222' },
  ];

  const displayTickets = tickets.length > 0 ? tickets : dummyTickets;
  const filteredTickets = displayTickets.filter((t: any) => 
    (filterStatus === 'All' || t.status === filterStatus) &&
    (t.businessName.toLowerCase().includes(searchTerm.toLowerCase()) || t.subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleWhatsApp = (phone: string, subject: string) => {
    const msg = `Hello, I'm from Bizora Support regarding your ticket: "${subject}". How can I help you?`;
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Support Center</h1>
          <p className="text-muted-foreground font-medium">Manage user feedback and resolve technical issues.</p>
        </div>
        <div className="flex gap-2 p-1 bg-secondary/30 rounded-2xl">
          {['All', 'Open', 'Pending', 'Resolved'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterStatus === status ? 'bg-background shadow-md text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {status}
            </button>
          ))}
        </div>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input 
          type="text" 
          placeholder="Search by business or subject..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-14 bg-card border rounded-2xl pl-12 pr-4 font-bold focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredTickets.map((ticket: any, i: number) => {
          const Icon = TYPE_ICONS[ticket.ticketType] || MessageCircle;
          return (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border rounded-[32px] p-6 shadow-sm hover:border-primary/40 transition-all group"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${PRIORITY_COLORS[ticket.priority]}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black tracking-tight">{ticket.subject}</h3>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${PRIORITY_COLORS[ticket.priority]}`}>
                            {ticket.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                          <Building2 size={12} />
                          <span>{ticket.businessName}</span>
                          <span className="opacity-30">•</span>
                          <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-foreground/70 leading-relaxed font-medium pl-1">
                    {ticket.message}
                  </p>
                </div>

                <div className="lg:w-64 shrink-0 flex flex-col gap-2 justify-center border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-6">
                  <button 
                    onClick={() => handleWhatsApp(ticket.phone, ticket.subject)}
                    className="w-full h-11 rounded-xl bg-green-500 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
                  >
                    <MessageCircle size={16} /> Contact via WA
                  </button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {ticket.status !== 'Resolved' ? (
                      <button 
                        onClick={() => updateStatusMutation.mutate({ ticketId: ticket.id, status: 'Resolved' })}
                        className="h-11 rounded-xl border border-primary/20 text-primary font-black text-[10px] uppercase tracking-tighter hover:bg-primary/5 transition-all"
                      >
                        Resolve
                      </button>
                    ) : (
                      <div className="h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <CheckCircle2 size={16} />
                      </div>
                    )}
                    <button className="h-11 rounded-xl bg-secondary text-muted-foreground font-black text-[10px] uppercase tracking-tighter hover:text-foreground transition-all">
                      View Thread
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredTickets.length === 0 && (
        <div className="p-20 text-center bg-secondary/10 rounded-[32px] border-2 border-dashed border-border">
          <LifeBuoy className="mx-auto text-muted-foreground mb-4 opacity-20" size={64} />
          <p className="text-muted-foreground font-bold italic">No support tickets found.</p>
        </div>
      )}
    </div>
  );
}
