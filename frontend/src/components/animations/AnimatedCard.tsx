import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}

export function AnimatedCard({
  children,
  className,
  delay = 0,
  hover = true,
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
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

interface AnimatedListProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
}

export function AnimatedList({
  children,
  className,
  staggerDelay = 0.05,
}: AnimatedListProps) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      className={className}
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            show: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94],
              },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}

export function AnimatedSection({
  children,
  className,
  delay = 0,
  direction = "up",
}: AnimatedSectionProps) {
  const getInitialPosition = () => {
    switch (direction) {
      case "up":
        return { opacity: 0, y: 30 };
      case "down":
        return { opacity: 0, y: -30 };
      case "left":
        return { opacity: 0, x: 30 };
      case "right":
        return { opacity: 0, x: -30 };
    }
  };

  const getAnimatePosition = () => {
    switch (direction) {
      case "up":
      case "down":
        return { opacity: 1, y: 0 };
      case "left":
      case "right":
        return { opacity: 1, x: 0 };
    }
  };

  return (
    <motion.div
      initial={getInitialPosition()}
      animate={getAnimatePosition()}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedCounterProps {
  value: number | string;
  className?: string;
  duration?: number;
}

export function AnimatedCounter({
  value,
  className,
  duration = 1,
}: AnimatedCounterProps) {
  const numValue = typeof value === "string" ? parseFloat(value.replace(/[^0-9.-]/g, "")) || 0 : value;
  const prefix = typeof value === "string" ? value.match(/^[^0-9]*/)?.[0] || "" : "";
  const suffix = typeof value === "string" ? value.match(/[^0-9]*$/)?.[0] || "" : "";

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {prefix}
      </motion.span>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {numValue.toLocaleString()}
      </motion.span>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {suffix}
      </motion.span>
    </motion.span>
  );
}
