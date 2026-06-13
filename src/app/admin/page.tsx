import { getAdminStats } from "@/lib/admin";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminOverviewPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const stats = await getAdminStats();

  return (
    <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <article className="pit-card-sm p-5">
        <h2 className="text-sm text-zinc-500">Users</h2>
        <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-100">{stats.userCount}</p>
      </article>
      <article className="pit-card-sm p-5">
        <h2 className="text-sm text-zinc-500">Applications</h2>
        <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-100">
          {stats.applicationCount}
        </p>
      </article>
      <article className="pit-card-sm p-5">
        <h2 className="text-sm text-zinc-500">Public STAR stories</h2>
        <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-100">
          {stats.publicStarCount}
        </p>
      </article>
      <article className="pit-card-sm p-5">
        <h2 className="text-sm text-zinc-500">Public Q&amp;A</h2>
        <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-100">
          {stats.publicQuestionCount}
        </p>
      </article>

      <article className="pit-card md:col-span-2 lg:col-span-4 p-5">
        <h2 className="text-lg font-semibold text-zinc-100">Recent sign-ups</h2>
        <ul className="mt-4 divide-y divide-zinc-800/80">
          {stats.recentUsers.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <div>
                <p className="font-medium text-zinc-200">{u.name ?? "—"}</p>
                <p className="text-zinc-500">{u.email}</p>
              </div>
              <div className="text-right text-xs text-zinc-500">
                <p>{u.role}</p>
                <p>{new Date(u.createdAt).toLocaleString()}</p>
              </div>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
