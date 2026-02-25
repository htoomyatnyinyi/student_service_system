import prisma from "../../prisma";

export const examService = {
  async scheduleExam(data: {
    sectionId: string;
    type: "MIDTERM" | "FINAL" | "QUIZ" | "ASSIGNMENT";
    date: string;
    duration?: number;
    location?: string;
  }) {
    return prisma.exam.create({
      data: { ...data, date: new Date(data.date) },
      include: { section: { include: { course: true } } },
    });
  },

  async getBySection(sectionId: string) {
    return prisma.exam.findMany({
      where: { sectionId },
      include: {
        section: { include: { course: true } },
        _count: { select: { results: true } },
      },
      orderBy: { date: "asc" },
    });
  },

  async recordResult(data: {
    examId: string;
    studentId: string;
    score: number;
    maxScore?: number;
    remarks?: string;
  }) {
    return prisma.examResult.create({
      data,
      include: {
        exam: { include: { section: { include: { course: true } } } },
        student: { include: { user: { select: { name: true } } } },
      },
    });
  },

  async recordBulkResults(
    examId: string,
    results: Array<{
      studentId: string;
      score: number;
      maxScore?: number;
      remarks?: string;
    }>,
  ) {
    const created = await Promise.all(
      results.map((result) =>
        prisma.examResult.create({
          data: { examId, ...result },
        }),
      ),
    );
    return created;
  },

  async getStudentResults(studentId: string) {
    return prisma.examResult.findMany({
      where: { studentId },
      include: {
        exam: { include: { section: { include: { course: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getExamResults(examId: string) {
    const results = await prisma.examResult.findMany({
      where: { examId },
      include: {
        student: { include: { user: { select: { name: true } } } },
      },
      orderBy: { score: "desc" },
    });

    const scores: number[] = results.map((r: { score: number }) => r.score);
    const avgScore =
      scores.length > 0
        ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length
        : 0;

    return {
      results,
      stats: {
        totalStudents: results.length,
        averageScore: Math.round(avgScore * 100) / 100,
        highestScore: scores.length > 0 ? Math.max(...scores) : 0,
        lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
      },
    };
  },
};
