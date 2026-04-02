/** Distinct, accessible hues: rose primary, teal/amber complements, stone for terminal states */
export const PIPELINE_STATUS_CONFIG = {
  WISHLIST: { label: "Wishlist", color: "#f43f5e" },
  APPLIED: { label: "Applied", color: "#fb7185" },
  INTERVIEW: { label: "Interview", color: "#2dd4bf" },
  OFFER: { label: "Offer", color: "#fbbf24" },
  REJECTED: { label: "Rejected", color: "#78716c" },
  WITHDRAWN: { label: "Withdrawn", color: "#a8a29e" }
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
