import { Elysia, t } from "elysia";
import { announcementService } from "./announcement.service";
import {
  authPlugin,
  requireAuth,
  requireRole,
} from "../../middleware/auth.middleware";
import { successResponse, errorResponse } from "../../utils/response";

export const announcementController = new Elysia({ prefix: "/announcements" })
  .use(authPlugin)

  .get(
    "/",
    async (ctx: any) => {
      try {
        requireAuth(ctx.userId, ctx.set);
        const result = await announcementService.getAll(
          Number(ctx.query.page) || 1,
          Number(ctx.query.limit) || 10,
          ctx.query.departmentId,
        );
        return successResponse(
          result.announcements,
          "Announcements retrieved",
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

  .post(
    "/",
    async (ctx: any) => {
      try {
        requireAuth(ctx.userId, ctx.set);
        requireRole(ctx.userRole, ["ADMIN", "TEACHER"], ctx.set);
        const announcement = await announcementService.create({
          ...ctx.body,
          authorId: ctx.userId!,
        });
        ctx.set.status = 201;
        return successResponse(announcement, "Announcement created");
      } catch (e: any) {
        ctx.set.status = 400;
        return errorResponse(e.message);
      }
    },
    {
      body: t.Object({
        title: t.String({ minLength: 1 }),
        content: t.String({ minLength: 1 }),
        departmentId: t.Optional(t.String()),
      }),
    },
  )

  .put(
    "/:id",
    async (ctx: any) => {
      try {
        requireAuth(ctx.userId, ctx.set);
        requireRole(ctx.userRole, ["ADMIN", "TEACHER"], ctx.set);
        const announcement = await announcementService.update(
          ctx.params.id,
          ctx.body,
        );
        return successResponse(announcement, "Announcement updated");
      } catch (e: any) {
        ctx.set.status = 400;
        return errorResponse(e.message);
      }
    },
    {
      body: t.Object({
        title: t.Optional(t.String()),
        content: t.Optional(t.String()),
        departmentId: t.Optional(t.String()),
      }),
    },
  )

  .delete("/:id", async (ctx: any) => {
    try {
      requireAuth(ctx.userId, ctx.set);
      requireRole(ctx.userRole, ["ADMIN"], ctx.set);
      await announcementService.delete(ctx.params.id);
      return successResponse(null, "Announcement deleted");
    } catch (e: any) {
      ctx.set.status = 400;
      return errorResponse(e.message);
    }
  });
