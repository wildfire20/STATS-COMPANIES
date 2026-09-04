import { clerkClient, getAuth } from "@clerk/express";
import type { Request, RequestHandler } from "express";
import { eq, sql } from "drizzle-orm";
import { db } from "./db";
import { users, type User } from "@shared/schema";

declare global {
  namespace Express {
    interface Request {
      dbUser?: User;
      clerkIdentity?: ClerkIdentity;
    }
  }
}

export interface ClerkIdentity {
  email?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}

function optionalClaim(claims: Record<string, unknown> | undefined, name: keyof ClerkIdentity): string | undefined {
  const value = claims?.[name];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

/** Returns identity values that Clerk has included in the verified session. */
export function getClerkIdentity(req: Request): ClerkIdentity {
  return req.clerkIdentity ?? {};
}

async function loadVerifiedClerkIdentity(clerkUserId: string): Promise<ClerkIdentity> {
  const clerkUser = await clerkClient.users.getUser(clerkUserId);
  const primaryEmail = clerkUser.emailAddresses.find(
    (address) =>
      address.id === clerkUser.primaryEmailAddressId &&
      address.verification?.status === "verified",
  );
  const verifiedEmail =
    primaryEmail ??
    clerkUser.emailAddresses.find(
      (address) => address.verification?.status === "verified",
    );

  return {
    email: verifiedEmail?.emailAddress,
    firstName: clerkUser.firstName ?? undefined,
    lastName: clerkUser.lastName ?? undefined,
    username: clerkUser.username ?? undefined,
  };
}

/**
 * Loads the application's local user for a Clerk session when one is present.
 * Migrated accounts use sessionClaims.userId; new accounts fall back to their
 * Clerk user id only when no migration bridge claim exists. Local-only legacy
 * accounts are bridged by their verified Clerk session email without changing
 * their local id, role, or relationships.
 */
export async function resolveOptionalDbUser(req: Request): Promise<User | undefined> {
  const auth = getAuth(req);
  const claims = auth.sessionClaims as Record<string, unknown> | undefined;
  const bridgeClaim = claims?.userId;
  const bridgeId = typeof bridgeClaim === "string" && bridgeClaim ? bridgeClaim : undefined;
  req.clerkIdentity = {
    email: optionalClaim(claims, "email"),
    firstName: optionalClaim(claims, "firstName"),
    lastName: optionalClaim(claims, "lastName"),
    username: optionalClaim(claims, "username"),
  };
  const userId = bridgeId || auth.userId;
  if (!userId) {
    return undefined;
  }

  if (!req.clerkIdentity.email && auth.userId) {
    req.clerkIdentity = {
      ...req.clerkIdentity,
      ...(await loadVerifiedClerkIdentity(auth.userId)),
    };
  }

  let dbUser: User | undefined;
  if (bridgeId) {
    [dbUser] = await db.select().from(users).where(eq(users.id, bridgeId)).limit(1);
  }
  const normalizedEmail = req.clerkIdentity.email?.toLowerCase();
  if (!dbUser && normalizedEmail) {
    [dbUser] = await db
      .select()
      .from(users)
      .where(sql`lower(trim(${users.email})) = ${normalizedEmail}`)
      .limit(1);
  }
  if (!dbUser && auth.userId) {
    [dbUser] = await db.select().from(users).where(eq(users.id, auth.userId)).limit(1);
  }
  if (!dbUser) {
    const [inserted] = await db
      .insert(users)
      .values({ id: userId, role: "customer" })
      .onConflictDoNothing()
      .returning();
    dbUser = inserted;
    if (!dbUser) {
      [dbUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    }
  }
  if (dbUser) {
    req.dbUser = dbUser;
  }
  return dbUser;
}

export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    const dbUser = await resolveOptionalDbUser(req);
    if (!dbUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const isAdmin: RequestHandler = (req, res, next) => {
  if (!req.dbUser) {
    return requireAuth(req, res, () => isAdmin(req, res, next));
  }
  if (req.dbUser.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  next();
};

// Compatibility alias keeps existing protected route declarations explicit.
export const isAuthenticated = requireAuth;