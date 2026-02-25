import { Elysia, t } from "elysia";
import { attendanceService } from "./attendance.service";
import {
  authPlugin,
  requireAuth,
  requireRole,
} from "../../middleware/auth.middleware";
import { successResponse, errorResponse } from "../../utils/response";

export const attendanceController = new Elysia({ prefix: "/attendance" })
  .use(authPlugin)

  // Mark single attendance
  .post(
    "/",
    async (ctx: any) => {
      try {
        requireAuth(ctx.userId, ctx.set);
        requireRole(ctx.userRole, ["ADMIN", "TEACHER"], ctx.set);
        const attendance = await attendanceService.mark(ctx.body);
        return successResponse(attendance, "Attendance marked");
      } catch (e: any) {
        ctx.set.status = 400;
        return errorResponse(e.message);
      }
    },
    {
      body: t.Object({
        studentId: t.String(),
        sectionId: t.String(),
        date: t.String(),
        status: t.Union([
          t.Literal("PRESENT"),
          t.Literal("ABSENT"),
          t.Literal("LATE"),
          t.Literal("EXCUSED"),
        ]),
      }),
    },
  )

  // Bulk mark attendance
  .post(
    "/bulk",
    async (ctx: any) => {
      try {
        requireAuth(ctx.userId, ctx.set);
        requireRole(ctx.userRole, ["ADMIN", "TEACHER"], ctx.set);
        const results = await attendanceService.markBulk(
          ctx.body.sectionId,
          ctx.body.date,
          ctx.body.records,
        );
        return successResponse(results, "Bulk attendance marked");
      } catch (e: any) {
        ctx.set.status = 400;
        return errorResponse(e.message);
      }
    },
    {
      body: t.Object({
        sectionId: t.String(),
        date: t.String(),
        records: t.Array(
          t.Object({
            studentId: t.String(),
            status: t.Union([
              t.Literal("PRESENT"),
              t.Literal("ABSENT"),
              t.Literal("LATE"),
              t.Literal("EXCUSED"),
            ]),
          }),
        ),
      }),
    },
  )

  // Get attendance by section
  .get(
    "/section/:sectionId",
    async (ctx: any) => {
      try {
        requireAuth(ctx.userId, ctx.set);
        const records = await attendanceService.getBySection(
          ctx.params.sectionId,
          ctx.query.date,
        );
        return successResponse(records);
      } catch (e: any) {
        ctx.set.status = 400;
        return errorResponse(e.message);
      }
    },
    { query: t.Object({ date: t.Optional(t.String()) }) },
  )

  // Get attendance by student
  .get(
    "/student/:studentId",
    async (ctx: any) => {
      try {
        requireAuth(ctx.userId, ctx.set);
        const result = await attendanceService.getByStudent(
          ctx.params.studentId,
          ctx.query.sectionId,
        );
        return successResponse(result);
      } catch (e: any) {
        ctx.set.status = 400;
        return errorResponse(e.message);
      }
    },
    { query: t.Object({ sectionId: t.Optional(t.String()) }) },
  );
