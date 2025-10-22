import React, { useRef, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  LineController,
} from "chart.js";

// Register necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  LineController,
  Title,
  Tooltip,
  Legend
);

interface BidData {
  timestamp: string;
  amount: number;
  vendorName: string;
  vendorId: number;
}

interface VariantsGraphProps {
  data: BidData[];
  title?: string;
  height?: number;
}

const VariantsGraph: React.FC<VariantsGraphProps> = ({ 
  data, 
  title = "Bid Variations Over Time",
  height = 300 
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!chartRef.current || !data.length) return;

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Collect and sort unique timestamps (labels)
    const labels = Array.from(
      new Set(data.map((d) => d.timestamp))
    ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    // Group data by vendor and map timestamp -> amount for fast lookup
    const vendorGroups = data.reduce((acc, bid) => {
      if (!acc[bid.vendorId]) {
        acc[bid.vendorId] = {
          vendorName: bid.vendorName,
          pointsByTs: new Map<string, number>()
        };
      }
      // If multiple entries for same timestamp, keep the latest occurrence
      acc[bid.vendorId].pointsByTs.set(bid.timestamp, bid.amount);
      return acc;
    }, {} as Record<number, { vendorName: string; pointsByTs: Map<string, number> }>);

    // Generate colors for different vendors
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
      '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6366F1'
    ];

    const datasets = Object.values(vendorGroups).map((vendor, index) => ({
      label: vendor.vendorName,
      data: labels.map((ts) => {
        const v = vendor.pointsByTs.get(ts);
        return v === undefined ? null : v;
      }),
      borderColor: colors[index % colors.length],
      backgroundColor: colors[index % colors.length] + '20',
      borderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      tension: 0.1,
      fill: false,
      spanGaps: true,
    }));

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new ChartJS(ctx, {
      type: 'line',
      data: {
        labels,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: title,
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            position: 'top' as const,
            labels: {
              usePointStyle: true,
              padding: 20
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              title: (context) => {
                const label = context[0].label as string;
                return new Date(label).toLocaleString();
              },
              label: (context) => {
                const y = context.parsed.y as number;
                return `${context.dataset.label}: $${(y ?? 0).toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          x: {
            type: 'category',
            title: {
              display: true,
              text: 'Time'
            },
            ticks: {
              maxRotation: 45,
              minRotation: 0,
              callback: function(value) {
                const label = (this.getLabelForValue as unknown as (value: number) => string)(value as number);
                const d = new Date(label);
                // Show a compact format
                return isNaN(d.getTime()) ? label : `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
              }
            }
          },
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: 'Bid Amount ($)'
            },
            ticks: {
              callback: function(value) {
                const num = typeof value === 'number' ? value : Number(value);
                return '$' + (isNaN(num) ? value : num.toLocaleString());
              }
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, title]);

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-gray-500 text-lg mb-2">No bid data available</div>
          <div className="text-gray-400 text-sm">Bid variations will appear here once vendors start submitting proposals</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div style={{ height: `${height}px` }}>
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default VariantsGraph;
