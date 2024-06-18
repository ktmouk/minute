import { factory } from "@factory-js/factory";
import { faker } from "@faker-js/faker";
import { defineChartFolderFactory } from "../../generated/factories";
import { chartFactory } from "./chart-factory";
import { folderFactory } from "./folder-factory";
import { userFactory } from "./user-factory";
import { db } from "@minute/prisma/vitest/helpers";

const { props, vars } = defineChartFolderFactory(db).def;

export const chartFolderFactory = factory
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
    async (props) => await db.chartFolder.create({ data: props }),
  )
  .props({
    chartId: async ({ vars }) => (await vars.chart).id,
    folderId: async ({ vars }) => (await vars.folder).id,
  })
  .vars({
    chart: async ({ user }) =>
      await chartFactory.vars({ user: () => user }).create(),
    folder: async ({ user }) =>
      await folderFactory.vars({ user: () => user }).create(),
  });
