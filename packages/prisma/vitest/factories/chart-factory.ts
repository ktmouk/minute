import { faker } from "@faker-js/faker";
import { defineChartFactory } from "../../generated/factories";
import { userFactory } from "./user-factory";
import { db } from "@minute/prisma/vitest/helpers";

export const chartFactory = defineChartFactory(db)
  .props({
    id: () => faker.string.uuid(),
  })
  .vars({
    user: async () => await userFactory.create(),
  });
