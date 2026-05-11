/**
 * Shared TypeScript types for OutreachOS.
 */

/** User roles with ascending privilege levels */
export type UserRole = 'viewer' | 'sender' | 'manager' | 'admin' | 'owner';

/** Organization billing plan tiers */
export type PlanTier = 'starter' | 'growth' | 'pro' | 'enterprise';

/** Contact status lifecycle states */
export type ContactStatus = 'active' | 'unsubscribed' | 'bounced' | 'invalid';

/** Campaign lifecycle states */
export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'archived';

/** Sequence step types */
export type StepType = 'email' | 'linkedin_connect' | 'linkedin_message' | 'sms' | 'wait';

/** Email format options */
export type EmailFormat = 'plain' | 'html' | 'newsletter' | 'minimal';

/** Campaign contact enrollment status */
export type EnrollmentStatus = 'enrolled' | 'active' | 'replied' | 'finished' | 'unsubscribed' | 'bounced' | 'failed';

/** Sent email status */
export type SentEmailStatus = 'sent' | 'delivered' | 'bounced' | 'failed';

/** Email event types */
export type EmailEventType = 'open' | 'click' | 'reply' | 'bounce' | 'unsubscribe' | 'spam_report';

/** Inbox channel types */
export type InboxChannel = 'email' | 'linkedin' | 'sms' | 'whatsapp';

/** Thread status */
export type ThreadStatus = 'open' | 'closed' | 'snoozed';

/** Thread label (from AI classifier) */
export type ThreadLabel = 'interested' | 'not_interested' | 'ooo' | 'wrong_person' | 'meeting_booked' | 'referral' | 'question' | 'unsubscribe_request';

/** Mailbox provider types */
export type MailboxProvider = 'gmail' | 'outlook' | 'smtp';

/** Mailbox status */
export type MailboxStatus = 'active' | 'paused' | 'error' | 'disconnected';

/** Contact list sources */
export type ListSource = 'csv_upload' | 'google_sheets' | 'hubspot' | 'salesforce' | 'manual';

/** Template categories */
export type TemplateCategory = 'cold_outreach' | 'follow_up' | 'breakup' | 'newsletter' | 'demo_request';

/** Subscription status */
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing';

/** Audit log actions */
export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'export' | 'import';

/** Audit log entity types */
export type AuditEntity = 'campaign' | 'contact' | 'mailbox' | 'user' | 'template' | 'settings';

/** JWT payload structure */
export interface JwtPayload {
  sub: string;
  orgId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

/** API error response shape */
export interface ApiError {
  statusCode: number;
  error: string;
  message: string;
  details?: unknown;
}

/** Paginated response wrapper */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Campaign schedule configuration */
export interface CampaignSchedule {
  timezone: string;
  days: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  startHour: number;
  endHour: number;
  throttlePerHour: number;
}

/** A/B test variant */
export interface StepVariant {
  id: string;
  subject: string;
  body: string;
  weight: number; // percentage allocation
}

/** Step condition for branching */
export interface StepCondition {
  trigger: 'opened' | 'clicked' | 'replied' | 'no_reply';
}

/** White label configuration */
export interface WhiteLabelConfig {
  domain?: string;
  logoUrl?: string;
  primaryColor?: string;
  name?: string;
}
