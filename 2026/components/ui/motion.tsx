"use client";

import { motion, type Variants, type Transition } from "framer-motion";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

// ─── Reusable Animation Variants ─────────────────────────────────────────────

export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const slideDownVariants: Variants = {
  hidden: { opacity: 0, y: -24 },
  visible: { opacity: 1, y: 0 },
};

export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

// ─── Default Transition ──────────────────────────────────────────────────────

const defaultTransition: Transition = {
  duration: 0.4,
  ease: [0.25, 0.46, 0.45, 0.94],
};

const springTransition: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 24,
};

// ─── FadeIn Wrapper ──────────────────────────────────────────────────────────

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "none";
  as?: "div" | "span" | "section" | "article";
}

export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.4,
  direction = "up",
  as = "div",
}: FadeInProps) {
  const yOffset = direction === "up" ? 24 : direction === "down" ? -24 : 0;
  const Component = motion[as];

  return (
    <Component
      initial={{ opacity: 0, y: yOffset }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...defaultTransition, delay, duration }}
      className={className}
    >
      {children}
    </Component>
  );
}

// ─── SlideUp Wrapper ─────────────────────────────────────────────────────────

interface SlideUpProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export function SlideUp({ children, className, delay = 0, duration = 0.4 }: SlideUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...defaultTransition, delay, duration }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── StaggerContainer + StaggerItem ──────────────────────────────────────────

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  delayChildren?: number;
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.08,
  delayChildren = 0.05,
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
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div variants={staggerItemVariants} className={className}>
      {children}
    </motion.div>
  );
}

// ─── ScaleOnHover ────────────────────────────────────────────────────────────

interface ScaleOnHoverProps {
  children: ReactNode;
  className?: string;
  scale?: number;
}

export function ScaleOnHover({ children, className, scale = 1.02 }: ScaleOnHoverProps) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={springTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Pressable ─────────────────────────────────────────────────────────────────

interface PressableProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Pressable({ children, className, onClick }: PressableProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      transition={springTransition}
      className={cn("cursor-pointer", className)}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}

// ─── AnimatedCard ──────────────────────────────────────────────────────────────

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedCard({ children, className, delay = 0 }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...springTransition, delay }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── PageTransition ────────────────────────────────────────────────────────────

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── PulseDot ──────────────────────────────────────────────────────────────────

interface PulseDotProps {
  color?: string;
  className?: string;
}

export function PulseDot({ color = "bg-emerald-500", className }: PulseDotProps) {
  return (
    <span className={cn("relative flex h-2.5 w-2.5", className)}>
      <span
        className={cn(
          "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
          color
        )}
      />
      <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5", color)} />
    </span>
  );
}
