import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import KpiCard from '@/components/KpiCard';
import { getReceivables, addReceivable, updateReceivable, deleteReceivable, getCustomers, type Receivable, type Customer, fmt } from '@/lib/store';
import { Plus, Trash2, X, DollarSign, AlertTriangle, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const statusLabels: Record<string, string> = { pendente: 'Pendente', pago_parcial: 'Parcial', recebida: 'Recebida', vencida: 'Vencida' };
const statusColors: Record<string, string> = { pendente: 'bg-amber-100 text-amber-700', pago_parcial: 'bg-primary/10 text-primary', recebida: 'bg-emerald-100 text-emerald-700', vencida: 'bg-destructive/10 text-destructive' };

export default function Receivables() {
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customerId: '', customerName: '', totalValue: 0, receivedValue: 0, dueDate: '', paymentMethod: '', status: 'pendente' as Receivable['status'], notes: '' });

  const reload = () => {
    setCustomers(getCustomers());
    const now = new Date().toISOString().split('T')[0];
    getReceivables().forEach(r => {
      if (r.status !== 'recebida' && r.dueDate && r.dueDate < now) updateReceivable(r.id, { status: 'vencida' });
    });
    setReceivables(getReceivables());
  };
  useEffect(reload, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId || !form.totalValue) { toast.error('Preencha cliente e valor'); return; }
    const customer = customers.find(c => c.id === form.customerId);
    addReceivable({ ...form, customerName: customer?.name || '' });
    setForm({ customerId: '', customerName: '', totalValue: 0, receivedValue: 0, dueDate: '', paymentMethod: '', status: 'pendente', notes: '' });
    setShowForm(false);
    toast.success('Conta a receber registrada');
    reload();
  };

  const totalOpen = receivables.filter(r => r.status !== 'recebida').reduce((s, r) => s + (r.totalValue - r.receivedValue), 0);
  const overdue = receivables.filter(r => r.status === 'vencida');
  const thisMonth = receivables.filter(r => { const d = new Date(r.dueDate); const now = new Date(); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && r.status !== 'recebida'; });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Contas a Receber</h1>
            <p className="text-muted-foreground text-sm mt-1">Acompanhe o dinheiro que ainda vai entrar</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2"><Plus className="h-4 w-4" /> Nova Conta</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard icon={DollarSign} title="Total a Receber" value={fmt(totalOpen)} subtitle={`${receivables.filter(r => r.status !== 'recebida').length} contas`} color="primary" />
          <KpiCard icon={AlertTriangle} title="Vencidas" value={String(overdue.length)} subtitle={overdue.length > 0 ? fmt(overdue.reduce((s, r) => s + (r.totalValue - r.receivedValue), 0)) : 'Nenhuma'} color={overdue.length > 0 ? 'destructive' : 'primary'} />
          <KpiCard icon={Calendar} title="Vence Este Mês" value={String(thisMonth.length)} subtitle={thisMonth.length > 0 ? fmt(thisMonth.reduce((s, r) => s + (r.totalValue - r.receivedValue), 0)) : 'Nenhuma'} color="warning" />
          <KpiCard icon={CheckCircle} title="Recebidas" value={String(receivables.filter(r => r.status === 'recebida').length)} subtitle={fmt(receivables.filter(r => r.status === 'recebida').reduce((s, r) => s + r.totalValue, 0))} color="success" />
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-accent/50">
                <th className="text-left p-3 font-medium text-muted-foreground">Cliente</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Total</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Recebido</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Pendente</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Vencimento</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Ações</th>
              </tr></thead>
              <tbody>
                {receivables.map(r => (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                    <td className="p-3 font-medium text-foreground">{r.customerName}</td>
                    <td className="p-3 text-right text-foreground">{fmt(r.totalValue)}</td>
                    <td className="p-3 text-right text-muted-foreground">{fmt(r.receivedValue)}</td>
                    <td className="p-3 text-right font-semibold text-foreground">{fmt(r.totalValue - r.receivedValue)}</td>
                    <td className="p-3 text-muted-foreground">{r.dueDate ? new Date(r.dueDate + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}</td>
                    <td className="p-3"><span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", statusColors[r.status])}>{statusLabels[r.status]}</span></td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {r.status !== 'recebida' && <button onClick={() => { updateReceivable(r.id, { status: 'recebida', receivedValue: r.totalValue }); reload(); toast.success('Marcado como recebida'); }} className="text-xs px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors">Receber</button>}
                        <button onClick={() => { deleteReceivable(r.id); reload(); toast.success('Removido'); }} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {receivables.length === 0 && <div className="p-8 text-center text-muted-foreground">Nenhuma conta a receber cadastrada.</div>}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md shadow-lg" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Nova Conta a Receber</h2>
                <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div><Label>Cliente</Label>
                  <select value={form.customerId} onChange={e => setForm({ ...form, customerId: e.target.value })} className="w-full h-10 border border-input rounded-md px-3 bg-background text-foreground text-sm">
                    <option value="">Selecione...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Valor Total (R$)</Label><Input type="number" step="0.01" value={form.totalValue || ''} onChange={e => setForm({ ...form, totalValue: parseFloat(e.target.value) || 0 })} /></div>
                  <div><Label>Valor Recebido (R$)</Label><Input type="number" step="0.01" value={form.receivedValue || ''} onChange={e => setForm({ ...form, receivedValue: parseFloat(e.target.value) || 0 })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Vencimento</Label><Input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
                  <div><Label>Pagamento</Label><Input value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })} placeholder="Pix, Cartão..." /></div>
                </div>
                <div><Label>Observações</Label><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
                <Button type="submit" className="w-full">Registrar</Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
