import { NavLink, useLocation } from 'react-router-dom';
import { Package, Warehouse, Receipt, Calculator, X, Menu, TrendingUp, ShoppingCart, Users, CreditCard, FileText, ArrowLeftRight, Wallet, HandCoins, UserCheck, BarChart3, RefreshCw, Target, Shield, PieChart, Rocket, LifeBuoy, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

const sections = [
  {
    label: 'Começo rápido',
    links: [
      { to: '/', icon: Rocket, label: 'Visão geral' },
      { to: '/produtos', icon: Package, label: 'Produtos' },
      { to: '/estoque', icon: Warehouse, label: 'Estoque' },
      { to: '/caixa', icon: ShoppingCart, label: 'Vendas / Caixa' },
      { to: '/custos', icon: Receipt, label: 'Custos' },
    ],
  },
  {
    label: 'Gestão',
    links: [
      { to: '/fornecedores', icon: Users, label: 'Fornecedores' },
      { to: '/clientes', icon: UserCheck, label: 'Clientes' },
      { to: '/fluxo-caixa', icon: Wallet, label: 'Fluxo de caixa' },
      { to: '/contas-receber', icon: HandCoins, label: 'Contas a receber' },
      { to: '/contas-pagar', icon: CreditCard, label: 'Contas a pagar' },
    ],
  },
  {
    label: 'Análises',
    links: [
      { to: '/precificacao', icon: Calculator, label: 'Precificação' },
      { to: '/rentabilidade', icon: BarChart3, label: 'Rentabilidade' },
      { to: '/reposicao', icon: RefreshCw, label: 'Reposição' },
      { to: '/curva-abc', icon: PieChart, label: 'Curva ABC' },
      { to: '/metas', icon: Target, label: 'Metas' },
      { to: '/concorrencia', icon: TrendingUp, label: 'Concorrência' },
    ],
  },
  {
    label: 'Avançado',
    links: [
      { to: '/movimentacoes', icon: ArrowLeftRight, label: 'Movimentações' },
      { to: '/notas-fiscais', icon: FileText, label: 'Notas fiscais' },
      { to: '/auditoria', icon: Shield, label: 'Auditoria' },
      { to: '/configuracoes', icon: SlidersHorizontal, label: 'Configurações' },
    ],
  },
];

export default function AppSidebar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <button onClick={() => setOpen(true)} className="fixed left-4 top-4 z-50 rounded-xl border border-border/70 bg-card/90 p-2.5 shadow-sm backdrop-blur lg:hidden">
        <Menu className="h-5 w-5 text-foreground" />
      </button>

      {open && <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden" onClick={() => setOpen(false)} />}

      <aside className={cn('fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-border/70 bg-card/90 backdrop-blur-xl transition-transform duration-200', 'lg:sticky lg:top-0 lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
        <div className="border-b border-border/70 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                <Rocket className="h-3.5 w-3.5" /> Feito para lojas
              </div>
              <h1 className="mt-3 text-xl font-bold tracking-tight text-foreground">Venda Certa</h1>
              <p className="mt-1 text-xs text-muted-foreground">Preço, estoque e caixa com acabamento premium.</p>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 text-muted-foreground hover:text-foreground lg:hidden">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {sections.map((section) => (
            <div key={section.label}>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{section.label}</p>
              <div className="space-y-1">
                {section.links.map(({ to, icon: Icon, label }) => {
                  const active = location.pathname === to;
                  return (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={() => setOpen(false)}
                      className={cn('group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200', active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent/80 hover:text-foreground')}
                    >
                      <Icon className="h-4 w-4 transition-transform group-hover:scale-105" />
                      <span>{label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="m-3 space-y-3">
          <div className="rounded-2xl border border-border/70 bg-accent/55 p-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Aparência</p>
            <ThemeToggle compact />
          </div>

          <div className="rounded-2xl border border-border/70 bg-accent/70 p-4">
            <div className="flex items-center gap-2 text-foreground">
              <LifeBuoy className="h-4 w-4" />
              <p className="text-xs font-semibold">Seu progresso fica salvo neste navegador</p>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">Próximo salto recomendado: autenticação, permissões e sincronização em nuvem.</p>
          </div>
        </div>
      </aside>
    </>
  );
}
