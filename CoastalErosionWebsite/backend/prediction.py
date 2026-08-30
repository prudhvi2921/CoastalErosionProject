"""
Module 2 - Erosion Analysis and Dynamic Prediction
---------------------------------------------------
Fits a Linear Regression trend model on mapped Time -> Target columns,
then projects future values across a multi-year forecast horizon.

Supports any selected Time column and any selected numeric Target column
(e.g., Shoreline Position, Erosion Rate, Beach Width, Volume).
"""

from dataclasses import dataclass
from typing import Tuple, Union
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score


@dataclass
class TrendModel:
    slope: float                  # change in target per unit time
    intercept: float
    r_squared: float
    erosion_rate_m_per_yr: float  # retreat rate (positive = loss/retreat)
    equation: str
    model: LinearRegression
    time_col: str = "Year"
    target_col: str = "ShorelinePosition_m"


def fit_dynamic_trend(
    df: pd.DataFrame,
    time_col: str = "StandardTime",
    target_col: str = "StandardTarget"
) -> TrendModel:
    """Fit selected Time -> Target with Linear Regression."""
    if len(df) < 2:
        raise ValueError("At least 2 historical data points are required to fit a linear regression trend.")

    t_col = time_col if time_col in df.columns else ("Year" if "Year" in df.columns else df.columns[0])
    y_col = target_col if target_col in df.columns else ("ShorelinePosition_m" if "ShorelinePosition_m" in df.columns else df.columns[1])

    display_t = df.attrs.get("time_col", t_col)
    display_y = df.attrs.get("target_col", y_col)

    X = df[[t_col]].values.reshape(-1, 1)
    y = df[y_col].values

    model = LinearRegression()
    model.fit(X, y)

    slope = float(model.coef_[0])
    intercept = float(model.intercept_)
    preds = model.predict(X)
    r2 = float(r2_score(y, preds))

    sign = "+" if intercept >= 0 else "-"
    equation = f"{display_y} = {slope:.3f} × {display_t} {sign} {abs(intercept):.2f}"

    return TrendModel(
        slope=round(slope, 4),
        intercept=round(intercept, 4),
        r_squared=round(max(0.0, r2), 4),
        erosion_rate_m_per_yr=round(-slope, 4),
        equation=equation,
        model=model,
        time_col=display_t,
        target_col=display_y
    )


def predict_dynamic_future(
    trend: TrendModel,
    last_time_val: float,
    horizon_years: int = 5,
    time_col_name: str = "Year",
    target_col_name: str = "PredictedPosition_m"
) -> pd.DataFrame:
    """Project target values for each of the next `horizon_years` time steps."""
    if horizon_years < 1:
        horizon_years = 1

    if float(last_time_val).is_integer():
        future_steps = np.arange(int(last_time_val) + 1, int(last_time_val) + horizon_years + 1).reshape(-1, 1)
    else:
        future_steps = np.arange(last_time_val + 1.0, last_time_val + float(horizon_years) + 1.0).reshape(-1, 1)

    predicted = trend.model.predict(future_steps)

    out_df = pd.DataFrame({
        "Year": future_steps.flatten().astype(int) if float(last_time_val).is_integer() else np.round(future_steps.flatten(), 2),
        "PredictedPosition_m": np.round(predicted, 3),
        "StandardTime": future_steps.flatten(),
        "StandardTarget": np.round(predicted, 3)
    })

    if time_col_name != "Year":
        out_df[time_col_name] = out_df["Year"]
    if target_col_name != "PredictedPosition_m":
        out_df[target_col_name] = out_df["PredictedPosition_m"]

    return out_df


def analyse_dynamic(
    df: pd.DataFrame,
    horizon_years: int = 5,
    time_col: str = "StandardTime",
    target_col: str = "StandardTarget"
) -> Tuple[TrendModel, pd.DataFrame]:
    """Full dynamic Module 2 pipeline: fit trend + project forward."""
    t_col = time_col if time_col in df.columns else "Year"
    y_col = target_col if target_col in df.columns else "ShorelinePosition_m"

    trend = fit_dynamic_trend(df, time_col=t_col, target_col=y_col)
    last_time = float(df[t_col].max())
    future = predict_dynamic_future(
        trend,
        last_time_val=last_time,
        horizon_years=horizon_years,
        time_col_name=df.attrs.get("time_col", "Year"),
        target_col_name=f"Predicted_{df.attrs.get('target_col', 'Target')}"
    )
    return trend, future


def fit_trend(df: pd.DataFrame) -> TrendModel:
    t_col = "StandardTime" if "StandardTime" in df.columns else "Year"
    y_col = "StandardTarget" if "StandardTarget" in df.columns else "ShorelinePosition_m"
    return fit_dynamic_trend(df, time_col=t_col, target_col=y_col)


def predict_future(trend: TrendModel, last_year: int, horizon_years: int) -> pd.DataFrame:
    return predict_dynamic_future(trend, float(last_year), horizon_years)


def analyse(df: pd.DataFrame, horizon_years: int = 5):
    return analyse_dynamic(df, horizon_years=horizon_years)
