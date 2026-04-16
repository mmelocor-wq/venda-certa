import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { getABCCurve, fmt } from '@/lib/store';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const curveColors = { A: 'hsl(142,71%,45%)', B: 'hsl(38,92%,50%)', C: 'hsl(0,72%,51%)' };
const curveBg = { A: 'bg-emerald-100 text-emerald-700', B: 'bg-amber-100 text-amber-700', C: 'bg-destructive/10 text-destructive' };

export default function ABCCurve() {
  const [criteria, setCriteria] = useState<'revenue' | 'profit'>('revenue');
  const [data, setData] = useState<ReturnType<typeof getABCCurve>>([]);

  useEffect(() => { setData(getABCCurve(criteria)); }, [criteria]);

  const countA = data.filter(d => d.curve === 'A').length;
  const countB = data.filter(d => d.curve === 'B').length;
  const countC = data.filter(d => d.curve === 'C').length;

  const chartData = data.map(d => ({
    name: d.name.length > 10 ? d.name.substring(0, 10) + '…' : d.name,
    valor: parseFloat(d.value.toFixed(2)),
    curve: d.curve,
  }));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Curva ABC</h1>
          <p className="text-muted-foreground text-sm mt-1">Classificação dos produtos por relevância no faturamento ou lucro</p>
        </div>

        {/* Criteria toggle */}
        <div className="flex gap-2">
          <button onClick={() => setCriteria('revenue')} className={cn("text-sm px-4 py-2 rounded-lg border transition-colors", criteria === 'revenue' ? 'bg-primary text-primary-foreground border-primary' : 'border-input bg-background text-muted-foreground hover:bg-accent')}>Por Faturamento</button>
          <button onClick={() => setCriteria('profit')} className={cn("text-sm px-4 py-2 rounded-lg border transition-colors", criteria === 'profit' ? 'bg-primary text-primary-foreground border-primary' : 'border-input bg-background text-muted-foreground hover:bg-accent')}>Por Lucro</button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 rounded-full bg-emerald-500" /><h3 className="text-sm font-semibold text-foreground">Curva A</h3></div>
            <p className="text-2xl font-bold text-foreground">{countA} produtos</p>
            <p className="text-xs text-muted-foreground">Mais relevantes — até 80% do {criteria === 'revenue' ? 'faturamento' : 'lucro'}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 rounded-full bg-amber-500" /><h3 className="text-sm font-semibold text-foreground">Curva B</h3></div>
            <p className="text-2xl font-bold text-foreground">{countB} produtos</p>
            <p className="text-xs text-muted-foreground">Intermediários — 80% a 95%</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 rounded-full bg-destructive" /><h3 className="text-sm font-semibold text-foreground">Curva C</h3></div>
            <p className="text-2xl font-bold text-foreground">{countC} produtos</p>
            <p className="text-xs text-muted-foreground">Menos relevantes — acima de 95%</p>
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Participação por Produto</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(220,10%,46%)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(220,10%,46%)' }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid hsl(220,13%,91%)', fontSize: 12 }} formatter={(v: number) => fmt(v)} />
                  <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, i) => <Cell key={i} fill={curveColors[entry.curve as keyof typeof curveColors]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-accent/50">
                <th className="text-left p-3 font-medium text-muted-foreground">Curva</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Produto</th>
                <th className="text-right p-3 font-medium text-muted-foreground">{criteria === 'revenue' ? 'Faturamento' : 'Lucro'}</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Participação</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Acumulado</th>
              </tr></thead>
              <tbody>
                {data.map(d => (
                  <tr key={d.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                    <td className="p-3"><span className={cn("text-xs px-2.5 py-1 rounded-full font-bold", curveBg[d.curve])}>{d.curve}</span></td>
                    <td className="p-3 font-medium text-foreground">{d.name}</td>
                    <td className="p-3 text-right text-foreground">{fmt(d.value)}</td>
                    <td className="p-3 text-right text-foreground">{d.share.toFixed(1)}%</td>
                    <td className="p-3 text-right text-muted-foreground">{d.cumulativePercentage.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.length === 0 && <div className="p-8 text-center text-muted-foreground">Nenhuma venda registrada para classificar.</div>}
        </div>
      </div>
    </AppLayout>
  );
}
