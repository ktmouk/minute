import { factory } from "@factory-js/factory";
import { faker } from "@faker-js/faker";
import { defineCategoryFolderFactory } from "../../generated/factories";
import { categoryFactory } from "./category-factory";
import { folderFactory } from "./folder-factory";
import { userFactory } from "./user-factory";
import { db } from "@minute/prisma/vitest/helpers";

const { props, vars } = defineCategoryFolderFactory(db).def;

export const categoryFolderFactory = factory
  .define(
    {
      props: {
        ...props,
        id: () => faker.string.uuid(),
      },
      vars: {
        ...vars,
        user: async () => await userFactory.create(),
      },
    },
    async (props) => await db.categoryFolder.create({ data: props }),
  )
  .props({
    categoryId: async ({ vars }) => (await vars.category).id,
    folderId: async ({ vars }) => (await vars.folder).id,
  })
  .vars({
    category: async ({ user }) =>
      await categoryFactory.vars({ user: () => user }).create(),
    folder: async ({ user }) =>
      await folderFactory.vars({ user: () => user }).create(),
  });
