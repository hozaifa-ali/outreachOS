import type { PlanTier, UserRole } from '../types';

/** Plan limits from architecture doc §11 */
export const PLAN_LIMITS: Record<PlanTier, {
  price: number;
  seats: number;
  emailsPerMonth: number;
  mailboxes: number;
  aiCredits: number;
  campaigns: number;
  abTesting: boolean;
  whiteLabel: boolean;
  samlSso: boolean;
}> = {
  starter: { price: 49, seats: 1, emailsPerMonth: 2500, mailboxes: 2, aiCredits: 50, campaigns: 3, abTesting: false, whiteLabel: false, samlSso: false },
  growth: { price: 149, seats: 5, emailsPerMonth: 10000, mailboxes: 10, aiCredits: 500, campaigns: 20, abTesting: true, whiteLabel: false, samlSso: false },
  pro: { price: 399, seats: 20, emailsPerMonth: 50000, mailboxes: 9999, aiCredits: 2000, campaigns: 9999, abTesting: true, whiteLabel: true, samlSso: false },
  enterprise: { price: 0, seats: 9999, emailsPerMonth: 999999, mailboxes: 9999, aiCredits: 99999, campaigns: 9999, abTesting: true, whiteLabel: true, samlSso: true },
};

/** RBAC permission matrix from architecture doc §10 */
export const RBAC_PERMISSIONS: Record<string, UserRole[]> = {
  'billing:manage': ['owner'],
  'team:manage': ['owner', 'admin'],
  'campaigns:create': ['owner', 'admin', 'manager', 'sender'],
  'campaigns:launch': ['owner', 'admin', 'manager'],
  'analytics:view': ['owner', 'admin', 'manager', 'sender', 'viewer'],
  'data:delete': ['owner', 'admin'],
  'api-keys:manage': ['owner', 'admin'],
  'contacts:import': ['owner', 'admin', 'manager', 'sender'],
  'contacts:export': ['owner', 'admin', 'manager'],
  'mailboxes:manage': ['owner', 'admin', 'manager'],
  'templates:manage': ['owner', 'admin', 'manager', 'sender'],
  'inbox:view': ['owner', 'admin', 'manager', 'sender', 'viewer'],
  'inbox:reply': ['owner', 'admin', 'manager', 'sender'],
  'settings:manage': ['owner', 'admin'],
};

/** Rate limiting config from architecture doc §10 */
export const RATE_LIMITS = {
  api: { max: 1000, window: 15 * 60 * 1000 }, // 1000 req/15min per org
  login: { max: 10, window: 15 * 60 * 1000 },  // 10 attempts/15min per IP
  import: { max: 3, window: 60 * 60 * 1000 },   // 3 uploads/hour per org
  aiGeneration: { starter: 100, growth: 500, pro: 2000, enterprise: 99999 }, // per day
};
