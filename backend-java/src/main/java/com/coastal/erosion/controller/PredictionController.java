package com.coastal.erosion.controller;

import com.coastal.erosion.dto.PredictionRequestDto;
import com.coastal.erosion.dto.PredictionResponseDto;
import com.coastal.erosion.service.PredictionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/predictions")
@CrossOrigin(origins = "*")
public class PredictionController {

    private final PredictionService predictionService;

    public PredictionController(PredictionService predictionService) {
        this.predictionService = predictionService;
    }

    @PostMapping("/run")
    public ResponseEntity<PredictionResponseDto> runPrediction(@RequestBody PredictionRequestDto request) {
        return ResponseEntity.ok(predictionService.executePrediction(request));
    }

    @GetMapping
    public ResponseEntity<List<PredictionResponseDto>> getAllRuns() {
        return ResponseEntity.ok(predictionService.getAllRuns());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PredictionResponseDto> getRunById(@PathVariable String id) {
        return predictionService.getRunById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
