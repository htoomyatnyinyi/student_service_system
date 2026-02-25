import { Elysia, t } from "elysia";
import { departmentService } from "./department.service";
import {
  authPlugin,
  requireAuth,
  requireRole,
} from "../../middleware/auth.middleware";
import { successResponse, errorResponse } from "../../utils/response";

export const departmentController = new Elysia({ prefix: "/departments" })
  .use(authPlugin)

  .get("/", async (ctx: any) => {
    try {
      requireAuth(ctx.userId, ctx.set);
      const departments = await departmentService.getAll();
      return successResponse(departments);
    } catch (e: any) {
      ctx.set.status = 400;
      return errorResponse(e.message);
    }
  })

  .get("/:id", async (ctx: any) => {
    try {
      requireAuth(ctx.userId, ctx.set);
      const dept = await departmentService.getById(ctx.params.id);
      return successResponse(dept);
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
        const dept = await departmentService.create(ctx.body);
        ctx.set.status = 201;
        return successResponse(dept, "Department created");
      } catch (e: any) {
        ctx.set.status = 400;
        return errorResponse(e.message);
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        code: t.String({ minLength: 1 }),
        headName: t.Optional(t.String()),
      }),
    },
  )

  .put(
    "/:id",
    async (ctx: any) => {
      try {
        requireAuth(ctx.userId, ctx.set);
        requireRole(ctx.userRole, ["ADMIN"], ctx.set);
        const dept = await departmentService.update(ctx.params.id, ctx.body);
        return successResponse(dept, "Department updated");
      } catch (e: any) {
        ctx.set.status = 400;
        return errorResponse(e.message);
      }
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        code: t.Optional(t.String()),
        headName: t.Optional(t.String()),
      }),
    },
  )

  .delete("/:id", async (ctx: any) => {
    try {
      requireAuth(ctx.userId, ctx.set);
      requireRole(ctx.userRole, ["ADMIN"], ctx.set);
      await departmentService.delete(ctx.params.id);
      return successResponse(null, "Department deleted");
    } catch (e: any) {
      ctx.set.status = 400;
      return errorResponse(e.message);
    }
  });
