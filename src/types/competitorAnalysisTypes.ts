// Competitor Analysis and Pricing Comparison Types

export interface ISupplierQuotation {
  id: string;
  itemCode: string;
  itemDescription: string;
  supplierId: string;
  supplierName: string;
  quotedPrice: number;
  currency: string;
  submissionTime: string;
  status: 'Active' | 'Withdrawn' | 'Expired';
  itemCategory?: string;
  unitOfMeasure?: string;
  validityPeriod?: number; // in days
  termsAndConditions?: string;
}

export interface IPriceComparison {
  itemCode: string;
  itemDescription: string;
  itemCategory?: string;
  quotations: ISupplierQuotation[];
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
  variance: number; // percentage difference between lowest and highest
  totalSuppliers: number;
}

export interface ISupplierRanking {
  supplierId: string;
  supplierName: string;
  itemCode: string;
  itemDescription: string;
  quotedPrice: number;
  rank: number;
  totalSuppliers: number;
  isLowest: boolean;
  isHighest: boolean;
  averagePrice: number;
  varianceFromAverage: number; // percentage difference from average
}

export interface IAnalyticsData {
  itemCode: string;
  itemDescription: string;
  priceData: {
    supplier: string;
    price: number;
    submissionTime: string;
  }[];
  summary: {
    lowest: number;
    highest: number;
    average: number;
    variance: number;
    totalSuppliers: number;
  };
}

export interface IAnalyticsFilters {
  supplierIds?: string[];
  itemCategories?: string[];
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface ICompetitorAnalysisFilters {
  suppliers?: string[];
  items?: string[];
  categories?: string[];
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  priceRange?: {
    min: number;
    max: number;
  };
  status?: ('Active' | 'Withdrawn' | 'Expired')[];
}

export interface IPriceTrendData {
  itemCode: string;
  itemDescription: string;
  trends: {
    date: string;
    lowestPrice: number;
    highestPrice: number;
    averagePrice: number;
    totalSubmissions: number;
  }[];
}

export interface ICompetitorAnalysisSummary {
  totalItems: number;
  totalSuppliers: number;
  totalQuotations: number;
  averageVariance: number;
  mostCompetitiveItem: {
    itemCode: string;
    itemDescription: string;
    variance: number;
  };
  leastCompetitiveItem: {
    itemCode: string;
    itemDescription: string;
    variance: number;
  };
}

export interface IRealTimeUpdate {
  type: 'quotation_submitted' | 'quotation_updated' | 'quotation_withdrawn';
  itemCode: string;
  supplierId: string;
  newRank?: number;
  timestamp: string;
}

export interface IChartData {
  name: string;
  value: number;
  color?: string;
}

export interface IBarChartData {
  item: string;
  suppliers: {
    [supplierName: string]: number;
  };
  lowest: number;
  highest: number;
  average: number;
}

export interface ILineChartData {
  date: string;
  lowest: number;
  highest: number;
  average: number;
  submissions: number;
}

// Enhanced types for tender-wide analysis
export interface ITenderQuotation {
  id: string;
  tenderId: string;
  tenderName: string;
  itemCode: string;
  itemDescription: string;
  itemCategory?: string;
  unitOfMeasure?: string;
  supplierId: string;
  supplierName: string;
  quotedPrice: number;
  currency: string;
  submissionTime: string;
  status: 'Active' | 'Withdrawn' | 'Expired';
  validityPeriod?: number;
  termsAndConditions?: string;
}

export interface ITenderMatrix {
  tenderId: string;
  tenderName: string;
  items: {
    itemCode: string;
    itemDescription: string;
    itemCategory?: string;
    unitOfMeasure?: string;
    quotations: {
      [supplierId: string]: {
        price: number;
        supplierName: string;
        submissionTime: string;
        status: string;
        isLowest: boolean;
        isHighest: boolean;
      };
    };
    summary: {
      lowest: number;
      highest: number;
      average: number;
      variance: number;
      totalSuppliers: number;
    };
  }[];
  suppliers: {
    supplierId: string;
    supplierName: string;
    totalQuotedValue: number;
    numberOfLowestQuotes: number;
    averagePrice: number;
    itemsQuoted: number;
    overallRank: number;
  }[];
  tenderSummary: {
    totalItems: number;
    totalSuppliers: number;
    totalQuotations: number;
    averageVariance: number;
    mostCompetitiveItem: string;
    leastCompetitiveItem: string;
  };
}

export interface ISupplierTenderSummary {
  supplierId: string;
  supplierName: string;
  tenderId: string;
  tenderName: string;
  itemsRanked: {
    itemCode: string;
    itemDescription: string;
    quotedPrice: number;
    rank: number;
    totalSuppliers: number;
    isLowest: boolean;
    isHighest: boolean;
    averagePrice: number;
    varianceFromAverage: number;
  }[];
  overallSummary: {
    totalItemsQuoted: number;
    numberOfLowestQuotes: number;
    averageRank: number;
    totalQuotedValue: number;
    lowestPossibleValue: number;
    savingsOpportunity: number;
    overallPosition: 'Leading' | 'Competitive' | 'Needs Improvement';
  };
}

export interface ITenderAnalytics {
  tenderId: string;
  tenderName: string;
  supplierPerformance: {
    supplierId: string;
    supplierName: string;
    totalValue: number;
    lowestQuotes: number;
    averageRank: number;
    marketShare: number;
  }[];
  itemAnalysis: {
    itemCode: string;
    itemDescription: string;
    variance: number;
    competitiveness: 'High' | 'Medium' | 'Low';
    averagePrice: number;
    priceRange: number;
  }[];
  tenderMetrics: {
    totalValue: number;
    averageVariance: number;
    mostCompetitiveItem: string;
    leastCompetitiveItem: string;
    marketConcentration: number;
  };
}

export interface ITenderFilters {
  tenderIds?: string[];
  suppliers?: string[];
  items?: string[];
  categories?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  status?: ('Active' | 'Withdrawn' | 'Expired')[];
}
