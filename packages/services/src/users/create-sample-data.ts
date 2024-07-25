import "server-only";

import type { PrismaClient } from "@minute/prisma";
import { contract } from "@minute/utils";
import { z } from "zod";
import { createCategory } from "../categories/create-category";
import { createChart } from "../charts/create-chart";
import { createFolder } from "../folders/create-folder";

export const createSampleData = (db: PrismaClient) =>
  contract(
    {
      input: z.strictObject({
        userId: z.string().uuid(),
      }),
      output: z.promise(z.void()),
    },
    async (input) => {
      const user = await db.user.findFirst({
        where: {
          id: input.userId,
        },
      });
      if (user === null) {
        throw Error("The user does not exist.");
      }
      const workFolder = await createFolder(db)({
        userId: input.userId,
        color: "#9c3e00",
        name: "Work",
        emoji: "💼",
      });
      const gameFolder = await createFolder(db)({
        userId: input.userId,
        color: "#3b3936",
        name: "Game",
        emoji: "🎮",
      });
      const studyFolder = await createFolder(db)({
        userId: input.userId,
        color: "#f24405",
        name: "Study",
        emoji: "📖",
      });
      const hobbyFolder = await createFolder(db)({
        userId: input.userId,
        color: "#348888",
        name: "Hobby",
        emoji: "🎣",
      });
      const meaninglessCategory = await createCategory(db)({
        userId: input.userId,
        color: "#026773",
        name: "Meaningless",
        emoji: "💩",
        folderIds: [workFolder.id, gameFolder.id],
      });
      const meaningfulCategory = await createCategory(db)({
        userId: input.userId,
        color: "#f24405",
        name: "Meaningful",
        emoji: "😊",
        folderIds: [studyFolder.id, hobbyFolder.id],
      });
      await createChart(db)({
        userId: input.userId,
        name: "Meaningful vs Meaningless",
        folderIds: [],
        categoryIds: [meaninglessCategory.id, meaningfulCategory.id],
      });
    },
  );
