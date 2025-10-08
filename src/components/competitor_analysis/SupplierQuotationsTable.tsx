import React, { useState, useMemo } from 'react';
import { ISupplierQuotation, ICompetitorAnalysisFilters } from '../../types/competitorAnalysisTypes';
import SelectField from '../basic_components/SelectField';
import { TickIcon, CrossIcon, CautionIcon } from '../../utils/Icons';

interface SupplierQuotationsTableProps {
  quotations: ISupplierQuotation[];
  filters: ICompetitorAnalysisFilters;
  onFiltersChange: (filters: ICompetitorAnalysisFilters) => void;
  supplierOptions: { label: string; value: string }[];
  itemOptions: { label: string; value: string }[];
  categoryOptions: { label: string; value: string }[];
}

const SupplierQuotationsTable: React.FC<SupplierQuotationsTableProps> = ({
  quotations,
  filters,
  onFiltersChange,
  supplierOptions,
  itemOptions,
  categoryOptions,
}) => {
  const [sortField, setSortField] = useState<keyof ISupplierQuotation>('submissionTime');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filter and sort quotations
  const filteredAndSortedQuotations = useMemo(() => {
    let filtered = quotations.filter(quotation => {
      if (filters.suppliers && filters.suppliers.length > 0) {
        if (!filters.suppliers.includes(quotation.supplierId)) return false;
      }
      if (filters.items && filters.items.length > 0) {
        if (!filters.items.includes(quotation.itemCode)) return false;
      }
      if (filters.categories && filters.categories.length > 0) {
        if (!quotation.itemCategory || !filters.categories.includes(quotation.itemCategory)) return false;
      }
      if (filters.priceRange) {
        if (quotation.quotedPrice < filters.priceRange.min || quotation.quotedPrice > filters.priceRange.max) return false;
      }
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(quotation.status)) return false;
      }
      return true;
    });

    // Sort quotations
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

    return filtered;
  }, [quotations, filters, sortField, sortDirection]);

  const handleSort = (field: keyof ISupplierQuotation) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <TickIcon className="w-4 h-4 text-green-500" />;
      case 'Withdrawn':
        return <CrossIcon className="w-4 h-4 text-red-500" />;
      case 'Expired':
        return <CautionIcon className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">Supplier Quotations Consolidation</h3>
        <p className="text-sm text-gray-600 mt-1">
          {filteredAndSortedQuotations.length} quotations found
        </p>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Suppliers</label>
            <SelectField
              options={supplierOptions}
              value={filters.suppliers?.[0] || ''}
              onChange={(value: string) => onFiltersChange({ ...filters, suppliers: value ? [value] : [] })}
              placeholder="All Suppliers"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
            <SelectField
              options={itemOptions}
              value={filters.items?.[0] || ''}
              onChange={(value: string) => onFiltersChange({ ...filters, items: value ? [value] : [] })}
              placeholder="All Items"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
            <SelectField
              options={categoryOptions}
              value={filters.categories?.[0] || ''}
              onChange={(value: string) => onFiltersChange({ ...filters, categories: value ? [value] : [] })}
              placeholder="All Categories"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <SelectField
              options={[
                { label: 'All Status', value: '' },
                { label: 'Active', value: 'Active' },
                { label: 'Withdrawn', value: 'Withdrawn' },
                { label: 'Expired', value: 'Expired' },
              ]}
              value={filters.status?.[0] || ''}
              onChange={(value: string) => onFiltersChange({ ...filters, status: value ? [value as any] : [] })}
              placeholder="All Status"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('itemCode')}
              >
                <div className="flex items-center space-x-1">
                  <span>Item Code</span>
                  {sortField === 'itemCode' && (
                    <span className="text-blue-500">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('itemDescription')}
              >
                <div className="flex items-center space-x-1">
                  <span>Item Description</span>
                  {sortField === 'itemDescription' && (
                    <span className="text-blue-500">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('supplierName')}
              >
                <div className="flex items-center space-x-1">
                  <span>Supplier Name</span>
                  {sortField === 'supplierName' && (
                    <span className="text-blue-500">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('quotedPrice')}
              >
                <div className="flex items-center space-x-1">
                  <span>Quoted Price</span>
                  {sortField === 'quotedPrice' && (
                    <span className="text-blue-500">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('submissionTime')}
              >
                <div className="flex items-center space-x-1">
                  <span>Submission Time</span>
                  {sortField === 'submissionTime' && (
                    <span className="text-blue-500">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedQuotations.map((quotation) => (
              <tr key={quotation.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {quotation.itemCode}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                  {quotation.itemDescription}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {quotation.supplierName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {formatPrice(quotation.quotedPrice, quotation.currency)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDateTime(quotation.submissionTime)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(quotation.status)}
                    <span className="text-sm text-gray-600">{quotation.status}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedQuotations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No quotations found</div>
          <div className="text-gray-400 text-sm mt-2">Try adjusting your filters</div>
        </div>
      )}
    </div>
  );
};

export default SupplierQuotationsTable;
