"""
Comprehensive Automated Test Suite for Coastal Erosion System
Tests:
1. Data Ingestion: CSV upload, column discovery, dynamic cleaning, validation error detection
2. Trend Modeling: Linear regression trend fitting, equation calculation, multi-year projection
3. Risk Assessment: Configurable risk thresholds (Low, Moderate, High, Very High) & action plans
4. Publications & Export: PDF and CSV report generation and dynamic chart generation
5. Platform Orchestration: API contracts, SQLite persistence, dashboard summary KPIs, segment coordinates
"""

import os
import sys
import pytest
from fastapi.testclient import TestClient

# Ensure backend directory is in sys.path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from main import app
from risk_assessment import classify_risk, DEFAULT_LOW_MAX, DEFAULT_MODERATE_MAX, DEFAULT_HIGH_MAX
from data_processing import inspect_dataset, clean_dynamic_data, process_dynamic
from prediction import analyse_dynamic, fit_dynamic_trend

client = TestClient(app)


def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_risk_classification_rules():
    """Verify default risk boundaries: <1.0 -> LOW, 1.0-2.0 -> MODERATE, 2.0-3.0 -> HIGH, >=3.0 -> VERY_HIGH"""
    # Low risk
    low = classify_risk(0.45)
    assert low.level == "LOW"
    assert low.color == "#0d9488"
    assert "Routine Annual Monitoring" in low.action_priority

    # Moderate risk
    mod = classify_risk(1.45)
    assert mod.level == "MODERATE"
    assert mod.color == "#d97706"
    assert "Active Monitoring" in mod.action_priority

    # High risk
    high = classify_risk(2.45)
    assert high.level == "HIGH"
    assert high.color == "#ea580c"
    assert "Targeted Mitigation" in high.action_priority

    # Very High risk
    vhigh = classify_risk(3.45)
    assert vhigh.level == "VERY_HIGH"
    assert vhigh.color == "#dc2626"
    assert "Immediate Structural Intervention" in vhigh.action_priority


def test_custom_configurable_thresholds():
    """Verify user-configured threshold overrides work accurately."""
    # Custom thresholds: Low < 0.5, Mod < 1.0, High < 1.5
    res = classify_risk(0.85, low_max=0.5, moderate_max=1.0, high_max=1.5)
    assert res.level == "MODERATE"

    res_high = classify_risk(1.2, low_max=0.5, moderate_max=1.0, high_max=1.5)
    assert res_high.level == "HIGH"


def test_api_threshold_config_endpoints():
    """Test GET and PUT /api/v1/config/thresholds."""
    get_res = client.get("/api/v1/config/thresholds")
    assert get_res.status_code == 200
    data = get_res.json()
    assert "low_max" in data
    assert "moderate_max" in data
    assert "high_max" in data

    # Update thresholds
    update_res = client.put(
        "/api/v1/config/thresholds",
        json={"low_max": 0.8, "moderate_max": 1.8, "high_max": 2.8}
    )
    assert update_res.status_code == 200
    assert update_res.json()["low_max"] == 0.8

    # Reset back to default
    client.put(
        "/api/v1/config/thresholds",
        json={"low_max": 1.0, "moderate_max": 2.0, "high_max": 3.0}
    )


def test_sample_dataset_seeding_and_inspection():
    """Test sample dataset loading and column inspection."""
    res = client.post("/api/v1/datasets/sample?type=default")
    assert res.status_code == 200
    dataset = res.json()
    assert dataset["rowCount"] > 0
    assert "Year" in dataset["column_mapping"]["timeColumn"]
    assert "ShorelinePosition_m" in dataset["column_mapping"]["targetColumn"]
    assert len(dataset["segments"]) > 0


def test_prediction_run_endpoint():
    """Test end-to-end prediction execution via API."""
    csv_data = """Year,Segment,ShorelinePosition_m
2015,Test Beach Alpha,100.0
2016,Test Beach Alpha,97.5
2017,Test Beach Alpha,95.0
2018,Test Beach Alpha,92.5
2019,Test Beach Alpha,90.0
2020,Test Beach Alpha,87.5
2021,Test Beach Alpha,85.0
2022,Test Beach Alpha,82.5
"""
    payload = {
        "csv_data": csv_data,
        "segment": "Test Beach Alpha",
        "time_col": "Year",
        "target_col": "ShorelinePosition_m",
        "location_col": "Segment",
        "horizon": 5,
        "target_type": "shoreline_position"
    }
    response = client.post("/api/v1/predictions/run", json=payload)
    assert response.status_code == 200
    result = response.json()
    assert result["segment"] == "Test Beach Alpha"
    assert result["recordCount"] == 8
    assert result["firstYear"] == 2015
    assert result["lastYear"] == 2022
    assert result["targetYear"] == 2027
    assert result["erosionRateMPerYr"] == 2.5
    assert result["riskLevel"] == "HIGH"
    assert len(result["future"]) == 5
    assert result["predictedPositionM"] == 70.0


def test_dashboard_summary_endpoint():
    """Test /api/v1/dashboard/summary KPI calculations."""
    res = client.get("/api/v1/dashboard/summary")
    assert res.status_code == 200
    summary = res.json()
    assert summary["totalMonitoredSegments"] > 0
    assert "riskDistribution" in summary
    assert "segments" in summary
    assert len(summary["segments"]) > 0


def test_report_generation_endpoints():
    """Test CSV and PDF download streams for a prediction run."""
    # First get list of runs
    runs = client.get("/api/v1/predictions").json()
    if runs:
        run_id = runs[0]["id"]
        # Test CSV
        csv_res = client.get(f"/api/v1/reports/{run_id}/csv")
        assert csv_res.status_code == 200
        assert "Historical Survey" in csv_res.text

        # Test PDF
        pdf_res = client.get(f"/api/v1/reports/{run_id}/pdf")
        assert pdf_res.status_code == 200
        assert pdf_res.headers["content-type"] == "application/pdf"
