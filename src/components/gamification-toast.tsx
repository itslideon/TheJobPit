"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from "react";
import type { GamificationReward } from "@/lib/gamification-types";
import { BADGE_DEFS } from "@/lib/gamification";

type ToastItem = {
  id: string;
  reward: GamificationReward;
};

type ToastContextValue = {
  showReward: (reward: GamificationReward) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function badgeTitle(key: string) {
  return BADGE_DEFS.find((b) => b.key === key)?.title ?? key;
}

function RewardToast({ item, onDone }: { item: ToastItem; onDone: (id: string) => void }) {
  const { reward } = item;

  return (
    <div
      className="pointer-events-auto animate-[pit-toast-in_0.35s_ease-out] overflow-hidden rounded-xl border border-teal-500/35 bg-zinc-950/95 shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur-md"
      role="status"
      aria-live="polite"
    >
      <div className="bg-[linear-gradient(135deg,rgba(244,63,94,0.18),rgba(45,212,191,0.14))] px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-300/90">
          Combat report
        </p>
        <p className="mt-1 text-sm font-semibold text-zinc-50">
          +{reward.xpGain} XP · Level {reward.level}
        </p>
        <p className="mt-0.5 text-xs text-zinc-400">
          {reward.streakDays} day streak
          {reward.leveledUp ? " · Rank up!" : ""}
        </p>
        {reward.newBadges.length > 0 ? (
          <ul className="mt-2 space-y-1 text-xs text-amber-200/90">
            {reward.newBadges.map((key) => (
              <li key={key}>Badge unlocked: {badgeTitle(key)}</li>
            ))}
          </ul>
        ) : null}
      </div>
      <button
        type="button"
        className="w-full border-t border-zinc-800/90 px-3 py-1.5 text-[11px] text-zinc-500 transition hover:bg-zinc-900/80 hover:text-zinc-300"
        onClick={() => onDone(item.id)}
      >
        Dismiss
      </button>
    </div>
  );
}

export function GamificationToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showReward = useCallback((reward: GamificationReward) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setItems((prev) => [...prev.slice(-2), { id, reward }]);
    window.setTimeout(() => dismiss(id), 5200);
  }, [dismiss]);

  const value = useMemo(() => ({ showReward }), [showReward]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(100vw-2rem,20rem)] flex-col gap-2">
        {items.map((item) => (
          <RewardToast key={item.id} item={item} onDone={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useGamificationToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useGamificationToast must be used within GamificationToastProvider");
  }
  return ctx;
}

/** Call after a mutating API response to surface XP rewards. */
export function extractGamification(body: unknown): GamificationReward | null {
  if (!body || typeof body !== "object") return null;
  const g = (body as { gamification?: GamificationReward }).gamification;
  if (!g || typeof g.xpGain !== "number") return null;
  return g;
}
