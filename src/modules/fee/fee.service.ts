import prisma from "../../prisma";

export const feeService = {
  async create(data: {
    studentId: string;
    type: string;
    amount: number;
    dueDate: string;
    semester: number;
    year: number;
  }) {
    return prisma.fee.create({
      data: { ...data, dueDate: new Date(data.dueDate) },
      include: { student: { include: { user: { select: { name: true } } } } },
    });
  },

  async getByStudent(studentId: string) {
    const fees = await prisma.fee.findMany({
      where: { studentId },
      include: {
        payments: true,
      },
      orderBy: { dueDate: "desc" },
    });

    return fees.map((fee: any) => {
      const totalPaid = fee.payments.reduce(
        (sum: number, p: { amount: number }) => sum + p.amount,
        0,
      );
      return {
        ...fee,
        totalPaid,
        remaining: fee.amount - totalPaid,
        isPaid: totalPaid >= fee.amount,
      };
    });
  },

  async recordPayment(data: {
    feeId: string;
    amount: number;
    method?: "CASH" | "BANK_TRANSFER" | "CARD" | "MOBILE_PAYMENT";
  }) {
    const fee = await prisma.fee.findUnique({
      where: { id: data.feeId },
      include: { payments: true },
    });
    if (!fee) throw new Error("Fee not found");

    const totalPaid = fee.payments.reduce(
      (sum: number, p: { amount: number }) => sum + p.amount,
      0,
    );
    if (totalPaid + data.amount > fee.amount) {
      throw new Error("Payment amount exceeds remaining balance");
    }

    return prisma.payment.create({
      data: {
        feeId: data.feeId,
        amount: data.amount,
        method: data.method || "CASH",
      },
      include: { fee: true },
    });
  },

  async getPaymentsByFee(feeId: string) {
    return prisma.payment.findMany({
      where: { feeId },
      orderBy: { paidAt: "desc" },
    });
  },
};
