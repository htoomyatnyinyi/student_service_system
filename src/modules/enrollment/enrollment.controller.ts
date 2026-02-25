import { Elysia, t } from "elysia";
import { enrollmentService } from "./enrollment.service";
import {
  authPlugin,
  requireAuth,
  requireRole,
} from "../../middleware/auth.middleware";
import { successResponse, errorResponse } from "../../utils/response";

export const enrollmentController = new Elysia({ prefix: "/enrollments" })
  .use(authPlugin)

  .post(
    "/",
    async (ctx: any) => {
      try {
        requireAuth(ctx.userId, ctx.set);
        requireRole(ctx.userRole, ["ADMIN", "STUDENT"], ctx.set);
        const enrollment = await enrollmentService.enroll(
          ctx.body.studentId,
          ctx.body.sectionId,
        );
        ctx.set.status = 201;
        return successResponse(enrollment, "Enrolled successfully");
      } catch (e: any) {
        ctx.set.status = 400;
        return errorResponse(e.message);
      }
    },
    {
      body: t.Object({
        studentId: t.String(),
        sectionId: t.String(),
      }),
    },
  )

  .delete("/:id", async (ctx: any) => {
    try {
      requireAuth(ctx.userId, ctx.set);
      requireRole(ctx.userRole, ["ADMIN", "STUDENT"], ctx.set);
      const enrollment = await enrollmentService.drop(ctx.params.id);
      return successResponse(enrollment, "Enrollment dropped");
    } catch (e: any) {
      ctx.set.status = 400;
      return errorResponse(e.message);
    }
  })

  .get("/student/:studentId", async (ctx: any) => {
    try {
      requireAuth(ctx.userId, ctx.set);
      const enrollments = await enrollmentService.getByStudent(
        ctx.params.studentId,
      );
      return successResponse(enrollments);
    } catch (e: any) {
      ctx.set.status = 400;
      return errorResponse(e.message);
    }
  })

  .get("/section/:sectionId", async (ctx: any) => {
    try {
      requireAuth(ctx.userId, ctx.set);
      const enrollments = await enrollmentService.getBySection(
        ctx.params.sectionId,
      );
      return successResponse(enrollments);
    } catch (e: any) {
      ctx.set.status = 400;
      return errorResponse(e.message);
    }
  });
