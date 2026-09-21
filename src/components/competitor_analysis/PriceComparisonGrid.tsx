import React from 'react';
import { IPriceComparison } from '../../types/competitorAnalysisTypes';

interface PriceComparisonGridProps {
  priceComparisons: IPriceComparison[];
}

const PriceComparisonGrid: React.FC<PriceComparisonGridProps> = ({ priceComparisons }) => {
  const formatPrice = (price: number, currency: string = 'OMR') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatVariance = (variance: number) => {
    return `${variance > 0 ? '+' : ''}${variance.toFixed(1)}%`;
  };

  const getVarianceColor = (variance: number) => {
    if (variance <= 10) return 'text-green-600';
    if (variance <= 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <h3 className="text-heading-3">Price Comparison</h3>
        <p className="text-body text-muted mt-2">
          Side-by-side comparison of supplier quotations
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left text-table-header">
                Product Details
              </th>
              <th className="px-6 py-3 text-left text-table-header">
                Supplier
              </th>
              <th className="px-6 py-3 text-right text-table-header">
                Quoted Price
              </th>
              <th className="px-6 py-3 text-center text-table-header">
                Status
              </th>
              <th className="px-6 py-3 text-right text-table-header">
                Submission Time
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {priceComparisons.map((comparison) => (
              <React.Fragment key={comparison.itemCode}>
                {/* Product Header Row */}
                <tr className="bg-slate-50">
                  <td colSpan={5} className="px-6 py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-heading-4">{comparison.itemCode}</h4>
                        <p className="text-body-small text-slate-600 mt-1">{comparison.itemDescription}</p>
                        {comparison.itemCategory && (
                          <span className="inline-block mt-2 px-2 py-1 text-caption bg-blue-100 text-blue-800 rounded-full">
                            {comparison.itemCategory}
                          </span>
                        )}
                      </div>
                      <div className="text-right text-body-small text-slate-500">
                        <div>{comparison.totalSuppliers} suppliers</div>
                        <div className="mt-1">
                          <span className="text-emerald-600 font-semibold">
                            Low: {formatPrice(comparison.lowestPrice)}
                          </span>
                          {' | '}
                          <span className="text-red-600 font-semibold">
                            High: {formatPrice(comparison.highestPrice)}
                          </span>
                          {' | '}
                          <span className="text-slate-600">
                            Avg: {formatPrice(comparison.averagePrice)}
                          </span>
                          {' | '}
                          <span className={`font-semibold ${getVarianceColor(comparison.variance)}`}>
                            {formatVariance(comparison.variance)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
                
                {/* Supplier Quotations */}
                {comparison.quotations
                  .sort((a, b) => a.quotedPrice - b.quotedPrice)
                  .map((quotation) => (
                    <tr key={quotation.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-body text-slate-500">
                        {/* Empty for product details - already shown in header */}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-table-cell">
                            {quotation.supplierName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <span className={`text-table-cell ${
                            quotation.quotedPrice === comparison.lowestPrice
                              ? 'text-emerald-600'
                              : quotation.quotedPrice === comparison.highestPrice
                              ? 'text-red-600'
                              : 'text-slate-900'
                          }`}>
                            {formatPrice(quotation.quotedPrice, quotation.currency)}
                          </span>
                          {quotation.quotedPrice === comparison.lowestPrice && (
                            <span className="px-2 py-1 text-caption font-semibold text-emerald-600 bg-emerald-100 rounded-full">
                              LOWEST
                            </span>
                          )}
                          {quotation.quotedPrice === comparison.highestPrice && (
                            <span className="px-2 py-1 text-caption font-semibold text-red-600 bg-red-100 rounded-full">
                              HIGHEST
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex px-2 py-1 text-caption font-semibold rounded-full ${
                          quotation.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : quotation.status === 'Withdrawn'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {quotation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-body text-slate-500">
                        {new Date(quotation.submissionTime).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {priceComparisons.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-500 text-heading-4">No price comparisons available</div>
          <div className="text-slate-400 text-body mt-2">No quotations found for comparison</div>
        </div>
      )}
    </div>
  );
};

export default PriceComparisonGrid;
