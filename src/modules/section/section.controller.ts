import { Elysia, t } from "elysia";
import { sectionService } from "./section.service";
import {
  authPlugin,
  requireAuth,
  requireRole,
} from "../../middleware/auth.middleware";
import { successResponse, errorResponse } from "../../utils/response";

export const sectionController = new Elysia({ prefix: "/sections" })
  .use(authPlugin)

  .get(
    "/",
    async (ctx: any) => {
      try {
        requireAuth(ctx.userId, ctx.set);
        const result = await sectionService.getAll(
          Number(ctx.query.page) || 1,
          Number(ctx.query.limit) || 10,
          ctx.query.courseId,
          ctx.query.semester ? Number(ctx.query.semester) : undefined,
          ctx.query.year ? Number(ctx.query.year) : undefined,
        );
        return successResponse(
          result.sections,
          "Sections retrieved",
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
        courseId: t.Optional(t.String()),
        semester: t.Optional(t.String()),
        year: t.Optional(t.String()),
      }),
    },
  )

  .get("/:id", async (ctx: any) => {
    try {
      requireAuth(ctx.userId, ctx.set);
      const section = await sectionService.getById(ctx.params.id);
      return successResponse(section);
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
        const section = await sectionService.create(ctx.body);
        ctx.set.status = 201;
        return successResponse(section, "Section created");
      } catch (e: any) {
        ctx.set.status = 400;
        return errorResponse(e.message);
      }
    },
    {
      body: t.Object({
        courseId: t.String(),
        teacherId: t.Optional(t.String()),
        semester: t.Number(),
        year: t.Number(),
        room: t.Optional(t.String()),
        schedule: t.Optional(t.String()),
        capacity: t.Optional(t.Number()),
      }),
    },
  )

  .put(
    "/:id",
    async (ctx: any) => {
      try {
        requireAuth(ctx.userId, ctx.set);
        requireRole(ctx.userRole, ["ADMIN", "TEACHER"], ctx.set);
        const section = await sectionService.update(ctx.params.id, ctx.body);
        return successResponse(section, "Section updated");
      } catch (e: any) {
        ctx.set.status = 400;
        return errorResponse(e.message);
      }
    },
    {
      body: t.Object({
        teacherId: t.Optional(t.String()),
        semester: t.Optional(t.Number()),
        year: t.Optional(t.Number()),
        room: t.Optional(t.String()),
        schedule: t.Optional(t.String()),
        capacity: t.Optional(t.Number()),
      }),
    },
  )

  .delete("/:id", async (ctx: any) => {
    try {
      requireAuth(ctx.userId, ctx.set);
      requireRole(ctx.userRole, ["ADMIN"], ctx.set);
      await sectionService.delete(ctx.params.id);
      return successResponse(null, "Section deleted");
    } catch (e: any) {
      ctx.set.status = 400;
      return errorResponse(e.message);
    }
  });
