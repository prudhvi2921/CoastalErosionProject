"""
Module 1 - Data Collection and Data Processing (Dynamic & Backward-Compatible)
-------------------------------------------------------------------------------
Loads, inspects, validates, cleans, and derives change statistics for any
coastal erosion or time-series survey dataset.

Supports dynamic column mappings (Time, Location, Target) as well as the
built-in standard dataset schema (Year, Segment, ShorelinePosition_m).
"""

from typing import Any, Dict, List, Optional, Tuple
import numpy as np
import pandas as pd

REQUIRED_COLUMNS = ["Year", "Segment", "ShorelinePosition_m"]


def read_csv_safely(csv_path: str) -> pd.DataFrame:
    """Read a CSV file with fallback encoding and cleaned column names."""
    try:
        df = pd.read_csv(csv_path, encoding="utf-8-sig")
    except UnicodeDecodeError:
        df = pd.read_csv(csv_path, encoding="latin1")

    # Clean whitespace in column names
    df.columns = [str(c).strip() for c in df.columns]
    return df


def inspect_dataset(csv_path: str) -> Dict[str, Any]:
    """
    Inspect an uploaded CSV dataset:
      - Detects all column names.
      - Infeers column data types (numeric vs text/categorical).
      - Extracts first 10 rows preview.
      - Computes intelligent auto-mapping suggestions for Time, Location, and Target.
      - Discovers available location segments.
    """
    df = read_csv_safely(csv_path)
    all_columns = list(df.columns)
    
    numeric_columns: List[str] = []
    text_columns: List[str] = []
    column_types: Dict[str, str] = {}

    for col in all_columns:
        series_clean = df[col].dropna()
        if len(series_clean) == 0:
            column_types[col] = "empty"
            continue

        # Try converting to numeric
        numeric_series = pd.to_numeric(series_clean, errors="coerce")
        valid_numeric_ratio = numeric_series.notna().sum() / len(series_clean)

        if valid_numeric_ratio >= 0.7:
            numeric_columns.append(col)
            column_types[col] = "numeric"
        else:
            text_columns.append(col)
            column_types[col] = "text"

    # Preview first 10 rows (formatted cleanly for JSON)
    preview_df = df.head(10).replace({np.nan: None})
    preview_rows = preview_df.to_dict(orient="records")

    # Auto-detection heuristic for Time column
    time_keywords = ["year", "date", "time", "period", "survey_year", "yr", "timestamp"]
    suggested_time = None
    for kw in time_keywords:
        for col in all_columns:
            if col.lower() == kw or kw in col.lower():
                suggested_time = col
                break
        if suggested_time:
            break
    if not suggested_time and numeric_columns:
        suggested_time = numeric_columns[0]

    # Auto-detection heuristic for Location column
    location_keywords = ["segment", "location", "area", "coastal_segment", "site", "beach", "transect", "region", "station", "place"]
    suggested_location = None
    for kw in location_keywords:
        for col in all_columns:
            if col.lower() == kw or kw in col.lower():
                suggested_location = col
                break
        if suggested_location:
            break
    if not suggested_location and text_columns:
        suggested_location = text_columns[0]

    # Auto-detection heuristic for Target column
    target_keywords = [
        "shoreline_position", "shorelineposition_m", "shorelineposition", "shoreline_pos",
        "beach_width", "position", "erosion_rate", "erosionrate_m_per_yr", "shoreline_change",
        "retreat", "width", "distance"
    ]
    suggested_target = None
    for kw in target_keywords:
        for col in numeric_columns:
            if col.lower() == kw or kw in col.lower():
                suggested_target = col
                break
        if suggested_target:
            break
    if not suggested_target and numeric_columns:
        available_numeric = [c for c in numeric_columns if c != suggested_time]
        suggested_target = available_numeric[0] if available_numeric else numeric_columns[0]

    # Extract unique values for location column if present
    locations: List[str] = []
    if suggested_location and suggested_location in df.columns:
        raw_locs = df[suggested_location].dropna().astype(str).str.strip().unique()
        locations = sorted([loc for loc in raw_locs if loc])

    return {
        "columns": all_columns,
        "numericColumns": numeric_columns,
        "textColumns": text_columns,
        "columnTypes": column_types,
        "preview": preview_rows,
        "rowCount": int(len(df)),
        "autoMapping": {
            "timeColumn": suggested_time or (all_columns[0] if all_columns else ""),
            "locationColumn": suggested_location or "",
            "targetColumn": suggested_target or (numeric_columns[0] if numeric_columns else "")
        },
        "locations": locations
    }


def clean_dynamic_data(
    df: pd.DataFrame,
    time_col: str,
    target_col: str,
    location_col: Optional[str] = None,
    location_val: Optional[str] = None,
    min_records: int = 5
) -> pd.DataFrame:
    """
    Clean dataset dynamically based on mapped columns:
      - Validates selected columns exist.
      - Filters by location if a location column and segment are specified.
      - Converts Time and Target columns to numeric.
      - Drops missing / NaN values.
      - Drops duplicate (Time, Location) records.
      - Sorts chronologically by Time.
      - Enforces minimum valid records requirement (default: 5).
    """
    work = df.copy()
    work.columns = [str(c).strip() for c in work.columns]

    if time_col not in work.columns:
        raise ValueError(f"Selected Time column '{time_col}' was not found in dataset. Available: {', '.join(work.columns)}")
    if target_col not in work.columns:
        raise ValueError(f"Selected Target column '{target_col}' was not found in dataset. Available: {', '.join(work.columns)}")

    # Location filtering logic
    actual_location = "All Locations"
    available_locations = []

    if location_col and str(location_col).strip() and str(location_col).strip() != "None" and location_col in work.columns:
        work[location_col] = work[location_col].astype(str).str.strip()
        available_locations = sorted(list(set(work[location_col].dropna().unique())))

        if location_val and str(location_val).strip() and str(location_val).strip() != "ALL":
            loc_clean = str(location_val).strip()
            matched = work[work[location_col].str.lower() == loc_clean.lower()]
            if matched.empty:
                raise ValueError(
                    f"Location '{loc_clean}' was not found under column '{location_col}'. "
                    f"Available locations: {', '.join(available_locations[:10])}"
                )
            work = matched
            actual_location = work[location_col].iloc[0]
        elif len(available_locations) == 1:
            actual_location = available_locations[0]
            work = work[work[location_col] == actual_location]
        elif len(available_locations) > 1:
            if location_val != "ALL":
                raise ValueError(
                    f"Multiple locations found in '{location_col}' ({', '.join(available_locations[:8])}). "
                    f"Please select a specific location/segment to analyze."
                )
            actual_location = "All Locations (Aggregated)"
    elif location_col and location_col not in work.columns and str(location_col).strip() != "None":
        raise ValueError(f"Location column '{location_col}' not found in dataset.")

    # Time column numeric parsing
    raw_time = work[time_col].astype(str)
    parsed_dates = pd.to_datetime(raw_time, errors="coerce")
    if parsed_dates.notna().sum() > len(work) * 0.7:
        work["_NumericTime"] = parsed_dates.dt.year + (parsed_dates.dt.dayofyear / 365.25)
        if (parsed_dates.dt.month == 1).all() and (parsed_dates.dt.day == 1).all():
            work["_NumericTime"] = parsed_dates.dt.year
    else:
        work["_NumericTime"] = pd.to_numeric(work[time_col], errors="coerce")

    # Target column numeric conversion
    work["_NumericTarget"] = pd.to_numeric(work[target_col], errors="coerce")

    before_invalid = len(work)
    work = work.dropna(subset=["_NumericTime", "_NumericTarget"])
    dropped_invalid = before_invalid - len(work)

    # Check duplicates
    before_dupes = len(work)
    if location_col and location_col in work.columns:
        work = work.drop_duplicates(subset=["_NumericTime", location_col], keep="first")
    else:
        work = work.drop_duplicates(subset=["_NumericTime"], keep="first")
    dropped_dupes = before_dupes - len(work)

    # Sort chronologically
    work = work.sort_values("_NumericTime").reset_index(drop=True)

    if len(work) < min_records:
        raise ValueError(
            f"At least {min_records} valid historical records are required for predictive trend analysis. "
            f"Found {len(work)} valid records for '{actual_location}' after cleaning."
        )

    # Assign standardized working columns
    work["StandardTime"] = work["_NumericTime"]
    work["StandardTarget"] = work["_NumericTarget"]

    work.attrs["segment_name"] = actual_location
    work.attrs["time_col"] = time_col
    work.attrs["target_col"] = target_col
    work.attrs["location_col"] = location_col
    work.attrs["dropped_invalid_rows"] = dropped_invalid
    work.attrs["dropped_duplicate_rows"] = dropped_dupes
    work.attrs["available_segments"] = available_locations

    return work


def compute_dynamic_changes(df: pd.DataFrame) -> pd.DataFrame:
    """
    Compute delta change and rate of change between consecutive time steps dynamically:
      - Change = Target[t] - Target[t-1]
      - Rate = Change / (Time[t] - Time[t-1])
    """
    work = df.copy()
    time_s = work["StandardTime"]
    target_s = work["StandardTarget"]

    work["DeltaChange"] = target_s.diff().fillna(0.0)
    work["TimeElapsed"] = time_s.diff().fillna(0.0)

    time_elapsed = work["TimeElapsed"].replace(0, 1)
    work["RateOfChange"] = (work["DeltaChange"] / time_elapsed).round(3).fillna(0.0)
    work.loc[work.index[0], ["DeltaChange", "RateOfChange", "TimeElapsed"]] = 0.0
    return work


def process_dynamic(
    csv_path: str,
    time_col: str,
    target_col: str,
    location_col: Optional[str] = None,
    location_val: Optional[str] = None,
    min_records: int = 5
) -> pd.DataFrame:
    """Full dynamic Module 1 pipeline: read -> clean -> compute changes."""
    raw = read_csv_safely(csv_path)
    cleaned = clean_dynamic_data(
        raw,
        time_col=time_col,
        target_col=target_col,
        location_col=location_col,
        location_val=location_val,
        min_records=min_records
    )
    return compute_dynamic_changes(cleaned)


# Backward Compatibility
def load_data(csv_path: str) -> pd.DataFrame:
    df = read_csv_safely(csv_path)
    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        raise ValueError(
            f"Input CSV is missing required column(s): {', '.join(missing)}. "
            f"Found columns: {', '.join(df.columns)}. "
            f"Required columns are: {', '.join(REQUIRED_COLUMNS)}"
        )
    return df


def get_segments(csv_path: str, location_col: str = "Segment") -> List[str]:
    try:
        df = read_csv_safely(csv_path)
        if location_col in df.columns:
            segments = [str(s).strip() for s in df[location_col].dropna().unique() if str(s).strip()]
            return sorted(list(set(segments)))
        insp = inspect_dataset(csv_path)
        return insp.get("locations", [])
    except Exception:
        return []


def clean_data(df: pd.DataFrame, segment: Optional[str] = None) -> pd.DataFrame:
    cleaned = clean_dynamic_data(
        df,
        time_col="Year",
        target_col="ShorelinePosition_m",
        location_col="Segment" if "Segment" in df.columns else None,
        location_val=segment,
        min_records=2
    )
    cleaned["Year"] = cleaned["StandardTime"].astype(int)
    cleaned["ShorelinePosition_m"] = cleaned["StandardTarget"]
    return cleaned


def compute_changes(df: pd.DataFrame) -> pd.DataFrame:
    dynamic_df = compute_dynamic_changes(df)
    dynamic_df["ShorelineChange_m"] = dynamic_df["DeltaChange"].fillna(0.0)
    dynamic_df["YearsElapsed"] = dynamic_df["TimeElapsed"].fillna(0.0)
    dynamic_df["ErosionRate_m_per_yr"] = (-dynamic_df["DeltaChange"] / dynamic_df["YearsElapsed"].replace(0, 1)).round(3).fillna(0.0)
    dynamic_df.loc[dynamic_df.index[0], ["ShorelineChange_m", "ErosionRate_m_per_yr", "YearsElapsed", "TimeElapsed", "DeltaChange", "RateOfChange"]] = 0.0
    return dynamic_df


def process(csv_path: str, segment: Optional[str] = None) -> pd.DataFrame:
    raw = load_data(csv_path)
    cleaned = clean_data(raw, segment=segment)
    return compute_changes(cleaned)
