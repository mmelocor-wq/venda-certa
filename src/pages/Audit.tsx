import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { getAuditLogs, type AuditLog } from '@/lib/store';
import { Shield, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const actionColors: Record<string, string> = {
  criação: 'bg-emerald-100 text-emerald-700',
  edição_preço: 'bg-amber-100 text-amber-700',
  exclusão: 'bg-destructive/10 text-destructive',
  venda: 'bg-primary/10 text-primary',
  ajuste_estoque: 'bg-accent text-accent-foreground',
  compra: 'bg-primary/10 text-primary',
  conta_a_receber: 'bg-amber-100 text-amber-700',
};

export default function Audit() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => { setLogs(getAuditLogs()); }, []);

  const filtered = logs.filter(l => l.summary.toLowerCase().includes(search.toLowerCase()) || l.action.includes(search.toLowerCase()) || l.entity.includes(search.toLowerCase()));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Auditoria</h1>
          <p className="text-muted-foreground text-sm mt-1">Histórico de ações realizadas no sistema</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar no histórico..." className="pl-10" />
        </div>

        <div className="space-y-2">
          {[...filtered].reverse().map(log => (
            <div key={log.id} className="rounded-xl border border-border bg-card p-4 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-accent"><Shield className="h-4 w-4 text-muted-foreground" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${actionColors[log.action] || 'bg-accent text-accent-foreground'}`}>{log.action}</span>
                  <span className="text-xs text-muted-foreground">{log.entity}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{new Date(log.createdAt).toLocaleString('pt-BR')}</span>
                </div>
                <p className="text-sm text-foreground mt-1">{log.summary}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Por: {log.user}</p>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            <Shield className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            <p>Nenhuma ação registrada ainda.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
