import { faker } from "@faker-js/faker";
import { defineRunningTimeEntryFactory } from "../../generated/factories";
import { folderFactory } from "./folder-factory";
import { userFactory } from "./user-factory";
import { db } from "@minute/prisma/vitest/helpers";

export const runningTimeEntryFactory = defineRunningTimeEntryFactory(db)
  .props({
    id: () => faker.string.uuid(),
  })
  .vars({
    folder: async ({ user }) =>
      await folderFactory.vars({ user: () => user }).create(),
    user: async () => await userFactory.create(),
  });
