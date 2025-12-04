import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env["POSTGRES_PRISMA_URL"],
});

export const db = new PrismaClient({ adapter });
