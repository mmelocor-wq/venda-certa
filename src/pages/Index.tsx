import { useEffect, useMemo, useState } from 'react';
import { Package, DollarSign, AlertTriangle, CreditCard, Target, ShoppingCart, BarChart3, ArrowRight, Sparkles, CheckCircle2, SlidersHorizontal, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import KpiCard from '@/components/KpiCard';
import OnboardingChecklist from '@/components/OnboardingChecklist';
import FeatureHint from '@/components/FeatureHint';
import EmptyState from '@/components/EmptyState';
import { getProducts, getSales, calcTotalFixedCostMonthly, calcMargin, seedDemoData, getCashFlowSummary, getReceivables, getPurchases, getGoals, getProductPerformance, getFixedCosts, type Product, fmt } from '@/lib/store';
import { cn } from '@/lib/utils';

const quickActions = [
  { title: 'Cadastrar produto', description: 'Monte seu catálogo inicial', to: '/produtos' },
  { title: 'Definir custos', description: 'Garanta preço sem prejuízo', to: '/custos' },
  { title: 'Ajustar estoque', description: 'Registre o estoque atual da loja', to: '/estoque' },
  { title: 'Testar primeira venda', description: 'Valide a experiência do caixa', to: '/caixa' },
  { title: 'Personalizar visual', description: 'Tema, onboarding e experiência', to: '/configuracoes' },
];

export default function Index() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    seedDemoData();
    setProducts(getProducts());
  }, []);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const totalProducts = products.length;
  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;
  const avgMargin = products.length > 0 ? products.reduce((s, p) => s + calcMargin(p), 0) / products.length : 0;
  const totalUnits = products.reduce((s, p) => s + p.stock, 0);
  const fixedCosts = getFixedCosts();
  const cashSummary = getCashFlowSummary();
  const receivables = getReceivables().filter((r) => r.status !== 'recebida');
  const totalReceivable = receivables.reduce((s, r) => s + (r.totalValue - r.receivedValue), 0);
  const payables = getPurchases().filter((p) => p.status !== 'pago');
  const totalPayable = payables.reduce((s, p) => s + (p.totalValue - p.paidValue), 0);
  const sales = getSales();
  const monthSales = sales.filter((s) => {
    const d = new Date(s.createdAt);
    return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
  });
  const monthRevenue = monthSales.reduce((s, sale) => s + sale.total, 0);
  const perf = getProductPerformance();
  const monthProfit = monthSales.reduce((s, sale) => s + sale.items.reduce((si, item) => {
    const p = perf.find((pr) => pr.id === item.productId);
    return si + (p ? p.grossProfit * item.quantity : 0);
  }, 0), 0);
  const goals = getGoals().filter((g) => g.month === currentMonth && g.year === currentYear);
  const revenueGoal = goals.find((g) => g.type === 'faturamento');

  const onboardingSteps = useMemo(() => [
    { id: 'costs', title: 'Comece pelos custos', description: 'Sem isso, a precificação perde precisão.', to: '/custos', done: fixedCosts.length > 0 },
    { id: 'products', title: 'Adicione produtos', description: 'Nome, custo, preço, unidade e código de barras.', to: '/produtos', done: products.length > 0 },
    { id: 'inventory', title: 'Revise o estoque inicial', description: 'Confirme as quantidades que você tem hoje.', to: '/estoque', done: totalUnits > 0 },
    { id: 'sales', title: 'Teste sua primeira venda', description: 'Valide caixa e baixa de estoque.', to: '/caixa', done: sales.length > 0 },
  ], [fixedCosts.length, products.length, sales.length, totalUnits]);

  const marginData = products.map((p) => ({ name: p.name.length > 10 ? `${p.name.substring(0, 10)}…` : p.name, margem: parseFloat(calcMargin(p).toFixed(1)) }));
  const categories: Record<string, number> = {};
  products.forEach((p) => { categories[p.category] = (categories[p.category] || 0) + 1; });
  const categoryData = Object.entries(categories).map(([name, value]) => ({ name, value }));
  const pieColors = ['hsl(222,83%,57%)', 'hsl(145,63%,42%)', 'hsl(38,92%,52%)', 'hsl(267,83%,64%)', 'hsl(0,72%,54%)'];
  const stalledProducts = perf.filter((p) => p.daysSinceLastSale > 30 && p.stock > 0);
  const lossProducts = perf.filter((p) => p.margin < 0);
  const nextActions = [
    { label: lowStockCount > 0 ? `${lowStockCount} itens precisam de reposição` : 'Estoque estável no momento', helper: lowStockCount > 0 ? 'Evite ruptura e perda de venda.' : 'Nenhum item crítico agora.', to: '/reposicao', highlight: lowStockCount > 0 },
    { label: fixedCosts.length === 0 ? 'Cadastre seus custos fixos' : 'Custos fixos já configurados', helper: fixedCosts.length === 0 ? 'Sem isso, a precificação perde precisão.' : 'Sua base de custos já está montada.', to: '/custos', highlight: fixedCosts.length === 0 },
    { label: sales.length === 0 ? 'Realize a primeira venda teste' : 'Acompanhe o caixa do dia', helper: sales.length === 0 ? 'Isso valida fluxo de caixa e baixa de estoque.' : 'Confira entradas e desempenho do mês.', to: sales.length === 0 ? '/caixa' : '/fluxo-caixa', highlight: sales.length === 0 },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <section className="rounded-3xl border border-border/70 bg-card/95 p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"><Sparkles className="h-3.5 w-3.5" /> Painel principal</div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">Bem-vindo ao Venda Certa</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Seu sistema já cobre produtos, estoque, caixa e financeiro. O foco agora é reduzir atrito no primeiro uso e deixar tudo com sensação de SaaS premium.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:w-[520px]">
              {quickActions.map((action) => (
                <Link key={action.title} to={action.to} className="rounded-2xl border border-border/70 bg-background/70 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-accent/40 hover:shadow-lg">
                  <p className="text-sm font-semibold text-foreground">{action.title}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{action.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">Abrir <ArrowRight className="h-3.5 w-3.5" /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <OnboardingChecklist steps={onboardingSteps} />

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-border/70 bg-card/95 p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /><h2 className="text-sm font-semibold text-foreground">O que fazer agora</h2><FeatureHint content="Esta área prioriza a próxima ação com maior impacto de valor percebido para novos usuários." /></div>
            <div className="space-y-3">{nextActions.map((item) => <Link key={item.label} to={item.to} className={cn('flex items-start justify-between gap-3 rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5', item.highlight ? 'border-primary/20 bg-primary/5 hover:bg-primary/10' : 'border-border/70 bg-background/70 hover:bg-accent/40')}><div><p className="text-sm font-medium text-foreground">{item.label}</p><p className="mt-1 text-xs text-muted-foreground">{item.helper}</p></div><ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" /></Link>)}</div>
          </div>
          <div className="rounded-2xl border border-border/70 bg-card/95 p-5 shadow-sm">
            <div className="flex items-center gap-2"><p className="text-sm font-semibold text-foreground">Leitura rápida do negócio</p><FeatureHint content="Resumo imediato aumenta confiança e reduz a sensação de sistema complexo." /></div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-accent/70 p-4"><p className="text-xs text-muted-foreground">Produtos</p><p className="mt-1 text-2xl font-bold text-foreground">{totalProducts}</p></div>
              <div className="rounded-xl bg-accent/70 p-4"><p className="text-xs text-muted-foreground">Unidades em estoque</p><p className="mt-1 text-2xl font-bold text-foreground">{totalUnits}</p></div>
              <div className="rounded-xl bg-accent/70 p-4"><p className="text-xs text-muted-foreground">Vendas do mês</p><p className="mt-1 text-2xl font-bold text-foreground">{monthSales.length}</p></div>
              <div className="rounded-xl bg-accent/70 p-4"><p className="text-xs text-muted-foreground">Meta do mês</p><p className="mt-1 text-lg font-bold text-foreground">{revenueGoal ? `${Math.min(100, (monthRevenue / revenueGoal.targetValue) * 100).toFixed(0)}%` : '—'}</p></div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-xl border border-border/70 bg-card p-4"><p className="text-xs text-muted-foreground">Saldo caixa</p><p className={cn('mt-1 text-lg font-bold', cashSummary.balanceTotal >= 0 ? 'text-emerald-600' : 'text-destructive')}>{fmt(cashSummary.balanceTotal)}</p></div>
          <div className="rounded-xl border border-border/70 bg-card p-4"><p className="text-xs text-muted-foreground">A receber</p><p className="mt-1 text-lg font-bold text-primary">{fmt(totalReceivable)}</p></div>
          <div className="rounded-xl border border-border/70 bg-card p-4"><p className="text-xs text-muted-foreground">A pagar</p><p className="mt-1 text-lg font-bold text-amber-600">{fmt(totalPayable)}</p></div>
          <div className="rounded-xl border border-border/70 bg-card p-4"><p className="text-xs text-muted-foreground">Faturamento mês</p><p className="mt-1 text-lg font-bold text-foreground">{fmt(monthRevenue)}</p></div>
          <div className="rounded-xl border border-border/70 bg-card p-4"><p className={cn('mt-1 text-lg font-bold', monthProfit >= 0 ? 'text-emerald-600' : 'text-destructive')}>{fmt(monthProfit)}</p><p className="text-xs text-muted-foreground">lucro do mês</p></div>
          <div className="rounded-xl border border-border/70 bg-card p-4"><p className="text-xs text-muted-foreground">Margem média</p><p className="mt-1 text-lg font-bold text-foreground">{avgMargin.toFixed(1)}%</p></div>
        </div>

        {revenueGoal && <div className="rounded-2xl border border-border/70 bg-card p-5"><div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2"><Target className="h-4 w-4 text-primary" /><span className="text-sm font-semibold text-foreground">Meta de faturamento do mês</span></div><Link to="/metas" className="text-xs font-medium text-primary hover:underline">Abrir metas →</Link></div><div className="flex flex-col gap-3 md:flex-row md:items-center"><div className="flex-1"><div className="h-3 overflow-hidden rounded-full bg-accent"><div className={cn('h-full rounded-full transition-all', monthRevenue >= revenueGoal.targetValue ? 'bg-emerald-500' : 'bg-primary')} style={{ width: `${Math.min(100, (monthRevenue / revenueGoal.targetValue) * 100)}%` }} /></div></div><div className="flex items-center gap-3 text-sm"><span className="font-semibold text-foreground">{((monthRevenue / revenueGoal.targetValue) * 100).toFixed(0)}%</span><span className="text-muted-foreground">{fmt(monthRevenue)} / {fmt(revenueGoal.targetValue)}</span></div></div></div>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard icon={Package} title="Produtos" value={String(totalProducts)} subtitle={`${totalUnits} un em estoque`} color="primary" />
          <KpiCard icon={ShoppingCart} title="Vendas do mês" value={String(monthSales.length)} subtitle={fmt(monthRevenue)} color="success" />
          <KpiCard icon={AlertTriangle} title="Estoque baixo" value={String(lowStockCount)} subtitle="Itens abaixo do mínimo" color={lowStockCount > 0 ? 'destructive' : 'primary'} />
          <KpiCard icon={DollarSign} title="Custos fixos/mês" value={fmt(calcTotalFixedCostMonthly())} subtitle="Base para precificar" color="warning" />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-border/70 bg-card p-5">
            <div className="mb-4 flex items-center gap-2"><h3 className="text-sm font-semibold text-foreground">Margem por produto (%)</h3><FeatureHint content="Ao deixar a leitura visual simples, o usuário percebe valor analítico mais rápido." /></div>
            {marginData.length === 0 ? <EmptyState icon={BarChart3} title="Sem produtos para analisar" description="Cadastre seus primeiros itens para desbloquear a análise de margem e encontrar oportunidades de preço." actionLabel="Cadastrar produto" to="/produtos" /> : <div className="h-56"><ResponsiveContainer width="100%" height="100%"><BarChart data={marginData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} /><YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} /><Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12, background: 'hsl(var(--card))' }} formatter={(value: number) => [`${value}%`, 'Margem']} /><Bar dataKey="margem" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div>}
          </div>
          <div className="rounded-2xl border border-border/70 bg-card p-5">
            <div className="mb-4 flex items-center gap-2"><h3 className="text-sm font-semibold text-foreground">Produtos por categoria</h3><FeatureHint content="Categorias ajudam o usuário a entender a composição do mix sem navegar por várias telas." /></div>
            {categoryData.length === 0 ? <EmptyState icon={PieChartIcon} title="Nenhuma categoria disponível" description="Quando você cadastrar produtos, esta visualização ajuda a identificar concentração do mix." actionLabel="Ir para produtos" to="/produtos" /> : <><div className="flex h-56 items-center justify-center"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={3}>{categoryData.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}</Pie><Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12, background: 'hsl(var(--card))' }} /></PieChart></ResponsiveContainer></div><div className="mt-1 flex flex-wrap justify-center gap-3">{categoryData.map((c, i) => <div key={c.name} className="flex items-center gap-1.5 text-xs text-muted-foreground"><div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: pieColors[i % pieColors.length] }} />{c.name}</div>)}</div></>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {lowStockCount > 0 && <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4"><div className="mb-2 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /><h3 className="text-sm font-semibold text-destructive">Estoque baixo</h3><Link to="/reposicao" className="ml-auto text-xs text-destructive hover:underline">Ver reposição →</Link></div><div className="space-y-1">{products.filter((p) => p.stock <= p.minStock).slice(0, 5).map((p) => <p key={p.id} className="text-sm text-muted-foreground"><span className="font-medium text-foreground">{p.name}</span> — {p.stock} {p.unit} (mín: {p.minStock})</p>)}</div></div>}
          {lossProducts.length > 0 && <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4"><div className="mb-2 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-destructive" /><h3 className="text-sm font-semibold text-destructive">Produtos no prejuízo</h3><Link to="/rentabilidade" className="ml-auto text-xs text-destructive hover:underline">Ver detalhes →</Link></div><div className="space-y-1">{lossProducts.slice(0, 5).map((p) => <p key={p.id} className="text-sm text-muted-foreground"><span className="font-medium text-foreground">{p.name}</span> — margem {p.margin.toFixed(1)}%</p>)}</div></div>}
          {stalledProducts.length > 0 && <div className="rounded-2xl border border-amber-300/30 bg-amber-50 p-4 dark:bg-amber-500/10"><div className="mb-2 flex items-center gap-2"><Package className="h-4 w-4 text-amber-600" /><h3 className="text-sm font-semibold text-amber-700 dark:text-amber-300">Produtos parados</h3></div><div className="space-y-1">{stalledProducts.slice(0, 5).map((p) => <p key={p.id} className="text-sm text-muted-foreground"><span className="font-medium text-foreground">{p.name}</span> — {p.daysSinceLastSale} dias sem vender ({p.stock} em estoque)</p>)}</div></div>}
          {payables.filter((p) => p.status === 'atrasado').length > 0 && <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4"><div className="mb-2 flex items-center gap-2"><CreditCard className="h-4 w-4 text-destructive" /><h3 className="text-sm font-semibold text-destructive">Contas atrasadas</h3><Link to="/contas-pagar" className="ml-auto text-xs text-destructive hover:underline">Ver todas →</Link></div><div className="space-y-1">{payables.filter((p) => p.status === 'atrasado').slice(0, 3).map((p) => <p key={p.id} className="text-sm text-muted-foreground"><span className="font-medium text-foreground">{p.supplierName}</span> — {fmt(p.totalValue - p.paidValue)}</p>)}</div></div>}
        </div>

        <section className="rounded-2xl border border-border/70 bg-card/95 p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 text-primary" /><h2 className="text-sm font-semibold text-foreground">Quick wins aplicados</h2></div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-border/70 bg-background/70 p-4"><p className="feedback-success">Sucesso</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Feedback visual mais elegante para ações concluídas.</p></div>
            <div className="rounded-xl border border-border/70 bg-background/70 p-4"><p className="feedback-error">Erro</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Estado de erro mais claro, sem parecer bruto.</p></div>
            <div className="rounded-xl border border-border/70 bg-background/70 p-4"><p className="text-sm font-semibold text-foreground">Tema escuro premium</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Cinza azulado no lugar de preto puro para conforto visual prolongado.</p></div>
            <div className="rounded-xl border border-border/70 bg-background/70 p-4"><p className="text-sm font-semibold text-foreground">Onboarding reexecutável</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Ideal para testes de retenção, demos e validação com usuários.</p></div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
