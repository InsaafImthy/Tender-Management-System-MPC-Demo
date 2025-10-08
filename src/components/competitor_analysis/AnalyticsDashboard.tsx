import React, { useState, useMemo } from 'react';
import { IAnalyticsData, IAnalyticsFilters, IBarChartData, ILineChartData, IPriceTrendData } from '../../types/competitorAnalysisTypes';
import SelectField from '../basic_components/SelectField';

// Mock chart components - replace with actual chart library
const BarChart: React.FC<{ data: IBarChartData[] }> = ({ data }) => (
  <div className="h-64 flex items-end space-x-2 p-4 bg-gray-50 rounded-lg">
    {data.map((item, index) => (
      <div key={index} className="flex-1 flex flex-col items-center">
        <div className="w-full bg-blue-500 rounded-t" style={{ height: `${(item.average / Math.max(...data.map(d => d.average))) * 200}px` }} />
        <div className="text-xs text-gray-600 mt-2 text-center">{item.item}</div>
      </div>
    ))}
  </div>
);

const LineChart: React.FC<{ data: ILineChartData[] }> = ({ data }) => (
  <div className="h-64 p-4 bg-gray-50 rounded-lg">
    <div className="text-sm text-gray-600 text-center">Price Trends Chart</div>
    <div className="text-xs text-gray-400 text-center mt-2">
      {data.length} data points available
    </div>
  </div>
);

const PieChart: React.FC<{ data: { name: string; value: number; color: string }[] }> = ({ data }) => (
  <div className="h-64 p-4 bg-gray-50 rounded-lg">
    <div className="text-sm text-gray-600 text-center">Supplier Distribution</div>
    <div className="text-xs text-gray-400 text-center mt-2">
      {data.length} suppliers
    </div>
  </div>
);

interface AnalyticsDashboardProps {
  analyticsData: IAnalyticsData[];
  priceTrends: IPriceTrendData[];
  filters: IAnalyticsFilters;
  onFiltersChange: (filters: IAnalyticsFilters) => void;
  supplierOptions: { label: string; value: string }[];
  categoryOptions: { label: string; value: string }[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  analyticsData,
  priceTrends,
  filters,
  onFiltersChange,
  supplierOptions,
  categoryOptions,
}) => {
  const [selectedChart, setSelectedChart] = useState<'bar' | 'line' | 'pie'>('bar');

  // Process data for charts
  const barChartData = useMemo(() => {
    return analyticsData.map(item => ({
      item: item.itemCode,
      suppliers: item.priceData.reduce((acc, price) => {
        acc[price.supplier] = price.price;
        return acc;
      }, {} as { [key: string]: number }),
      lowest: item.summary.lowest,
      highest: item.summary.highest,
      average: item.summary.average,
    }));
  }, [analyticsData]);

  const lineChartData = useMemo(() => {
    if (priceTrends.length === 0) return [];
    return priceTrends[0].trends.map((trend: any) => ({
      date: trend.date,
      lowest: trend.lowestPrice,
      highest: trend.highestPrice,
      average: trend.averagePrice,
      submissions: trend.totalSubmissions,
    }));
  }, [priceTrends]);

  const pieChartData = useMemo(() => {
    const supplierCounts: { [key: string]: number } = {};
    analyticsData.forEach(item => {
      item.priceData.forEach(price => {
        supplierCounts[price.supplier] = (supplierCounts[price.supplier] || 0) + 1;
      });
    });

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
    return Object.entries(supplierCounts).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length],
    }));
  }, [analyticsData]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatVariance = (variance: number) => {
    return `${variance > 0 ? '+' : ''}${variance.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Analytics Dashboard</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedChart('bar')}
              className={`px-3 py-1 text-sm rounded-md ${
                selectedChart === 'bar'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Bar Chart
            </button>
            <button
              onClick={() => setSelectedChart('line')}
              className={`px-3 py-1 text-sm rounded-md ${
                selectedChart === 'line'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Line Chart
            </button>
            <button
              onClick={() => setSelectedChart('pie')}
              className={`px-3 py-1 text-sm rounded-md ${
                selectedChart === 'pie'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pie Chart
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Suppliers</label>
            <SelectField
              id="supplier"
              options={supplierOptions}
              value={filters.supplierIds?.[0] || ''}
              onChange={(value: string) => onFiltersChange({ ...filters, supplierIds: value ? [value] : [] })}
              placeholder="All Suppliers"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
            <SelectField
              id="category"
              options={categoryOptions}
              value={filters.itemCategories?.[0] || ''}
              onChange={(value: string) => onFiltersChange({ ...filters, itemCategories: value ? [value] : [] })}
              placeholder="All Categories"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <div className="flex space-x-2">
              <input
                type="date"
                value={filters.dateRange?.startDate || ''}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  dateRange: { 
                    startDate: e.target.value,
                    endDate: filters.dateRange?.endDate || ''
                  }
                })}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="date"
                value={filters.dateRange?.endDate || ''}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  dateRange: { 
                    startDate: filters.dateRange?.startDate || '',
                    endDate: e.target.value
                  }
                })}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Chart */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedChart === 'bar' && 'Item vs Supplier Prices'}
            {selectedChart === 'line' && 'Price Trends Over Time'}
            {selectedChart === 'pie' && 'Supplier Distribution'}
          </h4>
          {selectedChart === 'bar' && <BarChart data={barChartData} />}
          {selectedChart === 'line' && <LineChart data={lineChartData} />}
          {selectedChart === 'pie' && <PieChart data={pieChartData} />}
        </div>

        {/* Summary Stats */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Summary Statistics</h4>
          <div className="space-y-4">
            {analyticsData.map((item) => (
              <div key={item.itemCode} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900">{item.itemCode}</h5>
                  <span className="text-sm text-gray-500">{item.priceData.length} quotes</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Lowest</div>
                    <div className="font-semibold text-green-600">{formatPrice(item.summary.lowest)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Highest</div>
                    <div className="font-semibold text-red-600">{formatPrice(item.summary.highest)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Average</div>
                    <div className="font-semibold text-gray-700">{formatPrice(item.summary.average)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Variance</div>
                    <div className={`font-semibold ${
                      item.summary.variance <= 10 ? 'text-green-600' :
                      item.summary.variance <= 25 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {formatVariance(item.summary.variance)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {analyticsData.length}
            </div>
            <div className="text-sm text-green-700">Items Analyzed</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {analyticsData.reduce((sum, item) => sum + item.priceData.length, 0)}
            </div>
            <div className="text-sm text-blue-700">Total Quotations</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {formatVariance(
                analyticsData.reduce((sum, item) => sum + item.summary.variance, 0) / analyticsData.length
              )}
            </div>
            <div className="text-sm text-purple-700">Avg Variance</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
