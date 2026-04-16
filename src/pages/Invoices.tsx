import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { getInvoices, addInvoice, getProducts, getSuppliers, type Invoice, type InvoiceItem, type Product } from '@/lib/store';
import { Plus, X, FileText, ArrowDownCircle, ArrowUpCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

function fmt(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ number: '', type: 'entrada' as 'entrada' | 'saida', entityName: '', entityType: 'fornecedor' as 'fornecedor' | 'cliente', issueDate: '', accessKey: '', status: 'pendente' as Invoice['status'], notes: '' });
  const [items, setItems] = useState<{ productId: string; quantity: number }[]>([]);

  const reload = () => { setInvoices(getInvoices()); setProducts(getProducts()); };
  useEffect(reload, []);

  const addItem = () => setItems([...items, { productId: '', quantity: 1 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: string, value: string | number) => setItems(items.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.number.trim()) { toast.error('Número da nota é obrigatório'); return; }
    const validItems = items.filter(i => i.productId && i.quantity > 0);
    if (validItems.length === 0) { toast.error('Adicione ao menos um item'); return; }
    const invoiceItems: InvoiceItem[] = validItems.map(i => {
      const p = products.find(pr => pr.id === i.productId)!;
      return { productId: i.productId, productName: p.name, quantity: i.quantity, unitPrice: form.type === 'entrada' ? p.costPrice : p.salePrice, subtotal: i.quantity * (form.type === 'entrada' ? p.costPrice : p.salePrice) };
    });
    const totalValue = invoiceItems.reduce((s, i) => s + i.subtotal, 0);
    addInvoice({ ...form, totalValue, items: invoiceItems });
    setForm({ number: '', type: 'entrada', entityName: '', entityType: 'fornecedor', issueDate: '', accessKey: '', status: 'pendente', notes: '' });
    setItems([]);
    setShowForm(false);
    toast.success(`Nota ${form.type === 'entrada' ? 'de entrada' : 'de saída'} registrada. Estoque atualizado automaticamente.`);
    reload();
  };

  const entradas = invoices.filter(i => i.type === 'entrada');
  const saidas = invoices.filter(i => i.type === 'saida');

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notas Fiscais</h1>
            <p className="text-muted-foreground text-sm mt-1">Gerencie notas de entrada e saída com atualização automática de estoque</p>
          </div>
          <Button onClick={() => { setItems([]); setShowForm(true); }} className="gap-2"><Plus className="h-4 w-4" /> Nova Nota</Button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center"><ArrowDownCircle className="h-5 w-5 text-emerald-600" /></div>
            <div><p className="text-xs text-muted-foreground">Entradas</p><p className="text-lg font-bold text-foreground">{entradas.length}</p></div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><ArrowUpCircle className="h-5 w-5 text-primary" /></div>
            <div><p className="text-xs text-muted-foreground">Saídas</p><p className="text-lg font-bold text-foreground">{saidas.length}</p></div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center"><FileText className="h-5 w-5 text-accent-foreground" /></div>
            <div><p className="text-xs text-muted-foreground">Total</p><p className="text-lg font-bold text-foreground">{invoices.length}</p></div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-accent/50">
                <th className="text-left p-3 font-medium text-muted-foreground">Nº</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Tipo</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Entidade</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Valor</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Data</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Itens</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
              </tr></thead>
              <tbody>
                {[...invoices].reverse().map(inv => (
                  <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                    <td className="p-3 font-medium text-foreground">{inv.number}</td>
                    <td className="p-3"><span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", inv.type === 'entrada' ? 'bg-emerald-100 text-emerald-700' : 'bg-primary/10 text-primary')}>{inv.type === 'entrada' ? 'Entrada' : 'Saída'}</span></td>
                    <td className="p-3 text-muted-foreground">{inv.entityName || '—'}</td>
                    <td className="p-3 text-right font-medium text-foreground">{fmt(inv.totalValue)}</td>
                    <td className="p-3 text-muted-foreground">{inv.issueDate ? new Date(inv.issueDate + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}</td>
                    <td className="p-3 text-muted-foreground">{inv.items.length} produto(s)</td>
                    <td className="p-3"><span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-medium">{inv.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {invoices.length === 0 && <div className="p-8 text-center text-muted-foreground">Nenhuma nota fiscal registrada.</div>}
        </div>

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <div className="bg-card rounded-xl border border-border p-6 w-full max-w-lg shadow-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Nova Nota Fiscal</h2>
                <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Número da Nota</Label><Input value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} /></div>
                  <div><Label>Tipo</Label>
                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as 'entrada' | 'saida', entityType: e.target.value === 'entrada' ? 'fornecedor' : 'cliente' })} className="w-full h-10 border border-input rounded-md px-3 bg-background text-foreground text-sm">
                      <option value="entrada">Entrada</option><option value="saida">Saída</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>{form.type === 'entrada' ? 'Fornecedor' : 'Cliente'}</Label><Input value={form.entityName} onChange={e => setForm({ ...form, entityName: e.target.value })} /></div>
                  <div><Label>Data Emissão</Label><Input type="date" value={form.issueDate} onChange={e => setForm({ ...form, issueDate: e.target.value })} /></div>
                </div>
                <div><Label>Chave de Acesso</Label><Input value={form.accessKey} onChange={e => setForm({ ...form, accessKey: e.target.value })} placeholder="Opcional" /></div>

                {/* Items */}
                <div>
                  <div className="flex items-center justify-between"><Label>Itens da Nota</Label><Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1"><Plus className="h-3 w-3" />Item</Button></div>
                  <div className="space-y-2 mt-2">
                    {items.map((item, i) => (
                      <div key={i} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <select value={item.productId} onChange={e => updateItem(i, 'productId', e.target.value)} className="w-full h-9 border border-input rounded-md px-2 bg-background text-foreground text-sm">
                            <option value="">Produto...</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                        </div>
                        <Input type="number" value={item.quantity} onChange={e => updateItem(i, 'quantity', parseInt(e.target.value) || 0)} className="w-20 h-9" min={1} />
                        <button type="button" onClick={() => removeItem(i)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div><Label>Observações</Label><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
                <Button type="submit" className="w-full">Registrar Nota</Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
