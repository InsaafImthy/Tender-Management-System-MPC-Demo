import React, { useRef, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  BarController,
  LineController,
} from "chart.js";

// Register necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  BarController,
  LineController,
  Title,
  Tooltip,
  Legend
);

interface BudgetCardProps {
  heading?: string;
  width?: number;
  height?: number;
  budgetDetails?: any;
}

const BudgetCard: React.FC<BudgetCardProps> = ({
  width = 456,
  height = 244,
  budgetDetails,
  heading = "Yearly Spend",
}) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);

  const showChart = (details?: any) => {
    try {
      if (chartRef.current) {
        const ctx = chartRef.current.getContext("2d");
        if (ctx) {
          if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
          }
          chartInstanceRef.current = new ChartJS(ctx, {
            type: "line",
            data: {
              labels: details?.years || [
                "2020",
                "2021",
                "2022",
                "2023",
                "2024",
              ],
              datasets: [
                {
                  label: "Estimated Budget",
                  data: details?.budgets || [12000, 15000, 18000, 22000, 25000],
                  borderColor: "#3B82F6",
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  borderWidth: 3,
                  fill: true,
                  tension: 0.4,
                  pointBackgroundColor: "#3B82F6",
                  pointBorderColor: "#ffffff",
                  pointBorderWidth: 3,
                  pointRadius: 6,
                  pointHoverRadius: 8,
                },
                {
                  label: "Actual Spend",
                  data: details?.spend || [10000, 13000, 16000, 19000, 21000],
                  borderColor: "#BFDBFE",
                  backgroundColor: "rgb(59 130 246 / 0.15)",
                  borderWidth: 3,
                  fill: true,
                  tension: 0.4,
                  pointBackgroundColor: "#BFDBFE", 
                  pointBorderColor: "#ffffff", 
                  pointBorderWidth: 3,
                  pointRadius: 6,
                  pointHoverRadius: 8,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              interaction: {
                intersect: false,
                mode: "index",
              },
              plugins: {
                tooltip: {
                  enabled: true,
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                  titleColor: "#ffffff",
                  bodyColor: "#ffffff",
                  borderColor: "#e5e7eb",
                  borderWidth: 1,
                  cornerRadius: 8,
                  displayColors: true,
                  callbacks: {
                    label: function (context) {
                      return (
                        context.dataset.label +
                        ": $" +
                        context.parsed.y.toLocaleString()
                      );
                    },
                  },
                },
                legend: {
                  display: false,
                },
              },
              scales: {
                x: {
                  grid: {
                    display: false,
                  },
                  ticks: {
                    color: "#6B7280",
                    font: {
                      size: 12,
                      weight: "normal",
                    },
                  },
                  border: {
                    display: false,
                  },
                },
                y: {
                  grid: {
                    color: "#F3F4F6",
                  },
                  ticks: {
                    color: "#6B7280",
                    font: {
                      size: 12,
                      weight: "normal",
                    },
                    callback: function (value) {
                      return "$" + value.toLocaleString();
                    },
                  },
                  beginAtZero: true,
                  border: {
                    display: false,
                  },
                },
              },
              elements: {
                point: {
                  hoverBackgroundColor: "#ffffff",
                },
              },
              animation: {
                duration: 2000,
                easing: "easeInOutQuart",
              },
            },
          });
        }
      }
    } catch (error) {
      console.error("Error creating chart:", error);
    }
  };

  useEffect(() => {
    showChart(budgetDetails);
  }, [budgetDetails]);

  return (
    <div className="bg-white rounded-2xl shadow-lg border-0 p-6 h-[350px] overflow-hidden relative">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-heading-3">{heading}</h2>
              <p className="text-body-small text-muted">Financial overview</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-blue-500 rounded-full shadow-sm"></div>
              <span className="text-label text-muted">Estimated</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-blue-200 rounded-full shadow-sm"></div>
              <span className="text-label text-muted">Actual</span>
            </div>
          </div>
        </div>
        <div className="relative h-[240px] rounded-2xl p-4">
          <canvas
            ref={chartRef}
            className="w-full h-full"
            width={width}
            height={height}
          />
        </div>
      </div>
    </div>
  );
};

export default BudgetCard;
