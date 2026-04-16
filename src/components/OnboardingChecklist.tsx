import { CheckCircle2, Circle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  to: string;
  done: boolean;
}

export default function OnboardingChecklist({ steps }: { steps: OnboardingStep[] }) {
  const completed = steps.filter((step) => step.done).length;
  const progress = steps.length > 0 ? Math.round((completed / steps.length) * 100) : 0;

  return (
    <section className="rounded-2xl border border-border bg-card/95 p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Configuração inicial guiada
          </div>
          <h2 className="text-xl font-semibold text-foreground">Comece por aqui</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Para deixar o Venda Certa realmente útil no dia a dia, siga estas etapas.
            O sistema fica muito mais claro depois dos primeiros cadastros.
          </p>
        </div>

        <div className="min-w-[180px] rounded-xl bg-accent/70 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Progresso</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{progress}%</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{completed} de {steps.length} etapas concluídas</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {steps.map((step, index) => (
          <Link
            key={step.id}
            to={step.to}
            className={cn(
              "group rounded-xl border p-4 transition-all",
              step.done
                ? "border-emerald-200 bg-emerald-50/70 hover:bg-emerald-50"
                : "border-border bg-background hover:border-primary/30 hover:bg-accent/40",
            )}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {step.done ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">Etapa {index + 1}</span>
                  {step.done && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                      concluída
                    </span>
                  )}
                </div>
                <h3 className="mt-1 text-sm font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                <span className="mt-3 inline-flex text-xs font-medium text-primary">Abrir etapa →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
