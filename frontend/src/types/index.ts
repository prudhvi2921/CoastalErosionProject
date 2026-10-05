export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';

export interface RiskThresholds {
  low_max: number;
  moderate_max: number;
  high_max: number;
}

export interface RiskInfo {
  level: RiskLevel;
  description: string;
  color: string;
  action_priority: string;
  recommendations: string[];
  rate_used?: number;
  retreat_m?: number | null;
  thresholds?: RiskThresholds;
}

export interface ColumnMapping {
  timeColumn: string;
  locationColumn?: string;
  targetColumn: string;
}

export interface ValidationError {
  row: number;
  column: string;
  value: any;
  message: string;
}

export interface DatasetSummary {
  id: string;
  name: string;
  filename: string;
  upload_time: string;
  row_count: number;
  valid_row_count: number;
  rejected_row_count: number;
  segments: string[];
  status: 'UPLOADED' | 'PREPROCESSED' | 'ANALYZED';
}

export interface DatasetDetail extends DatasetSummary {
  column_mapping: ColumnMapping;
  raw_data: Record<string, any>[];
  cleaned_data: Record<string, any>[];
  validation_errors: ValidationError[];
}

export interface HistoryPoint {
  Year?: number;
  ShorelinePosition_m?: number;
  DeltaChange_m?: number;
  RateOfChange_m_per_yr?: number;
  StandardTime: number;
  StandardTarget: number;
  [key: string]: any;
}

export interface FuturePoint {
  Year: number;
  PredictedPosition_m: number;
  StandardTime: number;
  StandardTarget: number;
  [key: string]: any;
}

export interface PredictionResult {
  id?: string;
  dataset_id?: string;
  selectedTimeColumn?: string;
  selectedTargetColumn?: string;
  selectedLocationColumn?: string;
  targetType?: string;
  segment: string;
  availableSegments: string[];
  recordCount: number;
  droppedInvalidRows?: number;
  droppedDuplicateRows?: number;
  firstYear: number;
  lastYear: number;
  targetYear: number;
  horizonYears: number;
  initialPositionM: number;
  lastHistoricalPositionM: number;
  totalHistoricalRetreatM: number;
  slope: number;
  intercept: number;
  equation: string;
  rSquared: number;
  erosionRateMPerYr: number;
  predictedPositionM: number;
  projectedRetreatM?: number;
  riskLevel: RiskLevel;
  riskDescription: string;
  riskColor: string;
  riskActionPriority: string;
  riskRecommendations: string[];
  history: HistoryPoint[];
  future: FuturePoint[];
  trendChartUrl?: string;
  erosionRateChartUrl?: string;
  createdAt?: string;
}

export interface CoastalSegmentGeo {
  name: string;
  latitude: number;
  longitude: number;
  baselineYear: number;
  latestYear: number;
  baselinePosition: number;
  latestPosition: number;
  erosionRate: number;
  riskLevel: RiskLevel;
  riskColor: string;
  actionPriority: string;
  recordsCount: number;
}

export interface DashboardSummary {
  totalMonitoredSegments: number;
  highRiskSegmentsCount: number;
  averageErosionRate: number;
  maxErosionRate: number;
  totalSurveysCount: number;
  latestRun: PredictionResult | null;
  riskDistribution: {
    name: string;
    level: RiskLevel;
    count: number;
    color: string;
  }[];
  segments: CoastalSegmentGeo[];
}

export interface SavedReport {
  id: string;
  run_id: string;
  dataset_id?: string;
  segment_name: string;
  title: string;
  summary_notes?: string;
  pdf_path?: string;
  created_at: string;
}
