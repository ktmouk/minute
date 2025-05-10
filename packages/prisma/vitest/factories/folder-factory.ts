import { faker } from "@faker-js/faker";
import type { Folder } from "@prisma/client";
import { defineFolderFactory } from "../../generated/factories";
import { folderHierarchyFactory } from "./folder-hierarchy-factory";
import { userFactory } from "./user-factory";
import { db } from "@minute/prisma/vitest/helpers";

export const folderFactory = defineFolderFactory(db)
  .props({
    id: () => faker.string.uuid(),
    color: () => faker.color.rgb(),
  })
  .vars({
    user: async () => await userFactory.create(),
  })
  .traits({
    root: {
      vars: {
        parent: () => null,
      },
      after: async (folder, { user }) => {
        await folderHierarchyFactory
          .props({ depth: () => 1 })
          .vars({
            user: () => user,
            descendant: () => folder,
            ancestor: () => null,
          })
          .create();
        await folderHierarchyFactory.use((t) => t.self(folder)).create();
      },
    },
    withAncestor: (ancestor: Folder) => ({
      vars: {
        parent: () => ancestor,
      },
      after: async (folder, { user }) => {
        const hierarchies = await db.folderHierarchy.findMany({
          where: { userId: (await user).id, descendantId: ancestor.id },
          include: { ancestor: true },
        });
        await Promise.all(
          hierarchies.map(async ({ ancestor, depth }) => {
            await folderHierarchyFactory
              .props({ depth: () => depth + 1 })
              .vars({
                user: () => user,
                descendant: () => folder,
                ancestor: () => ancestor,
              })
              .create();
          }),
        );
        await folderHierarchyFactory.use((t) => t.self(folder)).create();
      },
    }),
  });
