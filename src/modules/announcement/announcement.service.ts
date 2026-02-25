import prisma from "../../prisma";
import { paginate, paginationMeta } from "../../utils/pagination";

export const announcementService = {
  async getAll(page: number, limit: number, departmentId?: string) {
    const { skip, take, page: p, limit: l } = paginate(page, limit);

    const where: any = {};
    if (departmentId) {
      where.departmentId = departmentId;
    }

    const [announcements, total] = await Promise.all([
      prisma.announcement.findMany({
        where,
        skip,
        take,
        include: {
          author: { select: { name: true, role: true } },
          department: { select: { name: true, code: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.announcement.count({ where }),
    ]);

    return { announcements, meta: paginationMeta(total, p, l) };
  },

  async create(data: {
    title: string;
    content: string;
    authorId: string;
    departmentId?: string;
  }) {
    return prisma.announcement.create({
      data,
      include: {
        author: { select: { name: true, role: true } },
        department: { select: { name: true } },
      },
    });
  },

  async update(
    id: string,
    data: { title?: string; content?: string; departmentId?: string },
  ) {
    return prisma.announcement.update({
      where: { id },
      data,
      include: {
        author: { select: { name: true, role: true } },
        department: { select: { name: true } },
      },
    });
  },

  async delete(id: string) {
    return prisma.announcement.delete({ where: { id } });
  },
};
