import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MotionWrapperProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  variant?: "fadeUp" | "fadeDown" | "fadeLeft" | "fadeRight" | "scale" | "none";
  hover?: boolean;
  stagger?: boolean;
  staggerDelay?: number;
}

const variants: Record<string, Variants> = {
  fadeUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
  fadeDown: {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  },
  fadeLeft: {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  },
  fadeRight: {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  },
  none: {
    hidden: { opacity: 1 },
    visible: { opacity: 1 },
  },
};

export function MotionWrapper({
  children,
  className,
  delay = 0,
  duration = 0.4,
  variant = "fadeUp",
  hover = false,
}: MotionWrapperProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants[variant]}
      transition={{
        duration,
        delay,
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
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  delayChildren?: number;
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.05,
  delayChildren = 0.1,
}: StaggerContainerProps) {
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
            delayChildren,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function StaggerItem({ children, className, hover = true }: StaggerItemProps) {
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

// Stats card with count animation
interface AnimatedStatProps {
  value: number | string;
  label: string;
  icon?: ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedStat({
  value,
  label,
  icon,
  className,
  delay = 0,
}: AnimatedStatProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: "easeOut",
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn("group cursor-pointer", className)}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: delay + 0.2 }}
      >
        {icon}
      </motion.div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: delay + 0.3 }}
        className="text-2xl font-bold"
      >
        {value}
      </motion.span>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: delay + 0.4 }}
        className="text-sm text-muted-foreground"
      >
        {label}
      </motion.span>
    </motion.div>
  );
}
