import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { getFixedCosts, addFixedCost, deleteFixedCost, getVariableCosts, addVariableCost, deleteVariableCost, calcTotalFixedCostMonthly, calcTotalVariableCostPercentage, type FixedCost, type VariableCost } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function Costs() {
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([]);
  const [variableCosts, setVariableCosts] = useState<VariableCost[]>([]);
  const [fc, setFc] = useState<{ name: string; value: number; recurrence: 'mensal' | 'anual' }>({ name: '', value: 0, recurrence: 'mensal' });
  const [vc, setVc] = useState({ name: '', percentage: 0, description: '' });

  const reload = () => { setFixedCosts(getFixedCosts()); setVariableCosts(getVariableCosts()); };
  useEffect(reload, []);

  const handleAddFixed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fc.name.trim()) return;
    addFixedCost(fc);
    setFc({ name: '', value: 0, recurrence: 'mensal' });
    toast.success('Custo fixo adicionado');
    reload();
  };

  const handleAddVariable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vc.name.trim()) return;
    addVariableCost(vc);
    setVc({ name: '', percentage: 0, description: '' });
    toast.success('Custo variável adicionado');
    reload();
  };

  const totalFixed = calcTotalFixedCostMonthly();
  const totalVarPct = calcTotalVariableCostPercentage();

  const pieData = fixedCosts.map(c => ({
    name: c.name,
    value: c.recurrence === 'anual' ? c.value / 12 : c.value
  }));
  const pieColors = ['hsl(220,70%,50%)', 'hsl(142,71%,45%)', 'hsl(38,92%,50%)', 'hsl(280,65%,60%)', 'hsl(0,72%,51%)', 'hsl(200,70%,50%)'];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Custos</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie custos fixos e variáveis</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fixed Costs */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-foreground">Custos Fixos</h2>
                  <p className="text-xs text-muted-foreground">Total mensal: {fmt(totalFixed)}</p>
                </div>
              </div>

              <form onSubmit={handleAddFixed} className="flex gap-2 mb-4">
                <Input placeholder="Nome" value={fc.name} onChange={e => setFc({ ...fc, name: e.target.value })} className="flex-1" />
                <Input type="number" step="0.01" placeholder="Valor" value={fc.value || ''} onChange={e => setFc({ ...fc, value: parseFloat(e.target.value) || 0 })} className="w-24" />
                <select value={fc.recurrence} onChange={e => setFc({ ...fc, recurrence: e.target.value as 'mensal' | 'anual' })} className="text-sm border border-input rounded-md px-2 bg-background">
                  <option value="mensal">Mensal</option>
                  <option value="anual">Anual</option>
                </select>
                <Button type="submit" size="icon"><Plus className="h-4 w-4" /></Button>
              </form>

              <div className="space-y-2">
                {fixedCosts.map(c => (
                  <div key={c.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-accent/50">
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.recurrence}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{fmt(c.value)}</span>
                      <button onClick={() => { deleteFixedCost(c.id); reload(); }} className="p-1 hover:text-destructive text-muted-foreground">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pie chart */}
            {pieData.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold mb-3">Distribuição Custos Fixos</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={2}>
                        {pieData.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {pieData.map((d, i) => (
                    <span key={d.name} className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pieColors[i % pieColors.length] }} />
                      {d.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Variable Costs */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4">
              <h2 className="font-semibold text-foreground">Custos Variáveis</h2>
              <p className="text-xs text-muted-foreground">Total: {totalVarPct.toFixed(1)}% sobre cada venda</p>
            </div>

            <form onSubmit={handleAddVariable} className="flex gap-2 mb-4">
              <Input placeholder="Nome" value={vc.name} onChange={e => setVc({ ...vc, name: e.target.value })} className="flex-1" />
              <Input type="number" step="0.1" placeholder="%" value={vc.percentage || ''} onChange={e => setVc({ ...vc, percentage: parseFloat(e.target.value) || 0 })} className="w-20" />
              <Button type="submit" size="icon"><Plus className="h-4 w-4" /></Button>
            </form>

            <div className="space-y-2">
              {variableCosts.map(c => (
                <div key={c.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-accent/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{c.percentage}%</span>
                    <button onClick={() => { deleteVariableCost(c.id); reload(); }} className="p-1 hover:text-destructive text-muted-foreground">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {variableCosts.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-6">Nenhum custo variável cadastrado.</p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
