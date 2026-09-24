export interface TransactionRecord {
  id: number | string;
  month: string;
  town: string;
  flatType: string;
  block: string;
  streetName: string;
  storeyRange: string;
  floorAreaSqm: number;
  floorAreaSqft: number;
  flatModel: string;
  leaseCommenceDate: string;
  remainingLease: string;
  remainingLeaseYears: number;
  resalePrice: number;
  pricePerSqm: number;
}

export interface MonthlyTrend {
  month: string;
  count: number;
  avgPrice: number;
  medianPrice: number;
  minPrice: number;
  maxPrice: number;
  avgFloorAreaSqm: number;
  avgPsm: number;
}

export interface LeaseBreakdownItem {
  bracket: string;
  count: number;
  percentage: number;
  avgPrice: number;
  avgAreaSqm: number;
}

export interface AreaBreakdownItem {
  bracket: string;
  count: number;
  percentage: number;
  avgPrice: number;
}

export interface BudgetAnalysis {
  maxBudget: number | null;
  unitsInBudget: number;
  totalUnitsSampled: number;
  percentageInBudget: number;
  avgFloorAreaSqm: number;
  medianFloorAreaSqm: number;
  avgRemainingLeaseYears: number;
  leaseBreakdown: LeaseBreakdownItem[];
  areaBreakdown: AreaBreakdownItem[];
}

export interface MarketSummary {
  totalTransactions: number;
  totalMarketTransactions: number;
  marketAvgPrice: number;
  marketMedianPrice: number;
  filteredAvgPrice: number;
  filteredMedianPrice: number;
  minPrice: number;
  maxPrice: number;
  avgFloorAreaSqm: number;
  avgRemainingLeaseYears: number;
}

export interface FlatsApiResponse {
  filters: {
    town: string;
    flatType: string;
    maxBudget: number | null;
    limit: number;
  };
  totalMatches: number;
  records: TransactionRecord[];
  monthlyTrends: MonthlyTrend[];
  budgetAnalysis: BudgetAnalysis;
  summary: MarketSummary;
  noMatchMessage: string | null;
  error?: string;
  upstreamStatus?: number;
  upstreamReason?: string;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'checking';
  backend: string;
  latencyMs?: number;
  upstream?: {
    source: string;
    datasetId?: string;
    status: number;
    reachable: boolean;
    reason?: string;
  };
  timestamp?: string;
}
