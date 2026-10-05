package com.coastal.erosion.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Domain entity representing a monitored coastal transect / segment.
 */
public class CoastalSegment {
    private String id;
    private String name;
    private double latitude;
    private double longitude;
    private int baselineYear;
    private int latestYear;
    private double baselinePositionM;
    private double latestPositionM;
    private double annualErosionRate;
    private String riskLevel;
    private String riskColor;
    private String actionPriority;
    private List<ShorelineMeasurement> measurements = new ArrayList<>();

    public CoastalSegment() {}

    public CoastalSegment(String id, String name, double latitude, double longitude) {
        this.id = id;
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }

    public int getBaselineYear() { return baselineYear; }
    public void setBaselineYear(int baselineYear) { this.baselineYear = baselineYear; }

    public int getLatestYear() { return latestYear; }
    public void setLatestYear(int latestYear) { this.latestYear = latestYear; }

    public double getBaselinePositionM() { return baselinePositionM; }
    public void setBaselinePositionM(double baselinePositionM) { this.baselinePositionM = baselinePositionM; }

    public double getLatestPositionM() { return latestPositionM; }
    public void setLatestPositionM(double latestPositionM) { this.latestPositionM = latestPositionM; }

    public double getAnnualErosionRate() { return annualErosionRate; }
    public void setAnnualErosionRate(double annualErosionRate) { this.annualErosionRate = annualErosionRate; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public String getRiskColor() { return riskColor; }
    public void setRiskColor(String riskColor) { this.riskColor = riskColor; }

    public String getActionPriority() { return actionPriority; }
    public void setActionPriority(String actionPriority) { this.actionPriority = actionPriority; }

    public List<ShorelineMeasurement> getMeasurements() { return measurements; }
    public void setMeasurements(List<ShorelineMeasurement> measurements) { this.measurements = measurements; }
}
