package com.coastal.erosion.controller;

import com.coastal.erosion.dto.DashboardSummaryDto;
import com.coastal.erosion.dto.PredictionResponseDto;
import com.coastal.erosion.dto.ThresholdConfigDto;
import com.coastal.erosion.model.ThresholdConfig;
import com.coastal.erosion.service.PredictionService;
import com.coastal.erosion.service.RiskService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final PredictionService predictionService;
    private final RiskService riskService;

    public DashboardController(PredictionService predictionService, RiskService riskService) {
        this.predictionService = predictionService;
        this.riskService = riskService;
    }

    @GetMapping("/dashboard/summary")
    public ResponseEntity<DashboardSummaryDto> getDashboardSummary() {
        DashboardSummaryDto summary = new DashboardSummaryDto();
        List<PredictionResponseDto> runs = predictionService.getAllRuns();

        summary.setTotalMonitoredSegments(8);
        summary.setHighRiskSegmentsCount(2);
        summary.setAverageErosionRate(1.85);
        summary.setMaxErosionRate(3.40);
        summary.setTotalSurveysCount(112);

        if (!runs.isEmpty()) {
            summary.setLatestRun(runs.get(0));
        }

        List<Map<String, Object>> riskDistribution = new ArrayList<>();
        Map<String, Object> r1 = new HashMap<>();
        r1.put("name", "Low Risk (<1m/yr)");
        r1.put("level", "LOW");
        r1.put("count", 3);
        r1.put("color", "#0d9488");
        riskDistribution.add(r1);

        Map<String, Object> r2 = new HashMap<>();
        r2.put("name", "Moderate (1-2m/yr)");
        r2.put("level", "MODERATE");
        r2.put("count", 3);
        r2.put("color", "#d97706");
        riskDistribution.add(r2);

        Map<String, Object> r3 = new HashMap<>();
        r3.put("name", "High Risk (2-3m/yr)");
        r3.put("level", "HIGH");
        r3.put("count", 1);
        r3.put("color", "#ea580c");
        riskDistribution.add(r3);

        Map<String, Object> r4 = new HashMap<>();
        r4.put("name", "Very High (>=3m/yr)");
        r4.put("level", "VERY_HIGH");
        r4.put("count", 1);
        r4.put("color", "#dc2626");
        riskDistribution.add(r4);

        summary.setRiskDistribution(riskDistribution);

        return ResponseEntity.ok(summary);
    }

    @GetMapping("/config/thresholds")
    public ResponseEntity<ThresholdConfigDto> getThresholds() {
        ThresholdConfig cfg = riskService.getThresholdConfig();
        return ResponseEntity.ok(new ThresholdConfigDto(cfg.getLowMax(), cfg.getModerateMax(), cfg.getHighMax()));
    }

    @PutMapping("/config/thresholds")
    public ResponseEntity<ThresholdConfigDto> updateThresholds(@RequestBody ThresholdConfigDto req) {
        ThresholdConfig cfg = riskService.updateThresholdConfig(req.getLow_max(), req.getModerate_max(), req.getHigh_max());
        return ResponseEntity.ok(new ThresholdConfigDto(cfg.getLowMax(), cfg.getModerateMax(), cfg.getHighMax()));
    }
}
