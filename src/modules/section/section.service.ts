import prisma from "../../prisma";
import { paginate, paginationMeta } from "../../utils/pagination";

export const sectionService = {
  async getAll(
    page: number,
    limit: number,
    courseId?: string,
    semester?: number,
    year?: number,
  ) {
    const { skip, take, page: p, limit: l } = paginate(page, limit);

    const where: any = {};
    if (courseId) where.courseId = courseId;
    if (semester) where.semester = semester;
    if (year) where.year = year;

    const [sections, total] = await Promise.all([
      prisma.section.findMany({
        where,
        skip,
        take,
        include: {
          course: true,
          teacher: { select: { id: true, name: true, email: true } },
          _count: { select: { enrollments: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.section.count({ where }),
    ]);

    return { sections, meta: paginationMeta(total, p, l) };
  },

  async getById(id: string) {
    const section = await prisma.section.findUnique({
      where: { id },
      include: {
        course: true,
        teacher: { select: { id: true, name: true, email: true } },
        enrollments: {
          include: {
            student: { include: { user: { select: { name: true } } } },
          },
        },
        _count: { select: { enrollments: true } },
      },
    });
    if (!section) throw new Error("Section not found");
    return section;
  },

  async create(data: {
    courseId: string;
    teacherId?: string;
    semester: number;
    year: number;
    room?: string;
    schedule?: string;
    capacity?: number;
  }) {
    return prisma.section.create({
      data,
      include: { course: true, teacher: { select: { name: true } } },
    });
  },

  async update(id: string, data: any) {
    return prisma.section.update({
      where: { id },
      data,
      include: { course: true, teacher: { select: { name: true } } },
    });
  },

  async delete(id: string) {
    return prisma.section.delete({ where: { id } });
  },
};
