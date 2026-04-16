import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import KpiCard from '@/components/KpiCard';
import { getGoals, addGoal, deleteGoal, getSales, getProductPerformance, type Goal, fmt } from '@/lib/store';
import { Plus, Trash2, X, Target, TrendingUp, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'faturamento' as Goal['type'], targetValue: 0 });

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const reload = () => setGoals(getGoals());
  useEffect(reload, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.targetValue) { toast.error('Defina o valor da meta'); return; }
    addGoal({ ...form, month: currentMonth, year: currentYear });
    setForm({ type: 'faturamento', targetValue: 0 });
    setShowForm(false);
    toast.success('Meta cadastrada');
    reload();
  };

  // Calculate actuals
  const sales = getSales();
  const monthSales = sales.filter(s => {
    const d = new Date(s.createdAt);
    return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
  });
  const monthRevenue = monthSales.reduce((s, sale) => s + sale.total, 0);
  const monthSalesCount = monthSales.length;
  const perf = getProductPerformance();
  const monthProfit = monthSales.reduce((s, sale) => {
    return s + sale.items.reduce((si, item) => {
      const p = perf.find(pr => pr.id === item.productId);
      return si + (p ? p.grossProfit * item.quantity : 0);
    }, 0);
  }, 0);

  // Previous month
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  const prevSales = sales.filter(s => {
    const d = new Date(s.createdAt);
    return d.getMonth() + 1 === prevMonth && d.getFullYear() === prevYear;
  });
  const prevRevenue = prevSales.reduce((s, sale) => s + sale.total, 0);

  const currentGoals = goals.filter(g => g.month === currentMonth && g.year === currentYear);
  const getActual = (type: string) => {
    if (type === 'faturamento') return monthRevenue;
    if (type === 'lucro') return monthProfit;
    return monthSalesCount;
  };

  const typeLabels: Record<string, string> = { faturamento: 'Faturamento', lucro: 'Lucro', vendas: 'Vendas' };
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Metas</h1>
            <p className="text-muted-foreground text-sm mt-1">Desempenho de {monthNames[currentMonth - 1]}/{currentYear}</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2"><Plus className="h-4 w-4" /> Nova Meta</Button>
        </div>

        {/* Performance summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard icon={DollarSign} title="Faturamento Mês" value={fmt(monthRevenue)} subtitle={prevRevenue > 0 ? `Mês anterior: ${fmt(prevRevenue)}` : 'Sem dados anteriores'} color="primary" />
          <KpiCard icon={TrendingUp} title="Lucro Mês" value={fmt(monthProfit)} subtitle="Lucro bruto estimado" color="success" />
          <KpiCard icon={Target} title="Vendas Mês" value={String(monthSalesCount)} subtitle={`${prevSales.length} no mês anterior`} color="warning" />
          <KpiCard icon={TrendingUp} title="Variação" value={prevRevenue > 0 ? `${(((monthRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1)}%` : '—'} subtitle="vs mês anterior" color={monthRevenue >= prevRevenue ? 'success' : 'destructive'} />
        </div>

        {/* Goals progress */}
        {currentGoals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentGoals.map(g => {
              const actual = getActual(g.type);
              const pct = g.targetValue > 0 ? (actual / g.targetValue) * 100 : 0;
              const remaining = Math.max(0, g.targetValue - actual);
              return (
                <div key={g.id} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-foreground">{typeLabels[g.type]}</h3>
                    <button onClick={() => { deleteGoal(g.id); reload(); toast.success('Meta removida'); }} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{pct.toFixed(0)}% atingido</span>
                      <span>Meta: {g.type === 'vendas' ? g.targetValue : fmt(g.targetValue)}</span>
                    </div>
                    <div className="h-3 bg-accent rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all", pct >= 100 ? 'bg-emerald-500' : pct >= 70 ? 'bg-primary' : 'bg-amber-500')} style={{ width: `${Math.min(100, pct)}%` }} />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-foreground font-medium">Atual: {g.type === 'vendas' ? actual : fmt(actual)}</span>
                    <span className="text-muted-foreground">Falta: {g.type === 'vendas' ? remaining : fmt(remaining)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {currentGoals.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            <Target className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            <p>Nenhuma meta definida para este mês.</p>
            <p className="text-xs mt-1">Crie metas para acompanhar o desempenho da loja.</p>
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <div className="bg-card rounded-xl border border-border p-6 w-full max-w-sm shadow-lg" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Nova Meta — {monthNames[currentMonth - 1]}/{currentYear}</h2>
                <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div><Label>Tipo</Label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as Goal['type'] })} className="w-full h-10 border border-input rounded-md px-3 bg-background text-foreground text-sm">
                    <option value="faturamento">Faturamento (R$)</option>
                    <option value="lucro">Lucro (R$)</option>
                    <option value="vendas">Nº de Vendas</option>
                  </select>
                </div>
                <div><Label>Valor da Meta</Label><Input type="number" step="0.01" value={form.targetValue || ''} onChange={e => setForm({ ...form, targetValue: parseFloat(e.target.value) || 0 })} placeholder={form.type === 'vendas' ? 'Ex: 100' : 'Ex: 50000'} /></div>
                <Button type="submit" className="w-full">Criar Meta</Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
