"use client";

import ReactECharts from "echarts-for-react";

type RevenueChartProps = {
  points: Array<{ date: string; value: number }>;
  title?: string;
};

export default function RevenueChart({ points, title = "Revenue Over Time" }: RevenueChartProps) {
  if (!points || points.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-neutral-400 mb-2">📊</div>
        <p className="text-neutral-500 text-sm">No revenue data available for this period</p>
      </div>
    );
  }

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
      trigger: "axis",
      formatter: (params: any) => {
        const param = params[0];
        const value = param.value as number;
        if (value >= 1000000) {
          return `${param.name}<br/>${param.seriesName}: ${(value / 1000000).toFixed(2)}M IDR`;
        }
        if (value >= 1000) {
          return `${param.name}<br/>${param.seriesName}: ${(value / 1000).toFixed(1)}K IDR`;
        }
        return `${param.name}<br/>${param.seriesName}: ${value.toLocaleString("id-ID")} IDR`;
      },
    },
    xAxis: {
      type: "category",
      data: points.map((p) => {
        const date = new Date(p.date);
        return date.toLocaleDateString("id-ID", { month: "short", day: "numeric" });
      }),
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: (value: number) => {
          if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
          if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
          return value.toString();
        },
      },
    },
    series: [
      {
        name: "Revenue",
        type: "line",
        data: points.map((p) => p.value),
        smooth: true,
        areaStyle: {
          opacity: 0.3,
        },
        lineStyle: {
          color: "#3b82f6",
        },
        itemStyle: {
          color: "#3b82f6",
        },
      },
    ],
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
  };

  return (
    <div className="p-6">
      <ReactECharts option={option} style={{ height: "400px", width: "100%" }} />
    </div>
  );
}







