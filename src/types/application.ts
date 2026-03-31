export const APPLICATION_STATUSES = [
  "WISHLIST",
  "APPLIED",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "WITHDRAWN"
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export type CreateApplicationInput = {
  company: string;
  role: string;
  location?: string;
  sourceUrl?: string;
  notes?: string;
  status?: ApplicationStatus;
  appliedAt?: string;
  deadlineAt?: string;
  followUpAt?: string;
};
