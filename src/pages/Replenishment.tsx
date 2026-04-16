import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { getProductPerformance, getSuppliers, fmt } from '@/lib/store';
import { cn } from '@/lib/utils';
import { AlertTriangle, PackageX, TrendingDown, ShoppingCart } from 'lucide-react';

export default function Replenishment() {
  const [perf, setPerf] = useState<ReturnType<typeof getProductPerformance>>([]);

  useEffect(() => { setPerf(getProductPerformance()); }, []);

  const suppliers = getSuppliers();
  const needsReorder = perf.filter(p => p.stock <= p.minStock || p.suggestedReorder > 0).sort((a, b) => a.daysOfStock - b.daysOfStock);
  const stalled = perf.filter(p => p.daysSinceLastSale > 30 && p.stock > 0);
  const totalCapital = perf.reduce((s, p) => s + p.capitalInStock, 0);
  const stalledCapital = stalled.reduce((s, p) => s + p.capitalInStock, 0);

  const turnoverLabel: Record<string, string> = { alto: '🟢 Alto', medio: '🟡 Médio', baixo: '🔴 Baixo' };
  const turnoverColor: Record<string, string> = { alto: 'text-emerald-600', medio: 'text-amber-600', baixo: 'text-destructive' };

  const getSupplierForProduct = (productId: string) => {
    return suppliers.find(s => s.productIds?.includes(productId));
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reposição & Giro</h1>
          <p className="text-muted-foreground text-sm mt-1">Inteligência de estoque e sugestão de compra</p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card p-5 flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive"><AlertTriangle className="h-5 w-5" /></div>
            <div><p className="text-sm text-muted-foreground">Precisam Reposição</p><p className="text-2xl font-bold text-foreground">{needsReorder.length}</p></div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600"><PackageX className="h-5 w-5" /></div>
            <div><p className="text-sm text-muted-foreground">Produtos Parados</p><p className="text-2xl font-bold text-foreground">{stalled.length}</p><p className="text-xs text-muted-foreground">Sem venda há 30+ dias</p></div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary"><ShoppingCart className="h-5 w-5" /></div>
            <div><p className="text-sm text-muted-foreground">Capital em Estoque</p><p className="text-2xl font-bold text-foreground">{fmt(totalCapital)}</p></div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600"><TrendingDown className="h-5 w-5" /></div>
            <div><p className="text-sm text-muted-foreground">Capital Parado</p><p className="text-2xl font-bold text-foreground">{fmt(stalledCapital)}</p></div>
          </div>
        </div>

        {/* Reorder suggestions */}
        {needsReorder.length > 0 && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <h3 className="text-sm font-semibold text-destructive mb-2">🔔 Sugestão de Compra</h3>
            <p className="text-xs text-muted-foreground mb-3">Baseado no ritmo de vendas dos últimos 30 dias</p>
            <div className="space-y-2">
              {needsReorder.map(p => {
                const supplier = getSupplierForProduct(p.id);
                return (
                  <div key={p.id} className="flex items-center justify-between bg-card rounded-lg p-3 border border-border">
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">Estoque: {p.stock} | Mín: {p.minStock} | Dura ~{p.daysOfStock === 999 ? '∞' : p.daysOfStock} dias</p>
                      {supplier && <p className="text-xs text-primary mt-0.5">📦 Fornecedor: {supplier.name}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">Comprar: {p.suggestedReorder} {p.unit}</p>
                      <p className="text-xs text-muted-foreground">{fmt(p.suggestedReorder * p.costPrice)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Full table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-accent/50">
                <th className="text-left p-3 font-medium text-muted-foreground">Produto</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Estoque</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Vendas/30d</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Dias Estoque</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Últ. Venda</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Giro</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Capital</th>
              </tr></thead>
              <tbody>
                {perf.sort((a, b) => a.daysOfStock - b.daysOfStock).map(p => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                    <td className="p-3 font-medium text-foreground">{p.name}</td>
                    <td className={cn("p-3 text-right", p.stock <= p.minStock && 'text-destructive font-semibold')}>{p.stock} {p.unit}</td>
                    <td className="p-3 text-right text-foreground">{p.recentSales}</td>
                    <td className="p-3 text-right text-foreground">{p.daysOfStock === 999 ? '∞' : p.daysOfStock}</td>
                    <td className="p-3 text-right text-muted-foreground">{p.lastSaleDate ? `${p.daysSinceLastSale}d atrás` : 'Nunca'}</td>
                    <td className={cn("p-3 text-sm font-medium", turnoverColor[p.turnover])}>{turnoverLabel[p.turnover]}</td>
                    <td className="p-3 text-right text-foreground">{fmt(p.capitalInStock)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
