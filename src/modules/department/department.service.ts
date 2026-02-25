import prisma from "../../prisma";

export const departmentService = {
  async getAll() {
    return prisma.department.findMany({
      include: { _count: { select: { students: true, courses: true } } },
      orderBy: { name: "asc" },
    });
  },

  async getById(id: string) {
    const dept = await prisma.department.findUnique({
      where: { id },
      include: {
        students: {
          include: { user: { select: { name: true, email: true } } },
        },
        courses: true,
        _count: { select: { students: true, courses: true } },
      },
    });
    if (!dept) throw new Error("Department not found");
    return dept;
  },

  async create(data: { name: string; code: string; headName?: string }) {
    return prisma.department.create({ data });
  },

  async update(
    id: string,
    data: { name?: string; code?: string; headName?: string },
  ) {
    return prisma.department.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.department.delete({ where: { id } });
  },
};
