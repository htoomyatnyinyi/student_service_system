import { Elysia, t } from "elysia";
import { gradeService } from "./grade.service";
import {
  authPlugin,
  requireAuth,
  requireRole,
} from "../../middleware/auth.middleware";
import { successResponse, errorResponse } from "../../utils/response";

export const gradeController = new Elysia({ prefix: "/grades" })
  .use(authPlugin)

  .post(
    "/",
    async (ctx: any) => {
      try {
        requireAuth(ctx.userId, ctx.set);
        requireRole(ctx.userRole, ["ADMIN", "TEACHER"], ctx.set);
        const grade = await gradeService.create(ctx.body);
        ctx.set.status = 201;
        return successResponse(grade, "Grade recorded");
      } catch (e: any) {
        ctx.set.status = 400;
        return errorResponse(e.message);
      }
    },
    {
      body: t.Object({
        enrollmentId: t.String(),
        grade: t.Optional(t.String()),
        gpa: t.Optional(t.Number()),
        remarks: t.Optional(t.String()),
      }),
    },
  )

  .put(
    "/:id",
    async (ctx: any) => {
      try {
        requireAuth(ctx.userId, ctx.set);
        requireRole(ctx.userRole, ["ADMIN", "TEACHER"], ctx.set);
        const grade = await gradeService.update(ctx.params.id, ctx.body);
        return successResponse(grade, "Grade updated");
      } catch (e: any) {
        ctx.set.status = 400;
        return errorResponse(e.message);
      }
    },
    {
      body: t.Object({
        grade: t.Optional(t.String()),
        gpa: t.Optional(t.Number()),
        remarks: t.Optional(t.String()),
      }),
    },
  )

  .get("/student/:studentId", async (ctx: any) => {
    try {
      requireAuth(ctx.userId, ctx.set);
      const result = await gradeService.getByStudent(ctx.params.studentId);
      return successResponse(result);
    } catch (e: any) {
      ctx.set.status = 400;
      return errorResponse(e.message);
    }
  });
