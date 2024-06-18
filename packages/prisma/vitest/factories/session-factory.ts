import { faker } from "@faker-js/faker";
import { defineSessionFactory } from "../../generated/factories";
import { userFactory } from "./user-factory";
import { db } from "@minute/prisma/vitest/helpers";

export const sessionFactory = defineSessionFactory(db)
  .props({
    id: () => faker.string.uuid(),
    sessionToken: () => faker.string.alphanumeric(20),
  })
  .vars({
    user: async () => await userFactory.create(),
  });
