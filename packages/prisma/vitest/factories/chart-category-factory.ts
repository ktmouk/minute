import { factory } from "@factory-js/factory";
import { faker } from "@faker-js/faker";
import { defineChartCategoryFactory } from "../../generated/factories";
import { categoryFactory } from "./category-factory";
import { chartFactory } from "./chart-factory";
import { userFactory } from "./user-factory";
import { db } from "@minute/prisma/vitest/helpers";

const { props, vars } = defineChartCategoryFactory(db).def;

export const chartCategoryFactory = factory
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
    async (props) => await db.chartCategory.create({ data: props }),
  )
  .props({
    chartId: async ({ vars }) => (await vars.chart).id,
    categoryId: async ({ vars }) => (await vars.category).id,
  })
  .vars({
    chart: async ({ user }) =>
      await chartFactory.vars({ user: () => user }).create(),
    category: async ({ user }) =>
      await categoryFactory.vars({ user: () => user }).create(),
  });
