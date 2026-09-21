import { useEffect, useRef } from "react";
import { BarController, BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip } from "chart.js";
import { DashboardDistributionItem } from "../../types/dashboardTypes";

ChartJS.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

const TenderAgeingChart = ({ data }: { data: DashboardDistributionItem[] }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<ChartJS<"bar"> | null>(null);
  const hasData = data.some((item) => item.value > 0);

  useEffect(() => {
    chartRef.current?.destroy();
    if (!canvasRef.current || !hasData) return undefined;

    chartRef.current = new ChartJS(canvasRef.current, {
      type: "bar",
      data: {
        labels: data.map((item) => item.label),
        datasets: [{
          label: "Active tenders",
          data: data.map((item) => item.value),
          backgroundColor: data.map((item) => item.color),
          borderRadius: 5,
          borderSkipped: false,
          maxBarThickness: 34,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        plugins: {
          tooltip: { backgroundColor: "#111827", padding: 10, cornerRadius: 8 },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { color: "#7A8699", font: { size: 9 }, maxRotation: 0, autoSkip: false },
          },
          y: {
            beginAtZero: true,
            border: { display: false },
            grid: { color: "#EDF1F5" },
            ticks: { color: "#7A8699", precision: 0, font: { size: 10 } },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [data, hasData]);

  return (
    <section className="dashboard-panel dashboard-panel--compact">
      <div className="dashboard-panel__header">
        <div>
          <h2>Deadline profile</h2>
          <p>Active tenders by days to closing</p>
        </div>
      </div>
      <div className="dashboard-chart dashboard-chart--secondary">
        {hasData ? <canvas ref={canvasRef} role="img" aria-label="Active tender deadline profile" /> : <div className="dashboard-empty">No active tender deadlines available.</div>}
      </div>
    </section>
  );
};

export default TenderAgeingChart;

