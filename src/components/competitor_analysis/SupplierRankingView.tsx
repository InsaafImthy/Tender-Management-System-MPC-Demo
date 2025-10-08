import React, { useState, useMemo } from 'react';
import { ISupplierRanking } from '../../types/competitorAnalysisTypes';
import SelectField from '../basic_components/SelectField';
import { TickIcon, CautionIcon } from '../../utils/Icons';

interface SupplierRankingViewProps {
  rankings: ISupplierRanking[];
  supplierId: string;
  itemOptions: { label: string; value: string }[];
  categoryOptions: { label: string; value: string }[];
}

const SupplierRankingView: React.FC<SupplierRankingViewProps> = ({
  rankings,
  itemOptions,
  categoryOptions,
}) => {
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Filter rankings based on selections
  const filteredRankings = useMemo(() => {
    return rankings.filter(ranking => {
      if (selectedItem && ranking.itemCode !== selectedItem) return false;
      if (selectedCategory && ranking.itemCode !== selectedCategory) return false;
      return true;
    });
  }, [rankings, selectedItem, selectedCategory]);

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
    if (percentage <= 25) return 'text-green-600 bg-green-50 border-green-200';
    if (percentage <= 50) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (percentage <= 75) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { text: '1st', color: 'bg-green-500 text-white' };
    if (rank === 2) return { text: '2nd', color: 'bg-blue-500 text-white' };
    if (rank === 3) return { text: '3rd', color: 'bg-yellow-500 text-white' };
    return { text: `${rank}th`, color: 'bg-gray-500 text-white' };
  };

  const getPerformanceMessage = (ranking: ISupplierRanking) => {
    const percentage = (ranking.rank / ranking.totalSuppliers) * 100;
    if (ranking.isLowest) return "🏆 You have the lowest price!";
    if (ranking.isHighest) return "⚠️ Your price is the highest among competitors.";
    if (percentage <= 25) return "✅ You're in the top 25% of suppliers!";
    if (percentage <= 50) return "👍 You're in the top 50% of suppliers.";
    if (percentage <= 75) return "📈 Consider reviewing your pricing strategy.";
    return "🔍 There's room for improvement in your pricing.";
  };

  const getPerformanceColor = (ranking: ISupplierRanking) => {
    const percentage = (ranking.rank / ranking.totalSuppliers) * 100;
    if (ranking.isLowest) return 'text-green-600';
    if (ranking.isHighest) return 'text-red-600';
    if (percentage <= 25) return 'text-green-600';
    if (percentage <= 50) return 'text-blue-600';
    if (percentage <= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalItems = filteredRankings.length;
    const lowestPrices = filteredRankings.filter(r => r.isLowest).length;
    const top25Percent = filteredRankings.filter(r => (r.rank / r.totalSuppliers) <= 0.25).length;
    const averageRank = filteredRankings.reduce((sum, r) => sum + r.rank, 0) / totalItems;
    const averageVariance = filteredRankings.reduce((sum, r) => sum + r.varianceFromAverage, 0) / totalItems;

    return {
      totalItems,
      lowestPrices,
      top25Percent,
      averageRank: averageRank.toFixed(1),
      averageVariance: averageVariance.toFixed(1),
    };
  }, [filteredRankings]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Your Competitive Position</h3>
            <p className="text-sm text-gray-600 mt-1">
              Track your ranking across all quoted items
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Items Quoted</div>
            <div className="text-2xl font-bold text-gray-900">{summaryStats.totalItems}</div>
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
            id="categoryOptions"
              options={categoryOptions}
              value={selectedCategory}
              onChange={setSelectedCategory}
              placeholder="All Categories"
            />
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-green-600">{summaryStats.lowestPrices}</div>
          <div className="text-sm text-gray-600">Lowest Prices</div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-blue-600">{summaryStats.top25Percent}</div>
          <div className="text-sm text-gray-600">Top 25% Rankings</div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-purple-600">{summaryStats.averageRank}</div>
          <div className="text-sm text-gray-600">Average Rank</div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-orange-600">{summaryStats.averageVariance}%</div>
          <div className="text-sm text-gray-600">Avg Variance</div>
        </div>
      </div>

      {/* Rankings List */}
      <div className="space-y-4">
        {filteredRankings.map((ranking) => {
          const rankBadge = getRankBadge(ranking.rank);
          const performanceMessage = getPerformanceMessage(ranking);
          const performanceColor = getPerformanceColor(ranking);

          return (
            <div
              key={`${ranking.itemCode}-${ranking.supplierId}`}
              className={`bg-white rounded-2xl shadow-lg border-2 ${getRankColor(ranking.rank, ranking.totalSuppliers)} overflow-hidden`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold">{ranking.itemCode}</h4>
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${rankBadge.color}`}>
                        {rankBadge.text}
                      </span>
                      {ranking.isLowest && <TickIcon className="w-5 h-5 text-green-500" />}
                      {ranking.isHighest && <CautionIcon className="w-5 h-5 text-red-500" />}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{ranking.itemDescription}</p>
                    <div className={`text-sm font-medium ${performanceColor}`}>
                      {performanceMessage}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{formatPrice(ranking.quotedPrice)}</div>
                    <div className="text-sm text-gray-500">Your Price</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Rank</div>
                    <div className="font-semibold">
                      {ranking.rank} of {ranking.totalSuppliers}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Average Price</div>
                    <div className="font-semibold">{formatPrice(ranking.averagePrice)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Variance from Avg</div>
                    <div className={`font-semibold ${
                      ranking.varianceFromAverage <= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatVariance(ranking.varianceFromAverage)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Competitors</div>
                    <div className="font-semibold">{ranking.totalSuppliers - 1} others</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>Your Position</span>
                    <span>{ranking.rank} of {ranking.totalSuppliers}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        ranking.rank === 1 ? 'bg-green-500' :
                        ranking.rank <= 3 ? 'bg-blue-500' :
                        ranking.rank <= ranking.totalSuppliers / 2 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${((ranking.totalSuppliers - ranking.rank + 1) / ranking.totalSuppliers) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRankings.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="text-gray-500 text-lg">No rankings found</div>
          <div className="text-gray-400 text-sm mt-2">Try adjusting your filters</div>
        </div>
      )}
    </div>
  );
};

export default SupplierRankingView;
