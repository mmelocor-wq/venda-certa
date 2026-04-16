import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { getCustomers, addCustomer, updateCustomer, deleteCustomer, getSales, type Customer, type Sale, fmt } from '@/lib/store';
import { Plus, Pencil, Trash2, X, Users, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const emptyForm = { name: '', phone: '', email: '', document: '', birthDate: '', address: '', notes: '' };

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const reload = () => { setCustomers(getCustomers()); setSales(getSales()); };
  useEffect(reload, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Nome é obrigatório'); return; }
    if (editId) { updateCustomer(editId, form); toast.success('Cliente atualizado'); }
    else { addCustomer(form); toast.success('Cliente cadastrado'); }
    setForm(emptyForm); setShowForm(false); setEditId(null); reload();
  };

  const handleEdit = (c: Customer) => {
    setForm({ name: c.name, phone: c.phone, email: c.email, document: c.document, birthDate: c.birthDate, address: c.address, notes: c.notes });
    setEditId(c.id); setShowForm(true);
  };

  const getCustomerStats = (id: string) => {
    const customerSales = sales.filter(s => s.customerId === id);
    const totalSpent = customerSales.reduce((s, sale) => s + sale.total, 0);
    const lastPurchase = customerSales.length > 0 ? customerSales.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0].createdAt : null;
    const avgTicket = customerSales.length > 0 ? totalSpent / customerSales.length : 0;
    return { totalPurchases: customerSales.length, totalSpent, lastPurchase, avgTicket };
  };

  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.document?.includes(search) || c.phone?.includes(search));
  const selected = selectedId ? customers.find(c => c.id === selectedId) : null;
  const selectedStats = selectedId ? getCustomerStats(selectedId) : null;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
            <p className="text-muted-foreground text-sm mt-1">Cadastre e acompanhe seus clientes</p>
          </div>
          <Button onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }} className="gap-2"><Plus className="h-4 w-4" /> Novo Cliente</Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome, CPF ou telefone..." className="pl-10" />
        </div>

        {/* Client detail */}
        {selected && selectedStats && (
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2"><Users className="h-4 w-4 text-primary" />{selected.name}</h3>
              <button onClick={() => setSelectedId(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg bg-accent p-3"><p className="text-xs text-muted-foreground">Compras</p><p className="text-lg font-bold text-foreground">{selectedStats.totalPurchases}</p></div>
              <div className="rounded-lg bg-accent p-3"><p className="text-xs text-muted-foreground">Total Gasto</p><p className="text-lg font-bold text-foreground">{fmt(selectedStats.totalSpent)}</p></div>
              <div className="rounded-lg bg-accent p-3"><p className="text-xs text-muted-foreground">Ticket Médio</p><p className="text-lg font-bold text-foreground">{fmt(selectedStats.avgTicket)}</p></div>
              <div className="rounded-lg bg-accent p-3"><p className="text-xs text-muted-foreground">Última Compra</p><p className="text-sm font-bold text-foreground">{selectedStats.lastPurchase ? new Date(selectedStats.lastPurchase).toLocaleDateString('pt-BR') : 'Nunca'}</p></div>
            </div>
            {selected.phone && <p className="text-xs text-muted-foreground mt-3">📞 {selected.phone} {selected.email && `• ✉️ ${selected.email}`}</p>}
          </div>
        )}

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-accent/50">
                <th className="text-left p-3 font-medium text-muted-foreground">Nome</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Telefone</th>
                <th className="text-left p-3 font-medium text-muted-foreground">CPF/CNPJ</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Compras</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Total Gasto</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Ações</th>
              </tr></thead>
              <tbody>
                {filtered.map(c => {
                  const stats = getCustomerStats(c.id);
                  return (
                    <tr key={c.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors cursor-pointer" onClick={() => setSelectedId(c.id)}>
                      <td className="p-3 font-medium text-foreground">{c.name}</td>
                      <td className="p-3 text-muted-foreground">{c.phone || '—'}</td>
                      <td className="p-3 text-muted-foreground">{c.document || '—'}</td>
                      <td className="p-3 text-right text-foreground">{stats.totalPurchases}</td>
                      <td className="p-3 text-right font-medium text-foreground">{fmt(stats.totalSpent)}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                          <button onClick={() => handleEdit(c)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                          <button onClick={() => { deleteCustomer(c.id); reload(); toast.success('Removido'); }} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div className="p-8 text-center text-muted-foreground">Nenhum cliente cadastrado.</div>}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md shadow-lg" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{editId ? 'Editar' : 'Novo'} Cliente</h2>
                <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div><Label>Nome</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nome completo" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Telefone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                  <div><Label>Email</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>CPF/CNPJ</Label><Input value={form.document} onChange={e => setForm({ ...form, document: e.target.value })} /></div>
                  <div><Label>Nascimento</Label><Input type="date" value={form.birthDate} onChange={e => setForm({ ...form, birthDate: e.target.value })} /></div>
                </div>
                <div><Label>Endereço</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
                <div><Label>Observações</Label><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
                <Button type="submit" className="w-full">{editId ? 'Salvar' : 'Cadastrar'}</Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
