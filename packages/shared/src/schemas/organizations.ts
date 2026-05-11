import { z } from 'zod';

/** Update organization settings */
export const updateOrganizationSchema = z.object({
  name: z.string().min(1).optional(),
  timezone: z.string().optional(),
  whiteLabel: z.object({
    domain: z.string().optional(),
    logoUrl: z.string().url().optional(),
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    name: z.string().optional(),
  }).optional(),
});
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;

/** Invite a user to the organization */
export const inviteUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'manager', 'sender', 'viewer']),
  fullName: z.string().optional(),
});
export type InviteUserInput = z.infer<typeof inviteUserSchema>;

/** Update a user's role */
export const updateUserRoleSchema = z.object({
  role: z.enum(['admin', 'manager', 'sender', 'viewer']),
});
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
