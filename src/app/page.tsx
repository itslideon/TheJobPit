import { LandingPage } from "@/components/landing-page";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildPipelineChartData, computePipelineMetrics } from "@/lib/pipeline-insights";

export default async function HomePage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return <LandingPage />;
  }

  const applications = await prisma.application.findMany({
    where: { userId },
    orderBy: [{ updatedAt: "desc" }]
  });

  const chartData = buildPipelineChartData(applications);
  const metrics = computePipelineMetrics(applications);

  return (
    <LandingPage
      preview={{
        chartData,
        ...metrics
      }}
    />
  );
}
