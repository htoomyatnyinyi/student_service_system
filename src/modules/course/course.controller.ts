import { Elysia, t } from "elysia";
import { courseService } from "./course.service";
import {
  authPlugin,
  requireAuth,
  requireRole,
} from "../../middleware/auth.middleware";
import { successResponse, errorResponse } from "../../utils/response";

export const courseController = new Elysia({ prefix: "/courses" })
  .use(authPlugin)

  .get(
    "/",
    async (ctx: any) => {
      try {
        requireAuth(ctx.userId, ctx.set);
        const result = await courseService.getAll(
          Number(ctx.query.page) || 1,
          Number(ctx.query.limit) || 10,
          ctx.query.departmentId,
        );
        return successResponse(
          result.courses,
          "Courses retrieved",
          result.meta,
        );
      } catch (e: any) {
        ctx.set.status = 400;
        return errorResponse(e.message);
      }
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        departmentId: t.Optional(t.String()),
      }),
    },
  )

  .get("/:id", async (ctx: any) => {
    try {
      requireAuth(ctx.userId, ctx.set);
      const course = await courseService.getById(ctx.params.id);
      return successResponse(course);
    } catch (e: any) {
      ctx.set.status = 404;
      return errorResponse(e.message, 404);
    }
  })

  .post(
    "/",
    async (ctx: any) => {
      try {
        requireAuth(ctx.userId, ctx.set);
        requireRole(ctx.userRole, ["ADMIN"], ctx.set);
        const course = await courseService.create(ctx.body);
        ctx.set.status = 201;
        return successResponse(course, "Course created");
      } catch (e: any) {
        ctx.set.status = 400;
        return errorResponse(e.message);
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        code: t.String({ minLength: 1 }),
        credits: t.Optional(t.Number()),
        description: t.Optional(t.String()),
        departmentId: t.String(),
        prerequisiteIds: t.Optional(t.Array(t.String())),
      }),
    },
  )

  .put(
    "/:id",
    async (ctx: any) => {
      try {
        requireAuth(ctx.userId, ctx.set);
        requireRole(ctx.userRole, ["ADMIN"], ctx.set);
        const course = await courseService.update(ctx.params.id, ctx.body);
        return successResponse(course, "Course updated");
      } catch (e: any) {
        ctx.set.status = 400;
        return errorResponse(e.message);
      }
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        code: t.Optional(t.String()),
        credits: t.Optional(t.Number()),
        description: t.Optional(t.String()),
        departmentId: t.Optional(t.String()),
      }),
    },
  )

  .delete("/:id", async (ctx: any) => {
    try {
      requireAuth(ctx.userId, ctx.set);
      requireRole(ctx.userRole, ["ADMIN"], ctx.set);
      await courseService.delete(ctx.params.id);
      return successResponse(null, "Course deleted");
    } catch (e: any) {
      ctx.set.status = 400;
      return errorResponse(e.message);
    }
  });
