import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function FeatureHint({ content }: { content: string }) {
  const enabled = localStorage.getItem("vc_inline_tips") !== "false";
  if (!enabled) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" aria-label="Ajuda sobre esta funcionalidade">
          <HelpCircle className="h-4 w-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs rounded-xl border-border/70 bg-popover/95 px-3 py-2 text-xs leading-5 shadow-lg backdrop-blur">
        {content}
      </TooltipContent>
    </Tooltip>
  );
}
