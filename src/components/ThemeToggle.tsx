import { useEffect, useState } from "react";
import { Moon, Sun, MonitorSmartphone } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const options = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Sistema", icon: MonitorSmartphone },
] as const;

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className={cn("grid gap-2", compact ? "grid-cols-3" : "grid-cols-1")}>{options.map((o) => <div key={o.value} className="h-10 rounded-xl border border-border/70 bg-background/60" />)}</div>;
  }

  return (
    <div className={cn("grid gap-2", compact ? "grid-cols-3" : "grid-cols-1")}>
      {options.map(({ value, label, icon: Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all duration-200",
              active
                ? "border-primary/30 bg-primary/10 text-primary shadow-sm"
                : "border-border/70 bg-background/60 text-muted-foreground hover:border-primary/20 hover:bg-accent/60 hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {!compact && <span>{label}</span>}
          </button>
        );
      })}
    </div>
  );
}
