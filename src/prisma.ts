import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

// 1. Create the pg Pool instance
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 2. Wrap it in the Prisma adapter
const adapter = new PrismaPg(pool);

// 3. Initialize Prisma with the adapter
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;

// // postgresql
// // import { PrismaClient } from "@/prisma/generated/prisma/client";
// import { PrismaClient } from "./generated/prisma/client";
// import { PrismaPg } from "@prisma/adapter-pg";

// const globalForPrisma = global as unknown as {
//   prisma: PrismaClient;
// };

// const adapter = new PrismaPg({
//   connectionString: process.env.DATABASE_URL,
// });

// const prisma =
//   globalForPrisma.prisma ||
//   new PrismaClient({
//     adapter,
//   });

// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// export default prisma;

// // for mysql
// // import { PrismaClient } from "@prisma/client";
// // import { PrismaClient } from "@/prisma/generated/prisma/client";

// // // const globalForPrisma = global as unknown as { prisma: PrismaClient };

// // const prisma = new PrismaClient({});

// // export default prisma;

// // ####

// // import { PrismaClient } from "./generated/prisma/client";

// // // @ts-ignore - Prisma v7 reads datasource URL from prisma.config.ts
// // const prisma = new PrismaClient();

// // export default prisma;

// // // // import { PrismaClient } from "@prisma/client";
// // // import { PrismaClient } from "./generated/prisma/client";

// // // const prismaClientSingleton = () => {
// // //   return new PrismaClient();
// // // };

// // // declare global {
// // //   var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
// // // }

// // // const prisma = globalThis.prisma ?? prismaClientSingleton();

// // // export default prisma;

// // // if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
