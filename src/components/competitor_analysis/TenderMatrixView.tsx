import React, { useState, useMemo } from 'react';
import { ITenderMatrix, ITenderFilters } from '../../types/competitorAnalysisTypes';
import SelectField from '../basic_components/SelectField';

interface TenderMatrixViewProps {
  tenderMatrix: ITenderMatrix;
  filters: ITenderFilters;
  onFiltersChange: (filters: ITenderFilters) => void;
  supplierOptions: { label: string; value: string }[];
  itemOptions: { label: string; value: string }[];
  categoryOptions: { label: string; value: string }[];
}

const TenderMatrixView: React.FC<TenderMatrixViewProps> = ({
  tenderMatrix,
  filters,
  onFiltersChange,
  supplierOptions,
  itemOptions,
  categoryOptions,
}) => {
  const [sortBy, setSortBy] = useState<'item' | 'supplier' | 'value'>('item');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filteredItems = tenderMatrix.items.filter(item => {
      if (filters.items && filters.items.length > 0) {
        if (!filters.items.includes(item.itemCode)) return false;
      }
      if (filters.categories && filters.categories.length > 0) {
        if (!item.itemCategory || !filters.categories.includes(item.itemCategory)) return false;
      }
      return true;
    });

    let filteredSuppliers = tenderMatrix.suppliers.filter(supplier => {
      if (filters.suppliers && filters.suppliers.length > 0) {
        if (!filters.suppliers.includes(supplier.supplierId)) return false;
      }
      return true;
    });

    // Sort items
    filteredItems.sort((a, b) => {
      if (sortBy === 'item') {
        return sortDirection === 'asc' 
          ? a.itemCode.localeCompare(b.itemCode)
          : b.itemCode.localeCompare(a.itemCode);
      }
      return 0;
    });

    // Sort suppliers
    filteredSuppliers.sort((a, b) => {
      if (sortBy === 'supplier') {
        return sortDirection === 'asc' 
          ? a.supplierName.localeCompare(b.supplierName)
          : b.supplierName.localeCompare(a.supplierName);
      }
      if (sortBy === 'value') {
        return sortDirection === 'asc' 
          ? a.totalQuotedValue - b.totalQuotedValue
          : b.totalQuotedValue - a.totalQuotedValue;
      }
      return 0;
    });

    return { items: filteredItems, suppliers: filteredSuppliers };
  }, [tenderMatrix, filters, sortBy, sortDirection]);

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatVariance = (variance: number) => {
    return `${variance > 0 ? '+' : ''}${variance.toFixed(1)}%`;
  };

  const getPriceColor = (isLowest: boolean, isHighest: boolean) => {
    if (isLowest) return 'text-green-600 bg-green-50 border-green-200';
    if (isHighest) return 'text-red-600 bg-red-50 border-red-200';
    return 'text-gray-700 bg-gray-50 border-gray-200';
  };

  const getVarianceColor = (variance: number) => {
    if (variance <= 10) return 'text-green-600';
    if (variance <= 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleSort = (field: 'item' | 'supplier' | 'value') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Tender-Wide Price Matrix</h3>
            <p className="text-sm text-gray-600 mt-1">
              {tenderMatrix.tenderName} - {filteredData.items.length} products, {filteredData.suppliers.length} suppliers
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Value</div>
              <div className="text-xl font-bold text-gray-900">
                {formatPrice(tenderMatrix.suppliers.reduce((sum, s) => sum + s.totalQuotedValue, 0))}
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Products</label>
            <SelectField
            id="itemOptions"
              options={itemOptions}
              value={filters.items?.[0] || ''}
              onChange={(value: string) => onFiltersChange({ ...filters, items: value ? [value] : [] })}
              placeholder="All Products"
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

      {/* Matrix Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('item')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Product</span>
                    {sortBy === 'item' && (
                      <span className="text-blue-500">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </th>
                {filteredData.suppliers.map((supplier) => (
                  <th
                    key={supplier.supplierId}
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]"
                  >
                    <div className="flex flex-col items-center">
                      <span className="truncate max-w-[100px]" title={supplier.supplierName}>
                        {supplier.supplierName}
                      </span>
                      <span className="text-xs text-gray-400">
                        {supplier.numberOfLowestQuotes} wins
                      </span>
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Summary
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.items.map((item) => (
                <tr key={item.itemCode} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.itemCode}</div>
                      <div className="text-xs text-gray-500 max-w-[200px] truncate" title={item.itemDescription}>
                        {item.itemDescription}
                      </div>
                      {item.itemCategory && (
                        <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {item.itemCategory}
                        </span>
                      )}
                    </div>
                  </td>
                  {filteredData.suppliers.map((supplier) => {
                    const quotation = item.quotations[supplier.supplierId];
                    return (
                      <td key={supplier.supplierId} className="px-4 py-4 text-center">
                        {quotation ? (
                          <div className={`inline-block px-3 py-2 rounded-lg border-2 ${getPriceColor(quotation.isLowest, quotation.isHighest)}`}>
                            <div className="text-sm font-semibold">
                              {formatPrice(quotation.price)}
                            </div>
                            {quotation.isLowest && (
                              <div className="text-xs font-bold text-green-600">LOWEST</div>
                            )}
                            {quotation.isHighest && (
                              <div className="text-xs font-bold text-red-600">HIGHEST</div>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm">-</div>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-4 text-center">
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">Low: {formatPrice(item.summary.lowest)}</div>
                      <div className="text-xs text-gray-500">High: {formatPrice(item.summary.highest)}</div>
                      <div className="text-xs text-gray-500">Avg: {formatPrice(item.summary.average)}</div>
                      <div className={`text-xs font-semibold ${getVarianceColor(item.summary.variance)}`}>
                        {formatVariance(item.summary.variance)}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Summary Row */}
            <tfoot className="bg-gray-50">
              <tr>
                <td className="px-4 py-4 font-semibold text-gray-900">
                  <div className="text-sm">Tender Summary</div>
                </td>
                {filteredData.suppliers.map((supplier) => (
                  <td key={supplier.supplierId} className="px-4 py-4 text-center">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatPrice(supplier.totalQuotedValue)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {supplier.numberOfLowestQuotes} wins
                      </div>
                      <div className="text-xs text-gray-500">
                        Rank #{supplier.overallRank}
                      </div>
                    </div>
                  </td>
                ))}
                <td className="px-4 py-4 text-center">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatPrice(tenderMatrix.suppliers.reduce((sum, s) => sum + s.totalQuotedValue, 0))}
                    </div>
                    <div className="text-xs text-gray-500">
                      {tenderMatrix.tenderSummary.totalItems} products
                    </div>
                    <div className="text-xs text-gray-500">
                      {tenderMatrix.tenderSummary.totalSuppliers} suppliers
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Supplier Performance Summary */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Supplier Performance Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredData.suppliers.map((supplier) => (
            <div key={supplier.supplierId} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-gray-900 truncate" title={supplier.supplierName}>
                  {supplier.supplierName}
                </h5>
                <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  #{supplier.overallRank}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Value:</span>
                  <span className="font-semibold">{formatPrice(supplier.totalQuotedValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Lowest Quotes:</span>
                  <span className="font-semibold text-green-600">{supplier.numberOfLowestQuotes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Products Quoted:</span>
                  <span className="font-semibold">{supplier.itemsQuoted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Avg Price:</span>
                  <span className="font-semibold">{formatPrice(supplier.averagePrice)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TenderMatrixView;
