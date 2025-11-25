"use client";

import { WidgetConfig } from "@/lib/agent/tools";
import KpiCards from "../visuals/KpiCards";
import RevenueChart from "../visuals/RevenueChart";
import OccupancyHeatmap from "../visuals/OccupancyHeatmap";
import GenericTable from "../visuals/GenericTable";
import MenuMarginChart from "../visuals/MenuMarginChart";
import { Sparkles } from "lucide-react";
import { ErrorBoundary } from "../ErrorBoundary";

type VisualPanelProps = {
  widgets: WidgetConfig[];
};

export default function VisualPanel({ widgets }: VisualPanelProps) {
  if (!widgets || widgets.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Visualizations Yet</h3>
          <p className="text-gray-600 mb-4">
            Ask Aruna about your business metrics to see visualizations appear here.
          </p>
          <p className="text-sm text-gray-500">
            Try: &quot;Show me this month&apos;s performance&quot; or &quot;What&apos;s my revenue trend?&quot;
          </p>
        </div>
      </div>
    );
  }

  const renderWidget = (widget: WidgetConfig, index: number) => {
    const { visualId, props } = widget;

    switch (visualId) {
      case "kpi_cards":
        return <KpiCards key={`${visualId}-${index}`} kpis={props.kpis as any} />;
      case "revenue_timeseries":
        return (
          <RevenueChart
            key={`${visualId}-${index}`}
            points={props.points as Array<{ date: string; value: number }>}
            title={props.title as string | undefined}
          />
        );
      case "occupancy_heatmap":
        return (
          <OccupancyHeatmap
            key={`${visualId}-${index}`}
            courts={props.courts as string[]}
            hours={props.hours as number[]}
            matrix={props.matrix as number[][]}
            title={props.title as string | undefined}
          />
        );
      case "menu_margin_chart":
        return (
          <MenuMarginChart
            key={`${visualId}-${index}`}
            items={props.items as Array<{ name: string; margin: number; revenue: number }>}
            title={props.title as string | undefined}
          />
        );
      case "table":
        return (
          <GenericTable
            key={`${visualId}-${index}`}
            columns={props.columns as Array<{ key: string; label: string }>}
            rows={props.rows as Array<Record<string, unknown>>}
            title={props.title as string | undefined}
          />
        );
      default:
        return (
          <div key={`${visualId}-${index}`} className="p-4 text-gray-500 bg-white rounded-lg border border-gray-200">
            Unknown visualization: {visualId}
          </div>
        );
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-neutral-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {widgets.map((widget, index) => (
          <ErrorBoundary
            key={`${widget.visualId}-${index}`}
            fallback={
              <div className="p-4 text-error-600 bg-error-50 rounded-lg border border-error-200">
                Failed to render visualization: {widget.visualId}
              </div>
            }
          >
            <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
              {renderWidget(widget, index)}
            </div>
          </ErrorBoundary>
        ))}
      </div>
    </div>
  );
}






