import { faker } from "@faker-js/faker";
import { defineFolderHierarchyFactory } from "../../generated/factories";
import type { Folder } from "../../generated/prisma/client";
import { folderFactory } from "./folder-factory";
import { userFactory } from "./user-factory";
import { db } from "@minute/prisma/vitest/helpers";

export const folderHierarchyFactory = defineFolderHierarchyFactory(db)
  .props({
    id: () => faker.string.uuid(),
  })
  .vars({
    user: async () => await userFactory.create(),
    ancestor: async ({ user }) =>
      await folderFactory.vars({ user: () => user }).create(),
    descendant: async ({ user }) =>
      await folderFactory.vars({ user: () => user }).create(),
  })
  .traits({
    self: (folder: Folder) => ({
      props: {
        depth: () => 0,
        userId: () => folder.userId,
      },
      vars: {
        descendant: () => folder,
        ancestor: () => folder,
      },
    }),
  });
