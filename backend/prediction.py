"""
Module 2 - Erosion Analysis and Prediction
--------------------------------------------
Fits a Linear Regression model (Year -> Shoreline Position) on the cleaned
dataset from Module 1, then projects future shoreline positions and the
long-run erosion rate.
"""

from dataclasses import dataclass

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score


@dataclass
class TrendModel:
    slope: float                # m of shoreline position per year (negative = retreating)
    intercept: float
    r_squared: float
    erosion_rate_m_per_yr: float  # positive = retreating landward
    equation: str
    model: LinearRegression


def fit_trend(df: pd.DataFrame) -> TrendModel:
    """Fit Year -> ShorelinePosition_m with Linear Regression."""
    if len(df) < 2:
        raise ValueError("At least 2 historical data points are required to fit a linear regression model.")

    X = df[["Year"]].values
    y = df["ShorelinePosition_m"].values

    model = LinearRegression()
    model.fit(X, y)

    slope = float(model.coef_[0])
    intercept = float(model.intercept_)
    preds = model.predict(X)
    r2 = float(r2_score(y, preds))

    sign = "+" if intercept >= 0 else "-"
    equation = f"Position = {slope:.3f} × Year {sign} {abs(intercept):.2f}"

    return TrendModel(
        slope=round(slope, 4),
        intercept=round(intercept, 4),
        r_squared=round(max(0.0, r2), 4),
        erosion_rate_m_per_yr=round(-slope, 4),
        equation=equation,
        model=model,
    )


def predict_future(trend: TrendModel, last_year: int, horizon_years: int) -> pd.DataFrame:
    """Project shoreline position for each of the next `horizon_years` years."""
    if horizon_years < 1:
        horizon_years = 1
    future_years = np.arange(last_year + 1, last_year + horizon_years + 1).reshape(-1, 1)
    predicted = trend.model.predict(future_years)
    return pd.DataFrame({
        "Year": future_years.flatten(),
        "PredictedPosition_m": np.round(predicted, 3),
    })


def analyse(df: pd.DataFrame, horizon_years: int = 5):
    """Full Module 2 pipeline: fit trend + project forward."""
    trend = fit_trend(df)
    last_year = int(df["Year"].max())
    future = predict_future(trend, last_year, horizon_years)
    return trend, future


if __name__ == "__main__":
    import sys
    sys.path.insert(0, ".")
    from data_processing import process

    path = sys.argv[1] if len(sys.argv) > 1 else "coastal_data.csv"
    horizon = int(sys.argv[2]) if len(sys.argv) > 2 else 5

    cleaned = process(path)
    trend, future = analyse(cleaned, horizon)

    print(f"Equation: {trend.equation}")
    print(f"Slope: {trend.slope:.4f} m/yr  |  Erosion rate: {trend.erosion_rate_m_per_yr} m/yr")
    print(f"R^2 fit: {trend.r_squared:.4f}")
    print("\nProjected shoreline position:")
    print(future.to_string(index=False))
