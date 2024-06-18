import { faker } from "@faker-js/faker";
import { defineTaskFactory } from "../../generated/factories";
import { folderFactory, userFactory } from ".";
import { db } from "@minute/prisma/vitest/helpers";

export const taskFactory = defineTaskFactory(db)
  .props({
    id: () => faker.string.uuid(),
  })
  .vars({
    user: async () => await userFactory.create(),
    folder: async ({ user }) =>
      await folderFactory.vars({ user: () => user }).create(),
  });
