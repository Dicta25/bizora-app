import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  MessageSquare, 
  Bell, 
  Users, 
  Filter, 
  Clock, 
  History, 
  Zap,
  CheckCircle2,
  AlertCircle,
  Type
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function AdminBroadcast() {
  const [channel, setChannel] = useState<'sms' | 'push'>('sms');
  const [audience, setAudience] = useState('All');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['admin-broadcasts'],
    queryFn: async () => {
      const res = await api.get('/admin/broadcasts');
      return res.data;
    }
  });

  const sendMutation = useMutation({
    mutationFn: (data: any) => api.post('/admin/broadcasts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-broadcasts'] });
      toast.success('Broadcast sent successfully!');
      setTitle('');
      setMessage('');
    }
  });

  // Dummy history fallback
  const dummyHistory = [
    { id: '1', title: 'System Update', channel: 'push', audienceFilter: 'All', recipientCount: 124, status: 'Sent', sentAt: '2024-03-12T09:00:00' },
    { id: '2', title: 'New Feature: Reports', channel: 'sms', audienceFilter: 'Pro', recipientCount: 45, status: 'Sent', sentAt: '2024-03-10T14:30:00' },
  ];

  const displayHistory = history.length > 0 ? history : dummyHistory;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-20">
      <header>
        <h1 className="text-4xl font-black tracking-tighter">Broadcast Hub</h1>
        <p className="text-muted-foreground font-medium">Communicate with your business ecosystem instantly.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Composer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border rounded-[32px] p-8 shadow-sm">
            <h2 className="text-xl font-black tracking-tight mb-6 flex items-center gap-2">
              <Send size={20} className="text-primary" /> New Broadcast
            </h2>

            <div className="space-y-6">
              {/* Channel Toggle */}
              <div className="grid grid-cols-2 gap-3 p-1 bg-secondary/30 rounded-2xl">
                <button 
                  onClick={() => setChannel('sms')}
                  className={`h-12 rounded-xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest transition-all ${channel === 'sms' ? 'bg-background shadow-md text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <MessageSquare size={16} /> SMS
                </button>
                <button 
                  onClick={() => setChannel('push')}
                  className={`h-12 rounded-xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest transition-all ${channel === 'push' ? 'bg-background shadow-md text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Bell size={16} /> Push Notif
                </button>
              </div>

              {/* Audience Filter */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Target Audience</label>
                <div className="flex flex-wrap gap-2">
                  {['All', 'Pro', 'Enterprise', 'Food Vendor', 'Trader'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => setAudience(tag)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${audience === tag ? 'bg-primary border-primary text-primary-foreground' : 'bg-background border-border text-muted-foreground hover:border-primary/50'}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Fields */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Message Title</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. System Maintenance Tomorrow"
                    className="w-full h-14 bg-background border rounded-2xl px-4 font-bold focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex justify-between">
                    <span>Your Message</span>
                    <span className={message.length > 160 ? 'text-destructive' : 'text-primary'}>{message.length} / 160</span>
                  </label>
                  <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Type your announcement here..."
                    className="w-full bg-background border rounded-2xl p-4 font-bold focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                  />
                </div>
              </div>

              <button 
                disabled={!title || !message || sendMutation.isPending}
                onClick={() => sendMutation.mutate({ title, message, channel, audienceFilter: audience })}
                className="w-full h-16 bg-primary text-primary-foreground rounded-2xl font-black text-lg shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-40 transition-all flex items-center justify-center gap-3"
              >
                {sendMutation.isPending ? 'Processing...' : (
                  <>
                    <Zap size={20} /> Launch Broadcast
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Stats & History */}
        <div className="space-y-6">
          <div className="bg-card border rounded-[32px] p-6 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">SMS Engine</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <span className="text-xs font-bold uppercase tracking-tight">Available Balance</span>
                <span className="text-xl font-black text-primary">2,450 Units</span>
              </div>
              <button className="w-full h-12 rounded-xl border-2 border-dashed border-primary/20 text-primary font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary/5 transition-all">
                Top Up Balance
              </button>
            </div>
          </div>

          <div className="bg-card border rounded-[32px] overflow-hidden shadow-sm">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-widest">Sent Log</h3>
              <History size={16} className="text-muted-foreground" />
            </div>
            <div className="divide-y max-h-[400px] overflow-y-auto custom-scrollbar">
              {displayHistory.map((item: any) => (
                <div key={item.id} className="p-4 hover:bg-secondary/20 transition-colors">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-black truncate pr-2">{item.title}</p>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${item.channel === 'sms' ? 'bg-blue-500/10 text-blue-600' : 'bg-orange-500/10 text-orange-600'}`}>
                      {item.channel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground uppercase tracking-tighter">
                    <span>{item.recipientCount} Recipients</span>
                    <span>{new Date(item.sentAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
