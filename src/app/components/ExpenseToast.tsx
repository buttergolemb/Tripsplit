import React from "react";
import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";

export function ExpenseToast({
  emoji, description, amount, onDismiss,
}: {
  emoji: string; description: string; amount: string; onDismiss: () => void;
}) {
  React.useEffect(() => {
    const t = setTimeout(onDismiss, 3200);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ y: 80, opacity: 0, scale: 0.92 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 80, opacity: 0, scale: 0.92 }}
      transition={{ type: "spring", damping: 22, stiffness: 280 }}
      className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-3 bg-white text-[#1C1C1E] pl-3.5 pr-4 py-3 rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.06] max-w-[320px] w-[calc(100%-32px)]"
      onClick={onDismiss}
    >
      <div className="size-9 rounded-[12px] bg-[#34C759]/12 flex items-center justify-center flex-shrink-0">
        <CheckCircle2 className="size-5 text-[#34C759]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-[#1C1C1E] leading-tight">Expense added!</p>
        <p className="text-[12px] text-[#8E8E93] truncate mt-0.5">
          {emoji} {description} · <span className="text-[#34C759] font-semibold">${amount}</span> split with everyone
        </p>
      </div>
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b-[20px] bg-[#34C759]/35 origin-left"
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 3.2, ease: "linear" }}
      />
    </motion.div>
  );
}
