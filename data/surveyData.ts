import rainwaterProblemsJson from "./rainwater_problems.json";
import rainwaterSolutionsJson from "./rainwater_solutions.json";
import rainwaterLocationsJson from "./rainwater_locations.json";
import wasteProblemsJson from "./water_waste_problems_bhawan.json";
import wasteSolutionsJson from "./water_waste_solutions.json";

/* ------------------------------------------------------------------ */
/* Raw shapes                                                          */
/* ------------------------------------------------------------------ */

export type RainwaterProblem = {
  student_id: string;
  year_of_study: number;
  observed_issue: string;
  severity: number;
  location: string;
};

export type RainwaterSolution = {
  student_id: string;
  proposed_solution: string;
  feasibility_rating: number;
  cost_estimate_category: string;
};

export type RainwaterLocation = {
  student_id: string;
  suggested_building_or_ground: string;
  reasoning_category: string;
};

export type WasteProblem = {
  student_id: string;
  bhawan_name: string;
  primary_water_waste_issue: string;
  repair_delay_rating: number;
};

export type WasteSolution = {
  student_id: string;
  bhawan_name: string;
  actionable_solution: string;
  willingness_to_implement: "Yes" | "No" | "Maybe";
};

export const rainwaterProblems = rainwaterProblemsJson as RainwaterProblem[];
export const rainwaterSolutions = rainwaterSolutionsJson as RainwaterSolution[];
export const rainwaterLocations = rainwaterLocationsJson as RainwaterLocation[];
export const wasteProblems = wasteProblemsJson as WasteProblem[];
export const wasteSolutions = wasteSolutionsJson as WasteSolution[];

export const BHAWANS = [
  "Azad",
  "Aravalli",
  "Cautley",
  "Ganga",
  "Govind",
  "Himalya",
  "Kasturba",
  "Rajendra",
  "Rajiv",
  "RKB",
  "Sarojini",
] as const;

export const TOTAL_RESPONSES =
  rainwaterProblems.length +
  rainwaterSolutions.length +
  rainwaterLocations.length +
  wasteProblems.length +
  wasteSolutions.length;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const countBy = <T,>(rows: T[], key: (r: T) => string | null) => {
  const m = new Map<string, number>();
  for (const r of rows) {
    const k = key(r);
    if (k) m.set(k, (m.get(k) ?? 0) + 1);
  }
  return m;
};

const pct = (n: number, d: number) => (d === 0 ? 0 : Math.round((n / d) * 100));

/* ------------------------------------------------------------------ */
/* Rainwater: waterlogging by location                                 */
/* ------------------------------------------------------------------ */

// Locations that collect standing water. Roof entries are runoff, not waterlogging.
export const WATERLOGGING_LABELS: Record<string, string> = {
  "Govind canteen area": "Govind canteen",
  "LHC green gala side path": "LHC green gala path",
  "SAC outside path leading to pool/OAT": "SAC to pool / OAT",
  "Govind Bhawan corridors": "Govind corridors",
  "Tennis court area": "Tennis courts",
};

export type WaterloggingRow = {
  location: string;
  fullName: string;
  severe: number;
  moderate: number;
  total: number;
  avgSeverity: number;
};

export const waterloggingByLocation: WaterloggingRow[] = Object.entries(WATERLOGGING_LABELS)
  .map(([full, short]) => {
    const rows = rainwaterProblems.filter((r) => r.location === full);
    const severe = rows.filter((r) => r.severity >= 4).length;
    const avg = rows.reduce((s, r) => s + r.severity, 0) / Math.max(rows.length, 1);
    return {
      location: short,
      fullName: full,
      severe,
      moderate: rows.length - severe,
      total: rows.length,
      avgSeverity: Math.round(avg * 10) / 10,
    };
  })
  .sort((a, b) => b.total - a.total);

/* ------------------------------------------------------------------ */
/* Rainwater: proposed solutions, grouped                              */
/* ------------------------------------------------------------------ */

const solutionGroup = (s: string): string => {
  if (/percolation|recharge|filter pits/i.test(s)) return "Percolation trenches & recharge pits";
  if (/rooftop|roof downpipes|first-flush/i.test(s)) return "Rooftop harvesting";
  if (/desilt/i.test(s)) return "Desilt & re-slope drains";
  if (/permeable/i.test(s)) return "Permeable paving";
  if (/reuse/i.test(s)) return "Reuse for gardens & flushing";
  return "Other (corridors, reservoir)";
};

export type ShareRow = { name: string; value: number; share: number };

const toShares = (m: Map<string, number>, keepOrderLast?: string): ShareRow[] => {
  const total = [...m.values()].reduce((a, b) => a + b, 0);
  return [...m.entries()]
    .map(([name, value]) => ({ name, value, share: pct(value, total) }))
    .sort((a, b) => {
      if (keepOrderLast && a.name === keepOrderLast) return 1;
      if (keepOrderLast && b.name === keepOrderLast) return -1;
      return b.value - a.value;
    });
};

export const solutionShares: ShareRow[] = toShares(
  countBy(rainwaterSolutions, (r) => solutionGroup(r.proposed_solution)),
  "Other (corridors, reservoir)"
);

export const avgFeasibilityByGroup: Record<string, number> = (() => {
  const sums = new Map<string, { s: number; n: number }>();
  for (const r of rainwaterSolutions) {
    const g = solutionGroup(r.proposed_solution);
    const cur = sums.get(g) ?? { s: 0, n: 0 };
    sums.set(g, { s: cur.s + r.feasibility_rating, n: cur.n + 1 });
  }
  return Object.fromEntries([...sums].map(([k, v]) => [k, Math.round((v.s / v.n) * 10) / 10]));
})();

/* ------------------------------------------------------------------ */
/* Rainwater: catchment locations                                      */
/* ------------------------------------------------------------------ */

const CATCHMENT_SHORT: Record<string, string> = {
  "Main Building department roofs": "Main Building roofs",
  "Civil Engineering department roof": "Civil Engg. roof",
  "Electrical department roof": "Electrical dept. roof",
  "LHC roof and adjoining green gala": "LHC roof + green gala",
  "SAC and path to pool/OAT": "SAC + pool path",
  "Govind Bhawan roof and canteen area": "Govind roof + canteen",
  "Tennis court area": "Tennis courts",
  "Sports ground near SAC": "SAC sports ground",
};

const shortCatchment = (s: string) => CATCHMENT_SHORT[s] ?? s;

export const topCatchments = [...countBy(rainwaterLocations, (r) => r.suggested_building_or_ground)]
  .map(([name, value]) => ({ name: shortCatchment(name), fullName: name, value }))
  .sort((a, b) => b.value - a.value)
  .slice(0, 8);

export const catchmentReasons: ShareRow[] = toShares(
  countBy(rainwaterLocations, (r) => r.reasoning_category)
);

/* ------------------------------------------------------------------ */
/* Water waste: issues by bhawan (stacked)                             */
/* ------------------------------------------------------------------ */

export const ISSUE_KEYS = ["coolers", "taps", "approval", "flush", "overflow"] as const;
export type IssueKey = (typeof ISSUE_KEYS)[number];

export const ISSUE_LABELS: Record<IssueKey, string> = {
  coolers: "Dogs at ground-floor coolers",
  taps: "Broken / running taps",
  approval: "Repair stuck in approval chain",
  flush: "Leaking flush tanks",
  overflow: "Tank & cooler overflow",
};

export const issueKey = (s: string): IssueKey => {
  if (/dog/i.test(s)) return "coolers";
  if (/approval|Gen Sec|chain/i.test(s)) return "approval";
  if (/tap/i.test(s)) return "taps";
  if (/flush/i.test(s)) return "flush";
  return "overflow";
};

export type BhawanIssueRow = { bhawan: string; total: number } & Record<IssueKey, number>;

export const issuesByBhawan: BhawanIssueRow[] = BHAWANS.map((b) => {
  const rows = wasteProblems.filter((r) => r.bhawan_name === b);
  const row = { bhawan: b, total: rows.length } as BhawanIssueRow;
  for (const k of ISSUE_KEYS) row[k] = 0;
  for (const r of rows) row[issueKey(r.primary_water_waste_issue)] += 1;
  return row;
});

export function bhawanStats(bhawan: string | "all") {
  const rows = bhawan === "all" ? wasteProblems : wasteProblems.filter((r) => r.bhawan_name === bhawan);
  const avgDelay = rows.reduce((s, r) => s + r.repair_delay_rating, 0) / Math.max(rows.length, 1);
  const counts = countBy(rows, (r) => issueKey(r.primary_water_waste_issue));
  const [topKey, topCount] = [...counts].sort((a, b) => b[1] - a[1])[0] ?? ["taps", 0];
  return {
    responses: rows.length,
    avgDelay: Math.round(avgDelay * 10) / 10,
    topIssue: ISSUE_LABELS[topKey as IssueKey],
    topIssueShare: pct(topCount, rows.length),
  };
}

/* ------------------------------------------------------------------ */
/* Water waste: preferred solutions (donut)                            */
/* ------------------------------------------------------------------ */

const fixGroup = (s: string): string => {
  if (/Channel-i/i.test(s)) return "Channel-i SOS ticketing";
  if (/push-button/i.test(s)) return "Push-button taps";
  if (/sensor/i.test(s)) return "Sensor taps";
  if (/dog|cooler platforms/i.test(s)) return "Dog-proof cooler mesh";
  if (/spare|float valve/i.test(s)) return "Spares & auto-cut valves";
  return "Fines & volunteer audits";
};

export function preferredFixes(bhawan: string | "all") {
  const rows = bhawan === "all" ? wasteSolutions : wasteSolutions.filter((r) => r.bhawan_name === bhawan);
  const yes = rows.filter((r) => r.willingness_to_implement === "Yes");
  return {
    shares: toShares(countBy(yes, (r) => fixGroup(r.actionable_solution))),
    yes: yes.length,
    total: rows.length,
    yesShare: pct(yes.length, rows.length),
  };
}

/* ------------------------------------------------------------------ */
/* Headline metrics                                                    */
/* ------------------------------------------------------------------ */

export const headline = (() => {
  const worst = waterloggingByLocation[0];

  const tapRows = wasteProblems.filter((r) => issueKey(r.primary_water_waste_issue) === "taps");
  const [tapBhawan, tapCount] = [...countBy(tapRows, (r) => r.bhawan_name)].sort((a, b) => b[1] - a[1])[0];

  const avgDelay = wasteProblems.reduce((s, r) => s + r.repair_delay_rating, 0) / wasteProblems.length;
  const approvalShare = pct(
    wasteProblems.filter((r) => issueKey(r.primary_water_waste_issue) === "approval").length,
    wasteProblems.length
  );

  return {
    totalResponses: TOTAL_RESPONSES,
    modules: 5,
    perModule: rainwaterProblems.length,
    worstArea: worst.fullName,
    worstAreaShort: worst.location,
    worstAreaReports: worst.total,
    worstAreaSevere: pct(worst.severe, worst.total),
    tapBhawan,
    tapCount,
    tapShare: pct(tapCount, tapRows.length),
    avgDelay: Math.round(avgDelay * 10) / 10,
    approvalShare,
  };
})();

/* ------------------------------------------------------------------ */
/* Detail views for the inner pages                                    */
/* ------------------------------------------------------------------ */

export const YEAR_LABELS: Record<number, string> = { 1: "1st yr", 2: "2nd yr", 3: "3rd yr", 4: "4th yr", 5: "5th yr" };

export function locationDetail(fullName: string, minYear = 1, maxYear = 5) {
  const rows = rainwaterProblems.filter(
    (r) => r.location === fullName && r.year_of_study >= minYear && r.year_of_study <= maxYear
  );
  const severity = [1, 2, 3, 4, 5].map((s) => ({ s, n: rows.filter((r) => r.severity === s).length }));
  const years = [1, 2, 3, 4, 5].map((y) => ({ y, n: rows.filter((r) => r.year_of_study === y).length }));
  const issues = [...countBy(rows, (r) => r.observed_issue)]
    .map(([text, n]) => ({ text, n }))
    .sort((a, b) => b.n - a.n);
  const avg = rows.reduce((s, r) => s + r.severity, 0) / Math.max(rows.length, 1);
  return { reports: rows.length, severity, years, issues, avgSeverity: Math.round(avg * 10) / 10 };
}

export const COST_ORDER = ["Low", "Medium", "High", "Very High"] as const;

export type SolutionPoint = {
  name: string;
  votes: number;
  feasibility: number;
  cost: (typeof COST_ORDER)[number];
  costIndex: number;
  costMix: Record<string, number>;
};

export const solutionPoints: SolutionPoint[] = [...countBy(rainwaterSolutions, (r) => r.proposed_solution)].map(
  ([name, votes]) => {
    const rows = rainwaterSolutions.filter((r) => r.proposed_solution === name);
    const feas = rows.reduce((s, r) => s + r.feasibility_rating, 0) / rows.length;
    const mix = Object.fromEntries(countBy(rows, (r) => r.cost_estimate_category));
    // weighted cost position so bubbles spread between categories
    const ci = rows.reduce((s, r) => s + COST_ORDER.indexOf(r.cost_estimate_category as never), 0) / rows.length;
    const mode = [...countBy(rows, (r) => r.cost_estimate_category)].sort((a, b) => b[1] - a[1])[0][0];
    return {
      name,
      votes,
      feasibility: Math.round(feas * 100) / 100,
      cost: mode as SolutionPoint["cost"],
      costIndex: Math.round(ci * 100) / 100,
      costMix: mix,
    };
  }
);

export const catchmentsAll = [...countBy(rainwaterLocations, (r) => r.suggested_building_or_ground)]
  .map(([name, value]) => {
    const rows = rainwaterLocations.filter((r) => r.suggested_building_or_ground === name);
    return {
      name,
      short: CATCHMENT_SHORT[name] ?? name,
      value,
      reasons: Object.fromEntries(countBy(rows, (r) => r.reasoning_category)) as Record<string, number>,
      kind: /Bhawan|RKB/.test(name) ? "Bhawan roof" : /court|ground|path/i.test(name) ? "Open ground" : "Dept. / LHC",
    };
  })
  .sort((a, b) => b.value - a.value);

export const REASONS = catchmentReasons.map((r) => r.name);

export function bhawanProfile(b: string) {
  const rows = wasteProblems.filter((r) => r.bhawan_name === b);
  const issues = Object.fromEntries(ISSUE_KEYS.map((k) => [k, 0])) as Record<IssueKey, number>;
  for (const r of rows) issues[issueKey(r.primary_water_waste_issue)] += 1;
  const delays = Array.from({ length: 10 }, (_, i) => ({
    d: i + 1,
    n: rows.filter((r) => r.repair_delay_rating === i + 1).length,
  }));
  const avgDelay = rows.reduce((s, r) => s + r.repair_delay_rating, 0) / Math.max(rows.length, 1);
  const sol = wasteSolutions.filter((r) => r.bhawan_name === b);
  const yes = sol.filter((r) => r.willingness_to_implement === "Yes").length;
  return {
    bhawan: b,
    reports: rows.length,
    issues,
    delays,
    avgDelay: Math.round(avgDelay * 10) / 10,
    severeDelays: rows.filter((r) => r.repair_delay_rating >= 8).length,
    fixResponses: sol.length,
    yesShare: pct(yes, sol.length),
    topFix: preferredFixes(b).shares[0]?.name ?? "—",
  };
}

export const bhawanProfiles = BHAWANS.map(bhawanProfile);

export const delayHistogram = Array.from({ length: 10 }, (_, i) => ({
  d: i + 1,
  n: wasteProblems.filter((r) => r.repair_delay_rating === i + 1).length,
}));

/** Which issue each concrete action addresses. Used by the fix-plan builder. */
export const ACTION_TARGETS: Record<string, IssueKey[]> = {
  "Install dog-proof mesh enclosures around ground floor coolers": ["coolers"],
  "Raise cooler platforms so dogs cannot reach the spout": ["coolers"],
  "Replace bathroom taps with push-button taps": ["taps"],
  "Install sensor taps in common washrooms": ["taps"],
  "Direct Channel-i SOS ticketing to plumber for leaks": ["approval", "flush"],
  "Track plumbing tickets publicly on Channel-i with SLA timers": ["approval"],
  "Keep spare tap washers and valves with bhawan maintenance staff": ["approval", "taps", "flush"],
  "Fit auto-cut float valves on overhead tanks": ["overflow"],
  "Fine for deliberate tap damage via bhawan council": ["taps"],
  "Weekly student volunteer audit of running taps": ["taps", "overflow"],
};

export type ActionVote = { action: string; yes: number; maybe: number; no: number; total: number; yesShare: number };

export function actionVotes(bhawan: string | "all"): ActionVote[] {
  const rows = bhawan === "all" ? wasteSolutions : wasteSolutions.filter((r) => r.bhawan_name === bhawan);
  return Object.keys(ACTION_TARGETS)
    .map((action) => {
      const a = rows.filter((r) => r.actionable_solution === action);
      const yes = a.filter((r) => r.willingness_to_implement === "Yes").length;
      const maybe = a.filter((r) => r.willingness_to_implement === "Maybe").length;
      const no = a.filter((r) => r.willingness_to_implement === "No").length;
      return { action, yes, maybe, no, total: a.length, yesShare: pct(yes, a.length) };
    })
    .filter((v) => v.total > 0);
}

/** Share of all water-waste complaints that fall under each issue key. */
export const issueShares = Object.fromEntries(
  ISSUE_KEYS.map((k) => [
    k,
    wasteProblems.filter((r) => issueKey(r.primary_water_waste_issue) === k).length / wasteProblems.length,
  ])
) as Record<IssueKey, number>;
