export const PIPELINE_STATUS_CONFIG = {
  WISHLIST: { label: "Wishlist", color: "#ef4444" },
  APPLIED: { label: "Applied", color: "#dc2626" },
  INTERVIEW: { label: "Interview", color: "#b91c1c" },
  OFFER: { label: "Offer", color: "#f87171" },
  REJECTED: { label: "Rejected", color: "#7f1d1d" },
  WITHDRAWN: { label: "Withdrawn", color: "#991b1b" }
} as const;

export type ApplicationRow = {
  status: string;
  followUpAt: Date | null;
};

export function buildPipelineChartData(applications: { status: string }[]) {
  return Object.entries(PIPELINE_STATUS_CONFIG).map(([status, meta]) => ({
    name: meta.label,
    value: applications.filter((a) => a.status === status).length,
    color: meta.color
  }));
}

export function computePipelineMetrics(applications: ApplicationRow[]) {
  const activePipeline = applications.filter((a) =>
    ["WISHLIST", "APPLIED", "INTERVIEW", "OFFER"].includes(a.status)
  ).length;
  const followUpsDue = applications.filter(
    (a) => a.followUpAt && a.followUpAt.getTime() < Date.now()
  ).length;
  return {
    totalApplications: applications.length,
    activePipeline,
    followUpsDue
  };
}
