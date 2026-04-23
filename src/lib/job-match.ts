type Opening = {
  id: string;
  company: string;
  role: string;
  jobType: "Full-time" | "Part-time" | "Contract" | "Internship" | "Remote";
  location: string;
  salary: string;
  url: string;
  skills: string[];
  summary: string;
  source: "MCF" | "LinkedIn SG" | "Glassdoor SG" | "Fallback";
};

export type MatchInput = {
  company?: string;
  role?: string;
  jobType?: string;
  location?: string;
  skills?: string[];
  resumeText?: string;
};

export type MatchResult = Opening & {
  score: number;
  reasons: string[];
};

const FALLBACK_OPENINGS: Opening[] = [
  {
    id: "op_1",
    company: "Stripe",
    role: "Frontend Engineer",
    jobType: "Full-time",
    location: "Singapore",
    salary: "SGD 7,000 - 10,500/mo",
    url: "https://www.linkedin.com/jobs/search/?keywords=Stripe%20Frontend%20Engineer&location=Singapore",
    skills: ["react", "typescript", "accessibility", "design systems"],
    summary: "Build dashboard and payments UI with strong product craftsmanship.",
    source: "Fallback"
  },
  {
    id: "op_2",
    company: "Grab",
    role: "Software Engineer, Growth",
    jobType: "Full-time",
    location: "Kuala Lumpur",
    salary: "MYR 9,000 - 14,000/mo",
    url: "https://www.linkedin.com/jobs/search/?keywords=Grab%20Software%20Engineer%20Growth&location=Kuala%20Lumpur",
    skills: ["node", "sql", "experimentation", "analytics"],
    summary: "Ship growth experiments and optimize funnel conversion across mobile and web.",
    source: "Fallback"
  },
  {
    id: "op_3",
    company: "Shopee",
    role: "Data Analyst",
    jobType: "Full-time",
    location: "Singapore",
    salary: "SGD 5,500 - 8,000/mo",
    url: "https://www.linkedin.com/jobs/search/?keywords=Shopee%20Data%20Analyst&location=Singapore",
    skills: ["sql", "python", "dashboards", "ab testing"],
    summary: "Analyze campaign performance and create business-facing dashboards.",
    source: "Fallback"
  },
  {
    id: "op_4",
    company: "GovTech",
    role: "Product Designer",
    jobType: "Contract",
    location: "Singapore",
    salary: "SGD 5,000 - 8,500/mo",
    url: "https://www.linkedin.com/jobs/search/?keywords=GovTech%20Product%20Designer&location=Singapore",
    skills: ["figma", "ux research", "prototyping", "design systems"],
    summary: "Design citizen-facing services and improve public digital experience.",
    source: "Fallback"
  },
  {
    id: "op_5",
    company: "Canva",
    role: "Frontend Internship",
    jobType: "Internship",
    location: "Remote",
    salary: "USD 2,000 - 3,000/mo",
    url: "https://www.linkedin.com/jobs/search/?keywords=Canva%20Frontend%20Internship&location=Remote",
    skills: ["react", "javascript", "css", "testing"],
    summary: "Contribute to frontend platform and quality tooling.",
    source: "Fallback"
  },
  {
    id: "op_6",
    company: "Notion",
    role: "Full Stack Engineer",
    jobType: "Remote",
    location: "Remote",
    salary: "USD 7,500 - 11,000/mo",
    url: "https://www.linkedin.com/jobs/search/?keywords=Notion%20Full%20Stack%20Engineer&location=Remote",
    skills: ["typescript", "react", "node", "postgresql"],
    summary: "Build product features end-to-end with strong attention to UX.",
    source: "Fallback"
  }
];

function normalize(v: string) {
  return v.toLowerCase().trim();
}

function includesText(hay: string, needle: string) {
  return normalize(hay).includes(normalize(needle));
}

function locationMatches(target: string, candidate: string) {
  const t = normalize(target);
  const c = normalize(candidate);
  if (!t) return true;
  if (c.includes(t) || t.includes(c)) return true;
  if (t.includes("singapore") || t === "sg") {
    return c.includes("singapore") || c.includes("sg");
  }
  if (t.includes("remote")) return c.includes("remote");
  return false;
}

function defaultSearchUrl(source: "MCF" | "LinkedIn SG" | "Glassdoor SG", role: string, company: string) {
  const q = encodeURIComponent(`${role} ${company}`.trim());
  if (source === "LinkedIn SG") {
    return `https://www.linkedin.com/jobs/search/?keywords=${q}&location=Singapore`;
  }
  if (source === "Glassdoor SG") {
    return `https://www.glassdoor.sg/Job/singapore-${encodeURIComponent(role.toLowerCase().replace(/\s+/g, "-"))}-jobs-SRCH_IL.0,9_IM1123_KO10,${10 + role.length}.htm`;
  }
  return `https://www.mycareersfuture.gov.sg/search?search=${q}&sortBy=new_posting_date`;
}

function extractKeywords(text: string) {
  const words = normalize(text)
    .replace(/[^a-z0-9+.#\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3);
  return Array.from(new Set(words)).slice(0, 180);
}

function scoreOpenings(input: MatchInput, openings: Opening[]): MatchResult[] {
  const company = input.company?.trim();
  const role = input.role?.trim();
  const jobType = input.jobType?.trim();
  const location = input.location?.trim();
  const explicitSkills = (input.skills ?? []).map((s) => normalize(s)).filter(Boolean);
  const resumeWords = input.resumeText ? extractKeywords(input.resumeText) : [];
  const skillPool = new Set([...explicitSkills, ...resumeWords]);

  const filteredByLocation = location
    ? openings.filter((o) => locationMatches(location, o.location))
    : openings;

  const scored = filteredByLocation.map((o) => {
    let score = 0;
    const reasons: string[] = [];

    if (company && includesText(o.company, company)) {
      score += 30;
      reasons.push(`Company match: ${o.company}`);
    }
    if (role && (includesText(o.role, role) || includesText(role, o.role))) {
      score += 28;
      reasons.push(`Role alignment with ${o.role}`);
    }
    if (jobType && includesText(o.jobType, jobType)) {
      score += 16;
      reasons.push(`Job type fit: ${o.jobType}`);
    }
    if (location && locationMatches(location, o.location)) {
      score += 14;
      reasons.push(`Location fit: ${o.location}`);
    }

    const matchedSkills = o.skills.filter((s) => skillPool.has(normalize(s)));
    if (matchedSkills.length > 0) {
      score += Math.min(30, matchedSkills.length * 10);
      reasons.push(`Skill overlap: ${matchedSkills.join(", ")}`);
    }

    if (score === 0) {
      score = 10;
      reasons.push("General fit based on your preferences.");
    }

    return { ...o, score: Math.min(100, score), reasons };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, 8);
}

type McfHit = {
  uuid?: string;
  id?: string | number;
  metadata?: {
    uuid?: string;
    is_new?: boolean;
  };
  title?: string;
  company?: string;
  company_name?: string;
  employment_type?: string;
  job_type?: string;
  location?: string;
  posted_company?: {
    name?: string;
  };
  salary?: {
    minimum?: number;
    maximum?: number;
    type?: { id?: number; salary_type?: string };
  };
  minimum_salary?: number;
  maximum_salary?: number;
  currency?: string;
  skills?: string[];
  tags?: string[];
  description?: string;
  href?: string;
  url?: string;
};

type McfResponse = {
  results?: McfHit[];
  data?: McfHit[];
};

function inferJobType(raw?: string) {
  const v = normalize(raw ?? "");
  if (v.includes("intern")) return "Internship";
  if (v.includes("part")) return "Part-time";
  if (v.includes("contract")) return "Contract";
  if (v.includes("remote")) return "Remote";
  return "Full-time";
}

function stripHtml(input: string) {
  return input.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function dedupeOpenings(openings: Opening[]) {
  const seen = new Set<string>();
  const out: Opening[] = [];
  for (const o of openings) {
    const key = `${normalize(o.company)}|${normalize(o.role)}|${normalize(o.location)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(o);
  }
  return out;
}

function toMcfJobUrl(id: string) {
  return `https://www.mycareersfuture.gov.sg/job/${id}`;
}

function mapMcfHit(hit: McfHit, idx: number): Opening | null {
  const idRaw = String(
    hit.uuid ?? hit.metadata?.uuid ?? hit.id ?? `mcf_${idx}`
  ).trim();
  const role = (hit.title ?? "").trim();
  if (!role) return null;

  const company =
    hit.company_name?.trim() ||
    hit.posted_company?.name?.trim() ||
    hit.company?.trim() ||
    "Unknown company";

  const location = (hit.location ?? "Singapore").trim();

  const min = hit.salary?.minimum ?? hit.minimum_salary;
  const max = hit.salary?.maximum ?? hit.maximum_salary;
  const currency = hit.currency ?? "SGD";
  const salary =
    typeof min === "number" && typeof max === "number"
      ? `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`
      : "Not listed";

  const rawUrl = hit.url?.trim() || hit.href?.trim();
  const url = rawUrl && rawUrl !== "#" ? rawUrl : toMcfJobUrl(idRaw);

  return {
    id: `mcf_${idRaw}`,
    company,
    role,
    jobType: inferJobType(hit.employment_type ?? hit.job_type),
    location,
    salary,
    url,
    skills: [...(hit.skills ?? []), ...(hit.tags ?? [])]
      .map((s) => normalize(String(s)))
      .filter(Boolean)
      .slice(0, 16),
    summary: stripHtml(hit.description ?? "").slice(0, 220) || "No summary provided.",
    source: "MCF"
  };
}

type ExternalJob = {
  id?: string | number;
  title?: string;
  role?: string;
  company?: string;
  company_name?: string;
  location?: string;
  jobType?: string;
  job_type?: string;
  salary?: string;
  minimum_salary?: number;
  maximum_salary?: number;
  currency?: string;
  url?: string;
  href?: string;
  description?: string;
  skills?: string[];
  tags?: string[];
};

type ExternalResponse = {
  jobs?: ExternalJob[];
  results?: ExternalJob[];
  data?: ExternalJob[];
};

function normalizeExternalJob(
  raw: ExternalJob,
  idx: number,
  source: "LinkedIn SG" | "Glassdoor SG"
): Opening | null {
  const role = (raw.title ?? raw.role ?? "").trim();
  if (!role) return null;
  const id = String(raw.id ?? `${source}_${idx}`);
  const company = (raw.company ?? raw.company_name ?? "Unknown company").trim();
  const location = (raw.location ?? "Singapore").trim();
  const min = raw.minimum_salary;
  const max = raw.maximum_salary;
  const currency = raw.currency ?? "SGD";
  const salary =
    raw.salary?.trim() ||
    (typeof min === "number" && typeof max === "number"
      ? `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`
      : "Not listed");
  return {
    id: `${source}_${id}`,
    company,
    role,
    jobType: inferJobType(raw.jobType ?? raw.job_type),
    location,
    salary,
    url:
      (raw.url?.trim() && raw.url?.trim() !== "#"
        ? raw.url.trim()
        : raw.href?.trim() && raw.href?.trim() !== "#"
          ? raw.href.trim()
          : defaultSearchUrl(source, role, company)),
    skills: [...(raw.skills ?? []), ...(raw.tags ?? [])]
      .map((s) => normalize(String(s)))
      .filter(Boolean)
      .slice(0, 16),
    summary: stripHtml(raw.description ?? "").slice(0, 220) || "No summary provided.",
    source
  };
}

async function fetchProviderJsonFeed(
  endpoint: string | undefined,
  source: "LinkedIn SG" | "Glassdoor SG",
  input: MatchInput
) {
  if (!endpoint) return [] as Opening[];
  const q = input.role?.trim() || input.company?.trim() || "";
  const params = new URLSearchParams();
  if (q) params.set("search", q);
  params.set("country", "sg");
  params.set("location", input.location?.trim() || "singapore");
  const url = endpoint.includes("?") ? `${endpoint}&${params.toString()}` : `${endpoint}?${params.toString()}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as ExternalResponse | ExternalJob[];
    const arr = Array.isArray(data) ? data : data.jobs ?? data.results ?? data.data ?? [];
    return arr.slice(0, 80).map((j, idx) => normalizeExternalJob(j, idx, source)).filter((v): v is Opening => Boolean(v));
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

async function fetchLiveOpenings(input: MatchInput): Promise<Opening[]> {
  const enabled = (process.env.JOB_MATCH_USE_LIVE ?? "1") !== "0";
  if (!enabled) return [];

  const mcfEndpoint =
    process.env.MCF_API_URL ?? "https://api.mycareersfuture.gov.sg/v2/search";
  const q = input.role?.trim() || input.company?.trim() || "";
  const params = new URLSearchParams();
  if (q) params.set("search", q);
  if (input.location?.trim()) params.set("location", input.location.trim());
  params.set("limit", "30");
  const mcfUrl = `${mcfEndpoint}?${params.toString()}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  let mcfOpenings: Opening[] = [];
  try {
    const res = await fetch(mcfUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "thejobpit/1.0 job-match" },
      cache: "no-store"
    });
    if (res.ok) {
      const data = (await res.json()) as McfResponse;
      const hits = data.results ?? data.data ?? [];
      mcfOpenings = hits.slice(0, 80).map(mapMcfHit).filter((v): v is Opening => Boolean(v));
    }
  } catch {
    mcfOpenings = [];
  } finally {
    clearTimeout(timer);
  }

  const [linkedinOpenings, glassdoorOpenings] = await Promise.all([
    fetchProviderJsonFeed(process.env.LINKEDIN_SG_FEED_URL, "LinkedIn SG", input),
    fetchProviderJsonFeed(process.env.GLASSDOOR_SG_FEED_URL, "Glassdoor SG", input)
  ]);

  return dedupeOpenings([...mcfOpenings, ...linkedinOpenings, ...glassdoorOpenings]);
}

export async function matchOpenings(input: MatchInput): Promise<MatchResult[]> {
  const live = await fetchLiveOpenings(input);
  const source = live.length > 0 ? live : FALLBACK_OPENINGS;
  return scoreOpenings(input, source);
}
