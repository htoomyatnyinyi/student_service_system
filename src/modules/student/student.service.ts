import prisma from "../../prisma";
import { paginate, paginationMeta } from "../../utils/pagination";

export const studentService = {
  async getAll(
    page: number,
    limit: number,
    departmentId?: string,
    year?: number,
  ) {
    const { skip, take, page: p, limit: l } = paginate(page, limit);

    const where: any = {};
    if (departmentId) where.departmentId = departmentId;
    if (year) where.year = year;

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take,
        include: {
          user: { select: { email: true, name: true } },
          department: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.student.count({ where }),
    ]);

    return { students, meta: paginationMeta(total, p, l) };
  },

  async getById(id: string) {
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, name: true, role: true } },
        department: true,
        enrollments: {
          include: { section: { include: { course: true } }, grade: true },
        },
      },
    });
    if (!student) throw new Error("Student not found");
    return student;
  },

  async create(data: {
    userId: string;
    studentId: string;
    dateOfBirth?: string;
    gender?: "MALE" | "FEMALE" | "OTHER";
    address?: string;
    phone?: string;
    departmentId?: string;
    year?: number;
    semester?: number;
  }) {
    return prisma.student.create({
      data: {
        userId: data.userId,
        studentId: data.studentId,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        gender: data.gender,
        address: data.address,
        phone: data.phone,
        departmentId: data.departmentId,
        year: data.year,
        semester: data.semester,
      },
      include: {
        user: { select: { email: true, name: true } },
        department: true,
      },
    });
  },

  async update(id: string, data: any) {
    if (data.dateOfBirth) data.dateOfBirth = new Date(data.dateOfBirth);
    return prisma.student.update({
      where: { id },
      data,
      include: {
        user: { select: { email: true, name: true } },
        department: true,
      },
    });
  },

  async delete(id: string) {
    return prisma.student.delete({ where: { id } });
  },
};
