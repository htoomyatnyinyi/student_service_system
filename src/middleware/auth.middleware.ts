import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import type { Role } from "../generated/prisma/client";

export const jwtPlugin = new Elysia({ name: "jwt-plugin" }).use(
  jwt({
    name: "jwt",
    secret: process.env.JWT_SECRET || "fallback-secret",
  }),
);

export const authPlugin = new Elysia({ name: "auth-plugin" })
  .use(jwtPlugin)
  .derive(async ({ jwt, headers }) => {
    const auth = headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      return { userId: null as string | null, userRole: null as Role | null };
    }

    const token = auth.slice(7);
    const payload = await jwt.verify(token);

    if (!payload || !payload.id) {
      return { userId: null as string | null, userRole: null as Role | null };
    }

    return {
      userId: payload.id as string | null,
      userRole: payload.role as Role | null,
    };
  });

export function requireAuth(userId: string | null, set: any) {
  if (!userId) {
    set.status = 401;
    throw new Error("Unauthorized: Please login first");
  }
}

export function requireRole(
  userRole: Role | null,
  allowedRoles: Role[],
  set: any,
) {
  if (!userRole || !allowedRoles.includes(userRole)) {
    set.status = 403;
    throw new Error("Forbidden: Insufficient permissions");
  }
}
