import prisma from "../../prisma";

export const gradeService = {
  async create(data: {
    enrollmentId: string;
    grade?: string;
    gpa?: number;
    remarks?: string;
  }) {
    const existing = await prisma.grade.findUnique({
      where: { enrollmentId: data.enrollmentId },
    });
    if (existing) throw new Error("Grade already exists for this enrollment");

    return prisma.grade.create({
      data,
      include: {
        enrollment: {
          include: {
            student: { include: { user: { select: { name: true } } } },
            section: { include: { course: true } },
          },
        },
      },
    });
  },

  async update(
    id: string,
    data: { grade?: string; gpa?: number; remarks?: string },
  ) {
    return prisma.grade.update({
      where: { id },
      data,
      include: {
        enrollment: {
          include: {
            student: { include: { user: { select: { name: true } } } },
            section: { include: { course: true } },
          },
        },
      },
    });
  },

  async getByStudent(studentId: string) {
    const grades = await prisma.grade.findMany({
      where: { enrollment: { studentId } },
      include: {
        enrollment: {
          include: { section: { include: { course: true } } },
        },
      },
    });

    const totalGpa =
      grades.length > 0
        ? grades.reduce((sum, g) => sum + (g.gpa || 0), 0) / grades.length
        : 0;

    return { grades, cumulativeGpa: Math.round(totalGpa * 100) / 100 };
  },
};
