import { useEffect, useMemo, useRef, useState } from 'react';
import { Barcode, CheckCircle, Minus, Plus, Search, ShoppingCart, Trash2, Sparkles, Clock3, CreditCard, UserRound } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import EmptyState from '@/components/EmptyState';
import FeatureHint from '@/components/FeatureHint';
import { getProducts, type Product, findProductByBarcode, addSale, type SaleItem, getSales, fmt, type Sale, getCustomers, type Customer } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function POS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [search, setSearch] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [sales, setSales] = useState<Sale[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const barcodeRef = useRef<HTMLInputElement>(null);

  const reload = () => { setProducts(getProducts()); setSales(getSales()); setCustomers(getCustomers()); };
  useEffect(reload, []);

  const addToCart = (product: Product, qty = 1) => {
    if (product.stock < qty) return toast.error(`Estoque insuficiente: ${product.stock} ${product.unit}`);
    const existing = cart.find((i) => i.productId === product.id);
    if (existing) {
      const newQty = existing.quantity + qty;
      if (newQty > product.stock) return toast.error('Estoque insuficiente para aumentar a quantidade.');
      setCart(cart.map((i) => i.productId === product.id ? { ...i, quantity: newQty, subtotal: newQty * i.unitPrice } : i));
    } else {
      setCart([...cart, { productId: product.id, productName: product.name, quantity: qty, unitPrice: product.salePrice, subtotal: product.salePrice * qty }]);
    }
  };

  const updateQty = (productId: string, delta: number) => {
    const product = products.find((p) => p.id === productId);
    setCart((prev) => prev.flatMap((i) => {
      if (i.productId !== productId) return [i];
      const newQty = i.quantity + delta;
      if (newQty <= 0) return [];
      if (product && newQty > product.stock) {
        toast.error('Estoque insuficiente.');
        return [i];
      }
      return [{ ...i, quantity: newQty, subtotal: newQty * i.unitPrice }];
    }));
  };

  const handleBarcode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    const product = findProductByBarcode(barcodeInput.trim());
    if (product) {
      addToCart(product);
      toast.success(`${product.name} entrou no carrinho.`);
    } else toast.error('Produto não encontrado para esse código.');
    setBarcodeInput('');
    barcodeRef.current?.focus();
  };

  const finalizeSale = () => {
    if (cart.length === 0) return toast.error('Adicione itens antes de finalizar.');
    addSale(cart, 'Operador', selectedCustomer?.id, selectedCustomer?.name);
    setCart([]);
    setSelectedCustomer(null);
    toast.success('Venda finalizada com sucesso.');
    reload();
  };

  const total = cart.reduce((s, i) => s + i.subtotal, 0);
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const filtered = useMemo(() => products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode?.includes(search)), [products, search]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <section className="rounded-3xl border border-border/70 bg-card/95 p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"><Sparkles className="h-3.5 w-3.5" /> Tela que vende o produto</div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">Caixa / PDV</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">O caixa precisa passar sensação de velocidade, segurança e clareza. Se esta tela for boa, o sistema inteiro parece mais forte.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant={showHistory ? 'outline' : 'default'} className="rounded-xl" onClick={() => setShowHistory(false)}>Caixa</Button>
              <Button variant={showHistory ? 'default' : 'outline'} className="rounded-xl" onClick={() => setShowHistory(true)}>Histórico</Button>
            </div>
          </div>
        </section>

        {showHistory ? (
          <div className="overflow-hidden rounded-3xl border border-border/70 bg-card/95 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border/70 bg-accent/50"><th className="p-4 text-left font-medium text-muted-foreground">Venda</th><th className="p-4 text-left font-medium text-muted-foreground">Cliente</th><th className="p-4 text-left font-medium text-muted-foreground">Data</th><th className="p-4 text-right font-medium text-muted-foreground">Itens</th><th className="p-4 text-right font-medium text-muted-foreground">Total</th></tr></thead>
                <tbody>
                  {[...sales].reverse().map((s) => (
                    <tr key={s.id} className="border-b border-border/60 last:border-0 hover:bg-accent/30">
                      <td className="p-4 font-semibold text-foreground">#{s.id.substring(0, 6)}</td>
                      <td className="p-4 text-muted-foreground">{s.customerName || '—'}</td>
                      <td className="p-4 text-muted-foreground">{new Date(s.createdAt).toLocaleString('pt-BR')}</td>
                      <td className="p-4 text-right text-muted-foreground">{s.items.length}</td>
                      <td className="p-4 text-right font-semibold text-foreground">{fmt(s.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {sales.length === 0 && <div className="p-10"><EmptyState icon={Clock3} title="Nenhuma venda registrada ainda" description="Assim que você concluir a primeira venda, o histórico começa a mostrar o ritmo real da operação." actionLabel="Voltar ao caixa" to="/caixa" /></div>}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="space-y-4 lg:col-span-3">
              <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                <form onSubmit={handleBarcode} className="flex gap-2">
                  <div className="relative flex-1">
                    <Barcode className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input ref={barcodeRef} value={barcodeInput} onChange={(e) => setBarcodeInput(e.target.value)} placeholder="Ler ou digitar código de barras..." className="h-12 rounded-2xl border-border/70 bg-card/90 pl-10 shadow-sm" autoFocus />
                  </div>
                  <Button type="submit" variant="outline" className="rounded-2xl">Buscar</Button>
                </form>
                <div className="rounded-2xl border border-border/70 bg-card/90 px-4 py-3 text-sm text-muted-foreground shadow-sm">
                  <div className="flex items-center gap-2 text-foreground"><CreditCard className="h-4 w-4 text-primary" /> Fluxo simples</div>
                  <p className="mt-1 text-xs">Adicione item, ajuste quantidade e finalize.</p>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar produto por nome ou código..." className="h-12 rounded-2xl border-border/70 bg-card/90 pl-10 shadow-sm" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.slice(0, 12).map((p) => (
                  <button key={p.id} onClick={() => addToCart(p)} className="rounded-3xl border border-border/70 bg-card/95 p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:bg-accent/40 hover:shadow-lg">
                    <div className="flex items-start justify-between gap-2"><p className="text-sm font-semibold text-foreground line-clamp-2">{p.name}</p><div className={cn('rounded-full px-2 py-1 text-[11px] font-semibold', p.stock <= p.minStock ? 'bg-destructive/10 text-destructive' : 'bg-emerald-500/10 text-emerald-600')}>{p.stock} un</div></div>
                    <p className="mt-1 text-xs text-muted-foreground">{p.category}</p>
                    <p className="mt-4 text-lg font-bold text-primary">{fmt(p.salePrice)}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="sticky top-4 rounded-3xl border border-border/70 bg-card/95 p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-primary" /><h3 className="font-semibold text-foreground">Carrinho</h3><span className="ml-auto text-xs text-muted-foreground">{totalItems} item(ns)</span><FeatureHint content="A melhor sensação no caixa vem de clareza imediata: total, quantidade e próxima ação sem ruído." /></div>
                <div className="mb-4 rounded-2xl border border-border/70 bg-background/60 p-3">
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground"><UserRound className="h-4 w-4 text-primary" /> Cliente (opcional)</label>
                  <select value={selectedCustomer?.id || ''} onChange={(e) => setSelectedCustomer(customers.find((c) => c.id === e.target.value) || null)} className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground">
                    <option value="">Venda sem cliente vinculado</option>
                    {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                {cart.length === 0 ? (
                  <EmptyState icon={ShoppingCart} title="Carrinho vazio" description="Adicione produtos pelo código de barras ou pela busca rápida. A ideia é deixar sua primeira venda o mais simples possível." />
                ) : (
                  <div className="space-y-2">
                    <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                      {cart.map((item) => (
                        <div key={item.productId} className="rounded-2xl border border-border/70 bg-background/60 p-3">
                          <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-foreground">{item.productName}</p><p className="mt-1 text-xs text-muted-foreground">{fmt(item.unitPrice)} por unidade</p></div><button onClick={() => setCart(cart.filter((i) => i.productId !== item.productId))} className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button></div>
                          <div className="mt-3 flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Button variant="outline" size="icon" className="h-8 w-8 rounded-xl" onClick={() => updateQty(item.productId, -1)}><Minus className="h-3.5 w-3.5" /></Button><span className="w-7 text-center text-sm font-semibold text-foreground">{item.quantity}</span><Button variant="outline" size="icon" className="h-8 w-8 rounded-xl" onClick={() => updateQty(item.productId, 1)}><Plus className="h-3.5 w-3.5" /></Button></div><p className="text-sm font-bold text-foreground">{fmt(item.subtotal)}</p></div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-border/70 pt-4">
                      <div className="mb-4 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-accent/60 p-4"><p className="text-xs text-muted-foreground">Itens</p><p className="mt-1 text-2xl font-bold text-foreground">{totalItems}</p></div><div className="rounded-2xl bg-accent/60 p-4"><p className="text-xs text-muted-foreground">Total</p><p className="mt-1 text-2xl font-bold text-foreground">{fmt(total)}</p></div></div>
                      <Button onClick={finalizeSale} className="w-full gap-2 rounded-2xl" size="lg"><CheckCircle className="h-5 w-5" /> Finalizar venda</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
