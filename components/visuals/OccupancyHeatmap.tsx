"use client";

import ReactECharts from "echarts-for-react";

type OccupancyHeatmapProps = {
  courts: string[];
  hours: number[];
  matrix: number[][];
  title?: string;
};

export default function OccupancyHeatmap({
  courts,
  hours,
  matrix,
  title = "Court Occupancy Heatmap",
}: OccupancyHeatmapProps) {
  if (!courts || !hours || !matrix || courts.length === 0 || hours.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-neutral-400 mb-2">🏸</div>
        <p className="text-neutral-500 text-sm">No occupancy data available for this period</p>
      </div>
    );
  }

  // Prepare data for ECharts heatmap
  const data = matrix.flatMap((courtRow, courtIndex) =>
    courtRow.map((value, hourIndex) => [hourIndex, courtIndex, value])
  );

  const option = {
    title: {
      text: title,
      left: "center",
      textStyle: {
        fontSize: 16,
        fontWeight: "normal",
      },
    },
    tooltip: {
      position: "top",
      formatter: (params: any) => {
        const [hourIndex, courtIndex] = params.data;
        const hour = hours[hourIndex];
        const court = courts[courtIndex];
        const value = params.data[2];
        return `${court}<br/>${hour}:00 - ${hour + 1}:00<br/>Occupancy: ${value.toFixed(1)}%`;
      },
    },
    grid: {
      height: "50%",
      top: "10%",
    },
    xAxis: {
      type: "category",
      data: hours.map((h) => `${h}:00`),
      splitArea: {
        show: true,
      },
    },
    yAxis: {
      type: "category",
      data: courts,
      splitArea: {
        show: true,
      },
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: "5%",
      inRange: {
        color: ["#e0f2fe", "#0ea5e9", "#0284c7", "#0369a1"],
      },
      text: ["High", "Low"],
    },
    series: [
      {
        name: "Occupancy",
        type: "heatmap",
        data: data,
        label: {
          show: true,
          formatter: (params: any) => {
            const value = params.data[2];
            return value > 0 ? `${value.toFixed(0)}%` : "";
          },
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };

  return (
    <div className="p-6">
      <ReactECharts option={option} style={{ height: "500px", width: "100%" }} />
    </div>
  );
}







