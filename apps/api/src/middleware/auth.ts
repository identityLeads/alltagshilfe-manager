import { clerkMiddleware, requireAuth } from "@clerk/express";

export const attachClerk = clerkMiddleware();
export const requireSignedIn = requireAuth();
