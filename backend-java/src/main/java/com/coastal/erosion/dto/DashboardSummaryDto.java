package com.coastal.erosion.dto;

import java.util.List;
import java.util.Map;

public class DashboardSummaryDto {
    private int totalMonitoredSegments;
    private int highRiskSegmentsCount;
    private double averageErosionRate;
    private double maxErosionRate;
    private int totalSurveysCount;
    private PredictionResponseDto latestRun;
    private List<Map<String, Object>> riskDistribution;
    private List<Map<String, Object>> segments;

    public DashboardSummaryDto() {}

    public int getTotalMonitoredSegments() { return totalMonitoredSegments; }
    public void setTotalMonitoredSegments(int totalMonitoredSegments) { this.totalMonitoredSegments = totalMonitoredSegments; }

    public int getHighRiskSegmentsCount() { return highRiskSegmentsCount; }
    public void setHighRiskSegmentsCount(int highRiskSegmentsCount) { this.highRiskSegmentsCount = highRiskSegmentsCount; }

    public double getAverageErosionRate() { return averageErosionRate; }
    public void setAverageErosionRate(double averageErosionRate) { this.averageErosionRate = averageErosionRate; }

    public double getMaxErosionRate() { return maxErosionRate; }
    public void setMaxErosionRate(double maxErosionRate) { this.maxErosionRate = maxErosionRate; }

    public int getTotalSurveysCount() { return totalSurveysCount; }
    public void setTotalSurveysCount(int totalSurveysCount) { this.totalSurveysCount = totalSurveysCount; }

    public PredictionResponseDto getLatestRun() { return latestRun; }
    public void setLatestRun(PredictionResponseDto latestRun) { this.latestRun = latestRun; }

    public List<Map<String, Object>> getRiskDistribution() { return riskDistribution; }
    public void setRiskDistribution(List<Map<String, Object>> riskDistribution) { this.riskDistribution = riskDistribution; }

    public List<Map<String, Object>> getSegments() { return segments; }
    public void setSegments(List<Map<String, Object>> segments) { this.segments = segments; }
}
