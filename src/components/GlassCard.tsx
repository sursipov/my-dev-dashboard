import { ReactNode, CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  style?: CSSProperties;
}

export function GlassCard({ children, className, hover = false, style }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass rounded-3xl p-6",
        hover && "glass-hover cursor-pointer",
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}
