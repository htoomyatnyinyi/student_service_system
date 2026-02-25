import { Elysia, t } from "elysia";
import { examService } from "./exam.service";
import {
  authPlugin,
  requireAuth,
  requireRole,
} from "../../middleware/auth.middleware";
import { successResponse, errorResponse } from "../../utils/response";

export const examController = new Elysia({ prefix: "/exams" })
  .use(authPlugin)

  // Schedule exam
  .post(
    "/",
    async (ctx: any) => {
      try {
        requireAuth(ctx.userId, ctx.set);
        requireRole(ctx.userRole, ["ADMIN", "TEACHER"], ctx.set);
        const exam = await examService.scheduleExam(ctx.body);
        ctx.set.status = 201;
        return successResponse(exam, "Exam scheduled");
      } catch (e: any) {
        ctx.set.status = 400;
        return errorResponse(e.message);
      }
    },
    {
      body: t.Object({
        sectionId: t.String(),
        type: t.Union([
          t.Literal("MIDTERM"),
          t.Literal("FINAL"),
          t.Literal("QUIZ"),
          t.Literal("ASSIGNMENT"),
        ]),
        date: t.String(),
        duration: t.Optional(t.Number()),
        location: t.Optional(t.String()),
      }),
    },
  )

  // Get exams by section
  .get("/section/:sectionId", async (ctx: any) => {
    try {
      requireAuth(ctx.userId, ctx.set);
      const exams = await examService.getBySection(ctx.params.sectionId);
      return successResponse(exams);
    } catch (e: any) {
      ctx.set.status = 400;
      return errorResponse(e.message);
    }
  })

  // Record single result
  .post(
    "/results",
    async (ctx: any) => {
      try {
        requireAuth(ctx.userId, ctx.set);
        requireRole(ctx.userRole, ["ADMIN", "TEACHER"], ctx.set);
        const result = await examService.recordResult(ctx.body);
        ctx.set.status = 201;
        return successResponse(result, "Result recorded");
      } catch (e: any) {
        ctx.set.status = 400;
        return errorResponse(e.message);
      }
    },
    {
      body: t.Object({
        examId: t.String(),
        studentId: t.String(),
        score: t.Number(),
        maxScore: t.Optional(t.Number()),
        remarks: t.Optional(t.String()),
      }),
    },
  )

  // Record bulk results
  .post(
    "/results/bulk",
    async (ctx: any) => {
      try {
        requireAuth(ctx.userId, ctx.set);
        requireRole(ctx.userRole, ["ADMIN", "TEACHER"], ctx.set);
        const results = await examService.recordBulkResults(
          ctx.body.examId,
          ctx.body.results,
        );
        ctx.set.status = 201;
        return successResponse(results, "Bulk results recorded");
      } catch (e: any) {
        ctx.set.status = 400;
        return errorResponse(e.message);
      }
    },
    {
      body: t.Object({
        examId: t.String(),
        results: t.Array(
          t.Object({
            studentId: t.String(),
            score: t.Number(),
            maxScore: t.Optional(t.Number()),
            remarks: t.Optional(t.String()),
          }),
        ),
      }),
    },
  )

  // Get student results
  .get("/results/student/:studentId", async (ctx: any) => {
    try {
      requireAuth(ctx.userId, ctx.set);
      const results = await examService.getStudentResults(ctx.params.studentId);
      return successResponse(results);
    } catch (e: any) {
      ctx.set.status = 400;
      return errorResponse(e.message);
    }
  })

  // Get exam results with stats
  .get("/results/:examId", async (ctx: any) => {
    try {
      requireAuth(ctx.userId, ctx.set);
      const result = await examService.getExamResults(ctx.params.examId);
      return successResponse(result);
    } catch (e: any) {
      ctx.set.status = 400;
      return errorResponse(e.message);
    }
  });
