import bcrypt from 'bcrypt';
import { prisma } from '@outreachos/db';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../shared/auth/jwt.utils';
import { generateUniqueSlug } from '@outreachos/shared';
import { AppError } from '../../shared/errors/app-error';
import type { RegisterInput, LoginInput, JwtPayload, UserRole } from '@outreachos/shared';
import { randomUUID } from 'crypto';

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 12;

/** Registers a new user, creates an organization, and returns tokens */
export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw AppError.conflict('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const slug = generateUniqueSlug(input.orgName);

  const result = await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: {
        name: input.orgName,
        slug,
        plan: 'starter',
        seats: 1,
        emailCredits: 2500,
      },
    });

    const user = await tx.user.create({
      data: {
        orgId: org.id,
        email: input.email,
        passwordHash,
        fullName: input.fullName,
        role: 'owner',
      },
    });

    // Create starter subscription
    await tx.subscription.create({
      data: {
        orgId: org.id,
        plan: 'starter',
        status: 'trialing',
        emailQuota: 2500,
        seatsQuota: 1,
        currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14-day trial
      },
    });

    return { org, user };
  });

  const tokenPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
    sub: result.user.id,
    orgId: result.org.id,
    email: result.user.email,
    role: result.user.role as UserRole,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken({ sub: result.user.id });

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      userId: result.user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: result.user.id,
      email: result.user.email,
      fullName: result.user.fullName,
      role: result.user.role,
      orgId: result.org.id,
      orgName: result.org.name,
    },
  };
}

/** Authenticates a user with email + password and returns tokens */
export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: { organization: true },
  });
  if (!user || !user.passwordHash) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const validPassword = await bcrypt.compare(input.password, user.passwordHash);
  if (!validPassword) {
    throw AppError.unauthorized('Invalid email or password');
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const tokenPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
    sub: user.id,
    orgId: user.orgId,
    email: user.email,
    role: user.role as UserRole,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken({ sub: user.id });

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      orgId: user.orgId,
      orgName: user.organization.name,
    },
  };
}

/** Refreshes access token using a valid refresh token */
export async function refreshAccessToken(refreshTokenValue: string) {
  let payload: { sub: string };
  try {
    payload = verifyRefreshToken(refreshTokenValue);
  } catch {
    throw AppError.unauthorized('Invalid or expired refresh token');
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshTokenValue },
  });
  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw AppError.unauthorized('Refresh token revoked or expired');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: { organization: true },
  });
  if (!user) {
    throw AppError.unauthorized('User not found');
  }

  const accessToken = generateAccessToken({
    sub: user.id,
    orgId: user.orgId,
    email: user.email,
    role: user.role as UserRole,
  });

  return { accessToken };
}

/** Revokes a refresh token (logout) */
export async function revokeRefreshToken(refreshTokenValue: string) {
  await prisma.refreshToken.deleteMany({ where: { token: refreshTokenValue } });
}
