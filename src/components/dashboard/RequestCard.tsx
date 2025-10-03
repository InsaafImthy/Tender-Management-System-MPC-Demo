import React, { useRef, useEffect } from "react";
import {
  Chart as ChartJS,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

interface RequestCardProps {
  labels: string[];
  data: number[];
  colors: string[];
}

ChartJS.register(DoughnutController, ArcElement, Tooltip, Legend, Title);

const RequestCard: React.FC<RequestCardProps> = ({
  labels,
  data,
  colors,
}: RequestCardProps) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    try {
      if (chartRef.current) {
        const ctx = chartRef.current.getContext("2d");
        if (ctx) {
          if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
          }

          chartInstanceRef.current = new ChartJS(ctx, {
            type: "doughnut",
            data: {
              labels: labels,
              datasets: [
                {
                  label: "Request Status",
                  data: data,
                  backgroundColor: colors,
                  borderWidth: 0,
                  hoverOffset: 8,
                  spacing: 2,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              animation: {
                duration: 2000,
                easing: "easeInOutQuart",
              },
              plugins: {
                legend: {
                  display: false,
                },
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
                      const total = data.reduce((a, b) => a + b, 0);
                      const percentage = (
                        (context.parsed * 100) /
                        total
                      ).toFixed(1);
                      return (
                        context.label +
                        ": " +
                        context.parsed +
                        " (" +
                        percentage +
                        "%)"
                      );
                    },
                  },
                },
              },
              cutout: "65%",
              rotation: -90,
              circumference: 360,
              elements: {
                arc: {
                  borderWidth: 0,
                },
              },
            },
            plugins: [
              {
                id: "center-text",
                beforeDraw(chart) {
                  const { ctx, chartArea } = chart;

                  // Calculate the center of the doughnut
                  const centerX = (chartArea.left + chartArea.right) / 2;
                  const centerY = (chartArea.top + chartArea.bottom) / 2;

                  // Calculate total from dataset
                  const total = data.reduce((sum, value) => sum + value, 0);

                  // Save canvas state
                  ctx.save();

                  // Draw 'Total' text (normal)
                  ctx.font = "14px Inter, system-ui, sans-serif";
                  ctx.fillStyle = "#6B7280";
                  ctx.textAlign = "center";
                  ctx.textBaseline = "middle";
                  ctx.fillText("Total", centerX, centerY - 8);

                  // Draw the total value (bold)
                  ctx.font = "bold 24px Inter, system-ui, sans-serif";
                  ctx.fillStyle = "#1F2937";
                  ctx.fillText(`${total}`, centerX, centerY + 12);

                  // Restore canvas state
                  ctx.restore();
                },
              },
            ],
          });
        }
      }

      return () => {
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }
      };
    } catch (error) {
      console.error("Error creating donut chart:", error);
    }
  }, [labels, data, colors]);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-[350px] flex flex-col relative overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-1.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Request Status</h2>
            <p className="text-xs text-gray-500">Distribution overview</p>
          </div>
        </div>

        {/* Content - Horizontal Layout for Better Space Usage */}
        <div className="flex-1 flex flex-row items-center gap-6">
          {/* Chart Section */}
          <div className="flex-shrink-0">
            <div className="relative">
              <canvas
                ref={chartRef}
                className="w-[160px] h-[160px] drop-shadow-lg"
                width={160}
                height={160}
              />
              {/* Enhanced Chart glow effect */}
              <div className="absolute inset-0 w-[160px] h-[160px] rounded-full bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 opacity-30 blur-xl"></div>
            </div>
          </div>

          {/* Legend Section */}
          <div className="flex-1 w-full space-y-3 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {labels.map((label, index) => {
              const total = data.reduce((a, b) => a + b, 0);
                total > 0 ? ((data[index] * 100) / total).toFixed(1) : 0;
              return (
                <div key={index} className="group flex items-center justify-between p-1 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    {/* Color Indicator */}
                    <div className="relative">
                      <div
                        className="w-5 h-5 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300 border-2 border-white"
                        style={{ backgroundColor: colors[index] }}
                      ></div>
                    </div>

                    {/* Label */}
                    <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{label}</span>
                  </div>

                  {/* Value */}
                  <div className="text-right">
                    <div className="text-base font-bold text-gray-900">
                      {`${data[index]?.toLocaleString()}` || "0"}
                    </div>
                    
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer with Total */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">Total Requests</span>
            <span className="text-lg font-bold text-gray-900">
              {data.reduce((a, b) => a + b, 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-20 blur-xl"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-pink-100 to-yellow-100 rounded-full opacity-20 blur-lg"></div>
    </div>
  );
};

export default RequestCard;
