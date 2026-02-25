import { Elysia, t } from "elysia";
import { feeService } from "./fee.service";
import {
  authPlugin,
  requireAuth,
  requireRole,
} from "../../middleware/auth.middleware";
import { successResponse, errorResponse } from "../../utils/response";

export const feeController = new Elysia({ prefix: "/fees" })
  .use(authPlugin)

  .post(
    "/",
    async (ctx: any) => {
      try {
        requireAuth(ctx.userId, ctx.set);
        requireRole(ctx.userRole, ["ADMIN"], ctx.set);
        const fee = await feeService.create(ctx.body);
        ctx.set.status = 201;
        return successResponse(fee, "Fee created");
      } catch (e: any) {
        ctx.set.status = 400;
        return errorResponse(e.message);
      }
    },
    {
      body: t.Object({
        studentId: t.String(),
        type: t.String(),
        amount: t.Number(),
        dueDate: t.String(),
        semester: t.Number(),
        year: t.Number(),
      }),
    },
  )

  .get("/student/:studentId", async (ctx: any) => {
    try {
      requireAuth(ctx.userId, ctx.set);
      const fees = await feeService.getByStudent(ctx.params.studentId);
      return successResponse(fees);
    } catch (e: any) {
      ctx.set.status = 400;
      return errorResponse(e.message);
    }
  })

  .post(
    "/payments",
    async (ctx: any) => {
      try {
        requireAuth(ctx.userId, ctx.set);
        requireRole(ctx.userRole, ["ADMIN"], ctx.set);
        const payment = await feeService.recordPayment(ctx.body);
        ctx.set.status = 201;
        return successResponse(payment, "Payment recorded");
      } catch (e: any) {
        ctx.set.status = 400;
        return errorResponse(e.message);
      }
    },
    {
      body: t.Object({
        feeId: t.String(),
        amount: t.Number(),
        method: t.Optional(
          t.Union([
            t.Literal("CASH"),
            t.Literal("BANK_TRANSFER"),
            t.Literal("CARD"),
            t.Literal("MOBILE_PAYMENT"),
          ]),
        ),
      }),
    },
  )

  .get("/payments/:feeId", async (ctx: any) => {
    try {
      requireAuth(ctx.userId, ctx.set);
      const payments = await feeService.getPaymentsByFee(ctx.params.feeId);
      return successResponse(payments);
    } catch (e: any) {
      ctx.set.status = 400;
      return errorResponse(e.message);
    }
  });
