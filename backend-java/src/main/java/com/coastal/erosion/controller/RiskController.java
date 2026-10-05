package com.coastal.erosion.controller;

import com.coastal.erosion.dto.RiskAssessmentDto;
import com.coastal.erosion.dto.ThresholdConfigDto;
import com.coastal.erosion.model.RiskAssessment;
import com.coastal.erosion.model.ThresholdConfig;
import com.coastal.erosion.service.RiskService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/risk")
@CrossOrigin(origins = "*")
public class RiskController {

    private final RiskService riskService;

    public RiskController(RiskService riskService) {
        this.riskService = riskService;
    }

    @PostMapping("/assess")
    public ResponseEntity<RiskAssessmentDto> assessRisk(@RequestBody Map<String, Object> payload) {
        double rate = Double.parseDouble(payload.getOrDefault("erosion_rate", 0.0).toString());
        Double retreat = payload.get("projected_retreat_m") != null
                ? Double.parseDouble(payload.get("projected_retreat_m").toString())
                : null;

        ThresholdConfig customCfg = null;
        if (payload.containsKey("thresholds")) {
            Map<?, ?> th = (Map<?, ?>) payload.get("thresholds");
            double low = Double.parseDouble(th.getOrDefault("low_max", 1.0).toString());
            double mod = Double.parseDouble(th.getOrDefault("moderate_max", 2.0).toString());
            double high = Double.parseDouble(th.getOrDefault("high_max", 3.0).toString());
            customCfg = new ThresholdConfig(low, mod, high);
        }

        RiskAssessment assessment = riskService.assessRisk(rate, retreat, customCfg);
        return ResponseEntity.ok(riskService.toDto(assessment));
    }
}
