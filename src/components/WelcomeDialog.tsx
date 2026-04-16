import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Package, Receipt, Warehouse, ShoppingCart, SlidersHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "vc_welcome_seen_v2";

export default function WelcomeDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
  }, []);

  const steps = useMemo(
    () => [
      { title: "Comece pelos custos", description: "Defina sua base real antes de confiar no preço sugerido.", icon: Receipt, to: "/custos" },
      { title: "Cadastre seus produtos", description: "Nome, custo, preço e código de barras já destravam quase tudo.", icon: Package, to: "/produtos" },
      { title: "Revise o estoque inicial", description: "É aqui que o sistema começa a falar a verdade do seu negócio.", icon: Warehouse, to: "/estoque" },
      { title: "Teste sua primeira venda", description: "Esse é o momento em que o valor do produto fica evidente.", icon: ShoppingCart, to: "/caixa" },
      { title: "Deixe a experiência com sua cara", description: "Ajuste tema e comportamento visual para uso diário.", icon: SlidersHorizontal, to: "/configuracoes" },
    ],
    [],
  );

  const close = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? close() : setOpen(v))}>
      <DialogContent className="max-w-3xl overflow-hidden rounded-3xl border-border/70 bg-background/95 p-0 shadow-2xl backdrop-blur">
        <div className="overflow-hidden border-b border-border/60 bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.18),_transparent_42%),linear-gradient(135deg,_hsl(var(--card)),_hsl(var(--accent)/0.72))] px-6 py-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Primeiro acesso guiado
          </div>
          <DialogHeader className="mt-4 text-left">
            <DialogTitle className="text-2xl tracking-tight">Seu atalho para começar com confiança</DialogTitle>
            <DialogDescription className="max-w-2xl text-sm leading-6 text-muted-foreground">
              O Venda Certa já cobre muita coisa. Estes 5 passos foram organizados para gerar valor rápido e sem sensação de sistema complicado.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="grid gap-3 px-6 py-6 md:grid-cols-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Link key={step.title} to={step.to} onClick={close} className="group rounded-2xl border border-border/70 bg-card/80 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-accent/40 hover:shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-xl border border-border/70 bg-background/80 p-2 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Etapa {index + 1}</p>
                    <h3 className="mt-1 text-sm font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 border-t border-border/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">Dica: a primeira venda teste costuma ser o ponto em que o usuário decide se vai continuar usando.</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={close}>Explorar sozinho</Button>
            <Button asChild>
              <Link to="/configuracoes" onClick={close}>Ajustar experiência</Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
