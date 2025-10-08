import React, { useState, useMemo } from 'react';
import { ITenderAnalytics, ITenderFilters } from '../../types/competitorAnalysisTypes';
import SelectField from '../basic_components/SelectField';

// Mock chart components - replace with actual chart library
const BarChart: React.FC<{ data: { name: string; value: number; color: string }[] }> = ({ data }) => (
  <div className="h-64 flex items-end space-x-2 p-4 bg-gray-50 rounded-lg">
    {data.map((item, index) => (
      <div key={index} className="flex-1 flex flex-col items-center">
        <div 
          className="w-full rounded-t" 
          style={{ 
            height: `${(item.value / Math.max(...data.map(d => d.value))) * 200}px`,
            backgroundColor: item.color
          }} 
        />
        <div className="text-xs text-gray-600 mt-2 text-center truncate max-w-[80px]" title={item.name}>
          {item.name}
        </div>
      </div>
    ))}
  </div>
);

const HeatmapTable: React.FC<{ 
  data: { 
    item: string; 
    suppliers: { [key: string]: { value: number; isLowest: boolean; isHighest: boolean } } 
  }[] 
}> = ({ data }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b">
          <th className="text-left p-2">Item</th>
          {data[0] && Object.keys(data[0].suppliers).map(supplier => (
            <th key={supplier} className="text-center p-2 min-w-[100px]">{supplier}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index} className="border-b">
            <td className="p-2 font-medium">{row.item}</td>
            {Object.entries(row.suppliers).map(([supplier, data]) => (
              <td key={supplier} className="text-center p-2">
                <div className={`inline-block px-2 py-1 rounded ${
                  data.isLowest ? 'bg-green-100 text-green-800' :
                  data.isHighest ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  ${data.value.toLocaleString()}
                </div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

interface TenderAnalyticsDashboardProps {
  analytics: ITenderAnalytics;
  filters: ITenderFilters;
  onFiltersChange: (filters: ITenderFilters) => void;
  supplierOptions: { label: string; value: string }[];
  categoryOptions: { label: string; value: string }[];
}

const TenderAnalyticsDashboard: React.FC<TenderAnalyticsDashboardProps> = ({
  analytics,
  filters,
  onFiltersChange,
  supplierOptions,
  categoryOptions,
}) => {
  const [selectedChart, setSelectedChart] = useState<'supplier' | 'heatmap' | 'variance'>('supplier');

  // Process data for charts
  const supplierChartData = useMemo(() => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];
    return analytics.supplierPerformance.map((supplier, index) => ({
      name: supplier.supplierName,
      value: supplier.totalValue,
      color: colors[index % colors.length],
    }));
  }, [analytics.supplierPerformance]);

  const heatmapData = useMemo(() => {
    // This would be generated from the actual matrix data
    return analytics.itemAnalysis.map(item => ({
      item: item.itemCode,
      suppliers: {
        'Supplier A': { value: Math.floor(Math.random() * 1000) + 100, isLowest: false, isHighest: false },
        'Supplier B': { value: Math.floor(Math.random() * 1000) + 100, isLowest: false, isHighest: false },
        'Supplier C': { value: Math.floor(Math.random() * 1000) + 100, isLowest: false, isHighest: false },
      }
    }));
  }, [analytics.itemAnalysis]);

  const varianceData = useMemo(() => {
    return analytics.itemAnalysis.map(item => ({
      name: item.itemCode,
      value: item.variance,
      color: item.competitiveness === 'High' ? '#10B981' : 
             item.competitiveness === 'Medium' ? '#F59E0B' : '#EF4444',
    }));
  }, [analytics.itemAnalysis]);

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

  const getCompetitivenessColor = (competitiveness: string) => {
    switch (competitiveness) {
      case 'High': return 'text-green-600 bg-green-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Low': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Tender Analytics Dashboard</h3>
            <p className="text-sm text-gray-600 mt-1">{analytics.tenderName}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedChart('supplier')}
              className={`px-3 py-1 text-sm rounded-md ${
                selectedChart === 'supplier'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Supplier Performance
            </button>
            <button
              onClick={() => setSelectedChart('heatmap')}
              className={`px-3 py-1 text-sm rounded-md ${
                selectedChart === 'heatmap'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Price Heatmap
            </button>
            <button
              onClick={() => setSelectedChart('variance')}
              className={`px-3 py-1 text-sm rounded-md ${
                selectedChart === 'variance'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Variance Analysis
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Suppliers</label>
            <SelectField
            id="supplierOptions"
              options={supplierOptions}
              value={filters.suppliers?.[0] || ''}
              onChange={(value: string) => onFiltersChange({ ...filters, suppliers: value ? [value] : [] })}
              placeholder="All Suppliers"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
            <SelectField
            id="categoryOptions"
              options={categoryOptions}
              value={filters.categories?.[0] || ''}
              onChange={(value: string) => onFiltersChange({ ...filters, categories: value ? [value] : [] })}
              placeholder="All Categories"
            />
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-blue-600">{formatPrice(analytics.tenderMetrics.totalValue)}</div>
          <div className="text-sm text-gray-600">Total Tender Value</div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-green-600">{analytics.tenderMetrics.averageVariance.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Average Variance</div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-purple-600">{analytics.supplierPerformance.length}</div>
          <div className="text-sm text-gray-600">Active Suppliers</div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-orange-600">{analytics.tenderMetrics.marketConcentration.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Market Concentration</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Chart */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedChart === 'supplier' && 'Supplier Performance by Total Value'}
            {selectedChart === 'heatmap' && 'Price Heatmap - Supplier vs Items'}
            {selectedChart === 'variance' && 'Variance Analysis by Item'}
          </h4>
          {selectedChart === 'supplier' && <BarChart data={supplierChartData} />}
          {selectedChart === 'heatmap' && <HeatmapTable data={heatmapData} />}
          {selectedChart === 'variance' && <BarChart data={varianceData} />}
        </div>

        {/* Supplier Performance Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Supplier Performance Details</h4>
          <div className="space-y-3">
            {analytics.supplierPerformance.map((supplier, index) => (
              <div key={supplier.supplierId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900">{supplier.supplierName}</h5>
                  <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Total Value</div>
                    <div className="font-semibold">{formatPrice(supplier.totalValue)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Lowest Quotes</div>
                    <div className="font-semibold text-green-600">{supplier.lowestQuotes}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Average Rank</div>
                    <div className="font-semibold">{supplier.averageRank.toFixed(1)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Market Share</div>
                    <div className="font-semibold">{supplier.marketShare.toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Item Analysis */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Item Competitiveness Analysis</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Item</th>
                <th className="text-left py-2">Description</th>
                <th className="text-center py-2">Variance</th>
                <th className="text-center py-2">Competitiveness</th>
                <th className="text-center py-2">Avg Price</th>
                <th className="text-center py-2">Price Range</th>
              </tr>
            </thead>
            <tbody>
              {analytics.itemAnalysis.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 font-medium">{item.itemCode}</td>
                  <td className="py-3 text-sm text-gray-600 max-w-xs truncate" title={item.itemDescription}>
                    {item.itemDescription}
                  </td>
                  <td className="py-3 text-center">
                    <span className={`font-semibold ${
                      item.variance <= 10 ? 'text-green-600' :
                      item.variance <= 25 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {formatVariance(item.variance)}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCompetitivenessColor(item.competitiveness)}`}>
                      {item.competitiveness}
                    </span>
                  </td>
                  <td className="py-3 text-center font-semibold">{formatPrice(item.averagePrice)}</td>
                  <td className="py-3 text-center text-sm text-gray-600">{formatPrice(item.priceRange)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TenderAnalyticsDashboard;
