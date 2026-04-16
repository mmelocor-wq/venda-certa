import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Package, Barcode, Search, Boxes, Sparkles, AlertTriangle, TrendingUp, ScanBarcode, ShieldAlert } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import EmptyState from '@/components/EmptyState';
import FeatureHint from '@/components/FeatureHint';
import { getProducts, addProduct, updateProduct, deleteProduct, calcMargin, type Product } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const emptyForm = { name: '', category: '', costPrice: 0, salePrice: 0, stock: 0, minStock: 5, unit: 'un', barcode: '' };

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);

  const reload = () => setProducts(getProducts());
  useEffect(reload, []);

  const filteredProducts = useMemo(() => {
    const term = search.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term) || (p.barcode || '').includes(search));
  }, [products, search]);

  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;
  const avgMargin = products.length ? products.reduce((s, p) => s + calcMargin(p), 0) / products.length : 0;

  const marginPreview = calcMargin({ ...form, id: 'preview', createdAt: new Date().toISOString() } as Product);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Digite um nome para o produto.');
    if (!form.category.trim()) return toast.error('Escolha ou digite uma categoria.');
    if (form.costPrice <= 0) return toast.error('O preço de custo precisa ser maior que zero.');
    if (form.salePrice <= 0) return toast.error('O preço de venda precisa ser maior que zero.');
    if (form.stock < 0 || form.minStock < 0) return toast.error('Estoque e estoque mínimo não podem ser negativos.');
    const duplicateBarcode = products.find((p) => p.barcode && form.barcode && p.barcode === form.barcode && p.id !== editId);
    if (duplicateBarcode) return toast.error('Já existe outro produto com este código de barras.');

    if (editId) {
      updateProduct(editId, form);
      toast.success('Produto atualizado com sucesso.');
    } else {
      addProduct(form);
      toast.success('Produto cadastrado com sucesso.');
    }
    setForm(emptyForm);
    setShowForm(false);
    setEditId(null);
    reload();
  };

  const handleEdit = (p: Product) => {
    setForm({ name: p.name, category: p.category, costPrice: p.costPrice, salePrice: p.salePrice, stock: p.stock, minStock: p.minStock, unit: p.unit, barcode: p.barcode || '' });
    setEditId(p.id);
    setShowForm(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <section className="rounded-3xl border border-border/70 bg-card/95 p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"><Sparkles className="h-3.5 w-3.5" /> Catálogo mais forte</div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">Produtos</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Esta é uma das telas que mais vende o produto. Quanto mais rápida e confiável ela parecer, maior a chance de o lojista continuar usando o sistema no dia a dia.</p>
            </div>
            <Button onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }} className="gap-2 rounded-xl"><Plus className="h-4 w-4" /> Novo produto</Button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-accent/70 p-4"><p className="text-xs text-muted-foreground">Produtos cadastrados</p><p className="mt-1 text-2xl font-bold text-foreground">{products.length}</p></div>
            <div className="rounded-2xl bg-accent/70 p-4"><p className="text-xs text-muted-foreground">Estoque crítico</p><p className="mt-1 text-2xl font-bold text-destructive">{lowStockCount}</p></div>
            <div className="rounded-2xl bg-accent/70 p-4"><p className="text-xs text-muted-foreground">Margem média</p><p className="mt-1 text-2xl font-bold text-foreground">{avgMargin.toFixed(1)}%</p></div>
            <div className="rounded-2xl bg-accent/70 p-4"><p className="text-xs text-muted-foreground">Próximo ganho rápido</p><p className="mt-1 text-sm font-semibold text-foreground">Padronize código de barras e categoria</p></div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Busque por nome, categoria ou código de barras..." className="h-12 rounded-2xl border-border/70 bg-card/90 pl-10 shadow-sm" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-card/90 p-4"><div className="flex items-center gap-2 text-foreground"><ScanBarcode className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">Busca pronta para leitor</span></div><p className="mt-2 text-xs leading-5 text-muted-foreground">Use o campo acima para busca manual ou leitura por código.</p></div>
            <div className="rounded-2xl border border-border/70 bg-card/90 p-4"><div className="flex items-center gap-2 text-foreground"><TrendingUp className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">Margem visível</span></div><p className="mt-2 text-xs leading-5 text-muted-foreground">O lojista precisa perceber lucro sem abrir outra tela.</p></div>
            <div className="rounded-2xl border border-border/70 bg-card/90 p-4"><div className="flex items-center gap-2 text-foreground"><ShieldAlert className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">Alertas claros</span></div><p className="mt-2 text-xs leading-5 text-muted-foreground">Estoque baixo e margem ruim precisam saltar aos olhos.</p></div>
          </div>
        </section>

        {filteredProducts.length === 0 ? (
          <EmptyState icon={Package} title={products.length === 0 ? 'Seu catálogo começa aqui' : 'Nada encontrado com essa busca'} description={products.length === 0 ? 'Cadastre seus primeiros produtos para destravar estoque, precificação e caixa.' : 'Tente buscar por nome, categoria ou código de barras.'} actionLabel={products.length === 0 ? 'Cadastrar primeiro produto' : undefined} to={products.length === 0 ? '/produtos' : undefined} />
        ) : (
          <div className="overflow-hidden rounded-3xl border border-border/70 bg-card/95 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/70 bg-accent/50 text-left">
                    <th className="p-4 font-medium text-muted-foreground">Produto</th>
                    <th className="p-4 font-medium text-muted-foreground">Categoria</th>
                    <th className="p-4 text-right font-medium text-muted-foreground">Custo</th>
                    <th className="p-4 text-right font-medium text-muted-foreground">Venda</th>
                    <th className="p-4 text-right font-medium text-muted-foreground">Margem <FeatureHint content="Margens muito baixas costumam corroer lucro mesmo quando a venda está acontecendo." /></th>
                    <th className="p-4 text-right font-medium text-muted-foreground">Estoque</th>
                    <th className="p-4 text-right font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => {
                    const margin = calcMargin(p);
                    const lowStock = p.stock <= p.minStock;
                    return (
                      <tr key={p.id} className="border-b border-border/60 last:border-0 transition-colors hover:bg-accent/30">
                        <td className="p-4"><p className="font-semibold text-foreground">{p.name}</p>{p.barcode && <p className="mt-1 text-xs text-muted-foreground">Código: {p.barcode}</p>}</td>
                        <td className="p-4 text-muted-foreground">{p.category}</td>
                        <td className="p-4 text-right text-muted-foreground">{fmt(p.costPrice)}</td>
                        <td className="p-4 text-right font-medium text-foreground">{fmt(p.salePrice)}</td>
                        <td className={cn('p-4 text-right font-semibold', margin < 15 ? 'text-destructive' : margin < 30 ? 'text-amber-600' : 'text-emerald-600')}>{margin.toFixed(1)}%</td>
                        <td className="p-4 text-right">
                          <div className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', lowStock ? 'bg-destructive/10 text-destructive' : 'bg-emerald-500/10 text-emerald-600')}>{p.stock} {p.unit}</div>
                          <p className="mt-1 text-[11px] text-muted-foreground">mín: {p.minStock}</p>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleEdit(p)} className="rounded-xl border border-border/70 p-2 text-muted-foreground transition-all hover:border-primary/20 hover:bg-accent hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                            <button onClick={() => { deleteProduct(p.id); toast.success('Produto removido.'); reload(); }} className="rounded-xl border border-border/70 p-2 text-muted-foreground transition-all hover:border-destructive/20 hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-h-[92vh] max-w-3xl overflow-auto rounded-3xl border-border/70 bg-background/95 shadow-2xl">
            <DialogHeader>
              <DialogTitle>{editId ? 'Editar produto' : 'Novo produto'}</DialogTitle>
              <DialogDescription>Nome, custo, preço e estoque já te colocam em operação. O resto você pode refinar aos poucos.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5">
              <section className="rounded-2xl border border-border/70 p-4">
                <div className="mb-4 flex items-center gap-2"><Package className="h-4 w-4 text-primary" /><h3 className="text-sm font-semibold text-foreground">Informações básicas</h3></div>
                <div className="space-y-3">
                  <div><Label>Nome do produto</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Camiseta básica preta" /></div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div><Label>Categoria</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Ex: Vestuário" /></div>
                    <div><Label>Código de barras</Label><div className="relative"><Barcode className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} className="pl-10" placeholder="Ex: 7891234560011" /></div></div>
                  </div>
                </div>
              </section>
              <section className="rounded-2xl border border-border/70 p-4">
                <div className="mb-4 flex items-center gap-2"><Boxes className="h-4 w-4 text-primary" /><h3 className="text-sm font-semibold text-foreground">Preço e estoque</h3></div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div><Label>Preço de custo (R$)</Label><Input type="number" step="0.01" value={form.costPrice || ''} onChange={(e) => setForm({ ...form, costPrice: parseFloat(e.target.value) || 0 })} /></div>
                  <div><Label>Preço de venda (R$)</Label><Input type="number" step="0.01" value={form.salePrice || ''} onChange={(e) => setForm({ ...form, salePrice: parseFloat(e.target.value) || 0 })} /></div>
                  <div><Label>Estoque atual</Label><Input type="number" value={form.stock || ''} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} /></div>
                  <div><Label>Estoque mínimo</Label><Input type="number" value={form.minStock || ''} onChange={(e) => setForm({ ...form, minStock: parseInt(e.target.value) || 0 })} /></div>
                  <div><Label>Unidade</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="un, kg, par" /></div>
                  <div className="rounded-2xl bg-accent/70 p-4">
                    <p className="text-xs text-muted-foreground">Margem estimada</p>
                    <p className={cn('mt-1 text-2xl font-bold', marginPreview < 15 ? 'text-destructive' : marginPreview < 30 ? 'text-amber-600' : 'text-emerald-600')}>{marginPreview.toFixed(1)}%</p>
                    <p className="mt-1 text-xs text-muted-foreground">Uma prévia simples para decidir se o preço está saudável.</p>
                  </div>
                </div>
              </section>
              <Button type="submit" className="w-full rounded-xl">{editId ? 'Salvar alterações' : 'Cadastrar produto'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
