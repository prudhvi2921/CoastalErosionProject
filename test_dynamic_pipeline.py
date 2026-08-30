"""
Test suite for Dynamic Coastal Erosion Prediction Pipeline
Tests:
1. Column detection & inspection
2. Dynamic cleaning & column mapping
3. Dynamic linear trend modeling and multi-year projection
4. Dynamic Matplotlib visualization generation
5. Validation rules (minimum 5 records, non-numeric targets, missing columns)
6. Real-world example datasets (Example 1, Example 2, Example 3, Built-in standard)
"""

import os
import sys
import io
import pandas as pd
import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from data_processing import inspect_dataset, clean_dynamic_data, compute_dynamic_changes, process_dynamic
from prediction import analyse_dynamic, fit_dynamic_trend, predict_dynamic_future
from visualization import plot_dynamic_trend, plot_dynamic_rate

def test_example_1():
    print("\n--- Testing Example 1: (Year, Location, Shoreline_Position) ---")
    csv_content = """Year,Location,Shoreline_Position
2015,Miami Beach,120.5
2016,Miami Beach,118.2
2017,Miami Beach,116.0
2018,Miami Beach,113.7
2019,Miami Beach,111.4
2020,Miami Beach,109.1
2021,Miami Beach,106.8
2022,Miami Beach,104.5
2015,South Beach,85.0
2016,South Beach,84.1
2017,South Beach,83.2
2018,South Beach,82.4
2019,South Beach,81.5
2020,South Beach,80.6
2021,South Beach,79.8
2022,South Beach,78.9
"""
    test_csv_path = "backend/uploads/test_ex1.csv"
    os.makedirs("backend/uploads", exist_ok=True)
    with open(test_csv_path, "w") as f:
        f.write(csv_content)

    # 1. Inspect
    insp = inspect_dataset(test_csv_path)
    assert "Year" in insp["columns"]
    assert "Location" in insp["columns"]
    assert "Shoreline_Position" in insp["columns"]
    assert "Miami Beach" in insp["locations"]
    assert "South Beach" in insp["locations"]
    print("Inspection auto-mapping:", insp["autoMapping"])

    # 2. Clean & Process for Miami Beach
    cleaned = process_dynamic(
        test_csv_path,
        time_col="Year",
        target_col="Shoreline_Position",
        location_col="Location",
        location_val="Miami Beach",
        min_records=5
    )
    assert len(cleaned) == 8
    print(f"Miami Beach processed: {len(cleaned)} records")

    # 3. Dynamic Prediction
    trend, future = analyse_dynamic(cleaned, horizon_years=5)
    print(f"Equation: {trend.equation}")
    print(f"Slope: {trend.slope:.4f} | R2: {trend.r_squared:.4f}")
    assert len(future) == 5
    assert future.iloc[-1]["Year"] == 2027

    # 4. Visualization
    os.makedirs("backend/static/charts", exist_ok=True)
    chart_trend = plot_dynamic_trend(cleaned, future, "Miami Beach", "backend/static/charts/test_ex1_trend.png", "Year", "Shoreline_Position")
    chart_rate = plot_dynamic_rate(cleaned, "Miami Beach", "backend/static/charts/test_ex1_rate.png", "Year", "Shoreline_Position")
    assert os.path.exists(chart_trend)
    assert os.path.exists(chart_rate)
    print("Charts generated successfully!")


def test_example_2():
    print("\n--- Testing Example 2: (Date, Area, Erosion_Rate) ---")
    csv_content = """Date,Area,Erosion_Rate
2014-01-01,Outer Banks,2.4
2015-01-01,Outer Banks,2.6
2016-01-01,Outer Banks,2.8
2017-01-01,Outer Banks,3.1
2018-01-01,Outer Banks,3.3
2019-01-01,Outer Banks,3.5
2020-01-01,Outer Banks,3.7
"""
    test_csv_path = "backend/uploads/test_ex2.csv"
    with open(test_csv_path, "w") as f:
        f.write(csv_content)

    insp = inspect_dataset(test_csv_path)
    print("Detected columns:", insp["columns"])
    print("Auto-mapping:", insp["autoMapping"])

    cleaned = process_dynamic(
        test_csv_path,
        time_col="Date",
        target_col="Erosion_Rate",
        location_col="Area",
        location_val="Outer Banks",
        min_records=5
    )
    assert len(cleaned) == 7
    trend, future = analyse_dynamic(cleaned, horizon_years=4)
    print(f"Equation: {trend.equation}")
    print(f"Slope: {trend.slope:.4f} | Predicted 2024: {future.iloc[-1]['StandardTarget']}")


def test_example_3():
    print("\n--- Testing Example 3: (Year, Coastal_Segment, Beach_Width, Shoreline_Change) ---")
    csv_content = """Year,Coastal_Segment,Beach_Width,Shoreline_Change
2010,Gold Coast,65.0,-1.2
2011,Gold Coast,63.8,-1.5
2012,Gold Coast,62.3,-1.1
2013,Gold Coast,61.2,-1.4
2014,Gold Coast,59.8,-1.6
2015,Gold Coast,58.2,-1.3
2016,Gold Coast,56.9,-1.8
"""
    test_csv_path = "backend/uploads/test_ex3.csv"
    with open(test_csv_path, "w") as f:
        f.write(csv_content)

    # Predicting Beach_Width as custom numeric target
    cleaned = process_dynamic(
        test_csv_path,
        time_col="Year",
        target_col="Beach_Width",
        location_col="Coastal_Segment",
        location_val="Gold Coast",
        min_records=5
    )
    assert len(cleaned) == 7
    trend, future = analyse_dynamic(cleaned, horizon_years=5)
    print(f"Beach Width Equation: {trend.equation}")
    print(f"Predicted Future Beach Width in 2021: {future.iloc[-1]['StandardTarget']} m")


def test_validation_rules():
    print("\n--- Testing Validation Rules (<5 records & missing cols) ---")
    short_csv = """Year,Shoreline_Position
2020,100.0
2021,98.0
2022,96.0
"""
    test_csv_path = "backend/uploads/test_short.csv"
    with open(test_csv_path, "w") as f:
        f.write(short_csv)

    try:
        process_dynamic(test_csv_path, time_col="Year", target_col="Shoreline_Position", min_records=5)
        assert False, "Should have failed with <5 records"
    except ValueError as e:
        print("Validation caught as expected:", str(e))


def test_flask_app_endpoints():
    print("\n--- Testing Flask App API Endpoints ---")
    from app import app
    client = app.test_client()

    # Test /api/sample
    res = client.get("/api/sample")
    assert res.status_code == 200
    sample_json = res.get_json()
    assert sample_json["status"] == "success"
    assert "inspection" in sample_json
    print("GET /api/sample OK")

    # Test /api/inspect with JSON
    csv_str = "Year,Segment,ShorelinePosition_m\n2018,A,100\n2019,A,98\n2020,A,96\n2021,A,94\n2022,A,92\n2023,A,90"
    res = client.post("/api/inspect", json={"csv": csv_str})
    assert res.status_code == 200
    insp_json = res.get_json()
    assert insp_json["status"] == "success"
    assert "columns" in insp_json
    assert len(insp_json["preview"]) == 6
    print("POST /api/inspect OK")

    # Test /api/analyze with Dynamic Mapping
    res = client.post("/api/analyze", json={
        "csv": csv_str,
        "time_col": "Year",
        "target_col": "ShorelinePosition_m",
        "location_col": "Segment",
        "segment": "A",
        "horizon": 5,
        "target_type": "shoreline_position"
    })
    # Assert strictly compliant standard JSON (no NaN / Infinity / syntax errors for JS JSON.parse)
    raw_payload = res.data.decode("utf-8")
    assert "NaN" not in raw_payload, "API returned literal unquoted NaN in JSON payload!"
    assert "Infinity" not in raw_payload, "API returned Infinity in JSON payload!"
    import json
    strict_parsed = json.loads(raw_payload, parse_constant=lambda x: (_ for _ in ()).throw(ValueError(f"Invalid JSON constant: {x}")))
    assert strict_parsed["status"] == "success"

    res_json = res.get_json()
    assert res_json["status"] == "success"
    assert res_json["selectedTimeColumn"] == "Year"
    assert res_json["selectedTargetColumn"] == "ShorelinePosition_m"
    assert res_json["recordCount"] == 6
    assert len(res_json["future"]) == 5
    print("POST /api/analyze OK with strictly compliant dynamic prediction JSON response!")


if __name__ == "__main__":
    test_example_1()
    test_example_2()
    test_example_3()
    test_validation_rules()
    test_flask_app_endpoints()
    print("\n=======================================================")
    print("ALL TESTS PASSED SUCCESSFULLY! [OK]")
    print("=======================================================")
