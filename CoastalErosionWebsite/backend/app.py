"""
Flask web backend for the Coastal Erosion Prediction & Risk Assessment System.

This connects Modules 1-4:
- data_processing.py (Module 1): Clean CSV, calculate historical changes & rates
- prediction.py (Module 2): Scikit-learn Linear Regression trend modeling & forecasting
- risk_assessment.py (Module 3): Multi-tier risk classification & actionable mitigation
- visualization.py (Module 4): High-resolution Matplotlib trend & rate visualizations

Compatible with Local run, Gunicorn, Docker, and Vercel Serverless.
"""

import glob
import os
import sys
import tempfile
import time
import uuid

from flask import Flask, jsonify, request, send_from_directory

# Ensure backend directory is on sys.path for direct imports on Vercel / serverless
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from data_processing import clean_data, compute_changes, get_segments, load_data, process
from prediction import analyse
from risk_assessment import classify_risk
from visualization import plot_erosion_rate, plot_trend

# Handle Vercel / Serverless read-only filesystem by routing writes to /tmp
IS_SERVERLESS = os.environ.get("VERCEL") == "1" or not os.access(BASE_DIR, os.W_OK)

if IS_SERVERLESS:
    TEMP_BASE = tempfile.gettempdir()
    UPLOAD_DIR = os.path.join(TEMP_BASE, "coastal_uploads")
    CHART_DIR = os.path.join(TEMP_BASE, "coastal_charts")
else:
    UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
    CHART_DIR = os.path.join(BASE_DIR, "static", "charts")

SAMPLE_CSV = os.path.join(BASE_DIR, "coastal_data.csv")

try:
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    os.makedirs(CHART_DIR, exist_ok=True)
except Exception:
    pass

# Dynamically locate frontend directory regardless of working directory / deployment layout
candidate_paths = [
    os.path.abspath(os.path.join(BASE_DIR, "..", "frontend")),
    os.path.abspath(os.path.join(BASE_DIR, "frontend")),
    os.path.abspath(os.path.join(os.getcwd(), "frontend")),
    BASE_DIR,
]
FRONTEND_DIR = next((p for p in candidate_paths if os.path.exists(os.path.join(p, "index.html"))), candidate_paths[0])

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path="")


def clean_old_charts(max_age_seconds: int = 1800):
    """Remove chart files older than 30 minutes to prevent storage buildup."""
    now = time.time()
    for file_path in glob.glob(os.path.join(CHART_DIR, "*.png")):
        try:
            if os.stat(file_path).st_mtime < now - max_age_seconds:
                os.remove(file_path)
        except Exception:
            pass


@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")


@app.route("/static/charts/<path:filename>")
def serve_chart(filename):
    """Explicit route to serve dynamically generated charts from CHART_DIR."""
    return send_from_directory(CHART_DIR, filename)


@app.route("/api/sample")
def sample():
    """Returns the built-in demo dataset along with its available coastal segments."""
    try:
        with open(SAMPLE_CSV, "r", encoding="utf-8") as f:
            content = f.read()
        segments = get_segments(SAMPLE_CSV)
        return jsonify({
            "status": "success",
            "csv": content,
            "filename": "coastal_data.csv",
            "segments": segments,
        })
    except Exception as exc:
        return jsonify({"status": "error", "error": str(exc)}), 500


@app.route("/api/segments", methods=["POST"])
def inspect_segments():
    """Extract list of coastal segments from an uploaded or raw CSV."""
    run_id = uuid.uuid4().hex[:10]
    temp_path = os.path.join(UPLOAD_DIR, f"temp_{run_id}.csv")

    try:
        if "file" in request.files:
            request.files["file"].save(temp_path)
        elif request.is_json and request.json.get("csv"):
            with open(temp_path, "w", encoding="utf-8") as f:
                f.write(request.json["csv"])
        else:
            return jsonify({"error": "No CSV file or data provided"}), 400

        segments = get_segments(temp_path)
        return jsonify({"status": "success", "segments": segments})
    except Exception as exc:
        return jsonify({"status": "error", "error": str(exc)}), 400
    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass


@app.route("/api/analyze", methods=["POST"])
def analyze():
    """
    Accepts either:
      - multipart/form-data with a 'file' field (CSV upload), or
      - application/json with a 'csv' string field (raw CSV text)
    plus form/json fields 'segment' and 'horizon'.
    """
    clean_old_charts()

    segment = request.form.get("segment") or (request.json or {}).get("segment")
    if segment:
        segment = str(segment).strip()

    horizon_raw = request.form.get("horizon") or (request.json or {}).get("horizon", 5)
    try:
        horizon = max(1, min(50, int(horizon_raw)))
    except (TypeError, ValueError):
        horizon = 5

    run_id = uuid.uuid4().hex[:10]
    csv_path = os.path.join(UPLOAD_DIR, f"{run_id}.csv")

    if "file" in request.files:
        request.files["file"].save(csv_path)
    elif request.is_json and request.json.get("csv"):
        with open(csv_path, "w", encoding="utf-8") as f:
            f.write(request.json["csv"])
    else:
        return jsonify({"error": "No CSV file or csv text provided"}), 400

    try:
        cleaned = process(csv_path, segment=segment)
        actual_segment = cleaned.attrs.get("segment_name", segment or "Default Segment")
        available_segments = cleaned.attrs.get("available_segments", [actual_segment])

        trend, future = analyse(cleaned, horizon)

        first_year = int(cleaned["Year"].min())
        last_year = int(cleaned["Year"].max())
        target_year = last_year + horizon

        initial_pos = float(cleaned.iloc[0]["ShorelinePosition_m"])
        final_hist_pos = float(cleaned.iloc[-1]["ShorelinePosition_m"])
        predicted_position = float(future.iloc[-1]["PredictedPosition_m"])
        total_historical_retreat = round(initial_pos - final_hist_pos, 3)

        risk = classify_risk(trend.erosion_rate_m_per_yr)

        trend_chart_name = f"{run_id}_trend.png"
        rate_chart_name = f"{run_id}_rate.png"
        plot_trend(cleaned, future, actual_segment, os.path.join(CHART_DIR, trend_chart_name))
        plot_erosion_rate(cleaned, actual_segment, os.path.join(CHART_DIR, rate_chart_name))

        # Build table columns
        cols = [c for c in ["Year", "ShorelinePosition_m", "ShorelineChange_m", "ErosionRate_m_per_yr", "DataSource", "Latitude", "Longitude"] if c in cleaned.columns]
        history_records = cleaned[cols].to_dict(orient="records")

        return jsonify({
            "status": "success",
            "segment": actual_segment,
            "availableSegments": available_segments,
            "recordCount": int(len(cleaned)),
            "droppedInvalidRows": int(cleaned.attrs.get("dropped_invalid_rows", 0)),
            "droppedDuplicateRows": int(cleaned.attrs.get("dropped_duplicate_rows", 0)),
            "firstYear": first_year,
            "lastYear": last_year,
            "targetYear": target_year,
            "horizonYears": horizon,
            "initialPositionM": initial_pos,
            "lastHistoricalPositionM": final_hist_pos,
            "totalHistoricalRetreatM": total_historical_retreat,
            "slope": trend.slope,
            "intercept": trend.intercept,
            "equation": trend.equation,
            "rSquared": trend.r_squared,
            "erosionRateMPerYr": trend.erosion_rate_m_per_yr,
            "predictedPositionM": round(predicted_position, 3),
            "riskLevel": risk.level,
            "riskDescription": risk.description,
            "riskColor": risk.color,
            "riskActionPriority": risk.action_priority,
            "riskRecommendations": risk.recommendations,
            "history": history_records,
            "future": future.to_dict(orient="records"),
            "trendChartUrl": f"/static/charts/{trend_chart_name}",
            "erosionRateChartUrl": f"/static/charts/{rate_chart_name}",
        })
    except Exception as exc:
        return jsonify({"status": "error", "error": str(exc)}), 400
    finally:
        if os.path.exists(csv_path):
            try:
                os.remove(csv_path)
            except Exception:
                pass


# Expose app for Vercel/WSGI
application = app

if __name__ == "__main__":
    debug_mode = os.environ.get("FLASK_DEBUG") == "1"
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting Coastal Erosion Prediction Server on http://localhost:{port}")
    app.run(debug=debug_mode, host="0.0.0.0", port=port)
