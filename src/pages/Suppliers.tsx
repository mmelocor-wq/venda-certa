import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { getSuppliers, addSupplier, updateSupplier, deleteSupplier, getProducts, type Supplier, type Product } from '@/lib/store';
import { Plus, Pencil, Trash2, X, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const emptyForm = { name: '', legalName: '', document: '', phone: '', email: '', address: '', contactPerson: '', notes: '', productIds: [] as string[] };

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const reload = () => { setSuppliers(getSuppliers()); setProducts(getProducts()); };
  useEffect(reload, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Nome é obrigatório'); return; }
    if (editId) { updateSupplier(editId, form); toast.success('Fornecedor atualizado'); }
    else { addSupplier(form); toast.success('Fornecedor cadastrado'); }
    setForm(emptyForm); setShowForm(false); setEditId(null); reload();
  };

  const handleEdit = (s: Supplier) => {
    setForm({ name: s.name, legalName: s.legalName, document: s.document, phone: s.phone, email: s.email, address: s.address, contactPerson: s.contactPerson, notes: s.notes, productIds: s.productIds || [] });
    setEditId(s.id); setShowForm(true);
  };

  const toggleProduct = (pid: string) => {
    setForm(f => ({ ...f, productIds: f.productIds.includes(pid) ? f.productIds.filter(id => id !== pid) : [...f.productIds, pid] }));
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Fornecedores</h1>
            <p className="text-muted-foreground text-sm mt-1">Gerencie seus fornecedores e vínculos com produtos</p>
          </div>
          <Button onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }} className="gap-2"><Plus className="h-4 w-4" /> Novo Fornecedor</Button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suppliers.map(s => (
            <div key={s.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="h-5 w-5 text-primary" /></div>
                  <div>
                    <h3 className="font-semibold text-foreground">{s.name}</h3>
                    <p className="text-xs text-muted-foreground">{s.document || 'Sem CNPJ'}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(s)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => { deleteSupplier(s.id); reload(); toast.success('Removido'); }} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                {s.phone && <p className="text-muted-foreground">📞 {s.phone}</p>}
                {s.email && <p className="text-muted-foreground">✉️ {s.email}</p>}
                {s.contactPerson && <p className="text-muted-foreground">👤 {s.contactPerson}</p>}
                {s.address && <p className="text-muted-foreground col-span-2">📍 {s.address}</p>}
              </div>
              {s.productIds && s.productIds.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <button onClick={() => setExpandedId(expandedId === s.id ? null : s.id)} className="text-xs text-primary font-medium">
                    {s.productIds.length} produto(s) vinculado(s) {expandedId === s.id ? '▲' : '▼'}
                  </button>
                  {expandedId === s.id && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {s.productIds.map(pid => {
                        const p = products.find(pr => pr.id === pid);
                        return p ? <span key={pid} className="text-xs bg-accent rounded-md px-2 py-1 text-accent-foreground">{p.name}</span> : null;
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        {suppliers.length === 0 && <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">Nenhum fornecedor cadastrado.</div>}

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <div className="bg-card rounded-xl border border-border p-6 w-full max-w-lg shadow-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{editId ? 'Editar' : 'Novo'} Fornecedor</h2>
                <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div><Label>Nome</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nome fantasia" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Razão Social</Label><Input value={form.legalName} onChange={e => setForm({ ...form, legalName: e.target.value })} /></div>
                  <div><Label>CPF/CNPJ</Label><Input value={form.document} onChange={e => setForm({ ...form, document: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Telefone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                  <div><Label>Email</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                </div>
                <div><Label>Endereço</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
                <div><Label>Responsável</Label><Input value={form.contactPerson} onChange={e => setForm({ ...form, contactPerson: e.target.value })} /></div>
                <div><Label>Observações</Label><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
                {products.length > 0 && (
                  <div>
                    <Label>Produtos vinculados</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {products.map(p => (
                        <button key={p.id} type="button" onClick={() => toggleProduct(p.id)} className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${form.productIds.includes(p.id) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-input hover:bg-accent'}`}>
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <Button type="submit" className="w-full mt-2">{editId ? 'Salvar' : 'Cadastrar'}</Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
