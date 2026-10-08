package com.coastal.erosion.service;

import com.coastal.erosion.dto.PredictionRequestDto;
import com.coastal.erosion.dto.PredictionResponseDto;
import com.coastal.erosion.model.RiskAssessment;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Service orchestrating shoreline prediction runs and history tracking.
 */
@Service
public class PredictionService {

    private final PythonAnalyticsAdapter analyticsAdapter;
    private final RiskService riskService;
    private final Map<String, PredictionResponseDto> runStore = new LinkedHashMap<>();

    public PredictionService(PythonAnalyticsAdapter analyticsAdapter, RiskService riskService) {
        this.analyticsAdapter = analyticsAdapter;
        this.riskService = riskService;
    }

    public PredictionResponseDto executePrediction(PredictionRequestDto request) {
        // Invoke Python ML Linear Regression model fit & forecasting via adapter
        PredictionResponseDto response = analyticsAdapter.runPrediction(request);

        // Enhance / verify risk assessment with Java RiskService
        if (response != null) {
            RiskAssessment assessment = riskService.assessRisk(
                    response.getErosionRateMPerYr(),
                    response.getProjectedRetreatM(),
                    null
            );
            response.setRiskLevel(assessment.getLevel());
            response.setRiskColor(assessment.getColor());
            response.setRiskDescription(assessment.getDescription());
            response.setRiskActionPriority(assessment.getActionPriority());
            response.setRiskRecommendations(assessment.getRecommendations());

            runStore.put(response.getId(), response);
        }

        return response;
    }

    public List<PredictionResponseDto> getAllRuns() {
        List<PredictionResponseDto> list = new ArrayList<>(runStore.values());
        Collections.reverse(list);
        return list;
    }

    public Optional<PredictionResponseDto> getRunById(String id) {
        return Optional.ofNullable(runStore.get(id));
    }
}
