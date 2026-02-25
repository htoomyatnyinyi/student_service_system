import { Elysia, t } from "elysia";
import { studentService } from "./student.service";
import {
  authPlugin,
  requireAuth,
  requireRole,
} from "../../middleware/auth.middleware";
import { successResponse, errorResponse } from "../../utils/response";

export const studentController = new Elysia({ prefix: "/students" })
  .use(authPlugin)

  // List all students
  .get(
    "/",
    async (ctx: any) => {
      try {
        requireAuth(ctx.userId, ctx.set);
        const result = await studentService.getAll(
          Number(ctx.query.page) || 1,
          Number(ctx.query.limit) || 10,
          ctx.query.departmentId,
          ctx.query.year ? Number(ctx.query.year) : undefined,
        );
        return successResponse(
          result.students,
          "Students retrieved",
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
        year: t.Optional(t.String()),
      }),
    },
  )

  // Get student by ID
  .get("/:id", async (ctx: any) => {
    try {
      requireAuth(ctx.userId, ctx.set);
      const student = await studentService.getById(ctx.params.id);
      return successResponse(student);
    } catch (e: any) {
      ctx.set.status = 404;
      return errorResponse(e.message, 404);
    }
  })

  // Create student profile
  .post(
    "/",
    async (ctx: any) => {
      try {
        requireAuth(ctx.userId, ctx.set);
        requireRole(ctx.userRole, ["ADMIN"], ctx.set);
        const student = await studentService.create(ctx.body);
        ctx.set.status = 201;
        return successResponse(student, "Student created");
      } catch (e: any) {
        ctx.set.status = 400;
        return errorResponse(e.message);
      }
    },
    {
      body: t.Object({
        userId: t.String(),
        studentId: t.String(),
        dateOfBirth: t.Optional(t.String()),
        gender: t.Optional(
          t.Union([t.Literal("MALE"), t.Literal("FEMALE"), t.Literal("OTHER")]),
        ),
        address: t.Optional(t.String()),
        phone: t.Optional(t.String()),
        departmentId: t.Optional(t.String()),
        year: t.Optional(t.Number()),
        semester: t.Optional(t.Number()),
      }),
    },
  )

  // Update student
  .put(
    "/:id",
    async (ctx: any) => {
      try {
        requireAuth(ctx.userId, ctx.set);
        requireRole(ctx.userRole, ["ADMIN"], ctx.set);
        const student = await studentService.update(ctx.params.id, ctx.body);
        return successResponse(student, "Student updated");
      } catch (e: any) {
        ctx.set.status = 400;
        return errorResponse(e.message);
      }
    },
    {
      body: t.Object({
        dateOfBirth: t.Optional(t.String()),
        gender: t.Optional(
          t.Union([t.Literal("MALE"), t.Literal("FEMALE"), t.Literal("OTHER")]),
        ),
        address: t.Optional(t.String()),
        phone: t.Optional(t.String()),
        departmentId: t.Optional(t.String()),
        year: t.Optional(t.Number()),
        semester: t.Optional(t.Number()),
      }),
    },
  )

  // Delete student
  .delete("/:id", async (ctx: any) => {
    try {
      requireAuth(ctx.userId, ctx.set);
      requireRole(ctx.userRole, ["ADMIN"], ctx.set);
      await studentService.delete(ctx.params.id);
      return successResponse(null, "Student deleted");
    } catch (e: any) {
      ctx.set.status = 400;
      return errorResponse(e.message);
    }
  });
