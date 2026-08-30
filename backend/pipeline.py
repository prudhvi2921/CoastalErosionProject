"""
Pipeline - wires Module 1 (data processing), Module 2 (prediction),
Module 3 (risk assessment) and Module 4 (visualization) together.

This is the single entry point for desktop/CLI runs and automated batch tasks.
"""

import argparse
import os

from data_processing import process
from prediction import analyse
from risk_assessment import classify_risk
from visualization import plot_trend, plot_erosion_rate


def run(csv_path: str, segment: str | None, horizon: int, out_dir: str) -> dict:
    os.makedirs(out_dir, exist_ok=True)

    # Module 1
    cleaned = process(csv_path, segment=segment)
    actual_segment = cleaned.attrs.get("segment_name", segment or "Default Segment")

    # Module 2
    trend, future = analyse(cleaned, horizon)
    first_year = int(cleaned["Year"].min())
    last_year = int(cleaned["Year"].max())
    target_year = last_year + horizon
    initial_pos = float(cleaned.iloc[0]["ShorelinePosition_m"])
    final_historical_pos = float(cleaned.iloc[-1]["ShorelinePosition_m"])
    predicted_position = float(future.iloc[-1]["PredictedPosition_m"])
    total_historical_retreat = round(initial_pos - final_historical_pos, 3)

    # Module 3
    risk = classify_risk(trend.erosion_rate_m_per_yr)

    # Module 4
    trend_chart = plot_trend(cleaned, future, actual_segment, os.path.join(out_dir, "trend_chart.png"))
    rate_chart = plot_erosion_rate(cleaned, actual_segment, os.path.join(out_dir, "erosion_rate_chart.png"))

    results = {
        "segment": actual_segment,
        "recordCount": len(cleaned),
        "droppedInvalidRows": cleaned.attrs.get("dropped_invalid_rows", 0),
        "droppedDuplicateRows": cleaned.attrs.get("dropped_duplicate_rows", 0),
        "firstYear": first_year,
        "lastYear": last_year,
        "targetYear": target_year,
        "horizonYears": horizon,
        "initialPositionM": initial_pos,
        "lastHistoricalPositionM": final_historical_pos,
        "totalHistoricalRetreatM": total_historical_retreat,
        "slope": round(trend.slope, 4),
        "intercept": round(trend.intercept, 4),
        "equation": trend.equation,
        "rSquared": round(trend.r_squared, 4),
        "erosionRateMPerYr": trend.erosion_rate_m_per_yr,
        "predictedPositionM": round(predicted_position, 3),
        "riskLevel": risk.level,
        "riskDescription": risk.description,
        "riskActionPriority": risk.action_priority,
        "trendChartPath": os.path.abspath(trend_chart),
        "erosionRateChartPath": os.path.abspath(rate_chart),
    }

    out_file = os.path.join(out_dir, "results.properties")
    with open(out_file, "w") as f:
        for key, value in results.items():
            f.write(f"{key}={value}\n")

    return results


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Coastal erosion prediction pipeline")
    parser.add_argument("--csv", required=True, help="Path to input CSV (Module 1)")
    parser.add_argument("--segment", default=None, help="Coastal segment name to analyse")
    parser.add_argument("--horizon", type=int, default=5, help="Years ahead to predict")
    parser.add_argument("--out", default="outputs", help="Output directory for charts + results file")
    args = parser.parse_args()

    results = run(args.csv, args.segment, args.horizon, args.out)

    for key, value in results.items():
        print(f"{key}={value}")
