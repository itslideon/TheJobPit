import type { GamificationReward } from "@/lib/gamification-types";
import { awardGamification, XP_BY_ACTION } from "@/lib/gamification";
import { rankForLevel } from "@/lib/gamification-ranks";

type AwardAction = keyof typeof XP_BY_ACTION;

export async function awardAndBuildReward(
  userId: string,
  action: AwardAction
): Promise<GamificationReward | null> {
  const result = await awardGamification(userId, action);
  if (!result) return null;
  const rank = rankForLevel(result.level);
  return {
    ...result,
    xpGain: XP_BY_ACTION[action] ?? 0,
    rankName: rank.name,
    rankIcon: rank.icon
  };
}

export function jsonWithGamification<T extends Record<string, unknown>>(
  payload: T,
  reward: GamificationReward | null
) {
  if (!reward) return payload;
  return { ...payload, gamification: reward };
}

export function mergeGamificationRewards(
  ...rewards: (GamificationReward | null)[]
): GamificationReward | null {
  const valid = rewards.filter((r): r is GamificationReward => Boolean(r));
  if (valid.length === 0) return null;
  const last = valid[valid.length - 1]!;
  const xpGain = valid.reduce((sum, r) => sum + r.xpGain, 0);
  const newBadges = [...new Set(valid.flatMap((r) => r.newBadges))];
  const leveledUp = valid.some((r) => r.leveledUp);
  const rank = rankForLevel(last.level);
  return {
    xp: last.xp,
    level: last.level,
    streakDays: last.streakDays,
    longestStreakDays: last.longestStreakDays,
    leveledUp,
    newBadges,
    xpGain,
    rankName: rank.name,
    rankIcon: rank.icon
  };
}
