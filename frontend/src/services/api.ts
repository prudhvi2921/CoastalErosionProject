import {
  CoastalSegmentGeo,
  DashboardSummary,
  DatasetDetail,
  DatasetSummary,
  PredictionResult,
  RiskInfo,
  RiskThresholds,
  SavedReport,
} from '../types';

const API_BASE = '/api/v1';

export const api = {
  // Dashboard
  async getDashboardSummary(): Promise<DashboardSummary> {
    const res = await fetch(`${API_BASE}/dashboard/summary`);
    if (!res.ok) throw new Error(`Dashboard API error: ${res.statusText}`);
    return res.json();
  },

  // Segments
  async getSegments(): Promise<CoastalSegmentGeo[]> {
    const res = await fetch(`${API_BASE}/segments`);
    if (!res.ok) throw new Error(`Segments API error: ${res.statusText}`);
    return res.json();
  },

  // Datasets
  async getDatasets(): Promise<DatasetSummary[]> {
    const res = await fetch(`${API_BASE}/datasets`);
    if (!res.ok) throw new Error(`Datasets API error: ${res.statusText}`);
    return res.json();
  },

  async getDataset(id: string): Promise<DatasetDetail> {
    const res = await fetch(`${API_BASE}/datasets/${id}`);
    if (!res.ok) throw new Error(`Dataset detail API error: ${res.statusText}`);
    return res.json();
  },

  async uploadDataset(file: File, name?: string): Promise<DatasetDetail> {
    const formData = new FormData();
    formData.append('file', file);
    if (name) formData.append('name', name);

    const res = await fetch(`${API_BASE}/datasets/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || err.error || 'Failed to upload dataset');
    }
    return res.json();
  },

  async loadSampleDataset(sampleType: 'default' | 'high_risk' | 'moderate_risk' | 'low_risk' = 'default'): Promise<DatasetDetail> {
    const res = await fetch(`${API_BASE}/datasets/sample?type=${sampleType}`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || err.error || 'Failed to load sample dataset');
    }
    return res.json();
  },

  async preprocessDataset(
    datasetId: string,
    params: {
      time_col: string;
      target_col: string;
      location_col?: string;
      location_val?: string;
    }
  ): Promise<DatasetDetail> {
    const res = await fetch(`${API_BASE}/datasets/${datasetId}/preprocess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || err.error || 'Preprocessing failed');
    }
    return res.json();
  },

  // Predictions & Trend Forecasting
  async runPrediction(params: {
    dataset_id?: string;
    csv_data?: string;
    segment: string;
    time_col?: string;
    target_col?: string;
    location_col?: string;
    horizon: number;
    target_type?: string;
  }): Promise<PredictionResult> {
    const res = await fetch(`${API_BASE}/predictions/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || err.error || 'Prediction run failed');
    }
    return res.json();
  },

  async getPredictionRuns(): Promise<PredictionResult[]> {
    const res = await fetch(`${API_BASE}/predictions`);
    if (!res.ok) throw new Error(`Predictions API error: ${res.statusText}`);
    return res.json();
  },

  async getPredictionRun(id: string): Promise<PredictionResult> {
    const res = await fetch(`${API_BASE}/predictions/${id}`);
    if (!res.ok) throw new Error(`Prediction run detail error: ${res.statusText}`);
    return res.json();
  },

  // Risk Assessment Engine
  async assessRisk(params: {
    erosion_rate: number;
    projected_retreat_m?: number;
    thresholds?: RiskThresholds;
  }): Promise<RiskInfo> {
    const res = await fetch(`${API_BASE}/risk/assess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || err.error || 'Risk assessment failed');
    }
    return res.json();
  },

  // Threshold Configuration
  async getThresholds(): Promise<RiskThresholds> {
    const res = await fetch(`${API_BASE}/config/thresholds`);
    if (!res.ok) throw new Error(`Threshold config API error: ${res.statusText}`);
    return res.json();
  },

  async updateThresholds(thresholds: RiskThresholds): Promise<RiskThresholds> {
    const res = await fetch(`${API_BASE}/config/thresholds`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(thresholds),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || err.error || 'Failed to update thresholds');
    }
    return res.json();
  },

  // Reports
  async getReports(): Promise<SavedReport[]> {
    const res = await fetch(`${API_BASE}/reports`);
    if (!res.ok) throw new Error(`Reports API error: ${res.statusText}`);
    return res.json();
  },

  getPdfReportUrl(runId: string): string {
    return `${API_BASE}/reports/${runId}/pdf`;
  },

  getCsvReportUrl(runId: string): string {
    return `${API_BASE}/reports/${runId}/csv`;
  },
};
