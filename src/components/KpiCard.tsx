import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function KpiCard({
  label,
  value,
  icon: Icon,
  trend,
  className,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  className?: string;
}) {
  return (
    <Card className={cn("p-5 shadow-card border-border/60", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className="font-display font-bold text-2xl mt-1">{value}</p>
          {trend && <p className="text-xs text-success font-medium mt-1">{trend}</p>}
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent/10 text-accent">
          <Icon size={18} />
        </div>
      </div>
    </Card>
  );
}
