import React, { useState, useMemo } from 'react';
import { ISupplierTenderSummary } from '../../types/competitorAnalysisTypes';
import SelectField from '../basic_components/SelectField';
import { TickIcon, CautionIcon } from '../../utils/Icons';

interface SupplierTenderSummaryProps {
  summary: ISupplierTenderSummary;
  itemOptions: { label: string; value: string }[];
  categoryOptions: { label: string; value: string }[];
}

const SupplierTenderSummary: React.FC<SupplierTenderSummaryProps> = ({
  summary,
  itemOptions,
  categoryOptions,
}) => {
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Filter items based on selections
  const filteredItems = useMemo(() => {
    return summary.itemsRanked.filter(item => {
      if (selectedItem && item.itemCode !== selectedItem) return false;
      if (selectedCategory && item.itemCode !== selectedCategory) return false;
      return true;
    });
  }, [summary.itemsRanked, selectedItem, selectedCategory]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatVariance = (variance: number) => {
    return `${variance > 0 ? '+' : ''}${variance.toFixed(1)}%`;
  };

  const getRankColor = (rank: number, total: number) => {
    const percentage = (rank / total) * 100;
    if (rank === 1) return 'text-green-600 bg-green-50 border-green-200';
    if (percentage <= 25) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (percentage <= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { text: '1st', color: 'bg-green-500 text-white' };
    if (rank === 2) return { text: '2nd', color: 'bg-blue-500 text-white' };
    if (rank === 3) return { text: '3rd', color: 'bg-yellow-500 text-white' };
    return { text: `${rank}th`, color: 'bg-gray-500 text-white' };
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'Leading': return 'text-green-600 bg-green-50';
      case 'Competitive': return 'text-blue-600 bg-blue-50';
      case 'Needs Improvement': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPerformanceMessage = (item: any) => {
    if (item.isLowest) return "🏆 You have the lowest price!";
    if (item.isHighest) return "⚠️ Your price is the highest among competitors.";
    const percentage = (item.rank / item.totalSuppliers) * 100;
    if (percentage <= 25) return "✅ You're in the top 25% of suppliers!";
    if (percentage <= 50) return "👍 You're in the top 50% of suppliers.";
    if (percentage <= 75) return "📈 Consider reviewing your pricing strategy.";
    return "🔍 There's room for improvement in your pricing.";
  };

  const getPerformanceColor = (item: any) => {
    if (item.isLowest) return 'text-green-600';
    if (item.isHighest) return 'text-red-600';
    const percentage = (item.rank / item.totalSuppliers) * 100;
    if (percentage <= 25) return 'text-green-600';
    if (percentage <= 50) return 'text-blue-600';
    if (percentage <= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Your Tender Performance</h3>
            <p className="text-sm text-gray-600 mt-1">
              {summary.tenderName} - {summary.overallSummary.totalItemsQuoted} items quoted
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Overall Position</div>
            <div className={`text-lg font-bold px-3 py-1 rounded-full ${getPositionColor(summary.overallSummary.overallPosition)}`}>
              {summary.overallSummary.overallPosition}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Item</label>
            <SelectField
            id="itemOptions"
              options={itemOptions}
              value={selectedItem}
              onChange={setSelectedItem}
              placeholder="All Items"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
            <SelectField
            id="supplimentryTender"
              options={categoryOptions}
              value={selectedCategory}
              onChange={setSelectedCategory}
              placeholder="All Categories"
            />
          </div>
        </div>
      </div>

      {/* Overall Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-green-600">{summary.overallSummary.numberOfLowestQuotes}</div>
          <div className="text-sm text-gray-600">Lowest Quotes</div>
          <div className="text-xs text-gray-500 mt-1">
            {((summary.overallSummary.numberOfLowestQuotes / summary.overallSummary.totalItemsQuoted) * 100).toFixed(1)}% of items
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-blue-600">{summary.overallSummary.averageRank.toFixed(1)}</div>
          <div className="text-sm text-gray-600">Average Rank</div>
          <div className="text-xs text-gray-500 mt-1">Across all items</div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-purple-600">{formatPrice(summary.overallSummary.totalQuotedValue)}</div>
          <div className="text-sm text-gray-600">Total Quoted Value</div>
          <div className="text-xs text-gray-500 mt-1">Your total bid</div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-orange-600">{formatPrice(summary.overallSummary.savingsOpportunity)}</div>
          <div className="text-sm text-gray-600">Savings Opportunity</div>
          <div className="text-xs text-gray-500 mt-1">vs lowest possible</div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-2">
              {summary.overallSummary.numberOfLowestQuotes === 0 ? '😔' :
               summary.overallSummary.numberOfLowestQuotes === summary.overallSummary.totalItemsQuoted ? '🎉' :
               summary.overallSummary.numberOfLowestQuotes >= summary.overallSummary.totalItemsQuoted / 2 ? '😊' : '😐'}
            </div>
            <div className="text-sm text-gray-600">
              {summary.overallSummary.numberOfLowestQuotes === 0 ? 'No lowest quotes yet' :
               summary.overallSummary.numberOfLowestQuotes === summary.overallSummary.totalItemsQuoted ? 'Perfect! All lowest quotes' :
               summary.overallSummary.numberOfLowestQuotes >= summary.overallSummary.totalItemsQuoted / 2 ? 'Great performance!' : 'Room for improvement'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">
              {summary.overallSummary.averageRank <= 2 ? '🏆' :
               summary.overallSummary.averageRank <= 3 ? '🥈' :
               summary.overallSummary.averageRank <= 4 ? '🥉' : '📈'}
            </div>
            <div className="text-sm text-gray-600">
              {summary.overallSummary.averageRank <= 2 ? 'Excellent ranking' :
               summary.overallSummary.averageRank <= 3 ? 'Good ranking' :
               summary.overallSummary.averageRank <= 4 ? 'Average ranking' : 'Needs improvement'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">
              {summary.overallSummary.savingsOpportunity === 0 ? '💰' :
               summary.overallSummary.savingsOpportunity <= summary.overallSummary.totalQuotedValue * 0.1 ? '💡' : '⚠️'}
            </div>
            <div className="text-sm text-gray-600">
              {summary.overallSummary.savingsOpportunity === 0 ? 'Already at lowest' :
               summary.overallSummary.savingsOpportunity <= summary.overallSummary.totalQuotedValue * 0.1 ? 'Minimal savings' : 'Significant savings possible'}
            </div>
          </div>
        </div>
      </div>

      {/* Items Ranking List */}
      <div className="space-y-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Item-wise Performance</h4>
          <div className="space-y-3">
            {filteredItems.map((item, index) => {
              const rankBadge = getRankBadge(item.rank);
              const performanceMessage = getPerformanceMessage(item);
              const performanceColor = getPerformanceColor(item);

              return (
                <div
                  key={index}
                  className={`border-2 rounded-lg p-4 ${getRankColor(item.rank, item.totalSuppliers)}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h5 className="text-lg font-semibold">{item.itemCode}</h5>
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${rankBadge.color}`}>
                          {rankBadge.text}
                        </span>
                        {item.isLowest && <TickIcon className="w-5 h-5 text-green-500" />}
                        {item.isHighest && <CautionIcon className="w-5 h-5 text-red-500" />}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.itemDescription}</p>
                      <div className={`text-sm font-medium ${performanceColor}`}>
                        {performanceMessage}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">{formatPrice(item.quotedPrice)}</div>
                      <div className="text-sm text-gray-500">Your Price</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Rank</div>
                      <div className="font-semibold">
                        {item.rank} of {item.totalSuppliers}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Average Price</div>
                      <div className="font-semibold">{formatPrice(item.averagePrice)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Variance from Avg</div>
                      <div className={`font-semibold ${
                        item.varianceFromAverage <= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatVariance(item.varianceFromAverage)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Competitors</div>
                      <div className="font-semibold">{item.totalSuppliers - 1} others</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>Your Position</span>
                      <span>{item.rank} of {item.totalSuppliers}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          item.rank === 1 ? 'bg-green-500' :
                          item.rank <= 3 ? 'bg-blue-500' :
                          item.rank <= item.totalSuppliers / 2 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${((item.totalSuppliers - item.rank + 1) / item.totalSuppliers) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="text-gray-500 text-lg">No items found</div>
          <div className="text-gray-400 text-sm mt-2">Try adjusting your filters</div>
        </div>
      )}
    </div>
  );
};

export default SupplierTenderSummary;
