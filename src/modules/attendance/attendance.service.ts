import prisma from "../../prisma";

export const attendanceService = {
  async mark(data: {
    studentId: string;
    sectionId: string;
    date: string;
    status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  }) {
    return prisma.attendance.upsert({
      where: {
        studentId_sectionId_date: {
          studentId: data.studentId,
          sectionId: data.sectionId,
          date: new Date(data.date),
        },
      },
      update: { status: data.status },
      create: {
        studentId: data.studentId,
        sectionId: data.sectionId,
        date: new Date(data.date),
        status: data.status,
      },
    });
  },

  async markBulk(
    sectionId: string,
    date: string,
    records: Array<{
      studentId: string;
      status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
    }>,
  ) {
    const results = await Promise.all(
      records.map((record) =>
        this.mark({
          studentId: record.studentId,
          sectionId,
          date,
          status: record.status,
        }),
      ),
    );
    return results;
  },

  async getBySection(sectionId: string, date?: string) {
    const where: any = { sectionId };
    if (date) where.date = new Date(date);

    return prisma.attendance.findMany({
      where,
      include: {
        student: { include: { user: { select: { name: true } } } },
      },
      orderBy: { date: "desc" },
    });
  },

  async getByStudent(studentId: string, sectionId?: string) {
    const where: any = { studentId };
    if (sectionId) where.sectionId = sectionId;

    const records = await prisma.attendance.findMany({
      where,
      include: {
        section: { include: { course: true } },
      },
      orderBy: { date: "desc" },
    });

    const total = records.length;
    const present = records.filter((r) => r.status === "PRESENT").length;
    const absent = records.filter((r) => r.status === "ABSENT").length;
    const late = records.filter((r) => r.status === "LATE").length;
    const excused = records.filter((r) => r.status === "EXCUSED").length;

    return {
      records,
      summary: {
        total,
        present,
        absent,
        late,
        excused,
        attendanceRate:
          total > 0 ? Math.round(((present + late) / total) * 100) : 0,
      },
    };
  },
};
