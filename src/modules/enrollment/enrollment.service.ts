import prisma from "../../prisma";

export const enrollmentService = {
  async enroll(studentId: string, sectionId: string) {
    // Check section capacity
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: { _count: { select: { enrollments: true } } },
    });
    if (!section) throw new Error("Section not found");
    if (section._count.enrollments >= section.capacity) {
      throw new Error("Section is full");
    }

    // Check if already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: { studentId_sectionId: { studentId, sectionId } },
    });
    if (existing) throw new Error("Already enrolled in this section");

    return prisma.enrollment.create({
      data: { studentId, sectionId },
      include: {
        section: { include: { course: true } },
        student: { include: { user: { select: { name: true } } } },
      },
    });
  },

  async drop(id: string) {
    return prisma.enrollment.update({
      where: { id },
      data: { status: "DROPPED" },
    });
  },

  async getByStudent(studentId: string) {
    return prisma.enrollment.findMany({
      where: { studentId },
      include: {
        section: {
          include: { course: true, teacher: { select: { name: true } } },
        },
        grade: true,
      },
      orderBy: { enrolledAt: "desc" },
    });
  },

  async getBySection(sectionId: string) {
    return prisma.enrollment.findMany({
      where: { sectionId },
      include: {
        student: { include: { user: { select: { name: true, email: true } } } },
        grade: true,
      },
    });
  },
};
