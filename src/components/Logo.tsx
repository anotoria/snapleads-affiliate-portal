import snapleadsLogo from "@/assets/snapleads-logo.png";
import { useLanguage } from "@/hooks/useLanguage";

interface LogoProps {
  collapsed?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
}

export const Logo = ({ collapsed = false, className = "", size = "md", showSubtitle = false }: LogoProps) => {
  const { t } = useLanguage();
  
  const sizeClasses = {
    sm: "h-8",
    md: "h-10",
    lg: "h-16",
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center">
        <img 
          src={snapleadsLogo} 
          alt="SnapLeads" 
          className={`${sizeClasses[size]} w-auto object-contain ${collapsed ? "max-w-[40px]" : ""}`}
        />
      </div>
      {showSubtitle && (
        <span className="text-xs text-muted-foreground mt-1">{t.common.affiliatePortal}</span>
      )}
    </div>
  );
};
