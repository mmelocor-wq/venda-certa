import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function EmptyState({ icon: Icon, title, description, actionLabel, to }: { icon: LucideIcon; title: string; description: string; actionLabel?: string; to?: string; }) {
  return (
    <div className="rounded-2xl border border-dashed border-border/80 bg-card/70 p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-border/70 bg-background/70 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      {actionLabel && to && <Button asChild className="mt-5 rounded-xl"><Link to={to}>{actionLabel}</Link></Button>}
    </div>
  );
}
