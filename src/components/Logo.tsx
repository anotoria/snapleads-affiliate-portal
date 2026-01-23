import snapleadsLogo from "@/assets/snapleads-logo.png";

interface LogoProps {
  collapsed?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const Logo = ({ collapsed = false, className = "", size = "md" }: LogoProps) => {
  const sizeClasses = {
    sm: "h-8",
    md: "h-10",
    lg: "h-16",
  };

  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src={snapleadsLogo} 
        alt="SnapLeads" 
        className={`${sizeClasses[size]} w-auto object-contain ${collapsed ? "max-w-[40px]" : ""}`}
      />
    </div>
  );
};
