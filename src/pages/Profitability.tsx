import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { getProductPerformance, fmt } from '@/lib/store';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Profitability() {
  const [perf, setPerf] = useState<ReturnType<typeof getProductPerformance>>([]);
  const [sortBy, setSortBy] = useState<'margin' | 'totalProfit' | 'totalRevenue'>('totalProfit');

  useEffect(() => { setPerf(getProductPerformance()); }, []);

  const sorted = [...perf].sort((a, b) => b[sortBy] - a[sortBy]);
  const losers = perf.filter(p => p.margin < 0);
  const lowMargin = perf.filter(p => p.margin >= 0 && p.margin < 15);
  const highSalesLowProfit = perf.filter(p => p.totalQtySold > 5 && p.margin < 20);

  const chartData = sorted.slice(0, 10).map(p => ({
    name: p.name.length > 10 ? p.name.substring(0, 10) + '…' : p.name,
    lucro: parseFloat(p.totalProfit.toFixed(2)),
    margem: parseFloat(p.margin.toFixed(1)),
  }));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Rentabilidade</h1>
          <p className="text-muted-foreground text-sm mt-1">Margem real e lucro por produto</p>
        </div>

        {/* Alerts */}
        {losers.length > 0 && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <h3 className="text-sm font-semibold text-destructive mb-1">⚠️ Produtos no Prejuízo</h3>
            <div className="space-y-1">{losers.map(p => <p key={p.id} className="text-sm text-muted-foreground"><span className="font-medium text-foreground">{p.name}</span> — margem {p.margin.toFixed(1)}%</p>)}</div>
          </div>
        )}
        {highSalesLowProfit.length > 0 && (
          <div className="rounded-xl border border-amber-300/30 bg-amber-50 p-4">
            <h3 className="text-sm font-semibold text-amber-700 mb-1">💡 Vendem Muito, Lucram Pouco</h3>
            <div className="space-y-1">{highSalesLowProfit.map(p => <p key={p.id} className="text-sm text-muted-foreground"><span className="font-medium text-foreground">{p.name}</span> — {p.totalQtySold} vendidos, margem {p.margin.toFixed(1)}%</p>)}</div>
          </div>
        )}

        {/* Chart */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Lucro Total por Produto</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(220,10%,46%)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(220,10%,46%)' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid hsl(220,13%,91%)', fontSize: 12 }} formatter={(v: number, name: string) => [name === 'lucro' ? fmt(v) : `${v}%`, name === 'lucro' ? 'Lucro Total' : 'Margem']} />
                <Bar dataKey="lucro" fill="hsl(142,71%,45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sort */}
        <div className="flex gap-2">
          {[{ key: 'totalProfit' as const, label: 'Lucro Total' }, { key: 'margin' as const, label: 'Margem %' }, { key: 'totalRevenue' as const, label: 'Faturamento' }].map(s => (
            <button key={s.key} onClick={() => setSortBy(s.key)} className={cn("text-sm px-3 py-1.5 rounded-lg border transition-colors", sortBy === s.key ? 'bg-primary text-primary-foreground border-primary' : 'border-input bg-background text-muted-foreground hover:bg-accent')}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-accent/50">
                <th className="text-left p-3 font-medium text-muted-foreground">Produto</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Custo</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Venda</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Margem</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Vendidos</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Faturamento</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Lucro Total</th>
              </tr></thead>
              <tbody>
                {sorted.map(p => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                    <td className="p-3 font-medium text-foreground">{p.name}</td>
                    <td className="p-3 text-right text-muted-foreground">{fmt(p.costPrice)}</td>
                    <td className="p-3 text-right text-foreground">{fmt(p.salePrice)}</td>
                    <td className={cn("p-3 text-right font-semibold", p.margin < 0 ? 'text-destructive' : p.margin < 15 ? 'text-amber-600' : 'text-emerald-600')}>{p.margin.toFixed(1)}%</td>
                    <td className="p-3 text-right text-foreground">{p.totalQtySold}</td>
                    <td className="p-3 text-right text-foreground">{fmt(p.totalRevenue)}</td>
                    <td className={cn("p-3 text-right font-semibold", p.totalProfit < 0 ? 'text-destructive' : 'text-emerald-600')}>{fmt(p.totalProfit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {perf.length === 0 && <div className="p-8 text-center text-muted-foreground">Nenhum produto cadastrado.</div>}
        </div>
      </div>
    </AppLayout>
  );
}
