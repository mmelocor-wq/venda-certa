import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { getProducts, getCompetitors, addCompetitor, deleteCompetitor, getCompetitorPrices, addCompetitorPrice, deleteCompetitorPrice, getMarketAnalysis, type Product, type Competitor, type CompetitorPrice } from '@/lib/store';
import { Plus, Trash2, X, TrendingDown, TrendingUp, Minus, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function fmt(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }

export default function Competitors() {
  const [products, setProducts] = useState<Product[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [prices, setPrices] = useState<CompetitorPrice[]>([]);
  const [showCompForm, setShowCompForm] = useState(false);
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterType, setFilterType] = useState('');
  const [compForm, setCompForm] = useState({ name: '', type: 'online' as 'online' | 'fisica', city: '', neighborhood: '' });
  const [priceForm, setPriceForm] = useState({ productId: '', competitorId: '', price: 0, source: '', notes: '' });

  const reload = () => { setProducts(getProducts()); setCompetitors(getCompetitors()); setPrices(getCompetitorPrices()); };
  useEffect(reload, []);

  const handleAddCompetitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compForm.name.trim()) { toast.error('Nome é obrigatório'); return; }
    addCompetitor(compForm);
    setCompForm({ name: '', type: 'online', city: '', neighborhood: '' });
    setShowCompForm(false);
    toast.success('Concorrente cadastrado');
    reload();
  };

  const handleAddPrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!priceForm.productId || !priceForm.competitorId || !priceForm.price) { toast.error('Preencha todos os campos'); return; }
    addCompetitorPrice({ ...priceForm, collectedAt: new Date().toISOString() });
    setPriceForm({ productId: '', competitorId: '', price: 0, source: '', notes: '' });
    setShowPriceForm(false);
    toast.success('Preço registrado');
    reload();
  };

  // Analysis data
  const analysisProduct = selectedProduct || (products.length > 0 ? products[0].id : '');
  const analysis = analysisProduct ? getMarketAnalysis(analysisProduct) : null;
  const productName = products.find(p => p.id === analysisProduct)?.name || '';

  // Filtered prices
  const filteredPrices = prices.filter(p => {
    if (filterProduct && p.productId !== filterProduct) return false;
    const comp = competitors.find(c => c.id === p.competitorId);
    if (filterCity && comp?.city !== filterCity) return false;
    if (filterType && comp?.type !== filterType) return false;
    return true;
  });

  // Chart data for comparison
  const chartData = products.map(p => {
    const a = getMarketAnalysis(p.id);
    return { name: p.name.length > 10 ? p.name.substring(0, 10) + '…' : p.name, meuPreco: p.salePrice, mediaMercado: a?.avg || 0 };
  }).filter(d => d.mediaMercado > 0);

  const cities = [...new Set(competitors.map(c => c.city).filter(Boolean))];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Concorrência</h1>
            <p className="text-muted-foreground text-sm mt-1">Análise de preços e posicionamento de mercado</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowCompForm(true)} className="gap-2"><Plus className="h-4 w-4" /> Concorrente</Button>
            <Button onClick={() => setShowPriceForm(true)} className="gap-2"><Plus className="h-4 w-4" /> Preço</Button>
          </div>
        </div>

        {/* Market Position Card */}
        {products.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Análise de Mercado</h3>
              <select value={analysisProduct} onChange={e => setSelectedProduct(e.target.value)} className="text-sm border border-input rounded-lg px-3 py-1.5 bg-background text-foreground">
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            {analysis ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="rounded-lg bg-accent p-3"><p className="text-xs text-muted-foreground">Meu Preço</p><p className="text-lg font-bold text-foreground">{fmt(analysis.myPrice)}</p></div>
                <div className="rounded-lg bg-accent p-3"><p className="text-xs text-muted-foreground">Média Mercado</p><p className="text-lg font-bold text-foreground">{fmt(analysis.avg)}</p></div>
                <div className="rounded-lg bg-accent p-3"><p className="text-xs text-muted-foreground">Menor Preço</p><p className="text-lg font-bold text-foreground">{fmt(analysis.min)}</p></div>
                <div className="rounded-lg bg-accent p-3"><p className="text-xs text-muted-foreground">Maior Preço</p><p className="text-lg font-bold text-foreground">{fmt(analysis.max)}</p></div>
                <div className="rounded-lg bg-accent p-3"><p className="text-xs text-muted-foreground">Dif. Média</p><p className={cn("text-lg font-bold", analysis.diffAvg > 0 ? 'text-amber-600' : 'text-emerald-600')}>{analysis.diffAvg > 0 ? '+' : ''}{fmt(analysis.diffAvg)}</p></div>
                <div className="rounded-lg bg-accent p-3">
                  <p className="text-xs text-muted-foreground">Posição</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {analysis.position === 'abaixo' && <><TrendingDown className="h-4 w-4 text-emerald-600" /><span className="text-sm font-semibold text-emerald-600">Abaixo</span></>}
                    {analysis.position === 'dentro' && <><Minus className="h-4 w-4 text-primary" /><span className="text-sm font-semibold text-primary">Dentro</span></>}
                    {analysis.position === 'acima' && <><TrendingUp className="h-4 w-4 text-amber-600" /><span className="text-sm font-semibold text-amber-600">Acima</span></>}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum preço de concorrente cadastrado para {productName}.</p>
            )}
          </div>
        )}

        {/* Comparison Chart */}
        {chartData.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Meu Preço vs Média do Mercado</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(220,10%,46%)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(220,10%,46%)' }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid hsl(220,13%,91%)', fontSize: 12 }} formatter={(v: number) => fmt(v)} />
                  <Bar dataKey="meuPreco" name="Meu Preço" fill="hsl(220,70%,50%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="mediaMercado" name="Média Mercado" fill="hsl(142,71%,45%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <select value={filterProduct} onChange={e => setFilterProduct(e.target.value)} className="text-sm border border-input rounded-lg px-3 py-2 bg-background text-foreground">
            <option value="">Todos os produtos</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="text-sm border border-input rounded-lg px-3 py-2 bg-background text-foreground">
            <option value="">Todos os tipos</option>
            <option value="online">Online</option>
            <option value="fisica">Loja Física</option>
          </select>
          {cities.length > 0 && (
            <select value={filterCity} onChange={e => setFilterCity(e.target.value)} className="text-sm border border-input rounded-lg px-3 py-2 bg-background text-foreground">
              <option value="">Todas as cidades</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
        </div>

        {/* Prices Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-accent/50">
                  <th className="text-left p-3 font-medium text-muted-foreground">Produto</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Concorrente</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Tipo</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Preço</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Data</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrices.map(p => {
                  const prod = products.find(pr => pr.id === p.productId);
                  const comp = competitors.find(c => c.id === p.competitorId);
                  return (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                      <td className="p-3 font-medium text-foreground">{prod?.name || '—'}</td>
                      <td className="p-3 text-muted-foreground">{comp?.name || '—'}</td>
                      <td className="p-3"><span className={cn("text-xs px-2 py-0.5 rounded-full", comp?.type === 'online' ? 'bg-primary/10 text-primary' : 'bg-accent text-accent-foreground')}>{comp?.type === 'online' ? 'Online' : 'Física'}</span></td>
                      <td className="p-3 text-right font-medium">{fmt(p.price)}</td>
                      <td className="p-3 text-muted-foreground">{new Date(p.collectedAt).toLocaleDateString('pt-BR')}</td>
                      <td className="p-3 text-right"><button onClick={() => { deleteCompetitorPrice(p.id); reload(); toast.success('Removido'); }} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-3.5 w-3.5" /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredPrices.length === 0 && <div className="p-8 text-center text-muted-foreground">Nenhum preço de concorrente cadastrado.</div>}
        </div>

        {/* Competitors List */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Concorrentes Cadastrados</h3>
          {competitors.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum concorrente cadastrado.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {competitors.map(c => (
                <div key={c.id} className="flex items-center gap-2 bg-accent rounded-lg px-3 py-2 text-sm">
                  <span className="font-medium text-foreground">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{c.type === 'online' ? '🌐' : '🏪'} {c.city}</span>
                  <button onClick={() => { deleteCompetitor(c.id); reload(); toast.success('Removido'); }} className="text-muted-foreground hover:text-destructive"><X className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modals */}
        {showCompForm && (
          <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4" onClick={() => setShowCompForm(false)}>
            <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md shadow-lg" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Novo Concorrente</h2>
                <button onClick={() => setShowCompForm(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
              </div>
              <form onSubmit={handleAddCompetitor} className="space-y-3">
                <div><Label>Nome</Label><Input value={compForm.name} onChange={e => setCompForm({ ...compForm, name: e.target.value })} placeholder="Ex: Loja XYZ" /></div>
                <div><Label>Tipo</Label>
                  <select value={compForm.type} onChange={e => setCompForm({ ...compForm, type: e.target.value as 'online' | 'fisica' })} className="w-full h-10 border border-input rounded-md px-3 bg-background text-foreground text-sm">
                    <option value="online">Online</option><option value="fisica">Loja Física</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Cidade</Label><Input value={compForm.city} onChange={e => setCompForm({ ...compForm, city: e.target.value })} /></div>
                  <div><Label>Bairro</Label><Input value={compForm.neighborhood} onChange={e => setCompForm({ ...compForm, neighborhood: e.target.value })} /></div>
                </div>
                <Button type="submit" className="w-full">Cadastrar</Button>
              </form>
            </div>
          </div>
        )}

        {showPriceForm && (
          <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4" onClick={() => setShowPriceForm(false)}>
            <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md shadow-lg" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Registrar Preço</h2>
                <button onClick={() => setShowPriceForm(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
              </div>
              <form onSubmit={handleAddPrice} className="space-y-3">
                <div><Label>Produto</Label>
                  <select value={priceForm.productId} onChange={e => setPriceForm({ ...priceForm, productId: e.target.value })} className="w-full h-10 border border-input rounded-md px-3 bg-background text-foreground text-sm">
                    <option value="">Selecione...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div><Label>Concorrente</Label>
                  <select value={priceForm.competitorId} onChange={e => setPriceForm({ ...priceForm, competitorId: e.target.value })} className="w-full h-10 border border-input rounded-md px-3 bg-background text-foreground text-sm">
                    <option value="">Selecione...</option>
                    {competitors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div><Label>Preço Encontrado (R$)</Label><Input type="number" step="0.01" value={priceForm.price || ''} onChange={e => setPriceForm({ ...priceForm, price: parseFloat(e.target.value) || 0 })} /></div>
                <div><Label>Observações</Label><Input value={priceForm.notes} onChange={e => setPriceForm({ ...priceForm, notes: e.target.value })} placeholder="Opcional" /></div>
                <Button type="submit" className="w-full">Registrar Preço</Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
