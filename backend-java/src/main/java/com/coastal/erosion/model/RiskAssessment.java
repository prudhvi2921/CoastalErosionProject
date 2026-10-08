package com.coastal.erosion.model;

import java.util.List;

/**
 * Domain entity representing the result of Risk Assessment.
 */
public class RiskAssessment {
    private String level;
    private String description;
    private String color;
    private String actionPriority;
    private List<String> recommendations;
    private double erosionRateUsed;
    private Double projectedRetreatM;
    private ThresholdConfig thresholdsApplied;

    public RiskAssessment() {}

    public RiskAssessment(String level, String description, String color, String actionPriority, List<String> recommendations) {
        this.level = level;
        this.description = description;
        this.color = color;
        this.actionPriority = actionPriority;
        this.recommendations = recommendations;
    }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getActionPriority() { return actionPriority; }
    public void setActionPriority(String actionPriority) { this.actionPriority = actionPriority; }

    public List<String> getRecommendations() { return recommendations; }
    public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }

    public double getErosionRateUsed() { return erosionRateUsed; }
    public void setErosionRateUsed(double erosionRateUsed) { this.erosionRateUsed = erosionRateUsed; }

    public Double getProjectedRetreatM() { return projectedRetreatM; }
    public void setProjectedRetreatM(Double projectedRetreatM) { this.projectedRetreatM = projectedRetreatM; }

    public ThresholdConfig getThresholdsApplied() { return thresholdsApplied; }
    public void setThresholdsApplied(ThresholdConfig thresholdsApplied) { this.thresholdsApplied = thresholdsApplied; }
}
