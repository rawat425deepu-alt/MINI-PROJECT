import { ReactNode } from "react";
import { motion } from "framer-motion";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gradient-primary">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label, value, icon, accent, delay = 0,
}: { label: string; value: ReactNode; icon: ReactNode; accent?: "primary" | "accent" | "success" | "warning"; delay?: number }) {
  const accents: Record<string, string> = {
    primary: "from-primary/20 to-primary/0",
    accent: "from-accent/20 to-accent/0",
    success: "from-success/20 to-success/0",
    warning: "from-warning/20 to-warning/0",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group relative overflow-hidden rounded-xl border border-border bg-gradient-card p-5 shadow-card hover-lift cursor-default"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${accents[accent || "primary"]} pointer-events-none transition-opacity duration-500 group-hover:opacity-150`} />
      <div className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
           style={{ background: "linear-gradient(120deg, transparent, oklch(0.85 0.20 130 / 0.15), transparent)" }} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-display font-bold transition-transform duration-300 group-hover:scale-110 origin-left">{value}</p>
        </div>
        <div className="size-10 rounded-lg bg-secondary/70 grid place-items-center transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">{icon}</div>
      </div>
    </motion.div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-border bg-gradient-card shadow-card ${className}`}>
      {children}
    </div>
  );
}

export function Button({
  children, variant = "primary", size = "md", className = "", ...rest
}: {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "accent";
  size?: "sm" | "md";
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants: Record<string, string> = {
    primary: "bg-gradient-primary text-primary-foreground hover:shadow-glow",
    accent: "bg-gradient-accent text-accent-foreground hover:shadow-glow",
    secondary: "bg-secondary text-foreground hover:bg-secondary/70",
    ghost: "hover:bg-secondary/50 text-foreground",
    danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  };
  const sizes: Record<string, string> = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
  };
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 rounded-md bg-input border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/60 transition ${props.className ?? ""}`}
    />
  );
}

export function Select({ children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...rest}
      className={`w-full px-3 py-2 rounded-md bg-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 ${rest.className ?? ""}`}
    >
      {children}
    </select>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5 block">{children}</label>;
}

export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "live" | "scheduled" | "completed" | "ongoing" | "upcoming" }) {
  const tones: Record<string, string> = {
    default: "bg-secondary text-foreground",
    live: "bg-destructive/20 text-destructive border border-destructive/40 animate-pulse-score",
    scheduled: "bg-accent/15 text-accent border border-accent/30",
    completed: "bg-success/15 text-success border border-success/30",
    ongoing: "bg-primary/15 text-primary border border-primary/30",
    upcoming: "bg-accent/15 text-accent border border-accent/30",
  };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${tones[tone]}`}>{children}</span>;
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="text-center py-16 text-muted-foreground">
      <p className="font-medium">{title}</p>
      {hint && <p className="text-xs mt-1">{hint}</p>}
    </div>
  );
}
