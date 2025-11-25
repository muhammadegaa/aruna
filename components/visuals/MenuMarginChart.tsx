"use client";

import ReactECharts from "echarts-for-react";

type MenuMarginChartProps = {
  items: Array<{ name: string; margin: number; revenue: number }>;
  title?: string;
};

export default function MenuMarginChart({
  items,
  title = "Menu Item Margins",
}: MenuMarginChartProps) {
  if (!items || items.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-center">
        No menu margin data available
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
      axisPointer: {
        type: "shadow",
      },
      formatter: (params: any) => {
        const param = params[0];
        return `${param.name}<br/>Margin: ${param.value.toFixed(1)}%`;
      },
    },
    xAxis: {
      type: "category",
      data: items.map((item) => item.name),
      axisLabel: {
        rotate: 45,
        interval: 0,
      },
    },
    yAxis: {
      type: "value",
      name: "Margin (%)",
      axisLabel: {
        formatter: "{value}%",
      },
    },
    series: [
      {
        name: "Margin",
        type: "bar",
        data: items.map((item) => item.margin),
        itemStyle: {
          color: (params: any) => {
            const value = params.value;
            if (value >= 50) return "#10b981";
            if (value >= 30) return "#3b82f6";
            if (value >= 10) return "#f59e0b";
            return "#ef4444";
          },
        },
      },
    ],
    grid: {
      left: "3%",
      right: "4%",
      bottom: "15%",
      containLabel: true,
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <ReactECharts option={option} style={{ height: "400px", width: "100%" }} />
    </div>
  );
}







