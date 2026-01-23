import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MotionCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export const MotionCard = ({ children, className, delay = 0 }: MotionCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{
        y: -4,
        boxShadow: "0 20px 40px -15px hsl(var(--foreground) / 0.1)",
        transition: { duration: 0.2 },
      }}
      className={cn("cursor-pointer", className)}
    >
      {children}
    </motion.div>
  );
};
