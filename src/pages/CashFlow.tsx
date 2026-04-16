import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import KpiCard from '@/components/KpiCard';
import { getCashFlow, addCashFlowEntry, deleteCashFlowEntry, getCashFlowSummary, type CashFlowEntry, fmt } from '@/lib/store';
import { Plus, Trash2, X, Wallet, ArrowUpCircle, ArrowDownCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CashFlow() {
  const [entries, setEntries] = useState<CashFlowEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('mes');
  const [form, setForm] = useState({ type: 'entrada' as 'entrada' | 'saida', category: '', description: '', value: 0, date: new Date().toISOString().split('T')[0], origin: 'manual' as CashFlowEntry['origin'], notes: '' });

  const reload = () => setEntries(getCashFlow());
  useEffect(reload, []);

  const summary = getCashFlowSummary();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim() || !form.value) { toast.error('Preencha descrição e valor'); return; }
    addCashFlowEntry(form);
    setForm({ type: 'entrada', category: '', description: '', value: 0, date: new Date().toISOString().split('T')[0], origin: 'manual', notes: '' });
    setShowForm(false);
    toast.success('Lançamento registrado');
    reload();
  };

  // Filter by period
  const now = new Date();
  const filtered = entries.filter(e => {
    if (filterPeriod === 'hoje') return e.date === now.toISOString().split('T')[0];
    if (filterPeriod === 'semana') { const w = new Date(now); w.setDate(now.getDate() - 7); return e.date >= w.toISOString().split('T')[0]; }
    if (filterPeriod === 'mes') { return e.date >= `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`; }
    return true;
  });

  // Chart: last 7 days
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayEntries = entries.filter(e => e.date === dateStr);
    return {
      day: d.toLocaleDateString('pt-BR', { weekday: 'short' }),
      entradas: dayEntries.filter(e => e.type === 'entrada').reduce((s, e) => s + e.value, 0),
      saidas: dayEntries.filter(e => e.type === 'saida').reduce((s, e) => s + e.value, 0),
    };
  });

  const originLabel: Record<string, string> = { manual: 'Manual', venda: 'Venda', fornecedor: 'Fornecedor', despesa: 'Despesa' };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Fluxo de Caixa</h1>
            <p className="text-muted-foreground text-sm mt-1">Controle financeiro diário do seu negócio</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2"><Plus className="h-4 w-4" /> Novo Lançamento</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard icon={Wallet} title="Saldo Total" value={fmt(summary.balanceTotal)} subtitle="Acumulado" color={summary.balanceTotal >= 0 ? 'success' : 'destructive'} />
          <KpiCard icon={TrendingUp} title="Saldo do Mês" value={fmt(summary.balanceMonth)} subtitle="Resultado mensal" color={summary.balanceMonth >= 0 ? 'success' : 'destructive'} />
          <KpiCard icon={ArrowUpCircle} title="Entradas (Mês)" value={fmt(summary.totalIn)} subtitle="Total recebido" color="success" />
          <KpiCard icon={ArrowDownCircle} title="Saídas (Mês)" value={fmt(summary.totalOut)} subtitle="Total gasto" color="warning" />
        </div>

        {/* Chart */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Movimentação dos Últimos 7 Dias</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(220,10%,46%)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(220,10%,46%)' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid hsl(220,13%,91%)', fontSize: 12 }} formatter={(v: number) => fmt(v)} />
                <Bar dataKey="entradas" name="Entradas" fill="hsl(142,71%,45%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="saidas" name="Saídas" fill="hsl(0,72%,51%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {['hoje', 'semana', 'mes', 'todos'].map(p => (
            <button key={p} onClick={() => setFilterPeriod(p)} className={cn("text-sm px-3 py-1.5 rounded-lg border transition-colors", filterPeriod === p ? 'bg-primary text-primary-foreground border-primary' : 'border-input bg-background text-muted-foreground hover:bg-accent')}>
              {p === 'hoje' ? 'Hoje' : p === 'semana' ? 'Semana' : p === 'mes' ? 'Mês' : 'Todos'}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-accent/50">
                <th className="text-left p-3 font-medium text-muted-foreground">Tipo</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Descrição</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Categoria</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Origem</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Valor</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Data</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Ações</th>
              </tr></thead>
              <tbody>
                {[...filtered].reverse().map(e => (
                  <tr key={e.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                    <td className="p-3"><span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", e.type === 'entrada' ? 'bg-emerald-100 text-emerald-700' : 'bg-destructive/10 text-destructive')}>{e.type === 'entrada' ? '↑ Entrada' : '↓ Saída'}</span></td>
                    <td className="p-3 font-medium text-foreground">{e.description}</td>
                    <td className="p-3 text-muted-foreground">{e.category || '—'}</td>
                    <td className="p-3 text-muted-foreground">{originLabel[e.origin]}</td>
                    <td className={cn("p-3 text-right font-semibold", e.type === 'entrada' ? 'text-emerald-600' : 'text-destructive')}>{e.type === 'entrada' ? '+' : '-'}{fmt(e.value)}</td>
                    <td className="p-3 text-muted-foreground">{new Date(e.date + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                    <td className="p-3 text-right">{e.origin === 'manual' && <button onClick={() => { deleteCashFlowEntry(e.id); reload(); toast.success('Removido'); }} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div className="p-8 text-center text-muted-foreground">Nenhuma movimentação no período.</div>}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md shadow-lg" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Novo Lançamento</h2>
                <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div><Label>Tipo</Label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as 'entrada' | 'saida' })} className="w-full h-10 border border-input rounded-md px-3 bg-background text-foreground text-sm">
                    <option value="entrada">Entrada</option><option value="saida">Saída</option>
                  </select>
                </div>
                <div><Label>Descrição</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Ex: Venda no cartão" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Categoria</Label><Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Vendas, Aluguel..." /></div>
                  <div><Label>Valor (R$)</Label><Input type="number" step="0.01" value={form.value || ''} onChange={e => setForm({ ...form, value: parseFloat(e.target.value) || 0 })} /></div>
                </div>
                <div><Label>Data</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
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
