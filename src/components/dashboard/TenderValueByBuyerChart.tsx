import { useEffect, useRef } from "react";
import { BarController, BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip } from "chart.js";
import { DashboardBuyerItem } from "../../types/dashboardTypes";
import { formatDashboardCurrency } from "../../utils/dashboardAnalytics";

ChartJS.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

interface TenderValueByBuyerChartProps {
  data: DashboardBuyerItem[];
  mode: "value" | "count";
  currency: string | null;
}

const truncateLabel = (label: string) => label.length > 18 ? `${label.slice(0, 17)}…` : label;

const TenderValueByBuyerChart = ({ data, mode, currency }: TenderValueByBuyerChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<ChartJS<"bar"> | null>(null);
  const hasData = data.some((item) => item.value > 0);

  useEffect(() => {
    chartRef.current?.destroy();
    if (!canvasRef.current || !hasData) return undefined;

    chartRef.current = new ChartJS(canvasRef.current, {
      type: "bar",
      data: {
        labels: data.map((item) => truncateLabel(item.label)),
        datasets: [{
          label: mode === "value" ? "Estimated value" : "Tender count",
          data: data.map((item) => item.value),
          backgroundColor: "#3154D5",
          hoverBackgroundColor: "#2438B8",
          borderRadius: 4,
          borderSkipped: false,
          maxBarThickness: 20,
        }],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#111827",
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              title: (items) => data[items[0]?.dataIndex]?.label ?? "",
              label: (context) => mode === "value"
                ? formatDashboardCurrency(Number(context.parsed.x), currency)
                : `${context.parsed.x} tenders`,
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            border: { display: false },
            grid: { color: "#EDF1F5" },
            ticks: {
              color: "#7A8699",
              precision: 0,
              font: { size: 10 },
              callback: (value) => mode === "value" ? formatDashboardCurrency(Number(value), currency, true) : value,
            },
          },
          y: {
            grid: { display: false },
            border: { display: false },
            ticks: { color: "#667085", font: { size: 10 } },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [currency, data, hasData, mode]);

  return (
    <section className="dashboard-panel dashboard-panel--compact">
      <div className="dashboard-panel__header">
        <div>
          <h2>{mode === "value" ? "Tender value by buyer" : "Tender volume by buyer"}</h2>
          <p>{mode === "value" ? `Top buyers by estimated value · ${currency}` : "Top buyers by tender count · mixed currencies"}</p>
        </div>
      </div>
      <div className="dashboard-chart dashboard-chart--secondary">
        {hasData ? <canvas ref={canvasRef} role="img" aria-label="Tender portfolio by buyer" /> : <div className="dashboard-empty">No buyer data available.</div>}
      </div>
    </section>
  );
};

export default TenderValueByBuyerChart;
