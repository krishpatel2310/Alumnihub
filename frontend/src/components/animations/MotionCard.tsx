import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MotionCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
  index?: number;
}

export function MotionCard({
  children,
  className,
  delay = 0,
  hover = true,
  index = 0,
  ...props
}: MotionCardProps) {
  const calculatedDelay = delay || index * 0.05;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: calculatedDelay,
        ease: "easeOut",
      }}
      whileHover={
        hover
          ? {
              y: -4,
              transition: { duration: 0.2 },
            }
          : undefined
      }
      className={cn(
        "rounded-2xl border border-border/40 bg-card text-card-foreground transition-shadow",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface MotionGridProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function MotionGrid({
  children,
  className,
  staggerDelay = 0.05,
}: MotionGridProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function MotionGridItem({
  children,
  className,
  hover = true,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.4,
            ease: "easeOut",
          },
        },
      }}
      whileHover={
        hover
          ? {
              y: -4,
              transition: { duration: 0.2 },
            }
          : undefined
      }
      className={cn("transition-shadow", className)}
    >
      {children}
    </motion.div>
  );
}
