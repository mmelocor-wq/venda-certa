import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import KpiCard from '@/components/KpiCard';
import { getPurchases, addPurchase, updatePurchase, deletePurchase, getSuppliers, type SupplierPurchase, type Supplier } from '@/lib/store';
import { Plus, Trash2, X, DollarSign, AlertTriangle, Calendar, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

function fmt(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }

const statusLabels: Record<string, string> = { pendente: 'Pendente', pago_parcial: 'Parcial', pago: 'Pago', atrasado: 'Atrasado' };
const statusColors: Record<string, string> = { pendente: 'bg-amber-100 text-amber-700', pago_parcial: 'bg-primary/10 text-primary', pago: 'bg-emerald-100 text-emerald-700', atrasado: 'bg-destructive/10 text-destructive' };

export default function Payables() {
  const [purchases, setPurchases] = useState<SupplierPurchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ supplierId: '', supplierName: '', purchaseNumber: '', purchaseDate: '', totalValue: 0, paidValue: 0, dueDate: '', paymentMethod: '', status: 'pendente' as SupplierPurchase['status'], notes: '' });

  const reload = () => { setPurchases(getPurchases()); setSuppliers(getSuppliers()); };
  useEffect(() => {
    reload();
    // Auto-mark overdue
    const now = new Date().toISOString().split('T')[0];
    getPurchases().forEach(p => {
      if (p.status !== 'pago' && p.dueDate && p.dueDate < now) updatePurchase(p.id, { status: 'atrasado' });
    });
    reload();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.supplierId) { toast.error('Selecione um fornecedor'); return; }
    const supplier = suppliers.find(s => s.id === form.supplierId);
    addPurchase({ ...form, supplierName: supplier?.name || '' });
    setForm({ supplierId: '', supplierName: '', purchaseNumber: '', purchaseDate: '', totalValue: 0, paidValue: 0, dueDate: '', paymentMethod: '', status: 'pendente', notes: '' });
    setShowForm(false);
    toast.success('Compra registrada');
    reload();
  };

  const totalOpen = purchases.filter(p => p.status !== 'pago').reduce((s, p) => s + (p.totalValue - p.paidValue), 0);
  const overdue = purchases.filter(p => p.status === 'atrasado');
  const thisMonth = purchases.filter(p => { const d = new Date(p.dueDate); const now = new Date(); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && p.status !== 'pago'; });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Contas a Pagar</h1>
            <p className="text-muted-foreground text-sm mt-1">Controle financeiro com fornecedores</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2"><Plus className="h-4 w-4" /> Nova Compra</Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard icon={DollarSign} title="Total em Aberto" value={fmt(totalOpen)} subtitle={`${purchases.filter(p => p.status !== 'pago').length} compras`} color="warning" />
          <KpiCard icon={AlertTriangle} title="Atrasadas" value={String(overdue.length)} subtitle={overdue.length > 0 ? fmt(overdue.reduce((s, p) => s + (p.totalValue - p.paidValue), 0)) : 'Nenhuma'} color={overdue.length > 0 ? 'destructive' : 'primary'} />
          <KpiCard icon={Calendar} title="Vence Este Mês" value={String(thisMonth.length)} subtitle={thisMonth.length > 0 ? fmt(thisMonth.reduce((s, p) => s + (p.totalValue - p.paidValue), 0)) : 'Nenhuma'} color="primary" />
          <KpiCard icon={CreditCard} title="Total Compras" value={String(purchases.length)} subtitle={fmt(purchases.reduce((s, p) => s + p.totalValue, 0))} color="success" />
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-accent/50">
                <th className="text-left p-3 font-medium text-muted-foreground">Fornecedor</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Nº</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Total</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Pago</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Saldo</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Vencimento</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Ações</th>
              </tr></thead>
              <tbody>
                {purchases.map(p => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                    <td className="p-3 font-medium text-foreground">{p.supplierName}</td>
                    <td className="p-3 text-muted-foreground">{p.purchaseNumber || '—'}</td>
                    <td className="p-3 text-right text-foreground">{fmt(p.totalValue)}</td>
                    <td className="p-3 text-right text-muted-foreground">{fmt(p.paidValue)}</td>
                    <td className="p-3 text-right font-semibold text-foreground">{fmt(p.totalValue - p.paidValue)}</td>
                    <td className="p-3 text-muted-foreground">{p.dueDate ? new Date(p.dueDate + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}</td>
                    <td className="p-3"><span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", statusColors[p.status])}>{statusLabels[p.status]}</span></td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {p.status !== 'pago' && <button onClick={() => { updatePurchase(p.id, { status: 'pago', paidValue: p.totalValue }); reload(); toast.success('Marcado como pago'); }} className="text-xs px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors">Pagar</button>}
                        <button onClick={() => { deletePurchase(p.id); reload(); toast.success('Removido'); }} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {purchases.length === 0 && <div className="p-8 text-center text-muted-foreground">Nenhuma compra registrada.</div>}
        </div>

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md shadow-lg" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Registrar Compra</h2>
                <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div><Label>Fornecedor</Label>
                  <select value={form.supplierId} onChange={e => setForm({ ...form, supplierId: e.target.value })} className="w-full h-10 border border-input rounded-md px-3 bg-background text-foreground text-sm">
                    <option value="">Selecione...</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Nº da Compra</Label><Input value={form.purchaseNumber} onChange={e => setForm({ ...form, purchaseNumber: e.target.value })} /></div>
                  <div><Label>Data da Compra</Label><Input type="date" value={form.purchaseDate} onChange={e => setForm({ ...form, purchaseDate: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Valor Total (R$)</Label><Input type="number" step="0.01" value={form.totalValue || ''} onChange={e => setForm({ ...form, totalValue: parseFloat(e.target.value) || 0 })} /></div>
                  <div><Label>Valor Pago (R$)</Label><Input type="number" step="0.01" value={form.paidValue || ''} onChange={e => setForm({ ...form, paidValue: parseFloat(e.target.value) || 0 })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Vencimento</Label><Input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
                  <div><Label>Pagamento</Label><Input value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })} placeholder="Boleto, Pix..." /></div>
                </div>
                <div><Label>Observações</Label><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
                <Button type="submit" className="w-full">Registrar Compra</Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
