import urllib.request
import json

def test_url(url, method='GET', data=None):
    req = urllib.request.Request(url, method=method)
    if data:
        req.add_header('Content-Type', 'application/json')
        data_bytes = json.dumps(data).encode('utf-8')
    else:
        data_bytes = None
    res = urllib.request.urlopen(req, data=data_bytes)
    print(f'[{method}] {url} -> Status: {res.status}')
    content = res.read()
    if 'api' in url:
        return json.loads(content.decode('utf-8'))
    return content

print('--- Testing Coastal Erosion Prediction & Risk System ---')

# 1. Dashboard summary
summary = test_url('http://127.0.0.1:8000/api/v1/dashboard/summary')
print(f"Monitored Segments: {len(summary.get('segments', []))}")
print(f"Critical High-Risk Segments: {summary.get('highRiskSegmentsCount')}")
print(f"Average Coastal Erosion Rate: {summary.get('averageErosionRate')} m/year")

# 2. Segments
segments = test_url('http://127.0.0.1:8000/api/v1/segments')
print(f"Sample Coastal Reaches: {[s['name'] for s in segments[:4]]}")

# 3. Prediction Run
pred = test_url('http://127.0.0.1:8000/api/v1/predictions/run', method='POST', data={
    'segment': 'Visakhapatnam RK Beach',
    'horizon': 5,
    'target_type': 'shoreline_position'
})
print(f"Prediction Result for {pred['segment']}:")
print(f"  - Regression Equation: {pred['equation']}")
print(f"  - Model R^2 Score: {pred['rSquared']}")
print(f"  - Annual Erosion Rate: {pred['erosionRateMPerYr']} m/year")
print(f"  - Projected Target Shoreline: {pred['predictedPositionM']} m")
print(f"  - Assessed Risk Level: {pred['riskLevel']} ({pred['riskActionPriority']})")

# 4. Frontend Delivery
html = test_url('http://localhost:3000')
print(f"Frontend Status: OK (Length: {len(html)} bytes)")

print('--- All Local Services Verified Successfully! ---')
