import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { PipelineChart } from "@/components/pipeline-chart";
import { redirect } from "next/navigation";
import { buildPipelineChartData, computePipelineMetrics } from "@/lib/pipeline-insights";
import { getGamificationOverview } from "@/lib/gamification";
import { userIsAdmin } from "@/lib/admin";
import { badgeIcon, rankForLevel } from "@/lib/gamification-ranks";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const applications = await prisma.application.findMany({
    where: { userId: session.user.id },
    orderBy: [{ updatedAt: "desc" }]
  });

  const chartData = buildPipelineChartData(applications);
  const metrics = computePipelineMetrics(applications);
  const game = await getGamificationOverview(session.user.id);
  const isAdmin = await userIsAdmin(session.user.id);
  const nextLevelXp = game.profile.level * 100;
  const currentLevelStartXp = (game.profile.level - 1) * 100;
  const progressInLevel = Math.max(0, game.profile.xp - currentLevelStartXp);
  const progressTarget = Math.max(1, nextLevelXp - currentLevelStartXp);
  const progressPct = Math.min(100, Math.round((progressInLevel / progressTarget) * 100));
  const rank = rankForLevel(game.profile.level);

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-10">
      <section className="pit-card p-6 shadow-pit">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">Dashboard</h1>
        <p className="mt-3 max-w-3xl text-zinc-400">
          Track every application, monitor interview progress, and stay on top of deadlines
          with a single view.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link className="pit-btn-secondary" href="/profile">
            Profile
          </Link>
          <Link className="pit-btn-primary" href="/applications">
            Manage Applications
          </Link>
          <Link className="pit-btn-secondary" href="/lab">
            Resume &amp; cover lab
          </Link>
          <Link className="pit-btn-secondary" href="/interview">
            Interview prep
          </Link>
          <Link className="pit-btn-secondary" href="/companies">
            Company intel
          </Link>
          {isAdmin ? (
            <Link className="pit-btn-secondary border-rose-500/30 text-rose-200" href="/admin">
              Admin console
            </Link>
          ) : null}
          <Link
            className="rounded-lg border border-dashed border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-500 transition hover:border-teal-500/40 hover:text-zinc-300"
            href="/api/applications"
          >
            View API JSON
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="pit-card-sm border-l-2 border-l-rose-500/50 p-5">
          <h2 className="text-sm font-medium text-zinc-500">Total applications</h2>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-100">
            {metrics.totalApplications}
          </p>
        </article>
        <article className="pit-card-sm border-l-2 border-l-teal-500/50 p-5">
          <h2 className="text-sm font-medium text-zinc-500">Active pipeline</h2>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-100">
            {metrics.activePipeline}
          </p>
        </article>
        <article className="pit-card-sm border-l-2 border-l-amber-500/45 p-5">
          <h2 className="text-sm font-medium text-zinc-500">Follow ups due</h2>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-100">
            {metrics.followUpsDue}
          </p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <article className="pit-card relative overflow-hidden p-6 shadow-pit">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(244,63,94,0.2),transparent_42%),radial-gradient(circle_at_85%_35%,rgba(45,212,191,0.18),transparent_40%)]"
          />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-300/85">
              Combat report
            </p>
            <h2 className="mt-2 text-2xl font-bold text-zinc-50">Agent progression</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Valorant-style progression based on meaningful prep actions.
            </p>
            <div
              className={`mt-3 inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm ${rank.ring} bg-zinc-900/50`}
            >
              <span aria-hidden>{rank.icon}</span>
              <span className={`font-semibold ${rank.text}`}>{rank.name}</span>
              <span className="text-zinc-500">· Level {game.profile.level}</span>
            </div>
            {!game.profile.gamificationEnabled ? (
              <p className="mt-2 text-xs text-amber-300/90">
                Game mode is currently off in your profile settings.
              </p>
            ) : null}

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-zinc-800/90 bg-zinc-900/60 p-3">
                <p className="text-xs uppercase tracking-wider text-zinc-500">Level</p>
                <p className="mt-1 text-2xl font-semibold text-zinc-50">{game.profile.level}</p>
              </div>
              <div className="rounded-lg border border-zinc-800/90 bg-zinc-900/60 p-3">
                <p className="text-xs uppercase tracking-wider text-zinc-500">XP</p>
                <p className="mt-1 text-2xl font-semibold text-zinc-50">{game.profile.xp}</p>
              </div>
              <div className="rounded-lg border border-zinc-800/90 bg-zinc-900/60 p-3">
                <p className="text-xs uppercase tracking-wider text-zinc-500">Streak</p>
                <p className="mt-1 text-2xl font-semibold text-zinc-50">
                  {game.profile.streakDays}d
                </p>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-1 flex items-center justify-between text-xs text-zinc-500">
                <span>Current rank progress</span>
                <span>{progressPct}%</span>
              </div>
              <div className="h-2 rounded-full bg-zinc-900/80">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-rose-500 via-rose-400 to-teal-400"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                {progressInLevel}/{progressTarget} XP to next level
              </p>
            </div>

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
                Daily quests
              </p>
              <ul className="mt-3 space-y-2">
                {game.quests.map((quest) => {
                  const done = quest.progress >= quest.target;
                  const pct = Math.min(100, Math.round((quest.progress / quest.target) * 100));
                  return (
                    <li
                      key={quest.id}
                      className="rounded-lg border border-zinc-800/90 bg-zinc-900/45 p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className={`text-sm ${done ? "text-teal-200" : "text-zinc-300"}`}>
                          {quest.label}
                        </p>
                        <span className="text-xs text-amber-300/90">+{quest.xp} XP</span>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-zinc-800/80">
                        <div
                          className={`h-1.5 rounded-full ${done ? "bg-teal-400" : "bg-rose-400"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </article>

        <article className="pit-card p-6 shadow-pit">
          <h2 className="text-lg font-semibold text-zinc-100">Recent rewards</h2>
          <p className="mt-1 text-sm text-zinc-500">Latest XP gains, level-ups, and badge unlocks.</p>
          {game.recentEvents.length === 0 ? (
            <p className="mt-6 text-sm text-zinc-500">No events yet. Start adding prep items.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {game.recentEvents.map((event) => (
                <li
                  key={event.id}
                  className="rounded-lg border border-zinc-800/90 bg-zinc-900/45 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-zinc-200">{event.title}</p>
                    {event.xpDelta > 0 ? (
                      <span className="text-xs font-medium text-amber-300">+{event.xpDelta} XP</span>
                    ) : null}
                  </div>
                  {event.detail ? <p className="mt-1 text-xs text-zinc-500">{event.detail}</p> : null}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 border-t border-zinc-800/80 pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Badges
            </h3>
            {game.badges.length === 0 ? (
              <p className="mt-2 text-sm text-zinc-500">No badges unlocked yet.</p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {game.badges.slice(0, 8).map((badge) => (
                  <span
                    key={badge.key}
                    className="inline-flex items-center gap-1 rounded-md border border-teal-500/25 bg-teal-950/30 px-2.5 py-1 text-xs text-teal-200/90"
                    title={badge.detail}
                  >
                    <span aria-hidden>{badgeIcon(badge.key)}</span>
                    {badge.title}
                  </span>
                ))}
              </div>
            )}
          </div>
        </article>
      </section>

      <PipelineChart data={chartData} />
    </main>
  );
}
