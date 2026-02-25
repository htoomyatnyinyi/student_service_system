import prisma from "../../prisma";
import { paginate, paginationMeta } from "../../utils/pagination";

export const courseService = {
  async getAll(page: number, limit: number, departmentId?: string) {
    const { skip, take, page: p, limit: l } = paginate(page, limit);

    const where: any = {};
    if (departmentId) where.departmentId = departmentId;

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take,
        include: {
          department: true,
          prerequisites: { include: { prerequisiteCourse: true } },
          _count: { select: { sections: true } },
        },
        orderBy: { code: "asc" },
      }),
      prisma.course.count({ where }),
    ]);

    return { courses, meta: paginationMeta(total, p, l) };
  },

  async getById(id: string) {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        department: true,
        prerequisites: { include: { prerequisiteCourse: true } },
        sections: { include: { teacher: { select: { name: true } } } },
      },
    });
    if (!course) throw new Error("Course not found");
    return course;
  },

  async create(data: {
    name: string;
    code: string;
    credits?: number;
    description?: string;
    departmentId: string;
    prerequisiteIds?: string[];
  }) {
    const { prerequisiteIds, ...courseData } = data;

    const course = await prisma.course.create({
      data: {
        ...courseData,
        ...(prerequisiteIds && {
          prerequisites: {
            create: prerequisiteIds.map((id) => ({
              prerequisiteCourseId: id,
            })),
          },
        }),
      },
      include: {
        department: true,
        prerequisites: { include: { prerequisiteCourse: true } },
      },
    });

    return course;
  },

  async update(
    id: string,
    data: {
      name?: string;
      code?: string;
      credits?: number;
      description?: string;
      departmentId?: string;
    },
  ) {
    return prisma.course.update({
      where: { id },
      data,
      include: { department: true },
    });
  },

  async delete(id: string) {
    return prisma.course.delete({ where: { id } });
  },
};
