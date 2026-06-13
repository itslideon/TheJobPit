/** Valorant-inspired rank tiers mapped to agent level bands. */
export const RANK_TIERS = [
  { minLevel: 1, name: "Iron", icon: "⬡", ring: "border-zinc-600/60", text: "text-zinc-400" },
  { minLevel: 6, name: "Bronze", icon: "◆", ring: "border-amber-800/50", text: "text-amber-600" },
  { minLevel: 11, name: "Silver", icon: "◇", ring: "border-zinc-400/40", text: "text-zinc-300" },
  { minLevel: 16, name: "Gold", icon: "★", ring: "border-amber-500/45", text: "text-amber-400" },
  { minLevel: 21, name: "Platinum", icon: "✦", ring: "border-teal-500/40", text: "text-teal-300" },
  { minLevel: 31, name: "Diamond", icon: "◈", ring: "border-cyan-400/40", text: "text-cyan-300" },
  { minLevel: 41, name: "Ascendant", icon: "▲", ring: "border-emerald-500/40", text: "text-emerald-300" },
  { minLevel: 56, name: "Immortal", icon: "✸", ring: "border-rose-500/45", text: "text-rose-300" },
  { minLevel: 76, name: "Radiant", icon: "☀", ring: "border-amber-300/50", text: "text-amber-200" }
] as const;

export type RankTier = (typeof RANK_TIERS)[number];

export function rankForLevel(level: number): RankTier {
  let tier: RankTier = RANK_TIERS[0];
  for (const t of RANK_TIERS) {
    if (level >= t.minLevel) tier = t;
  }
  return tier;
}

export const BADGE_ICONS: Record<string, string> = {
  FIRST_BLOOD: "🎯",
  PIPELINE_COMMANDER: "📋",
  STAR_CRAFTER: "⭐",
  AIM_TRAINER: "🎮",
  SCRIM_MASTER: "🎙",
  COMMUNITY_AGENT: "📡",
  STREAK_7: "🔥",
  PROFILE_READY: "🪪"
};

export function badgeIcon(key: string): string {
  return BADGE_ICONS[key] ?? "🏅";
}
