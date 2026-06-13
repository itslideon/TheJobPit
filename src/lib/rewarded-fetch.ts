"use client";

import type { GamificationReward } from "@/lib/gamification-types";
import { extractGamification, useGamificationToast } from "@/components/gamification-toast";

type JsonBody = Record<string, unknown>;

/** Parse JSON from a fetch Response and show gamification toast when present. */
export async function readJsonWithReward(
  res: Response,
  showReward: (reward: GamificationReward) => void
): Promise<JsonBody> {
  const body = (await res.json().catch(() => ({}))) as JsonBody;
  const reward = extractGamification(body);
  if (reward && res.ok) showReward(reward);
  return body;
}

export function useRewardedFetch() {
  const { showReward } = useGamificationToast();

  return {
    showReward,
    readJsonWithReward: (res: Response) => readJsonWithReward(res, showReward)
  };
}
