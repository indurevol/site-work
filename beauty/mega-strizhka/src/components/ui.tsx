import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "line" | "ghost";
};

export function Button({ variant = "solid", className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-transform duration-150 ease-out active:not-disabled:scale-[0.96] disabled:opacity-50",
        variant === "solid" && "bg-copper text-surface hover:bg-copper-deep",
        variant === "line" && "border border-line bg-surface text-ink hover:border-copper",
        variant === "ghost" && "text-ink hover:bg-sand",
        className,
      )}
      {...props}
    />
  );
}

export function Rise({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setOn(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.18 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ animationDelay: `${delay}ms` }} className={cn("rise", on && "rise-in", className)}>
      {children}
    </div>
  );
}

export function Stars({ value = 5 }: { value?: number }) {
  return (
    <span className="inline-flex gap-0.5 text-copper" aria-label={`${value} из 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={cn("size-3.5", i < value ? "fill-copper" : "fill-transparent")} />
      ))}
    </span>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-muted">{label}</span>
      {children}
    </label>
  );
}

export const fieldClass =
  "min-h-11 w-full rounded-2xl border border-line bg-surface px-3 text-ink outline-none transition focus:border-copper";
