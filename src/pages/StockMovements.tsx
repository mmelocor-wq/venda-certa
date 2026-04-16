import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { getStockMovements, getProducts, type StockMovement } from '@/lib/store';
import { ArrowDownCircle, ArrowUpCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StockMovements() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [filterType, setFilterType] = useState('');
  const [filterProduct, setFilterProduct] = useState('');

  useEffect(() => { setMovements(getStockMovements()); }, []);
  const products = getProducts();

  const filtered = movements.filter(m => {
    if (filterType && m.type !== filterType) return false;
    if (filterProduct && m.productId !== filterProduct) return false;
    return true;
  });

  const typeIcon = (t: string) => {
    if (t === 'entrada') return <ArrowDownCircle className="h-4 w-4 text-emerald-600" />;
    if (t === 'saida') return <ArrowUpCircle className="h-4 w-4 text-destructive" />;
    return <RefreshCw className="h-4 w-4 text-primary" />;
  };

  const typeLabel: Record<string, string> = { entrada: 'Entrada', saida: 'Saída', ajuste: 'Ajuste' };
  const typeColor: Record<string, string> = { entrada: 'bg-emerald-100 text-emerald-700', saida: 'bg-destructive/10 text-destructive', ajuste: 'bg-primary/10 text-primary' };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Movimentações de Estoque</h1>
          <p className="text-muted-foreground text-sm mt-1">Histórico completo de entradas, saídas e ajustes</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <ArrowDownCircle className="h-8 w-8 text-emerald-600" />
            <div><p className="text-xs text-muted-foreground">Entradas</p><p className="text-lg font-bold text-foreground">{movements.filter(m => m.type === 'entrada').length}</p></div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <ArrowUpCircle className="h-8 w-8 text-destructive" />
            <div><p className="text-xs text-muted-foreground">Saídas</p><p className="text-lg font-bold text-foreground">{movements.filter(m => m.type === 'saida').length}</p></div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <RefreshCw className="h-8 w-8 text-primary" />
            <div><p className="text-xs text-muted-foreground">Ajustes</p><p className="text-lg font-bold text-foreground">{movements.filter(m => m.type === 'ajuste').length}</p></div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="text-sm border border-input rounded-lg px-3 py-2 bg-background text-foreground">
            <option value="">Todos os tipos</option>
            <option value="entrada">Entradas</option>
            <option value="saida">Saídas</option>
            <option value="ajuste">Ajustes</option>
          </select>
          <select value={filterProduct} onChange={e => setFilterProduct(e.target.value)} className="text-sm border border-input rounded-lg px-3 py-2 bg-background text-foreground">
            <option value="">Todos os produtos</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-accent/50">
                <th className="text-left p-3 font-medium text-muted-foreground">Tipo</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Produto</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Quantidade</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Motivo</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Data/Hora</th>
              </tr></thead>
              <tbody>
                {[...filtered].reverse().map(m => (
                  <tr key={m.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {typeIcon(m.type)}
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", typeColor[m.type])}>{typeLabel[m.type]}</span>
                      </div>
                    </td>
                    <td className="p-3 font-medium text-foreground">{m.productName}</td>
                    <td className="p-3 text-right font-semibold text-foreground">{m.quantity}</td>
                    <td className="p-3 text-muted-foreground">{m.reason}</td>
                    <td className="p-3 text-muted-foreground">{new Date(m.createdAt).toLocaleString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div className="p-8 text-center text-muted-foreground">Nenhuma movimentação registrada.</div>}
        </div>
      </div>
    </AppLayout>
  );
}
