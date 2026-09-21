import { useEffect, useRef } from "react";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { DashboardTrendPoint } from "../../types/dashboardTypes";
import { formatDashboardCurrency } from "../../utils/dashboardAnalytics";

ChartJS.register(CategoryScale, LinearScale, LineController, LineElement, PointElement, Filler, Tooltip, Legend);

interface TenderTrendChartProps {
  points: DashboardTrendPoint[];
  currency: string | null;
  periodLabel: string;
}

const TenderTrendChart = ({ points, currency, periodLabel }: TenderTrendChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<ChartJS<"line"> | null>(null);
  const hasData = points.some((point) => point.tenderCount > 0);

  useEffect(() => {
    chartRef.current?.destroy();
    if (!canvasRef.current || !hasData) return undefined;

    chartRef.current = new ChartJS(canvasRef.current, {
      type: "line",
      data: {
        labels: points.map((point) => point.label),
        datasets: [
          {
            label: "Tender count",
            data: points.map((point) => point.tenderCount),
            borderColor: "#3154D5",
            backgroundColor: "rgba(49, 84, 213, 0.12)",
            borderWidth: 2,
            pointRadius: 2,
            pointHoverRadius: 4,
            pointBackgroundColor: "#3154D5",
            fill: true,
            tension: 0.35,
            yAxisID: "count",
          },
          ...(currency ? [{
            label: "Estimated value",
            data: points.map((point) => point.estimatedValue),
            borderColor: "#31B7DE",
            backgroundColor: "rgba(49, 183, 222, 0.04)",
            borderWidth: 2,
            borderDash: [5, 4],
            pointRadius: 0,
            pointHoverRadius: 4,
            fill: false,
            tension: 0.35,
            yAxisID: "value",
          }] : []),
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 350 },
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            align: "end",
            labels: { color: "#667085", usePointStyle: true, pointStyle: "circle", boxWidth: 6, boxHeight: 6, padding: 12, font: { size: 10 } },
          },
          tooltip: {
            backgroundColor: "#111827",
            padding: 11,
            cornerRadius: 8,
            callbacks: {
              label: (context) => context.dataset.yAxisID === "value"
                ? `${context.dataset.label}: ${formatDashboardCurrency(Number(context.parsed.y), currency)}`
                : `${context.dataset.label}: ${context.parsed.y}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { color: "#7A8699", font: { size: 10 }, maxRotation: 0 },
          },
          count: {
            beginAtZero: true,
            border: { display: false },
            grid: { color: "#EEF2F6", lineWidth: 0.8 },
            ticks: { color: "#7A8699", precision: 0, font: { size: 10 } },
          },
          value: {
            display: Boolean(currency),
            position: "right",
            beginAtZero: true,
            border: { display: false },
            grid: { display: false },
            ticks: {
              color: "#7A8699",
              font: { size: 10 },
              callback: (value) => formatDashboardCurrency(Number(value), currency, true),
            },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [currency, hasData, points]);

  return (
    <section className="dashboard-panel dashboard-panel--trend">
      <div className="dashboard-panel__header">
        <div>
          <h2>Tender pipeline trend</h2>
          <p>Tender records and estimated contract value · {periodLabel}</p>
        </div>
        {!currency && hasData && <span className="dashboard-note">Select one currency to compare value</span>}
      </div>
      <div className="dashboard-chart dashboard-chart--primary">
        {hasData ? (
          <canvas ref={canvasRef} role="img" aria-label="Tender count and estimated value over the last twelve months" />
        ) : (
          <div className="dashboard-empty">No dated tenders match the selected filters.</div>
        )}
      </div>
    </section>
  );
};

export default TenderTrendChart;
