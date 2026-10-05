package com.coastal.erosion;

import com.coastal.erosion.model.RiskAssessment;
import com.coastal.erosion.model.ThresholdConfig;
import com.coastal.erosion.service.RiskService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class RiskServiceTest {

    private RiskService riskService;

    @BeforeEach
    public void setup() {
        riskService = new RiskService();
    }

    @Test
    public void testDefaultLowRiskClassification() {
        RiskAssessment result = riskService.assessRisk(0.65, 3.25, null);
        assertEquals("LOW", result.getLevel());
        assertEquals("#0d9488", result.getColor());
        assertTrue(result.getDescription().contains("broadly stable"));
    }

    @Test
    public void testDefaultModerateRiskClassification() {
        RiskAssessment result = riskService.assessRisk(1.45, 7.25, null);
        assertEquals("MODERATE", result.getLevel());
        assertEquals("#d97706", result.getColor());
        assertTrue(result.getDescription().contains("Noticeable coastal retreat"));
    }

    @Test
    public void testDefaultHighRiskClassification() {
        RiskAssessment result = riskService.assessRisk(2.65, 13.25, null);
        assertEquals("HIGH", result.getLevel());
        assertEquals("#ea580c", result.getColor());
        assertTrue(result.getDescription().contains("Significant chronic erosion"));
    }

    @Test
    public void testDefaultVeryHighRiskClassification() {
        RiskAssessment result = riskService.assessRisk(3.85, 19.25, null);
        assertEquals("VERY_HIGH", result.getLevel());
        assertEquals("#dc2626", result.getColor());
        assertTrue(result.getDescription().contains("Critical, aggressive erosion"));
    }

    @Test
    public void testCustomConfigurableThresholds() {
        ThresholdConfig custom = new ThresholdConfig(0.5, 1.2, 2.0);
        RiskAssessment result = riskService.assessRisk(1.5, 7.5, custom);
        // Under custom config, 1.5 is between 1.2 and 2.0 -> HIGH
        assertEquals("HIGH", result.getLevel());
    }

    @Test
    public void testInvalidThresholdUpdate() {
        assertThrows(IllegalArgumentException.class, () -> {
            riskService.updateThresholdConfig(2.5, 1.5, 3.0); // low > moderate is invalid
        });
    }
}
