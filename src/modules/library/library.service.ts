import prisma from "../../prisma";
import { paginate, paginationMeta } from "../../utils/pagination";

export const libraryService = {
  async searchBooks(
    page: number,
    limit: number,
    search?: string,
    category?: string,
  ) {
    const { skip, take, page: p, limit: l } = paginate(page, limit);

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { author: { contains: search, mode: "insensitive" } },
        { isbn: { contains: search, mode: "insensitive" } },
      ];
    }
    if (category) where.category = category;

    const [books, total] = await Promise.all([
      prisma.book.findMany({ where, skip, take, orderBy: { title: "asc" } }),
      prisma.book.count({ where }),
    ]);

    return { books, meta: paginationMeta(total, p, l) };
  },

  async addBook(data: {
    title: string;
    author: string;
    isbn?: string;
    category?: string;
    totalCopies?: number;
  }) {
    return prisma.book.create({
      data: {
        ...data,
        availableCopies: data.totalCopies || 1,
      },
    });
  },

  async borrowBook(bookId: string, studentId: string, dueDate: string) {
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) throw new Error("Book not found");
    if (book.availableCopies <= 0) throw new Error("No copies available");

    const [borrow] = await prisma.$transaction([
      prisma.bookBorrow.create({
        data: {
          bookId,
          studentId,
          dueDate: new Date(dueDate),
        },
        include: {
          book: true,
          student: { include: { user: { select: { name: true } } } },
        },
      }),
      prisma.book.update({
        where: { id: bookId },
        data: { availableCopies: { decrement: 1 } },
      }),
    ]);

    return borrow;
  },

  async returnBook(borrowId: string) {
    const borrow = await prisma.bookBorrow.findUnique({
      where: { id: borrowId },
    });
    if (!borrow) throw new Error("Borrow record not found");
    if (borrow.returnedAt) throw new Error("Book already returned");

    const [updated] = await prisma.$transaction([
      prisma.bookBorrow.update({
        where: { id: borrowId },
        data: { returnedAt: new Date() },
        include: { book: true },
      }),
      prisma.book.update({
        where: { id: borrow.bookId },
        data: { availableCopies: { increment: 1 } },
      }),
    ]);

    return updated;
  },

  async getStudentBorrows(studentId: string) {
    return prisma.bookBorrow.findMany({
      where: { studentId },
      include: { book: true },
      orderBy: { borrowedAt: "desc" },
    });
  },
};
