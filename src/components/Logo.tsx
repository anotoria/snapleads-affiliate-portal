import { Zap } from "lucide-react";

interface LogoProps {
  collapsed?: boolean;
  className?: string;
}

export const Logo = ({ collapsed = false, className = "" }: LogoProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient shadow-brand">
        <Zap className="h-5 w-5 text-primary-foreground" />
      </div>
      {!collapsed && (
        <span className="text-xl font-bold text-foreground">
          Snap<span className="text-brand-gradient">Leads</span>
        </span>
      )}
    </div>
  );
};
