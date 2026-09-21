import React, { useState, useEffect, useMemo } from 'react';
import CommonTitleCard from '../../components/basic_components/CommonTitleCard';
import SupplierQuotationsTable from '../../components/competitor_analysis/SupplierQuotationsTable';
import PriceComparisonGrid from '../../components/competitor_analysis/PriceComparisonGrid';
import AnalyticsDashboard from '../../components/competitor_analysis/AnalyticsDashboard';
// import SupplierRankingView from '../../components/competitor_analysis/SupplierRankingView';
import TenderMatrixView from '../../components/competitor_analysis/TenderMatrixView';
import TenderAnalyticsDashboard from '../../components/competitor_analysis/TenderAnalyticsDashboard';
// import SupplierTenderSummary from '../../components/competitor_analysis/SupplierTenderSummary';
import {
  ISupplierQuotation,
  IPriceComparison,
  IAnalyticsData,
  IPriceTrendData,
  // ISupplierRanking,
  ICompetitorAnalysisFilters,
  IAnalyticsFilters,
  // ICompetitorAnalysisSummary,
  ITenderMatrix,
  ITenderAnalytics,
  // ISupplierTenderSummary,
  ITenderFilters,
} from '../../types/competitorAnalysisTypes';
import { AnalysisIconMain } from '../../utils/Icons';

const CompetitorAnalysisPage: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState<'quotations' | 'comparison' | 'analytics' | 'tender-matrix' | 'tender-analytics'>('quotations');
  // const [userRole, setUserRole] = useState<'buyer' | 'supplier'>('buyer');
  const [viewMode, setViewMode] = useState<'item-wise' | 'tender-wide'>('item-wise');
  const [quotations, setQuotations] = useState<ISupplierQuotation[]>([]);
  const [priceComparisons, setPriceComparisons] = useState<IPriceComparison[]>([]);
  const [analyticsData, setAnalyticsData] = useState<IAnalyticsData[]>([]);
  const [priceTrends] = useState<IPriceTrendData[]>([]);
  // const [supplierRankings, setSupplierRankings] = useState<ISupplierRanking[]>([]);
  // const [summary, setSummary] = useState<ICompetitorAnalysisSummary | null>(null);
  const [filters, setFilters] = useState<ICompetitorAnalysisFilters>({});
  const [analyticsFilters, setAnalyticsFilters] = useState<IAnalyticsFilters>({});
  const [tenderMatrix, setTenderMatrix] = useState<ITenderMatrix | null>(null);
  const [tenderAnalytics, setTenderAnalytics] = useState<ITenderAnalytics | null>(null);
  // const [supplierTenderSummary, setSupplierTenderSummary] = useState<ISupplierTenderSummary | null>(null);
  const [tenderFilters, setTenderFilters] = useState<ITenderFilters>({});
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const loadMockData = async () => {
      setLoading(true);
      
      // Mock quotations data
      const mockQuotations: ISupplierQuotation[] = [
        {
          id: '1',
          itemCode: 'MED-001',
          itemDescription: 'Paracetamol 500mg Tablets',
          supplierId: 'SUP-001',
          supplierName: 'Oman Pharma Supplies',
          quotedPrice: 250.00,
          currency: 'OMR',
          submissionTime: '2024-01-15T10:30:00Z',
          status: 'Active',
          itemCategory: 'Medicines',
          unitOfMeasure: 'packs',
          validityPeriod: 30,
        },
        {
          id: '2',
          itemCode: 'MED-001',
          itemDescription: 'Paracetamol 500mg Tablets',
          supplierId: 'SUP-002',
          supplierName: 'Gulf Medical Trading',
          quotedPrice: 275.00,
          currency: 'OMR',
          submissionTime: '2024-01-15T11:15:00Z',
          status: 'Active',
          itemCategory: 'Medicines',
          unitOfMeasure: 'packs',
          validityPeriod: 30,
        },
        {
          id: '3',
          itemCode: 'MED-001',
          itemDescription: 'Paracetamol 500mg Tablets',
          supplierId: 'SUP-003',
          supplierName: 'Muscat Healthcare Distribution',
          quotedPrice: 240.00,
          currency: 'OMR',
          submissionTime: '2024-01-15T14:20:00Z',
          status: 'Active',
          itemCategory: 'Medicines',
          unitOfMeasure: 'packs',
          validityPeriod: 30,
        },
        {
          id: '4',
          itemCode: 'MED-002',
          itemDescription: 'Sterile Syringes 5ml',
          supplierId: 'SUP-001',
          supplierName: 'Oman Pharma Supplies',
          quotedPrice: 85.00,
          currency: 'OMR',
          submissionTime: '2024-01-16T09:45:00Z',
          status: 'Active',
          itemCategory: 'Medical Consumables',
          unitOfMeasure: 'boxes',
          validityPeriod: 30,
        },
        {
          id: '5',
          itemCode: 'MED-002',
          itemDescription: 'Sterile Syringes 5ml',
          supplierId: 'SUP-004',
          supplierName: 'Salalah Clinical Supplies',
          quotedPrice: 92.00,
          currency: 'OMR',
          submissionTime: '2024-01-16T10:30:00Z',
          status: 'Active',
          itemCategory: 'Medical Consumables',
          unitOfMeasure: 'boxes',
          validityPeriod: 30,
        },
      ];

      setQuotations(mockQuotations);

      // Generate price comparisons
      const itemGroups = mockQuotations.reduce((acc, quotation) => {
        if (!acc[quotation.itemCode]) {
          acc[quotation.itemCode] = [];
        }
        acc[quotation.itemCode].push(quotation);
        return acc;
      }, {} as { [key: string]: ISupplierQuotation[] });

      const comparisons: IPriceComparison[] = Object.entries(itemGroups).map(([itemCode, quotes]) => {
        const prices = quotes.map(q => q.quotedPrice);
        const lowest = Math.min(...prices);
        const highest = Math.max(...prices);
        const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        const variance = ((highest - lowest) / lowest) * 100;

        return {
          itemCode,
          itemDescription: quotes[0].itemDescription,
          itemCategory: quotes[0].itemCategory,
          quotations: quotes,
          lowestPrice: lowest,
          highestPrice: highest,
          averagePrice: average,
          variance,
          totalSuppliers: quotes.length,
        };
      });

      setPriceComparisons(comparisons);

      // Generate analytics data
      const analytics: IAnalyticsData[] = comparisons.map(comp => ({
        itemCode: comp.itemCode,
        itemDescription: comp.itemDescription,
        priceData: comp.quotations.map(q => ({
          supplier: q.supplierName,
          price: q.quotedPrice,
          submissionTime: q.submissionTime,
        })),
        summary: {
          lowest: comp.lowestPrice,
          highest: comp.highestPrice,
          average: comp.averagePrice,
          variance: comp.variance,
          totalSuppliers: comp.totalSuppliers,
        },
      }));

      setAnalyticsData(analytics);

      // Generate supplier rankings (removed - supplier functionality disabled)
      // const rankings: ISupplierRanking[] = mockQuotations.map(quotation => {
      //   const itemQuotes = itemGroups[quotation.itemCode];
      //   const sortedQuotes = itemQuotes.sort((a, b) => a.quotedPrice - b.quotedPrice);
      //   const rank = sortedQuotes.findIndex(q => q.id === quotation.id) + 1;
      //   const average = itemQuotes.reduce((sum, q) => sum + q.quotedPrice, 0) / itemQuotes.length;
      //   const varianceFromAverage = ((quotation.quotedPrice - average) / average) * 100;

      //   return {
      //     supplierId: quotation.supplierId,
      //     supplierName: quotation.supplierName,
      //     itemCode: quotation.itemCode,
      //     itemDescription: quotation.itemDescription,
      //     quotedPrice: quotation.quotedPrice,
      //     rank,
      //     totalSuppliers: itemQuotes.length,
      //     isLowest: rank === 1,
      //     isHighest: rank === itemQuotes.length,
      //     averagePrice: average,
      //     varianceFromAverage,
      //   };
      // });

      // setSupplierRankings(rankings);

      // Generate summary
      // const totalItems = comparisons.length;
      // const totalSuppliers = new Set(mockQuotations.map(q => q.supplierId)).size;
      // const totalQuotations = mockQuotations.length;
      const averageVariance = comparisons.reduce((sum, comp) => sum + comp.variance, 0) / comparisons.length;
      const mostCompetitive = comparisons.reduce((min, comp) => comp.variance < min.variance ? comp : min);
      const leastCompetitive = comparisons.reduce((max, comp) => comp.variance > max.variance ? comp : max);

      // setSummary({
      //   totalItems,
      //   totalSuppliers,
      //   totalQuotations,
      //   averageVariance,
      //   mostCompetitiveItem: {
      //     itemCode: mostCompetitive.itemCode,
      //     itemDescription: mostCompetitive.itemDescription,
      //     variance: mostCompetitive.variance,
      //   },
      //   leastCompetitiveItem: {
      //     itemCode: leastCompetitive.itemCode,
      //     itemDescription: leastCompetitive.itemDescription,
      //     variance: leastCompetitive.variance,
      //   },
      // });

      // Generate tender-wide data
      const tenderMatrixData: ITenderMatrix = {
        tenderId: 'TENDER-001',
        tenderName: 'Pharmaceutical Supplies Tender',
        items: comparisons.map(comp => ({
          itemCode: comp.itemCode,
          itemDescription: comp.itemDescription,
          itemCategory: comp.itemCategory,
          unitOfMeasure: comp.quotations[0]?.unitOfMeasure || 'packs',
          quotations: comp.quotations.reduce((acc, q) => {
            acc[q.supplierId] = {
              price: q.quotedPrice,
              supplierName: q.supplierName,
              submissionTime: q.submissionTime,
              status: q.status,
              isLowest: q.quotedPrice === comp.lowestPrice,
              isHighest: q.quotedPrice === comp.highestPrice,
            };
            return acc;
          }, {} as any),
          summary: {
            lowest: comp.lowestPrice,
            highest: comp.highestPrice,
            average: comp.averagePrice,
            variance: comp.variance,
            totalSuppliers: comp.totalSuppliers,
          },
        })),
        suppliers: mockQuotations.reduce((acc, q) => {
          const existing = acc.find(s => s.supplierId === q.supplierId);
          if (existing) {
            existing.totalQuotedValue += q.quotedPrice;
            existing.itemsQuoted += 1;
            existing.averagePrice = existing.totalQuotedValue / existing.itemsQuoted;
          } else {
            acc.push({
              supplierId: q.supplierId,
              supplierName: q.supplierName,
              totalQuotedValue: q.quotedPrice,
              numberOfLowestQuotes: 0,
              averagePrice: q.quotedPrice,
              itemsQuoted: 1,
              overallRank: 0,
            });
          }
          return acc;
        }, [] as any[]).map((supplier, index) => ({
          ...supplier,
          overallRank: index + 1,
        })),
        tenderSummary: {
          totalItems: comparisons.length,
          totalSuppliers: new Set(mockQuotations.map(q => q.supplierId)).size,
          totalQuotations: mockQuotations.length,
          averageVariance,
          mostCompetitiveItem: mostCompetitive.itemCode,
          leastCompetitiveItem: leastCompetitive.itemCode,
        },
      };

      setTenderMatrix(tenderMatrixData);

      // Generate tender analytics
      const tenderAnalyticsData: ITenderAnalytics = {
        tenderId: 'TENDER-001',
        tenderName: 'Pharmaceutical Supplies Tender',
        supplierPerformance: tenderMatrixData.suppliers.map(supplier => ({
          supplierId: supplier.supplierId,
          supplierName: supplier.supplierName,
          totalValue: supplier.totalQuotedValue,
          lowestQuotes: supplier.numberOfLowestQuotes,
          averageRank: supplier.overallRank,
          marketShare: (supplier.totalQuotedValue / tenderMatrixData.suppliers.reduce((sum, s) => sum + s.totalQuotedValue, 0)) * 100,
        })),
        itemAnalysis: comparisons.map(comp => ({
          itemCode: comp.itemCode,
          itemDescription: comp.itemDescription,
          variance: comp.variance,
          competitiveness: comp.variance <= 10 ? 'High' : comp.variance <= 25 ? 'Medium' : 'Low',
          averagePrice: comp.averagePrice,
          priceRange: comp.highestPrice - comp.lowestPrice,
        })),
        tenderMetrics: {
          totalValue: tenderMatrixData.suppliers.reduce((sum, s) => sum + s.totalQuotedValue, 0),
          averageVariance,
          mostCompetitiveItem: mostCompetitive.itemCode,
          leastCompetitiveItem: leastCompetitive.itemCode,
          marketConcentration: 75.5, // Mock value
        },
      };

      setTenderAnalytics(tenderAnalyticsData);

      // Generate supplier tender summary (removed - supplier functionality disabled)
      // const supplierTenderSummaryData: ISupplierTenderSummary = {
      //   supplierId: 'SUP-001',
      //   supplierName: 'Oman Pharma Supplies',
      //   tenderId: 'TENDER-001',
      //   tenderName: 'Pharmaceutical Supplies Tender',
      //   itemsRanked: rankings.filter(r => r.supplierId === 'SUP-001'),
      //   overallSummary: {
      //     totalItemsQuoted: rankings.filter(r => r.supplierId === 'SUP-001').length,
      //     numberOfLowestQuotes: rankings.filter(r => r.supplierId === 'SUP-001' && r.isLowest).length,
      //     averageRank: rankings.filter(r => r.supplierId === 'SUP-001').reduce((sum, r) => sum + r.rank, 0) / rankings.filter(r => r.supplierId === 'SUP-001').length,
      //     totalQuotedValue: rankings.filter(r => r.supplierId === 'SUP-001').reduce((sum, r) => sum + r.quotedPrice, 0),
      //     lowestPossibleValue: rankings.filter(r => r.supplierId === 'SUP-001').reduce((sum, r) => sum + r.averagePrice, 0),
      //     savingsOpportunity: 0,
      //     overallPosition: 'Leading' as const,
      //   },
      // };

      // setSupplierTenderSummary(supplierTenderSummaryData);

      setLoading(false);
    };

    loadMockData();
  }, []);

  // Generate options for filters
  const supplierOptions = useMemo(() => {
    const suppliers = [...new Set(quotations.map(q => ({ label: q.supplierName, value: q.supplierId })))];
    return [{ label: 'All Suppliers', value: '' }, ...suppliers];
  }, [quotations]);

  const itemOptions = useMemo(() => {
    const items = [...new Set(quotations.map(q => ({ label: q.itemCode, value: q.itemCode })))];
    return [{ label: 'All Products', value: '' }, ...items];
  }, [quotations]);

  const categoryOptions = useMemo(() => {
    const categories = [...new Set(quotations.map(q => q.itemCategory).filter(Boolean))];
    return [{ label: 'All Categories', value: '' }, ...categories.map(cat => ({ label: cat!, value: cat! }))];
  }, [quotations]);

  const getTabs = () => {
    if (viewMode === 'item-wise') {
      return [
        { id: 'quotations', label: 'Quotations' },
        { id: 'comparison', label: 'Price Comparison'},
        { id: 'analytics', label: 'Analytics' },
      ];
    } else {
      return [
        { id: 'tender-matrix', label: 'Tender Matrix'},
        { id: 'tender-analytics', label: 'Tender Analytics' },
      ];
    }
  };

  const tabs = getTabs();

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-content">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <div className="mt-4 text-gray-600">Loading competitor analysis...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
       {/* Header */}
        <div>
          <CommonTitleCard />
        </div>
        
      <div className="admin-content">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 mb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-[#1365AA] rounded-xl flex items-center justify-center shadow-lg">
                <AnalysisIconMain/>
              </div>
              <div>
                <h1 className="text-heading-2">Competitor Analysis</h1>
                <p className="text-body-small text-muted mt-1">
                  Analyze supplier quotations and competitive positioning
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-md border border-blue-200">
                <span className="text-button text-accent">
                  {quotations.length} Total Quotations
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
          <div className="overflow-x-auto">
            <div className="flex min-w-max items-center">
              <button
                onClick={() => setViewMode('item-wise')}
                className={`relative px-6 py-3 text-button rounded-lg transition-all duration-200 ${
                  viewMode === 'item-wise'
                    ? "bg-gradient-to-r from-blue-400 to-[#1365AA] !text-white shadow-lg transform -translate-y-0.5"
                    : "text-muted hover:text-slate-900 hover:bg-gray-50"
                }`}
              >
                Product-wise Analysis
                {viewMode === 'item-wise' && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-emerald-500"></div>
                )}
              </button>
              <div className="w-px h-6 bg-gray-300 mx-4"></div>
              <button
                onClick={() => setViewMode('tender-wide')}
                className={`relative px-6 py-3 text-button rounded-lg transition-all duration-200 ${
                  viewMode === 'tender-wide'
                    ? "bg-gradient-to-r from-blue-400 to-[#1365AA] !text-white shadow-lg transform -translate-y-0.5"
                    : "text-muted hover:text-slate-900 hover:bg-gray-50"
                }`}
              >
                Tender-wide Analysis
                {viewMode === 'tender-wide' && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-emerald-500"></div>
                )}
              </button>
            </div>
          </div>
        </div>

      

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-4">
          <div className="border-b border-gray-200">
            <nav className="flex min-w-max space-x-8 overflow-x-auto px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 text-button transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {/* Product-wise Analysis Tabs */}
          {viewMode === 'item-wise' && (
            <>
              {activeTab === 'quotations' && (
                <SupplierQuotationsTable
                  quotations={quotations}
                  filters={filters}
                  onFiltersChange={setFilters}
                  supplierOptions={supplierOptions}
                  itemOptions={itemOptions}
                  categoryOptions={categoryOptions}
                />
              )}

              {activeTab === 'comparison' && (
                <PriceComparisonGrid priceComparisons={priceComparisons} />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsDashboard
                  analyticsData={analyticsData}
                  priceTrends={priceTrends}
                  filters={analyticsFilters}
                  onFiltersChange={setAnalyticsFilters}
                  supplierOptions={supplierOptions}
                  categoryOptions={categoryOptions}
                />
              )}

            </>
          )}

          {/* Tender-wide Analysis Tabs */}
          {viewMode === 'tender-wide' && (
            <>
              {activeTab === 'tender-matrix' && tenderMatrix && (
                <TenderMatrixView
                  tenderMatrix={tenderMatrix}
                  filters={tenderFilters}
                  onFiltersChange={setTenderFilters}
                  supplierOptions={supplierOptions}
                  itemOptions={itemOptions}
                  categoryOptions={categoryOptions}
                />
              )}

              {activeTab === 'tender-analytics' && tenderAnalytics && (
                <TenderAnalyticsDashboard
                  analytics={tenderAnalytics}
                  filters={tenderFilters}
                  onFiltersChange={setTenderFilters}
                  supplierOptions={supplierOptions}
                  categoryOptions={categoryOptions}
                />
              )}

            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompetitorAnalysisPage;
