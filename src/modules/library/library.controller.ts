import { Elysia, t } from "elysia";
import { libraryService } from "./library.service";
import {
  authPlugin,
  requireAuth,
  requireRole,
} from "../../middleware/auth.middleware";
import { successResponse, errorResponse } from "../../utils/response";

export const libraryController = new Elysia({ prefix: "/library" })
  .use(authPlugin)

  // Search books
  .get(
    "/books",
    async (ctx: any) => {
      try {
        requireAuth(ctx.userId, ctx.set);
        const result = await libraryService.searchBooks(
          Number(ctx.query.page) || 1,
          Number(ctx.query.limit) || 10,
          ctx.query.search,
          ctx.query.category,
        );
        return successResponse(result.books, "Books retrieved", result.meta);
      } catch (e: any) {
        ctx.set.status = 400;
        return errorResponse(e.message);
      }
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        search: t.Optional(t.String()),
        category: t.Optional(t.String()),
      }),
    },
  )

  // Add book
  .post(
    "/books",
    async (ctx: any) => {
      try {
        requireAuth(ctx.userId, ctx.set);
        requireRole(ctx.userRole, ["ADMIN"], ctx.set);
        const book = await libraryService.addBook(ctx.body);
        ctx.set.status = 201;
        return successResponse(book, "Book added");
      } catch (e: any) {
        ctx.set.status = 400;
        return errorResponse(e.message);
      }
    },
    {
      body: t.Object({
        title: t.String({ minLength: 1 }),
        author: t.String({ minLength: 1 }),
        isbn: t.Optional(t.String()),
        category: t.Optional(t.String()),
        totalCopies: t.Optional(t.Number()),
      }),
    },
  )

  // Borrow book
  .post(
    "/borrow",
    async (ctx: any) => {
      try {
        requireAuth(ctx.userId, ctx.set);
        const borrow = await libraryService.borrowBook(
          ctx.body.bookId,
          ctx.body.studentId,
          ctx.body.dueDate,
        );
        ctx.set.status = 201;
        return successResponse(borrow, "Book borrowed");
      } catch (e: any) {
        ctx.set.status = 400;
        return errorResponse(e.message);
      }
    },
    {
      body: t.Object({
        bookId: t.String(),
        studentId: t.String(),
        dueDate: t.String(),
      }),
    },
  )

  // Return book
  .put("/return/:id", async (ctx: any) => {
    try {
      requireAuth(ctx.userId, ctx.set);
      const result = await libraryService.returnBook(ctx.params.id);
      return successResponse(result, "Book returned");
    } catch (e: any) {
      ctx.set.status = 400;
      return errorResponse(e.message);
    }
  })

  // Student borrow history
  .get("/borrows/student/:studentId", async (ctx: any) => {
    try {
      requireAuth(ctx.userId, ctx.set);
      const borrows = await libraryService.getStudentBorrows(
        ctx.params.studentId,
      );
      return successResponse(borrows);
    } catch (e: any) {
      ctx.set.status = 400;
      return errorResponse(e.message);
    }
  });
