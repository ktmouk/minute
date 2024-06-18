"use client";

import {
  type ChartCategory,
  type Chart,
  type ChartFolder,
} from "@minute/schemas";
import { useState } from "react";
import { trpc } from "../../../_components/TrpcProvider";
import { ChartHeader } from "../_components/ChartHeader";
import { LineChartContainer } from "../_components/LineChartContainer";
import { ChartModal } from "./ChartModal";
import { NewChartButton } from "./NewChartButton";

type Props = {
  startDate: Date;
  endDate: Date;
  datePart: "day" | "month";
};

export const ChartList = ({ startDate, endDate, datePart }: Props) => {
  const [isNewChartModalOpen, setIsNewChartModalOpen] = useState(false);

  const [editingChart, setEditingChart] = useState<
    | (Chart & {
        chartFolders: ChartFolder[];
        chartCategories: ChartCategory[];
      })
    | undefined
  >(undefined);

  const charts = trpc.charts.getCharts.useQuery();

  return (
    <>
      <div className="flex flex-col gap-6 mb-4">
        {(charts.data ?? []).map((chart) => (
          <section
            key={chart.id}
            className="border border-gray-300 rounded p-2"
          >
            <ChartHeader
              name={chart.name}
              onEditClick={() => {
                setEditingChart(chart);
              }}
            />
            <div className="h-64 mt-1 text-sm">
              <LineChartContainer
                startDate={startDate}
                endDate={endDate}
                chartId={chart.id}
                datePart={datePart}
              />
            </div>
          </section>
        ))}
      </div>
      <NewChartButton
        onClick={() => {
          setIsNewChartModalOpen(true);
        }}
      />
      {editingChart !== undefined && (
        <ChartModal
          onClose={() => {
            setEditingChart(undefined);
          }}
          id={editingChart.id}
          name={editingChart.name}
          folderIds={editingChart.chartFolders.map(({ folderId }) => folderId)}
          categoryIds={editingChart.chartCategories.map(
            ({ categoryId }) => categoryId,
          )}
        />
      )}
      {isNewChartModalOpen && (
        <ChartModal
          onClose={() => {
            setIsNewChartModalOpen(false);
          }}
        />
      )}
    </>
  );
};
