import { prisma } from "@/lib/prisma";

export const XP_BY_ACTION = {
  application_create: 30,
  application_status_update: 12,
  star_story_create: 24,
  interview_question_create: 18,
  mock_interview_log: 30,
  profile_update: 8,
  community_share: 16
};

export const BADGE_DEFS = [
  { key: "FIRST_BLOOD", title: "First Blood", detail: "Created your first application." },
  { key: "PIPELINE_COMMANDER", title: "Pipeline Commander", detail: "Logged 10 applications." },
  { key: "STAR_CRAFTER", title: "STAR Crafter", detail: "Created 5 STAR stories." },
  { key: "AIM_TRAINER", title: "Aim Trainer", detail: "Saved 10 interview questions." },
  { key: "SCRIM_MASTER", title: "Scrim Master", detail: "Logged 3 mock interviews." },
  { key: "COMMUNITY_AGENT", title: "Community Agent", detail: "Shared 3 public prep posts." },
  { key: "STREAK_7", title: "Hot Streak", detail: "Maintained a 7-day activity streak." },
  { key: "PROFILE_READY", title: "Agent Card Ready", detail: "Completed 4+ profile fields." }
] as const;

type BadgeKey = (typeof BADGE_DEFS)[number]["key"];

function levelFromXp(xp: number) {
  return Math.floor(Math.max(0, xp) / 100) + 1;
}

function startOfUtcDay(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function dayDiffUtc(a: Date, b: Date) {
  const ms = startOfUtcDay(a).getTime() - startOfUtcDay(b).getTime();
  return Math.floor(ms / 86_400_000);
}

function badgeMeta(key: BadgeKey) {
  return BADGE_DEFS.find((b) => b.key === key)!;
}

export async function ensureGameProfile(userId: string) {
  return prisma.userGameProfile.upsert({
    where: { userId },
    create: { userId },
    update: {}
  });
}

async function evaluateBadgeKeys(userId: string, streakDays: number): Promise<BadgeKey[]> {
  const [applicationCount, starCount, questionCount, mockCount, sharedCount, user] = await Promise.all([
    prisma.application.count({ where: { userId } }),
    prisma.starStory.count({ where: { userId } }),
    prisma.interviewQuestion.count({ where: { userId } }),
    prisma.mockInterviewNote.count({ where: { application: { userId } } }),
    prisma.starStory.count({ where: { userId, isPublic: true } }).then(async (starShared) => {
      const qShared = await prisma.interviewQuestion.count({ where: { userId, isPublic: true } });
      return starShared + qShared;
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        headline: true,
        bio: true,
        linkedinUrl: true,
        githubUrl: true,
        websiteUrl: true,
        twitterUrl: true
      }
    })
  ]);

  const profileFields = [
    user?.name,
    user?.headline,
    user?.bio,
    user?.linkedinUrl,
    user?.githubUrl,
    user?.websiteUrl,
    user?.twitterUrl
  ].filter((v) => Boolean(v)).length;

  const keys: BadgeKey[] = [];
  if (applicationCount >= 1) keys.push("FIRST_BLOOD");
  if (applicationCount >= 10) keys.push("PIPELINE_COMMANDER");
  if (starCount >= 5) keys.push("STAR_CRAFTER");
  if (questionCount >= 10) keys.push("AIM_TRAINER");
  if (mockCount >= 3) keys.push("SCRIM_MASTER");
  if (sharedCount >= 3) keys.push("COMMUNITY_AGENT");
  if (streakDays >= 7) keys.push("STREAK_7");
  if (profileFields >= 4) keys.push("PROFILE_READY");
  return keys;
}

export async function awardGamification(userId: string, action: keyof typeof XP_BY_ACTION) {
  const profile = await ensureGameProfile(userId);
  if (!profile.gamificationEnabled) return null;

  const now = new Date();
  const today = startOfUtcDay(now);
  const xpGain = XP_BY_ACTION[action] ?? 0;

  let streakDays = profile.streakDays;
  if (!profile.lastActivityDate) {
    streakDays = 1;
  } else {
    const diff = dayDiffUtc(today, profile.lastActivityDate);
    if (diff >= 2) streakDays = 1;
    if (diff === 1) streakDays = profile.streakDays + 1;
  }

  const nextXp = profile.xp + xpGain;
  const nextLevel = levelFromXp(nextXp);
  const leveledUp = nextLevel > profile.level;

  const updated = await prisma.userGameProfile.update({
    where: { userId },
    data: {
      xp: nextXp,
      level: nextLevel,
      streakDays,
      longestStreakDays: Math.max(profile.longestStreakDays, streakDays),
      lastActivityDate: today
    }
  });

  const eventCreates = [
    prisma.gamificationEvent.create({
      data: {
        userId,
        action,
        title: "XP earned",
        detail: `+${xpGain} XP`,
        xpDelta: xpGain
      }
    })
  ];

  if (leveledUp) {
    eventCreates.push(
      prisma.gamificationEvent.create({
        data: {
          userId,
          action: "level_up",
          title: "Level up!",
          detail: `Reached level ${nextLevel}`,
          xpDelta: 0
        }
      })
    );
  }

  await Promise.all(eventCreates);

  const [candidateBadgeKeys, owned] = await Promise.all([
    evaluateBadgeKeys(userId, updated.streakDays),
    prisma.userGameBadge.findMany({ where: { userId }, select: { key: true } })
  ]);
  const ownedKeys = new Set(owned.map((b) => b.key));
  const newKeys = candidateBadgeKeys.filter((k) => !ownedKeys.has(k));
  if (newKeys.length > 0) {
    await prisma.userGameBadge.createMany({
      data: newKeys.map((key) => ({ userId, key })),
      skipDuplicates: true
    });
    await Promise.all(
      newKeys.map((key) => {
        const meta = badgeMeta(key);
        return prisma.gamificationEvent.create({
          data: {
            userId,
            action: "badge_unlock",
            title: `Badge unlocked: ${meta.title}`,
            detail: meta.detail,
            xpDelta: 0
          }
        });
      })
    );
  }

  return {
    xp: updated.xp,
    level: updated.level,
    streakDays: updated.streakDays,
    longestStreakDays: updated.longestStreakDays,
    leveledUp,
    newBadges: newKeys
  };
}

export async function getGamificationOverview(userId: string) {
  const profile = await ensureGameProfile(userId);
  const [badges, recentEvents, counts, todayCounts] = await Promise.all([
    prisma.userGameBadge.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 12
    }),
    prisma.gamificationEvent.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 8
    }),
    Promise.all([
      prisma.application.count({ where: { userId } }),
      prisma.starStory.count({ where: { userId } }),
      prisma.interviewQuestion.count({ where: { userId } }),
      prisma.mockInterviewNote.count({ where: { application: { userId } } })
    ]),
    Promise.all([
      prisma.application.count({ where: { userId, createdAt: { gte: startOfUtcDay() } } }),
      prisma.starStory.count({ where: { userId, createdAt: { gte: startOfUtcDay() } } }),
      prisma.interviewQuestion.count({ where: { userId, createdAt: { gte: startOfUtcDay() } } }),
      prisma.starStory.count({ where: { userId, isPublic: true, updatedAt: { gte: startOfUtcDay() } } })
    ])
  ]);

  const [applications, stories, questions, mocks] = counts;
  const [todayApps, todayStories, todayQuestions, todayShares] = todayCounts;

  const quests = [
    { id: "q1", label: "Log 1 application today", progress: todayApps, target: 1, xp: 30 },
    { id: "q2", label: "Write 1 STAR story today", progress: todayStories, target: 1, xp: 24 },
    { id: "q3", label: "Save 1 interview question today", progress: todayQuestions, target: 1, xp: 18 },
    { id: "q4", label: "Share 1 prep item today", progress: todayShares, target: 1, xp: 16 }
  ];

  return {
    profile,
    stats: {
      applications,
      stories,
      questions,
      mocks
    },
    badges: badges.map((b) => {
      const meta = BADGE_DEFS.find((d) => d.key === b.key as BadgeKey);
      return {
        key: b.key,
        title: meta?.title ?? b.key,
        detail: meta?.detail ?? "",
        createdAt: b.createdAt
      };
    }),
    recentEvents,
    quests
  };
}
