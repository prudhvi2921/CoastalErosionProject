"""
Automated verification script for Coastal Erosion Website backend & responsive HTML structure.
"""
import urllib.request
import json

BASE_URL = "http://127.0.0.1:5000"

def test_frontend():
    print("[1] Testing Frontend Root HTML...")
    with urllib.request.urlopen(f"{BASE_URL}/") as response:
        html = response.read().decode('utf-8')
        assert response.status == 200
        assert "<meta name=\"viewport\"" in html
        assert "mobileMenuToggle" in html
        assert "mobileDrawer" in html
        assert "table-container" in html
        assert "@media (max-width: 767px)" in html
        assert "@media (max-width: 480px)" in html
        assert "clamp(" in html
        print(" -> Frontend HTML contains all responsive tokens, hamburger menu, mobile drawer, and media queries! [PASSED]")

def test_sample_api():
    print("[2] Testing /api/sample...")
    with urllib.request.urlopen(f"{BASE_URL}/api/sample") as response:
        data = json.loads(response.read().decode('utf-8'))
        assert response.status == 200
        assert "csv" in data
        assert "inspection" in data
        print(f" -> Sample dataset loaded ({len(data['inspection']['columns'])} columns detected, {len(data['inspection']['locations'])} segments)! [PASSED]")
        return data

def test_analyze_api(sample_data):
    print("[3] Testing /api/analyze (Dynamic Prediction & Chart Generation)...")
    payload = json.dumps({
        "csv": sample_data["csv"],
        "time_col": "Year",
        "target_col": "ShorelinePosition_m",
        "location_col": "Segment",
        "segment": "Coastal Area A",
        "horizon": 5,
        "target_type": "shoreline_position"
    }).encode('utf-8')

    req = urllib.request.Request(
        f"{BASE_URL}/api/analyze",
        data=payload,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as response:
        res = json.loads(response.read().decode('utf-8'))
        assert response.status == 200
        assert res["status"] == "success"
        assert "slope" in res
        assert "predictedTargetVal" in res
        assert "riskLevel" in res
        assert "trendChartUrl" in res
        assert "erosionRateChartUrl" in res
        assert len(res["future"]) == 5
        print(f" -> Prediction Success! Risk Level: {res['riskLevel']}, Slope: {res['slope']:.2f}, Forecast: {res['predictedTargetVal']:.2f}")
        print(f" -> Trend Chart URL: {res['trendChartUrl']}")
        print(f" -> Rate Chart URL: {res['erosionRateChartUrl']} [PASSED]")
        return res

def test_chart_images(analyze_res):
    print("[4] Testing Chart image download endpoints...")
    trend_url = f"{BASE_URL}{analyze_res['trendChartUrl']}"
    with urllib.request.urlopen(trend_url) as response:
        img_bytes = response.read()
        assert response.status == 200
        assert len(img_bytes) > 1000
        print(f" -> Trend Chart Image successfully downloaded ({len(img_bytes)} bytes)! [PASSED]")

    rate_url = f"{BASE_URL}{analyze_res['erosionRateChartUrl']}"
    with urllib.request.urlopen(rate_url) as response:
        img_bytes = response.read()
        assert response.status == 200
        assert len(img_bytes) > 1000
        print(f" -> Rate Chart Image successfully downloaded ({len(img_bytes)} bytes)! [PASSED]")

if __name__ == "__main__":
    print("==================================================")
    print("RUNNING AUTOMATED VERIFICATION FOR RESPONSIVE APP")
    print("==================================================")
    test_frontend()
    sample = test_sample_api()
    analysis = test_analyze_api(sample)
    test_chart_images(analysis)
    print("==================================================")
    print("ALL TESTS PASSED SUCCESSFULLY! 100% OPERATIONAL")
    print("==================================================")
