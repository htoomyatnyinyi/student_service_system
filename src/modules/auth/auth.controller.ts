import { Elysia, t } from "elysia";
import { authService } from "./auth.service";
import { authPlugin, requireAuth } from "../../middleware/auth.middleware";
import { successResponse, errorResponse } from "../../utils/response";

export const authController = new Elysia({ prefix: "/auth" })
  .use(authPlugin)

  // Register
  .post(
    "/register",
    async ({ body, set }) => {
      try {
        const user = await authService.register(
          body.email,
          body.password,
          body.name,
          body.role,
        );
        set.status = 201;
        return successResponse(user, "User registered successfully");
      } catch (e: any) {
        set.status = 400;
        return errorResponse(e.message);
      }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 6 }),
        name: t.String({ minLength: 1 }),
        role: t.Optional(
          t.Union([
            t.Literal("ADMIN"),
            t.Literal("TEACHER"),
            t.Literal("STUDENT"),
          ]),
        ),
      }),
    },
  )

  // Login
  .post(
    "/login",
    async ({ body, jwt, set }) => {
      try {
        const user = await authService.login(body.email, body.password);
        const token = await jwt.sign({
          id: user.id,
          role: user.role,
        });
        return successResponse({ user, token }, "Login successful");
      } catch (e: any) {
        set.status = 401;
        return errorResponse(e.message, 401);
      }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 1 }),
      }),
    },
  )

  // Get current user
  .get("/me", async ({ userId, set }) => {
    try {
      requireAuth(userId, set);
      const profile = await authService.getProfile(userId!);
      return successResponse(profile);
    } catch (e: any) {
      set.status = set.status && set.status !== 200 ? set.status : 401;
      return errorResponse(e.message, set.status as number);
    }
  });
