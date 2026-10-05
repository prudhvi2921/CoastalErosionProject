package com.coastal.erosion.service;

import com.coastal.erosion.dto.RiskAssessmentDto;
import com.coastal.erosion.dto.ThresholdConfigDto;
import com.coastal.erosion.model.RiskAssessment;
import com.coastal.erosion.model.ThresholdConfig;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Module 3 - Risk Assessment Service
 * Implements configurable multi-tier coastal erosion risk classification,
 * detailed environmental impact explanations, and engineering mitigation recommendations.
 */
@Service
public class RiskService {

    private final ThresholdConfig activeConfig = new ThresholdConfig(1.0, 2.0, 3.0);

    public ThresholdConfig getThresholdConfig() {
        return activeConfig;
    }

    public ThresholdConfig updateThresholdConfig(double lowMax, double moderateMax, double highMax) {
        if (lowMax <= 0 || moderateMax <= lowMax || highMax <= moderateMax) {
            throw new IllegalArgumentException("Invalid thresholds: Ensure 0 < lowMax < moderateMax < highMax");
        }
        activeConfig.setLowMax(lowMax);
        activeConfig.setModerateMax(moderateMax);
        activeConfig.setHighMax(highMax);
        return activeConfig;
    }

    public RiskAssessment assessRisk(double annualErosionRateMPerYr, Double projectedRetreatM, ThresholdConfig customConfig) {
        double rate = Math.abs(annualErosionRateMPerYr);
        ThresholdConfig cfg = customConfig != null ? customConfig : activeConfig;

        String level;
        String color;
        String priority;
        String desc;
        List<String> recommendations;

        String retreatNote = projectedRetreatM != null
                ? String.format(" Projected cumulative retreat is approximately %.2f m over the forecast horizon.", Math.abs(projectedRetreatM))
                : "";

        if (rate < cfg.getLowMax()) {
            level = "LOW";
            color = "#0d9488"; // Sea-teal
            priority = "Routine Annual Monitoring";
            desc = String.format("Shoreline is broadly stable with an annual erosion rate of %.2f m/yr (< %.1f m/yr threshold). Retreat is within normal seasonal sediment dynamics.%s",
                    rate, cfg.getLowMax(), retreatNote);
            recommendations = Arrays.asList(
                    "Maintain existing vegetative buffer zones, dune vegetation, and natural sediment traps.",
                    "Conduct annual drone/satellite multispectral shoreline boundary surveys.",
                    "Enforce standard coastal zone management (CZM) setback regulations."
            );
        } else if (rate < cfg.getModerateMax()) {
            level = "MODERATE";
            color = "#d97706"; // Amber
            priority = "Active Monitoring & Dune Restoration";
            desc = String.format("Noticeable coastal retreat trend observed at %.2f m/yr (%.1f to %.1f m/yr threshold). Requires active monitoring and proactive conservation buffers.%s",
                    rate, cfg.getLowMax(), cfg.getModerateMax(), retreatNote);
            recommendations = Arrays.asList(
                    "Establish bi-annual high-precision shoreline profiling and sediment budget tracking.",
                    "Implement sand fence trapping and native dune grass stabilization (e.g., Spinifex, Ipomoea).",
                    "Restrict heavy infrastructure construction and vegetation removal within a 100m coastal buffer."
            );
        } else if (rate < cfg.getHighMax()) {
            level = "HIGH";
            color = "#ea580c"; // Warning Orange
            priority = "Targeted Mitigation & Beach Nourishment";
            desc = String.format("Significant chronic erosion at %.2f m/yr (%.1f to %.1f m/yr threshold). Nearshore structures, coastal roads, and ecosystems face imminent vulnerability.%s",
                    rate, cfg.getModerateMax(), cfg.getHighMax(), retreatNote);
            recommendations = Arrays.asList(
                    "Execute programmed beach nourishment (sand replenishment) using compatible marine borrow pits.",
                    "Deploy hybrid living shorelines, geotextile revetment bags, and artificial reef breakwaters.",
                    "Review building setback lines with municipal urban planning authorities and declare hazard zones."
            );
        } else {
            level = "VERY_HIGH";
            color = "#dc2626"; // Crimson Alert Red
            priority = "Immediate Structural Intervention & Emergency Planning";
            desc = String.format("Critical, aggressive erosion occurring at %.2f m/yr (>= %.1f m/yr threshold). Immediate structural intervention and emergency zoning are necessary to protect life and assets.%s",
                    rate, cfg.getHighMax(), retreatNote);
            recommendations = Arrays.asList(
                    "Emergency structural defense: install offshore submerged breakwaters, rock revetments, or groynes.",
                    "Declare coastal erosion disaster hazard zone with mandatory setback and building freeze.",
                    "Formulate managed retreat and relocation plans for critical public infrastructure and communities."
            );
        }

        RiskAssessment assessment = new RiskAssessment(level, desc, color, priority, recommendations);
        assessment.setErosionRateUsed(rate);
        assessment.setProjectedRetreatM(projectedRetreatM);
        assessment.setThresholdsApplied(cfg);
        return assessment;
    }

    public RiskAssessmentDto toDto(RiskAssessment assessment) {
        RiskAssessmentDto dto = new RiskAssessmentDto();
        dto.setLevel(assessment.getLevel());
        dto.setDescription(assessment.getDescription());
        dto.setColor(assessment.getColor());
        dto.setActionPriority(assessment.getActionPriority());
        dto.setRecommendations(assessment.getRecommendations());
        dto.setRateUsed(assessment.getErosionRateUsed());
        dto.setRetreatM(assessment.getProjectedRetreatM());

        Map<String, Double> thMap = new HashMap<>();
        if (assessment.getThresholdsApplied() != null) {
            thMap.put("low_max", assessment.getThresholdsApplied().getLowMax());
            thMap.put("moderate_max", assessment.getThresholdsApplied().getModerateMax());
            thMap.put("high_max", assessment.getThresholdsApplied().getHighMax());
        }
        dto.setThresholds(thMap);
        return dto;
    }
}
