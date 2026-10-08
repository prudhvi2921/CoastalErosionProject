package com.coastal.erosion.model;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Domain entity representing an execution of Shoreline Prediction & Trend Fitting.
 */
public class PredictionRun {
    private String id;
    private String datasetId;
    private String segmentName;
    private int horizonYears;
    private int targetYear;
    private double slope;
    private double intercept;
    private double rSquared;
    private String equation;
    private double erosionRateMPerYr;
    private double predictedPositionM;
    private double projectedRetreatM;
    private String riskLevel;
    private String riskColor;
    private String riskDescription;
    private String riskActionPriority;
    private List<String> riskRecommendations;
    private List<ShorelineMeasurement> historicalData;
    private List<ShorelineMeasurement> forecastData;
    private LocalDateTime createdAt;
    private String trendChartUrl;
    private String rateChartUrl;

    public PredictionRun() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDatasetId() { return datasetId; }
    public void setDatasetId(String datasetId) { this.datasetId = datasetId; }

    public String getSegmentName() { return segmentName; }
    public void setSegmentName(String segmentName) { this.segmentName = segmentName; }

    public int getHorizonYears() { return horizonYears; }
    public void setHorizonYears(int horizonYears) { this.horizonYears = horizonYears; }

    public int getTargetYear() { return targetYear; }
    public void setTargetYear(int targetYear) { this.targetYear = targetYear; }

    public double getSlope() { return slope; }
    public void setSlope(double slope) { this.slope = slope; }

    public double getIntercept() { return intercept; }
    public void setIntercept(double intercept) { this.intercept = intercept; }

    public double getRSquared() { return rSquared; }
    public void setRSquared(double rSquared) { this.rSquared = rSquared; }

    public String getEquation() { return equation; }
    public void setEquation(String equation) { this.equation = equation; }

    public double getErosionRateMPerYr() { return erosionRateMPerYr; }
    public void setErosionRateMPerYr(double erosionRateMPerYr) { this.erosionRateMPerYr = erosionRateMPerYr; }

    public double getPredictedPositionM() { return predictedPositionM; }
    public void setPredictedPositionM(double predictedPositionM) { this.predictedPositionM = predictedPositionM; }

    public double getProjectedRetreatM() { return projectedRetreatM; }
    public void setProjectedRetreatM(double projectedRetreatM) { this.projectedRetreatM = projectedRetreatM; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public String getRiskColor() { return riskColor; }
    public void setRiskColor(String riskColor) { this.riskColor = riskColor; }

    public String getRiskDescription() { return riskDescription; }
    public void setRiskDescription(String riskDescription) { this.riskDescription = riskDescription; }

    public String getRiskActionPriority() { return riskActionPriority; }
    public void setRiskActionPriority(String riskActionPriority) { this.riskActionPriority = riskActionPriority; }

    public List<String> getRiskRecommendations() { return riskRecommendations; }
    public void setRiskRecommendations(List<String> riskRecommendations) { this.riskRecommendations = riskRecommendations; }

    public List<ShorelineMeasurement> getHistoricalData() { return historicalData; }
    public void setHistoricalData(List<ShorelineMeasurement> historicalData) { this.historicalData = historicalData; }

    public List<ShorelineMeasurement> getForecastData() { return forecastData; }
    public void setForecastData(List<ShorelineMeasurement> forecastData) { this.forecastData = forecastData; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getTrendChartUrl() { return trendChartUrl; }
    public void setTrendChartUrl(String trendChartUrl) { this.trendChartUrl = trendChartUrl; }

    public String getRateChartUrl() { return rateChartUrl; }
    public void setRateChartUrl(String rateChartUrl) { this.rateChartUrl = rateChartUrl; }
}
