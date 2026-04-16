import { useState } from "react";
import { Sparkles, Palette, MousePointerClick, ShieldCheck, RotateCcw, Info } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const WELCOME_KEY = "vc_welcome_seen_v2";

export default function Settings() {
  const [reducedMotion, setReducedMotion] = useState(localStorage.getItem("vc_reduced_motion") === "true");
  const [tipsEnabled, setTipsEnabled] = useState(localStorage.getItem("vc_inline_tips") !== "false");

  const handleReducedMotion = (checked: boolean) => {
    setReducedMotion(checked);
    localStorage.setItem("vc_reduced_motion", String(checked));
    document.documentElement.classList.toggle("reduce-motion", checked);
    toast.success("Preferência de movimento atualizada.");
  };

  const handleTipsEnabled = (checked: boolean) => {
    setTipsEnabled(checked);
    localStorage.setItem("vc_inline_tips", String(checked));
    toast.success("Preferência de dicas atualizada.");
  };

  const resetWelcome = () => {
    localStorage.removeItem(WELCOME_KEY);
    toast.success("Boas-vindas liberadas novamente no próximo acesso.");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <section className="rounded-3xl border border-border/70 bg-card/95 p-6 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"><Sparkles className="h-3.5 w-3.5" /> Experiência do produto</div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">Configurações</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Controle visual, onboarding reexecutável e pequenos ajustes que deixam o uso diário mais confortável.</p>
        </section>

        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-2xl border border-border/70 bg-card/95 p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2"><Palette className="h-4 w-4 text-primary" /><h2 className="text-sm font-semibold text-foreground">Tema e identidade visual</h2></div>
            <p className="mb-4 text-sm leading-6 text-muted-foreground">O modo escuro usa cinza azulado em vez de preto puro para reduzir fadiga e dar um acabamento mais premium.</p>
            <ThemeToggle />
          </section>
          <section className="rounded-2xl border border-border/70 bg-card/95 p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2"><MousePointerClick className="h-4 w-4 text-primary" /><h2 className="text-sm font-semibold text-foreground">Micro-interações</h2></div>
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-background/60 p-4">
                <div><p className="text-sm font-medium text-foreground">Reduzir movimento</p><p className="text-xs leading-5 text-muted-foreground">Ideal para uso prolongado ou maior conforto visual.</p></div>
                <Switch checked={reducedMotion} onCheckedChange={handleReducedMotion} />
              </div>
              <div className="flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-background/60 p-4">
                <div><p className="text-sm font-medium text-foreground">Dicas contextuais</p><p className="text-xs leading-5 text-muted-foreground">Mantém os ícones de ajuda nas áreas mais importantes de decisão.</p></div>
                <Switch checked={tipsEnabled} onCheckedChange={handleTipsEnabled} />
              </div>
            </div>
          </section>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-border/70 bg-card/95 p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2"><RotateCcw className="h-4 w-4 text-primary" /><h2 className="text-sm font-semibold text-foreground">Onboarding</h2></div>
            <p className="text-sm leading-6 text-muted-foreground">Reativar o guia inicial é ótimo para testar retenção, demos ou validação com novos usuários.</p>
            <Button variant="outline" className="mt-4 rounded-xl" onClick={resetWelcome}>Mostrar boas-vindas novamente</Button>
          </section>
          <section className="rounded-2xl border border-border/70 bg-card/95 p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /><h2 className="text-sm font-semibold text-foreground">Próximo passo mais importante</h2></div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• autenticação real e perfis de acesso</li>
              <li>• sincronização online de dados</li>
              <li>• confirmação de salvamento na nuvem</li>
              <li>• permissões por operador</li>
            </ul>
          </section>
        </div>

        <section className="rounded-2xl border border-primary/15 bg-primary/5 p-5 shadow-sm">
          <div className="flex items-start gap-3"><div className="rounded-xl bg-background/70 p-2 text-primary"><Info className="h-4 w-4" /></div><div><h2 className="text-sm font-semibold text-foreground">Leitura honesta do produto</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">A camada visual ficou muito mais forte. O que mais eleva percepção de confiança a partir daqui é login, multiusuário e persistência online.</p></div></div>
        </section>
      </div>
    </AppLayout>
  );
}
