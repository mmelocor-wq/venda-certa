import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { getProducts, calcMargin, calcGrossProfit, calcIdealPrice, calcTotalVariableCostPercentage, type Product } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calculator, Search } from 'lucide-react';
import { Label } from '@/components/ui/label';

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function Pricing() {
  const [products, setProducts] = useState<Product[]>([]);
  const [desiredMargin, setDesiredMargin] = useState(30);
  const [search, setSearch] = useState('');

  useEffect(() => setProducts(getProducts()), []);

  const varPct = calcTotalVariableCostPercentage();

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const chartData = filtered.map(p => ({
    name: p.name.length > 10 ? p.name.substring(0, 10) + '…' : p.name,
    atual: p.salePrice,
    ideal: parseFloat(calcIdealPrice(p.costPrice, desiredMargin).toFixed(2)),
  }));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Precificação</h1>
          <p className="text-muted-foreground text-sm mt-1">Calcule o preço ideal de venda para cada produto</p>
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <Label className="text-xs">Margem desejada (%)</Label>
            <Input
              type="number"
              value={desiredMargin}
              onChange={e => setDesiredMargin(parseFloat(e.target.value) || 0)}
              className="w-28 mt-1"
            />
          </div>
          <div className="rounded-lg bg-accent px-3 py-2 text-xs text-muted-foreground">
            Custos variáveis: <span className="font-semibold text-foreground">{varPct.toFixed(1)}%</span> por venda
          </div>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>

        {/* Comparison chart */}
        {chartData.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold mb-4">Preço Atual vs. Preço Ideal</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(220,10%,46%)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(220,10%,46%)' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid hsl(220,13%,91%)', fontSize: 12 }}
                    formatter={(v: number) => fmt(v)}
                  />
                  <Bar dataKey="atual" name="Preço Atual" fill="hsl(220,70%,50%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ideal" name="Preço Ideal" fill="hsl(142,71%,45%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-accent/50">
                  <th className="text-left p-3 font-medium text-muted-foreground">Produto</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Custo</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Preço Atual</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Preço Ideal</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Margem Atual</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Lucro Bruto/un</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const margin = calcMargin(p);
                  const profit = calcGrossProfit(p);
                  const ideal = calcIdealPrice(p.costPrice, desiredMargin);
                  const isAbove = p.salePrice >= ideal;
                  return (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                      <td className="p-3 font-medium text-foreground">{p.name}</td>
                      <td className="p-3 text-right text-muted-foreground">{fmt(p.costPrice)}</td>
                      <td className="p-3 text-right font-medium">{fmt(p.salePrice)}</td>
                      <td className="p-3 text-right font-medium text-primary">{fmt(ideal)}</td>
                      <td className={cn("p-3 text-right font-semibold", margin < 15 ? 'text-destructive' : margin < 30 ? 'text-amber-600' : 'text-emerald-600')}>
                        {margin.toFixed(1)}%
                      </td>
                      <td className="p-3 text-right">{fmt(profit)}</td>
                      <td className="p-3 text-center">
                        <span className={cn(
                          "inline-block px-2 py-0.5 rounded-full text-xs font-medium",
                          isAbove ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive'
                        )}>
                          {isAbove ? '✓ OK' : '↑ Ajustar'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
