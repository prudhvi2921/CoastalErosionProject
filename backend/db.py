"""
SQLite Database Layer for Coastal Erosion Prediction & Risk Assessment System
------------------------------------------------------------------------------
Provides persistent storage for:
- Datasets & Preprocessing runs
- Coastal Segments
- Prediction Runs
- Risk Assessments
- Configurable Risk Thresholds
- Generated Reports & Audit Logs
"""

import json
import os
import sqlite3
from datetime import datetime
from typing import Any, Dict, List, Optional

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "coastal_intelligence.db")


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Create tables if they do not exist and seed initial config."""
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Datasets table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS datasets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        filename TEXT NOT NULL,
        upload_time TEXT NOT NULL,
        row_count INTEGER DEFAULT 0,
        valid_row_count INTEGER DEFAULT 0,
        rejected_row_count INTEGER DEFAULT 0,
        column_mapping TEXT,
        raw_data TEXT,
        cleaned_data TEXT,
        validation_errors TEXT,
        segments TEXT,
        status TEXT DEFAULT 'UPLOADED'
    )
    """)

    # 2. Prediction Runs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS prediction_runs (
        id TEXT PRIMARY KEY,
        dataset_id TEXT,
        segment_name TEXT NOT NULL,
        horizon_years INTEGER NOT NULL,
        target_year INTEGER NOT NULL,
        slope REAL NOT NULL,
        intercept REAL NOT NULL,
        r_squared REAL NOT NULL,
        equation TEXT NOT NULL,
        erosion_rate_m_per_yr REAL NOT NULL,
        predicted_position_m REAL NOT NULL,
        projected_retreat_m REAL DEFAULT 0,
        risk_level TEXT NOT NULL,
        risk_color TEXT NOT NULL,
        risk_description TEXT NOT NULL,
        risk_action_priority TEXT NOT NULL,
        risk_recommendations TEXT NOT NULL,
        history_data TEXT NOT NULL,
        future_data TEXT NOT NULL,
        created_at TEXT NOT NULL,
        trend_chart_url TEXT,
        rate_chart_url TEXT,
        FOREIGN KEY (dataset_id) REFERENCES datasets(id)
    )
    """)

    # 3. Threshold Configuration table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS threshold_config (
        id INTEGER PRIMARY KEY,
        low_max REAL DEFAULT 1.0,
        moderate_max REAL DEFAULT 2.0,
        high_max REAL DEFAULT 3.0,
        updated_at TEXT NOT NULL
    )
    """)

    # 4. Reports table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        run_id TEXT NOT NULL,
        dataset_id TEXT,
        segment_name TEXT NOT NULL,
        title TEXT NOT NULL,
        summary_notes TEXT,
        pdf_path TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (run_id) REFERENCES prediction_runs(id)
    )
    """)

    # Seed default threshold configuration if not present
    cursor.execute("SELECT COUNT(*) FROM threshold_config WHERE id = 1")
    if cursor.fetchone()[0] == 0:
        cursor.execute(
            "INSERT INTO threshold_config (id, low_max, moderate_max, high_max, updated_at) VALUES (1, 1.0, 2.0, 3.0, ?)",
            (datetime.utcnow().isoformat(),)
        )

    conn.commit()
    conn.close()


# ==============================================================================
# Threshold Configuration Queries
# ==============================================================================

def get_threshold_config() -> Dict[str, float]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT low_max, moderate_max, high_max FROM threshold_config WHERE id = 1")
    row = cursor.fetchone()
    conn.close()
    if row:
        return {
            "low_max": float(row["low_max"]),
            "moderate_max": float(row["moderate_max"]),
            "high_max": float(row["high_max"]),
        }
    return {"low_max": 1.0, "moderate_max": 2.0, "high_max": 3.0}


def update_threshold_config(low_max: float, moderate_max: float, high_max: float) -> Dict[str, float]:
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()
    cursor.execute(
        "UPDATE threshold_config SET low_max = ?, moderate_max = ?, high_max = ?, updated_at = ? WHERE id = 1",
        (low_max, moderate_max, high_max, now)
    )
    conn.commit()
    conn.close()
    return {"low_max": low_max, "moderate_max": moderate_max, "high_max": high_max}


# ==============================================================================
# Dataset CRUD
# ==============================================================================

def save_dataset(
    dataset_id: str,
    name: str,
    filename: str,
    row_count: int,
    raw_data: List[Dict],
    column_mapping: Optional[Dict] = None,
    validation_errors: Optional[List[Dict]] = None,
    segments: Optional[List[str]] = None,
    status: str = "UPLOADED"
) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()
    cursor.execute("""
    INSERT OR REPLACE INTO datasets (
        id, name, filename, upload_time, row_count, valid_row_count, rejected_row_count,
        column_mapping, raw_data, cleaned_data, validation_errors, segments, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        dataset_id,
        name,
        filename,
        now,
        row_count,
        row_count - (len(validation_errors) if validation_errors else 0),
        len(validation_errors) if validation_errors else 0,
        json.dumps(column_mapping or {}),
        json.dumps(raw_data),
        json.dumps([]),
        json.dumps(validation_errors or []),
        json.dumps(segments or []),
        status
    ))
    conn.commit()
    conn.close()
    return get_dataset(dataset_id)


def update_dataset_preprocessing(
    dataset_id: str,
    cleaned_data: List[Dict],
    valid_count: int,
    rejected_count: int,
    validation_errors: List[Dict],
    segments: List[str]
):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE datasets SET
        cleaned_data = ?,
        valid_row_count = ?,
        rejected_row_count = ?,
        validation_errors = ?,
        segments = ?,
        status = 'PREPROCESSED'
    WHERE id = ?
    """, (
        json.dumps(cleaned_data),
        valid_count,
        rejected_count,
        json.dumps(validation_errors),
        json.dumps(segments),
        dataset_id
    ))
    conn.commit()
    conn.close()


def get_dataset(dataset_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM datasets WHERE id = ?", (dataset_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return {
        "id": row["id"],
        "name": row["name"],
        "filename": row["filename"],
        "upload_time": row["upload_time"],
        "uploadTime": row["upload_time"],
        "row_count": row["row_count"],
        "rowCount": row["row_count"],
        "valid_row_count": row["valid_row_count"],
        "validRowCount": row["valid_row_count"],
        "rejected_row_count": row["rejected_row_count"],
        "rejectedRowCount": row["rejected_row_count"],
        "column_mapping": json.loads(row["column_mapping"] or "{}"),
        "columnMapping": json.loads(row["column_mapping"] or "{}"),
        "raw_data": json.loads(row["raw_data"] or "[]"),
        "rawData": json.loads(row["raw_data"] or "[]"),
        "cleaned_data": json.loads(row["cleaned_data"] or "[]"),
        "cleanedData": json.loads(row["cleaned_data"] or "[]"),
        "validation_errors": json.loads(row["validation_errors"] or "[]"),
        "validationErrors": json.loads(row["validation_errors"] or "[]"),
        "segments": json.loads(row["segments"] or "[]"),
        "status": row["status"]
    }


def list_datasets() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, filename, upload_time, row_count, valid_row_count, rejected_row_count, segments, status FROM datasets ORDER BY upload_time DESC")
    rows = cursor.fetchall()
    conn.close()
    result = []
    for r in rows:
        result.append({
            "id": r["id"],
            "name": r["name"],
            "filename": r["filename"],
            "upload_time": r["upload_time"],
            "uploadTime": r["upload_time"],
            "row_count": r["row_count"],
            "rowCount": r["row_count"],
            "valid_row_count": r["valid_row_count"],
            "validRowCount": r["valid_row_count"],
            "rejected_row_count": r["rejected_row_count"],
            "rejectedRowCount": r["rejected_row_count"],
            "segments": json.loads(r["segments"] or "[]"),
            "status": r["status"]
        })
    return result


# ==============================================================================
# Prediction Runs CRUD
# ==============================================================================

def save_prediction_run(run_data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT OR REPLACE INTO prediction_runs (
        id, dataset_id, segment_name, horizon_years, target_year,
        slope, intercept, r_squared, equation, erosion_rate_m_per_yr,
        predicted_position_m, projected_retreat_m, risk_level, risk_color,
        risk_description, risk_action_priority, risk_recommendations,
        history_data, future_data, created_at, trend_chart_url, rate_chart_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        run_data["id"],
        run_data.get("dataset_id"),
        run_data["segment_name"],
        run_data["horizon_years"],
        run_data["target_year"],
        run_data["slope"],
        run_data["intercept"],
        run_data["r_squared"],
        run_data["equation"],
        run_data["erosion_rate_m_per_yr"],
        run_data["predicted_position_m"],
        run_data.get("projected_retreat_m", 0.0),
        run_data["risk_level"],
        run_data["risk_color"],
        run_data["risk_description"],
        run_data["risk_action_priority"],
        json.dumps(run_data.get("risk_recommendations", [])),
        json.dumps(run_data.get("history_data", [])),
        json.dumps(run_data.get("future_data", [])),
        run_data.get("created_at", datetime.utcnow().isoformat()),
        run_data.get("trend_chart_url", ""),
        run_data.get("rate_chart_url", "")
    ))
    conn.commit()
    conn.close()
    return get_prediction_run(run_data["id"])


def get_prediction_run(run_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM prediction_runs WHERE id = ?", (run_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return {
        "id": row["id"],
        "dataset_id": row["dataset_id"],
        "segment_name": row["segment_name"],
        "horizon_years": row["horizon_years"],
        "target_year": row["target_year"],
        "slope": row["slope"],
        "intercept": row["intercept"],
        "r_squared": row["r_squared"],
        "equation": row["equation"],
        "erosion_rate_m_per_yr": row["erosion_rate_m_per_yr"],
        "predicted_position_m": row["predicted_position_m"],
        "projected_retreat_m": row["projected_retreat_m"],
        "risk_level": row["risk_level"],
        "risk_color": row["risk_color"],
        "risk_description": row["risk_description"],
        "risk_action_priority": row["risk_action_priority"],
        "risk_recommendations": json.loads(row["risk_recommendations"] or "[]"),
        "history_data": json.loads(row["history_data"] or "[]"),
        "future_data": json.loads(row["future_data"] or "[]"),
        "created_at": row["created_at"],
        "trend_chart_url": row["trend_chart_url"],
        "rate_chart_url": row["rate_chart_url"]
    }


def list_prediction_runs() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, dataset_id, segment_name, horizon_years, target_year, erosion_rate_m_per_yr, predicted_position_m, r_squared, risk_level, risk_color, risk_action_priority, created_at FROM prediction_runs ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


# ==============================================================================
# Reports CRUD
# ==============================================================================

def save_report(
    report_id: str,
    run_id: str,
    dataset_id: Optional[str],
    segment_name: str,
    title: str,
    summary_notes: str,
    pdf_path: str
) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()
    cursor.execute("""
    INSERT OR REPLACE INTO reports (
        id, run_id, dataset_id, segment_name, title, summary_notes, pdf_path, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (report_id, run_id, dataset_id, segment_name, title, summary_notes, pdf_path, now))
    conn.commit()
    conn.close()
    return {
        "id": report_id,
        "run_id": run_id,
        "dataset_id": dataset_id,
        "segment_name": segment_name,
        "title": title,
        "summary_notes": summary_notes,
        "pdf_path": pdf_path,
        "created_at": now
    }


def list_reports() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM reports ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


# Initialize on import
init_db()
