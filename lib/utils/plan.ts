// Plan-gating utilities
// Import createServerClient() to use on the server side

type Plan = 'free' | 'pro' | 'enterprise'

const PLAN_RANK: Record<Plan, number> = {
  free: 0,
  pro: 1,
  enterprise: 2,
}

/** Returns true if `userPlan` meets or exceeds the required `minPlan`. */
export function planAtLeast(userPlan: Plan, minPlan: Plan): boolean {
  return PLAN_RANK[userPlan] >= PLAN_RANK[minPlan]
}

/** Feature access matrix — single source of truth for what each plan unlocks. */
export const PLAN_FEATURES = {
  quizRecommendationsLimit: {
    free: 1,
    pro: 5,
    enterprise: Infinity,
  },
  subscriptionTracking: {
    free: false,
    pro: true,
    enterprise: true,
  },
  overlapAlerts: {
    free: false,
    pro: true,
    enterprise: true,
  },
  renewalReminders: {
    free: false,
    pro: true,
    enterprise: true,
  },
  comparisons: {
    free: true,  // public only
    pro: true,
    enterprise: true,
  },
  teamMembers: {
    free: 1,
    pro: 25,
    enterprise: Infinity,
  },
  auditLog: {
    free: false,
    pro: true,
    enterprise: true,
  },
} as const

export function getFeatureLimit<K extends keyof typeof PLAN_FEATURES>(
  feature: K,
  plan: Plan
): number | boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (PLAN_FEATURES[feature] as any)[plan] as number | boolean
}
