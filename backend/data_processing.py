"""
Module 1 - Data Collection and Data Processing
-----------------------------------------------
Loads a year-wise shoreline CSV, validates it, removes duplicate/invalid
records, and derives Shoreline Change and Erosion Rate for each year.

Expected input columns (order does not matter):
    Year, Segment, Latitude, Longitude, ShorelinePosition_m, DataSource
"""

import pandas as pd

REQUIRED_COLUMNS = ["Year", "Segment", "ShorelinePosition_m"]


def load_data(csv_path: str) -> pd.DataFrame:
    """Read the raw CSV exactly as collected from NCCR / USGS / survey exports."""
    try:
        df = pd.read_csv(csv_path, encoding="utf-8-sig")
    except UnicodeDecodeError:
        df = pd.read_csv(csv_path, encoding="latin1")

    # Clean whitespace in column names
    df.columns = [str(c).strip() for c in df.columns]

    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        raise ValueError(
            f"Input CSV is missing required column(s): {', '.join(missing)}. "
            f"Found columns: {', '.join(df.columns)}. "
            f"Required columns are: {', '.join(REQUIRED_COLUMNS)}"
        )
    return df


def get_segments(csv_path: str) -> list[str]:
    """Extract list of unique segment names from CSV."""
    df = load_data(csv_path)
    if "Segment" in df.columns:
        segments = [str(s).strip() for s in df["Segment"].dropna().unique() if str(s).strip()]
        return sorted(list(set(segments)))
    return []


def clean_data(df: pd.DataFrame, segment: str | None = None) -> pd.DataFrame:
    """
    Clean the raw dataset:
      - optionally filter to a single coastal segment (or auto-select if single segment)
      - drop rows with missing/invalid position or year
      - drop duplicate (Year, Segment) records, keeping the first
      - sort chronologically
    """
    work = df.copy()
    work["Segment"] = work["Segment"].astype(str).str.strip()

    available_segments = sorted(list(set(work["Segment"].dropna().unique())))

    if segment and str(segment).strip():
        segment_clean = str(segment).strip()
        matched = work[work["Segment"].str.lower() == segment_clean.lower()]
        if matched.empty:
            raise ValueError(
                f"Segment '{segment_clean}' was not found in the dataset. "
                f"Available segments: {', '.join(available_segments)}"
            )
        work = matched
        # Preserve original segment casing
        actual_segment = work["Segment"].iloc[0]
    elif len(available_segments) == 1:
        actual_segment = available_segments[0]
        work = work[work["Segment"] == actual_segment]
    elif len(available_segments) > 1:
        raise ValueError(
            f"Multiple coastal segments found ({', '.join(available_segments)}). "
            f"Please specify which segment to analyze."
        )
    else:
        raise ValueError("No coastal segments found in the dataset.")

    work["Year"] = pd.to_numeric(work["Year"], errors="coerce")
    work["ShorelinePosition_m"] = pd.to_numeric(work["ShorelinePosition_m"], errors="coerce")

    before_invalid = len(work)
    work = work.dropna(subset=["Year", "ShorelinePosition_m"])
    dropped_invalid = before_invalid - len(work)

    before_dupes = len(work)
    work = work.drop_duplicates(subset=["Year", "Segment"], keep="first")
    dropped_dupes = before_dupes - len(work)

    work["Year"] = work["Year"].astype(int)
    work = work.sort_values("Year").reset_index(drop=True)

    if len(work) < 2:
        raise ValueError(
            f"At least 2 valid historical records are required for trend analysis. "
            f"Found {len(work)} valid rows after cleaning."
        )

    work.attrs["segment_name"] = actual_segment
    work.attrs["dropped_invalid_rows"] = dropped_invalid
    work.attrs["dropped_duplicate_rows"] = dropped_dupes
    work.attrs["available_segments"] = available_segments
    return work


def compute_changes(df: pd.DataFrame) -> pd.DataFrame:
    """Add ShorelineChange_m (vs previous year) and ErosionRate_m_per_yr columns.

    Retreat convention: a positive ErosionRate means the shoreline moved
    landward (eroded) that year; a negative value means accretion (growth).
    """
    work = df.copy()
    work["ShorelineChange_m"] = work["ShorelinePosition_m"].diff()
    work["YearsElapsed"] = work["Year"].diff()

    # Avoid division by zero if years are somehow identical
    years_elapsed = work["YearsElapsed"].replace(0, 1)
    work["ErosionRate_m_per_yr"] = (-work["ShorelineChange_m"] / years_elapsed).round(3)
    work.loc[work.index[0], ["ShorelineChange_m", "ErosionRate_m_per_yr"]] = 0.0
    return work


def process(csv_path: str, segment: str | None = None) -> pd.DataFrame:
    """Full Module 1 pipeline: load -> clean -> derive change/erosion columns."""
    raw = load_data(csv_path)
    cleaned = clean_data(raw, segment=segment)
    return compute_changes(cleaned)


if __name__ == "__main__":
    import sys

    path = sys.argv[1] if len(sys.argv) > 1 else "coastal_data.csv"
    result = process(path)
    print(result.to_string(index=False))
    print(f"\nAnalyzed Segment: {result.attrs.get('segment_name')}")
    print(f"Dropped invalid rows: {result.attrs.get('dropped_invalid_rows')}")
    print(f"Dropped duplicate rows: {result.attrs.get('dropped_duplicate_rows')}")
