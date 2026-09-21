import { useEffect, useMemo, useRef } from "react";
import { ArcElement, Chart as ChartJS, DoughnutController, Tooltip } from "chart.js";
import { DashboardDistributionItem } from "../../types/dashboardTypes";

ChartJS.register(DoughnutController, ArcElement, Tooltip);

interface TenderStatusChartProps {
  data: DashboardDistributionItem[];
  total: number;
}

const TenderStatusChart = ({ data, total }: TenderStatusChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<ChartJS<"doughnut"> | null>(null);
  const chartData = useMemo(() => data.length > 6
    ? [
        ...data.slice(0, 5),
        {
          label: "Other",
          value: data.slice(5).reduce((sum, item) => sum + item.value, 0),
          color: "#94A3B8",
        },
      ]
    : data, [data]);

  useEffect(() => {
    chartRef.current?.destroy();
    if (!canvasRef.current || total === 0) return undefined;

    chartRef.current = new ChartJS(canvasRef.current, {
      type: "doughnut",
      data: {
        labels: chartData.map((item) => item.label),
        datasets: [{
          data: chartData.map((item) => item.value),
          backgroundColor: chartData.map((item) => item.color),
          borderColor: "#FFFFFF",
          borderWidth: 3,
          hoverOffset: 3,
          spacing: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 350 },
        cutout: "70%",
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#111827",
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                const value = Number(context.parsed);
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";
                return `${context.label}: ${value} (${percentage}%)`;
              },
            },
          },
        },
      },
      plugins: [{
        id: "dashboard-center-label",
        beforeDraw: (chart) => {
          const { ctx, chartArea } = chart;
          if (!chartArea) return;
          const x = (chartArea.left + chartArea.right) / 2;
          const y = (chartArea.top + chartArea.bottom) / 2;
          ctx.save();
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#667085";
          ctx.font = "500 11px Inter, system-ui, sans-serif";
          ctx.fillText("TOTAL", x, y - 11);
          ctx.fillStyle = "#111827";
          ctx.font = "700 25px Inter, system-ui, sans-serif";
          ctx.fillText(String(total), x, y + 11);
          ctx.restore();
        },
      }],
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [chartData, total]);

  return (
    <section className="dashboard-panel">
      <div className="dashboard-panel__header">
        <div>
          <h2>Tender status distribution</h2>
          <p>Current portfolio by workflow status</p>
        </div>
      </div>
      {total > 0 ? (
        <div className="dashboard-status-layout">
          <div className="dashboard-chart dashboard-chart--doughnut">
            <canvas ref={canvasRef} role="img" aria-label="Tender status distribution" />
          </div>
          <div className="dashboard-legend" aria-label="Tender status legend">
            {chartData.map((item) => (
              <div className="dashboard-legend__item" key={item.label}>
                <span className="dashboard-legend__dot" style={{ backgroundColor: item.color }} />
                <span title={item.label}>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="dashboard-empty">No tender statuses to display.</div>
      )}
    </section>
  );
};

export default TenderStatusChart;
