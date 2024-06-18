import { faker } from "@faker-js/faker";
import { defineCategoryFactory } from "../../generated/factories";
import { userFactory } from "./user-factory";
import { db } from "@minute/prisma/vitest/helpers";

export const categoryFactory = defineCategoryFactory(db)
  .props({
    id: () => faker.string.uuid(),
    color: () => faker.internet.color(),
  })
  .vars({
    user: async () => await userFactory.create(),
  });
