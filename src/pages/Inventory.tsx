import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Minus, Package, Plus, Search, Sparkles, Boxes, ShieldCheck } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import EmptyState from '@/components/EmptyState';
import FeatureHint from '@/components/FeatureHint';
import { addStockMovement, getProducts, type Product } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const reload = () => setProducts(getProducts());
  useEffect(reload, []);

  const filtered = useMemo(() => products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())), [products, search]);
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);
  const stockValue = products.reduce((sum, p) => sum + p.stock * p.costPrice, 0);

  const adjustStock = (product: Product, delta: number) => {
    if (delta < 0 && product.stock <= 0) return toast.error('Esse item já está zerado.');
    addStockMovement({ productId: product.id, productName: product.name, type: delta > 0 ? 'entrada' : 'saida', quantity: Math.abs(delta), reason: delta > 0 ? 'Ajuste rápido de entrada' : 'Ajuste rápido de saída' });
    toast.success(delta > 0 ? 'Estoque ajustado para cima.' : 'Estoque ajustado para baixo.');
    reload();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <section className="rounded-3xl border border-border/70 bg-card/95 p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"><Sparkles className="h-3.5 w-3.5" /> Estoque com leitura rápida</div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">Estoque</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">O objetivo aqui é simples: o usuário precisa bater o olho e entender onde está o risco, o excesso e a próxima ação.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:w-[520px]">
              <div className="rounded-2xl bg-accent/70 p-4"><p className="text-xs text-muted-foreground">Itens ativos</p><p className="mt-1 text-2xl font-bold text-foreground">{products.length}</p></div>
              <div className="rounded-2xl bg-accent/70 p-4"><p className="text-xs text-muted-foreground">Estoque crítico</p><p className="mt-1 text-2xl font-bold text-destructive">{lowStockProducts.length}</p></div>
              <div className="rounded-2xl bg-accent/70 p-4"><p className="text-xs text-muted-foreground">Capital em estoque</p><p className="mt-1 text-lg font-bold text-foreground">{stockValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p></div>
            </div>
          </div>
        </section>

        {lowStockProducts.length > 0 && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
            <div className="mb-2 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /><span className="text-sm font-semibold text-destructive">{lowStockProducts.length} produto(s) pedem reposição</span><FeatureHint content="Estoque abaixo do mínimo é um dos gatilhos mais importantes para retenção: o cliente percebe valor quando o sistema evita ruptura." /></div>
            <p className="text-xs text-muted-foreground">{lowStockProducts.slice(0, 8).map((p) => p.name).join(', ')}</p>
          </div>
        )}

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por produto ou categoria..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-12 rounded-2xl border-border/70 bg-card/90 pl-10 shadow-sm" />
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={Package} title={products.length === 0 ? 'Sem produtos em estoque' : 'Nada encontrado'} description={products.length === 0 ? 'Cadastre produtos para começar a controlar entradas, saídas e reposição.' : 'Ajuste a busca ou revise a categoria digitada.'} actionLabel={products.length === 0 ? 'Ir para produtos' : undefined} to={products.length === 0 ? '/produtos' : undefined} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => {
              const lowStock = p.stock <= p.minStock;
              return (
                <div key={p.id} className={cn('rounded-3xl border bg-card/95 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg', lowStock ? 'border-destructive/40' : 'border-border/70')}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{p.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{p.category}</p>
                    </div>
                    <div className={cn('rounded-full px-2.5 py-1 text-[11px] font-semibold', lowStock ? 'bg-destructive/10 text-destructive' : 'bg-emerald-500/10 text-emerald-600')}>
                      {lowStock ? 'Crítico' : 'Saudável'}
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-accent/60 p-4">
                      <p className="text-xs text-muted-foreground">Quantidade</p>
                      <p className={cn('mt-1 text-3xl font-bold', lowStock ? 'text-destructive' : 'text-foreground')}>{p.stock}</p>
                      <p className="text-xs text-muted-foreground">{p.unit} • mín: {p.minStock}</p>
                    </div>
                    <div className="rounded-2xl bg-accent/60 p-4">
                      <p className="text-xs text-muted-foreground">Valor imobilizado</p>
                      <p className="mt-1 text-sm font-bold text-foreground">{(p.stock * p.costPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                      <p className="text-xs text-muted-foreground">custo médio atual</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-2xl border border-border/70 bg-background/60 p-3">
                    <div className="flex items-center gap-2 text-sm text-foreground"><Boxes className="h-4 w-4 text-primary" /> Ajuste rápido</div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl" onClick={() => adjustStock(p, -1)}><Minus className="h-4 w-4" /></Button>
                      <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl" onClick={() => adjustStock(p, 1)}><Plus className="h-4 w-4" /></Button>
                    </div>
                  </div>

                  {lowStock ? (
                    <div className="mt-4 flex items-center gap-2 rounded-2xl bg-destructive/5 px-3 py-2 text-xs text-destructive"><AlertTriangle className="h-3.5 w-3.5" /> Este item já está abaixo do mínimo e merece reposição.</div>
                  ) : (
                    <div className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-500/5 px-3 py-2 text-xs text-emerald-600"><ShieldCheck className="h-3.5 w-3.5" /> Estoque dentro de uma faixa segura no momento.</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
