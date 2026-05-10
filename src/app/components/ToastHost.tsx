// App-wide toast host. Lives once at the root and lets any descendant push a
// success/error/info toast via `useToast().push(...)`. Toasts auto-dismiss and
// stack above the iPhone mockup content (z-[70]) so they sit above sheets.

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastTone = "success" | "error" | "info";

export type ToastInput = {
  tone?: ToastTone;
  title: string;
  description?: string;
  // Optional action — renders as a secondary button on the right.
  actionLabel?: string;
  onAction?: () => void;
  // ms before auto-dismiss. Defaults to 3500. Use 0 for sticky.
  duration?: number;
};

type Toast = Required<Omit<ToastInput, "onAction" | "actionLabel" | "description">> & {
  id: number;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

type ToastContextType = {
  push: (t: ToastInput) => void;
  dismiss: (id: number) => void;
};

const ToastContext = React.createContext<ToastContextType | null>(null);

export function useToast(): ToastContextType {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    // In test/storybook contexts outside the provider, log and noop instead
    // of crashing the app.
    return {
      push: (t) => console.warn("[toast:no-provider]", t),
      dismiss: () => {},
    };
  }
  return ctx;
}

export function ToastHost({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const idRef = React.useRef(1);
  const timersRef = React.useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = React.useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const push = React.useCallback<ToastContextType["push"]>((input) => {
    const id = idRef.current++;
    const toast: Toast = {
      id,
      tone: input.tone ?? "success",
      title: input.title,
      description: input.description,
      duration: input.duration ?? 3500,
      actionLabel: input.actionLabel,
      onAction: input.onAction,
    };
    setToasts((list) => [...list, toast].slice(-3)); // keep at most 3 visible
    if (toast.duration > 0) {
      const timer = setTimeout(() => dismiss(id), toast.duration);
      timersRef.current.set(id, timer);
    }
  }, [dismiss]);

  React.useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const t of timers.values()) clearTimeout(t);
      timers.clear();
    };
  }, []);

  const value = React.useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 top-3 z-[70] flex flex-col items-center gap-2 px-4"
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <ToastCard key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const tone = toast.tone;
  const Icon = tone === "success" ? CheckCircle2 : tone === "error" ? AlertCircle : Info;
  const palette =
    tone === "success"
      ? { iconColor: "#34C759", ring: "ring-[#34C759]/15" }
      : tone === "error"
      ? { iconColor: "#FF3B30", ring: "ring-[#FF3B30]/15" }
      : { iconColor: "#007AFF", ring: "ring-[#007AFF]/15" };

  return (
    <motion.div
      role={tone === "error" ? "alert" : "status"}
      initial={{ opacity: 0, y: -14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ type: "spring", damping: 22, stiffness: 280 }}
      className={`pointer-events-auto max-w-[320px] w-full bg-white rounded-[14px] shadow-[0_8px_28px_rgba(0,0,0,0.18)] ring-1 ${palette.ring} px-3.5 py-3 flex items-start gap-2.5`}
    >
      <Icon className="size-5 flex-shrink-0 mt-[1px]" style={{ color: palette.iconColor }} />
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-semibold text-[#1C1C1E] leading-tight">
          {toast.title}
        </p>
        {toast.description && (
          <p className="text-[12px] text-[#6E6E73] mt-0.5 leading-snug">{toast.description}</p>
        )}
      </div>
      {toast.actionLabel && toast.onAction && (
        <button
          onClick={() => {
            toast.onAction?.();
            onDismiss();
          }}
          className="text-[12px] font-semibold text-[#007AFF] px-1.5 py-0.5 -mt-0.5"
        >
          {toast.actionLabel}
        </button>
      )}
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="size-5 rounded-full hover:bg-[#F1F2F5] flex items-center justify-center flex-shrink-0"
      >
        <X className="size-3.5 text-[#8E8E93]" strokeWidth={2.4} />
      </button>
    </motion.div>
  );
}
