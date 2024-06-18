import { faker } from "@faker-js/faker";
import { defineUserFactory } from "../../generated/factories";
import { db } from "@minute/prisma/vitest/helpers";

export const userFactory = defineUserFactory(db).props({
  id: () => faker.string.uuid(),
  email: () => `${faker.string.uuid()}@example.com`,
});
