package com.coastal.erosion.service;

import com.coastal.erosion.dto.DatasetResponseDto;
import com.coastal.erosion.dto.PredictionRequestDto;
import com.coastal.erosion.dto.PredictionResponseDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/**
 * Adapter integrating existing Python analytics / FastAPI service with Java Spring Boot.
 */
@Component
public class PythonAnalyticsAdapter {

    private final RestTemplate restTemplate;

    @Value("${python.analytics.url:http://localhost:8000}")
    private String pythonAnalyticsUrl;

    public PythonAnalyticsAdapter(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public PredictionResponseDto runPrediction(PredictionRequestDto requestDto) {
        String endpoint = pythonAnalyticsUrl + "/api/v1/predictions/run";
        try {
            ResponseEntity<PredictionResponseDto> response = restTemplate.postForEntity(
                    endpoint, requestDto, PredictionResponseDto.class
            );
            return response.getBody();
        } catch (Exception e) {
            // Fallback or rethrow descriptive exception
            throw new RuntimeException("Python Analytics Service communication error: " + e.getMessage(), e);
        }
    }

    public DatasetResponseDto preprocessDataset(String datasetId, Object request) {
        String endpoint = pythonAnalyticsUrl + "/api/v1/datasets/" + datasetId + "/preprocess";
        try {
            ResponseEntity<DatasetResponseDto> response = restTemplate.postForEntity(
                    endpoint, request, DatasetResponseDto.class
            );
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Preprocessing service communication error: " + e.getMessage(), e);
        }
    }
}
