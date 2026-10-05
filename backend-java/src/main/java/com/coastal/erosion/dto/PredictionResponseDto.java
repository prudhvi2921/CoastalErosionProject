package com.coastal.erosion.dto;

import java.util.List;
import java.util.Map;

public class PredictionResponseDto {
    private String id;
    private String datasetId;
    private String selectedTimeColumn;
    private String selectedTargetColumn;
    private String selectedLocationColumn;
    private String targetType;
    private String segment;
    private List<String> availableSegments;
    private int recordCount;
    private int firstYear;
    private int lastYear;
    private int targetYear;
    private int horizonYears;
    private double initialPositionM;
    private double lastHistoricalPositionM;
    private double totalHistoricalRetreatM;
    private double slope;
    private double intercept;
    private String equation;
    private double rSquared;
    private double erosionRateMPerYr;
    private double predictedPositionM;
    private double projectedRetreatM;
    private String riskLevel;
    private String riskDescription;
    private String riskColor;
    private String riskActionPriority;
    private List<String> riskRecommendations;
    private List<Map<String, Object>> history;
    private List<Map<String, Object>> future;
    private String trendChartUrl;
    private String erosionRateChartUrl;
    private String createdAt;

    public PredictionResponseDto() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDatasetId() { return datasetId; }
    public void setDatasetId(String datasetId) { this.datasetId = datasetId; }

    public String getSelectedTimeColumn() { return selectedTimeColumn; }
    public void setSelectedTimeColumn(String selectedTimeColumn) { this.selectedTimeColumn = selectedTimeColumn; }

    public String getSelectedTargetColumn() { return selectedTargetColumn; }
    public void setSelectedTargetColumn(String selectedTargetColumn) { this.selectedTargetColumn = selectedTargetColumn; }

    public String getSelectedLocationColumn() { return selectedLocationColumn; }
    public void setSelectedLocationColumn(String selectedLocationColumn) { this.selectedLocationColumn = selectedLocationColumn; }

    public String getTargetType() { return targetType; }
    public void setTargetType(String targetType) { this.targetType = targetType; }

    public String getSegment() { return segment; }
    public void setSegment(String segment) { this.segment = segment; }

    public List<String> getAvailableSegments() { return availableSegments; }
    public void setAvailableSegments(List<String> availableSegments) { this.availableSegments = availableSegments; }

    public int getRecordCount() { return recordCount; }
    public void setRecordCount(int recordCount) { this.recordCount = recordCount; }

    public int getFirstYear() { return firstYear; }
    public void setFirstYear(int firstYear) { this.firstYear = firstYear; }

    public int getLastYear() { return lastYear; }
    public void setLastYear(int lastYear) { this.lastYear = lastYear; }

    public int getTargetYear() { return targetYear; }
    public void setTargetYear(int targetYear) { this.targetYear = targetYear; }

    public int getHorizonYears() { return horizonYears; }
    public void setHorizonYears(int horizonYears) { this.horizonYears = horizonYears; }

    public double getInitialPositionM() { return initialPositionM; }
    public void setInitialPositionM(double initialPositionM) { this.initialPositionM = initialPositionM; }

    public double getLastHistoricalPositionM() { return lastHistoricalPositionM; }
    public void setLastHistoricalPositionM(double lastHistoricalPositionM) { this.lastHistoricalPositionM = lastHistoricalPositionM; }

    public double getTotalHistoricalRetreatM() { return totalHistoricalRetreatM; }
    public void setTotalHistoricalRetreatM(double totalHistoricalRetreatM) { this.totalHistoricalRetreatM = totalHistoricalRetreatM; }

    public double getSlope() { return slope; }
    public void setSlope(double slope) { this.slope = slope; }

    public double getIntercept() { return intercept; }
    public void setIntercept(double intercept) { this.intercept = intercept; }

    public String getEquation() { return equation; }
    public void setEquation(String equation) { this.equation = equation; }

    public double getRSquared() { return rSquared; }
    public void setRSquared(double rSquared) { this.rSquared = rSquared; }

    public double getErosionRateMPerYr() { return erosionRateMPerYr; }
    public void setErosionRateMPerYr(double erosionRateMPerYr) { this.erosionRateMPerYr = erosionRateMPerYr; }

    public double getPredictedPositionM() { return predictedPositionM; }
    public void setPredictedPositionM(double predictedPositionM) { this.predictedPositionM = predictedPositionM; }

    public double getProjectedRetreatM() { return projectedRetreatM; }
    public void setProjectedRetreatM(double projectedRetreatM) { this.projectedRetreatM = projectedRetreatM; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public String getRiskDescription() { return riskDescription; }
    public void setRiskDescription(String riskDescription) { this.riskDescription = riskDescription; }

    public String getRiskColor() { return riskColor; }
    public void setRiskColor(String riskColor) { this.riskColor = riskColor; }

    public String getRiskActionPriority() { return riskActionPriority; }
    public void setRiskActionPriority(String riskActionPriority) { this.riskActionPriority = riskActionPriority; }

    public List<String> getRiskRecommendations() { return riskRecommendations; }
    public void setRiskRecommendations(List<String> riskRecommendations) { this.riskRecommendations = riskRecommendations; }

    public List<Map<String, Object>> getHistory() { return history; }
    public void setHistory(List<Map<String, Object>> history) { this.history = history; }

    public List<Map<String, Object>> getFuture() { return future; }
    public void setFuture(List<Map<String, Object>> future) { this.future = future; }

    public String getTrendChartUrl() { return trendChartUrl; }
    public void setTrendChartUrl(String trendChartUrl) { this.trendChartUrl = trendChartUrl; }

    public String getErosionRateChartUrl() { return erosionRateChartUrl; }
    public void setErosionRateChartUrl(String erosionRateChartUrl) { this.erosionRateChartUrl = erosionRateChartUrl; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
