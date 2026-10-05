package com.coastal.erosion.dto;

import java.util.List;
import java.util.Map;

public class RiskAssessmentDto {
    private String level;
    private String description;
    private String color;
    private String actionPriority;
    private List<String> recommendations;
    private double rateUsed;
    private Double retreatM;
    private Map<String, Double> thresholds;

    public RiskAssessmentDto() {}

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

    public double getRateUsed() { return rateUsed; }
    public void setRateUsed(double rateUsed) { this.rateUsed = rateUsed; }

    public Double getRetreatM() { return retreatM; }
    public void setRetreatM(Double retreatM) { this.retreatM = retreatM; }

    public Map<String, Double> getThresholds() { return thresholds; }
    public void setThresholds(Map<String, Double> thresholds) { this.thresholds = thresholds; }
}
