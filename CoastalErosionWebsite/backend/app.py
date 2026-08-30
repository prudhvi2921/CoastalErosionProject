"""
Flask web backend for the Coastal Erosion & Dynamic Dataset Prediction System.

Connects Modules 1-4:
- data_processing.py (Module 1): Dynamic CSV inspection, cleaning, and validation
- prediction.py (Module 2): Dynamic Scikit-learn Linear Regression trend modeling & forecasting
- risk_assessment.py (Module 3): Multi-tier risk classification & actionable engineering mitigation
- visualization.py (Module 4): High-resolution Matplotlib dynamic trend & rate charts

Compatible with Local run, Gunicorn, Docker, and Vercel Serverless.
"""

import glob
import os
import sys
import tempfile
import time
import uuid

from flask import Flask, jsonify, request, send_from_directory

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from data_processing import (
    clean_dynamic_data,
    compute_dynamic_changes,
    get_segments,
    inspect_dataset,
    load_data,
    process_dynamic,
    read_csv_safely,
)
from prediction import analyse_dynamic
from risk_assessment import classify_risk
from visualization import plot_dynamic_rate, plot_dynamic_trend

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
    return send_from_directory(CHART_DIR, filename)


@app.route("/api/sample")
def sample():
    try:
        with open(SAMPLE_CSV, "r", encoding="utf-8") as f:
            content = f.read()
        inspection = inspect_dataset(SAMPLE_CSV)
        return jsonify({
            "status": "success",
            "csv": content,
            "filename": "coastal_data.csv",
            "segments": inspection.get("locations", ["Coastal Area A"]),
            "inspection": inspection
        })
    except Exception as exc:
        return jsonify({"status": "error", "error": str(exc)}), 500


@app.route("/api/inspect", methods=["POST"])
def inspect():
    run_id = uuid.uuid4().hex[:10]
    temp_path = os.path.join(UPLOAD_DIR, f"inspect_{run_id}.csv")

    try:
        if "file" in request.files:
            request.files["file"].save(temp_path)
        elif request.is_json and request.json.get("csv"):
            with open(temp_path, "w", encoding="utf-8") as f:
                f.write(request.json["csv"])
        else:
            return jsonify({"status": "error", "error": "No CSV file or data provided"}), 400

        result = inspect_dataset(temp_path)
        return jsonify({
            "status": "success",
            "columns": result["columns"],
            "numericColumns": result["numericColumns"],
            "textColumns": result["textColumns"],
            "columnTypes": result["columnTypes"],
            "preview": result["preview"],
            "rowCount": result["rowCount"],
            "autoMapping": result["autoMapping"],
            "locations": result["locations"]
        })
    except Exception as exc:
        return jsonify({"status": "error", "error": str(exc)}), 400
    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass


@app.route("/api/segments", methods=["POST"])
def inspect_segments():
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

        loc_col = request.form.get("location_col") or (request.json or {}).get("location_col", "Segment")
        segments = get_segments(temp_path, location_col=loc_col)
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
    clean_old_charts()

    form_data = request.form if request.form else (request.json or {})

    time_col = form_data.get("time_col")
    target_col = form_data.get("target_col")
    location_col = form_data.get("location_col")
    segment = form_data.get("segment")
    target_type = form_data.get("target_type", "shoreline_position")

    if segment:
        segment = str(segment).strip()
    if location_col and (location_col.lower() in ["none", "null", "all", ""]):
        location_col = None

    horizon_raw = form_data.get("horizon", 5)
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
        return jsonify({"status": "error", "error": "No CSV file or csv text provided"}), 400

    try:
        if not time_col or not target_col:
            inspection = inspect_dataset(csv_path)
            time_col = time_col or inspection["autoMapping"]["timeColumn"]
            target_col = target_col or inspection["autoMapping"]["targetColumn"]
            if not location_col and inspection["autoMapping"]["locationColumn"]:
                location_col = inspection["autoMapping"]["locationColumn"]

        cleaned = process_dynamic(
            csv_path=csv_path,
            time_col=time_col,
            target_col=target_col,
            location_col=location_col,
            location_val=segment,
            min_records=5
        )

        actual_segment = cleaned.attrs.get("segment_name", segment or "Observed Region")
        available_segments = cleaned.attrs.get("available_segments", [actual_segment])

        trend, future = analyse_dynamic(cleaned, horizon_years=horizon)

        first_time = float(cleaned["StandardTime"].min())
        last_time = float(cleaned["StandardTime"].max())
        target_time = float(future["StandardTime"].max())

        first_time_disp = int(first_time) if first_time.is_integer() else round(first_time, 1)
        last_time_disp = int(last_time) if last_time.is_integer() else round(last_time, 1)
        target_time_disp = int(target_time) if target_time.is_integer() else round(target_time, 1)

        initial_val = float(cleaned.iloc[0]["StandardTarget"])
        final_hist_val = float(cleaned.iloc[-1]["StandardTarget"])
        predicted_val = float(future.iloc[-1]["StandardTarget"])
        total_historical_change = round(final_hist_val - initial_val, 3)

        annual_retreat_rate = trend.erosion_rate_m_per_yr if target_type != "erosion_rate" else abs(float(cleaned["StandardTarget"].mean()))
        risk = classify_risk(annual_retreat_rate)

        trend_chart_name = f"{run_id}_trend.png"
        rate_chart_name = f"{run_id}_rate.png"

        plot_dynamic_trend(
            history=cleaned,
            future=future,
            segment=actual_segment,
            out_path=os.path.join(CHART_DIR, trend_chart_name),
            time_label=time_col,
            target_label=target_col
        )
        plot_dynamic_rate(
            history=cleaned,
            segment=actual_segment,
            out_path=os.path.join(CHART_DIR, rate_chart_name),
            time_label=time_col,
            target_label=target_col
        )

        display_cols = list(cleaned.columns)
        display_cols = [c for c in display_cols if not c.startswith("_") and c not in ["StandardTime", "StandardTarget"]]
        history_records = cleaned[display_cols].to_dict(orient="records")
        future_records = future[["Year", "PredictedPosition_m", "StandardTime", "StandardTarget"]].to_dict(orient="records")

        return jsonify({
            "status": "success",
            "selectedTimeColumn": time_col,
            "selectedTargetColumn": target_col,
            "selectedLocationColumn": location_col or "None",
            "targetType": target_type,
            "segment": actual_segment,
            "availableSegments": available_segments,
            "recordCount": int(len(cleaned)),
            "droppedInvalidRows": int(cleaned.attrs.get("dropped_invalid_rows", 0)),
            "droppedDuplicateRows": int(cleaned.attrs.get("dropped_duplicate_rows", 0)),
            "firstYear": first_time_disp,
            "lastYear": last_time_disp,
            "targetYear": target_time_disp,
            "horizonYears": horizon,
            "initialPositionM": initial_val,
            "lastHistoricalPositionM": final_hist_val,
            "totalHistoricalRetreatM": round(abs(total_historical_change), 3),
            "totalHistoricalChange": total_historical_change,
            "slope": trend.slope,
            "intercept": trend.intercept,
            "equation": trend.equation,
            "rSquared": trend.r_squared,
            "erosionRateMPerYr": trend.erosion_rate_m_per_yr,
            "predictedPositionM": round(predicted_val, 3),
            "predictedTargetVal": round(predicted_val, 3),
            "riskLevel": risk.level,
            "riskDescription": risk.description,
            "riskColor": risk.color,
            "riskActionPriority": risk.action_priority,
            "riskRecommendations": risk.recommendations,
            "history": history_records,
            "future": future_records,
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


application = app

if __name__ == "__main__":
    debug_mode = os.environ.get("FLASK_DEBUG") == "1"
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting Coastal Erosion Dynamic Prediction Server on http://localhost:{port}")
    app.run(debug=debug_mode, host="0.0.0.0", port=port)
