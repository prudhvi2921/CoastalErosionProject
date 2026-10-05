# Coastal Erosion Prediction & Environmental Risk Assessment System

> **A production-quality Environmental Intelligence Platform for shoreline retreat forecasting, dynamic survey validation, configurable risk assessment, and decision support.**

---

## 🌊 System Architecture Overview

The platform uses a clean, layered microservice architecture preserving existing Python analytics (Pandas, Scikit-learn) and exposing them through a high-performance **FastAPI / REST API v1** and an enterprise **Java Spring Boot OOP orchestration service**, fronted by a modern **React + TypeScript + Vite + Tailwind CSS** dashboard.

```
+-----------------------------------------------------------------------------------+
|                        REACT + TYPESCRIPT + VITE DASHBOARD                        |
|  - Leaflet Map (Geospatial Risk Pins)      - Recharts Multi-Year Time-Series      |
|  - 5 Screens: Dashboard | Workspace | Prediction Studio | Risk Explorer | Reports |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          | HTTP REST (/api/v1)
                                          v
+-----------------------------------------+-----------------------------------------+
|                    APPLICATION REST API ENGINE (FastAPI / Java)                   |
|  - /api/v1/datasets (Upload, Validate, Preprocess)                                |
|  - /api/v1/predictions/run (Linear Regression Fit & Horizon Forecasting)          |
|  - /api/v1/risk/assess (Configurable Threshold Evaluation)                        |
|  - /api/v1/reports (ReportLab PDF Generation & CSV Projections)                  |
|  - SQLite Database Persistence (Datasets, Runs, Thresholds, Reports)              |
+-----------------------------------------+-----------------------------------------+
                                          |
                      +-------------------+-------------------+
                      |                                       |
                      v                                       v
+-----------------------------------+   +-------------------------------------------+
|  MODULE 1: DATA INGESTION         |   |  MODULE 2: EROSION MODELING               |
|  - Dynamic Column Discovery       |   |  - Scikit-Learn Linear Regression         |
|  - Row-Level Schema Validation    |   |  - Slope, Intercept, R² Fit               |
|  - Delta & Rate Computation       |   |  - Multi-Year Horizon Projections         |
+-----------------------------------+   +-------------------------------------------+
                      |                                       |
                      v                                       v
+-----------------------------------+   +-------------------------------------------+
|  MODULE 3: RISK ASSESSMENT        |   |  MODULE 4: VISUALIZATION & REPORTS        |
|  - Configurable Threshold Rules   |   |  - Matplotlib High-Res Publication Charts |
|  - Low, Mod, High, Very High      |   |  - ReportLab Formal Engineering PDF       |
|  - Mitigation Action Matrix       |   |  - Time-series Recharts & Leaflet Maps    |
+-----------------------------------+   +-------------------------------------------+
```

---

## 📦 Modules Summary

| Module | Purpose | Status | Key Features |
| :--- | :--- | :--- | :--- |
| **Module 1: Data Processing** | Survey Ingestion & Cleaning | Complete | Dynamic column auto-detection (Time, Target, Location), row-level error validation, duplicate filtering, delta change derivation. |
| **Module 2: Erosion Prediction** | Trend Modeling & Forecasting | Complete | Linear regression slope fit, R² score computation, forecast horizon projections (1–20 years). |
| **Module 3: Risk Assessment** | Hazard Classification & Guidance | Complete | Configurable threshold engine (<1m/yr Low, 1-2m/yr Moderate, 2-3m/yr High, ≥3m/yr Very High) with actionable mitigation recommendations. |
| **Module 4: Visualization & Export** | Visual Analytics & Publications | Complete | Leaflet interactive map, actual vs predicted shoreline charts, ReportLab PDF generation, CSV data export. |
| **Module 5: OOP & User Interface** | Architecture & Premium Frontend | Complete | Java Spring Boot OOP services (`DatasetService`, `PredictionService`, `RiskService`, `ReportService`), DTO contracts, React SPA. |

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- **Python 3.10+** (Python 3.11 / 3.14 tested)
- **Node.js 18+** & npm
- **Java 17+** (Optional for Spring Boot microservice)

---

### 2. Backend Setup (FastAPI & Analytics Engine)

```bash
# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Start FastAPI server (Runs on port 8000)
python backend/main.py
```
> API Docs & Swagger UI will be available at: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 3. Frontend Setup (React + TypeScript + Vite)

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server (Runs on port 3000)
npm run dev

# 4. Or build production bundle (served automatically by FastAPI at http://localhost:8000/)
npm run build
```

---

### 4. Optional Java Spring Boot Microservice

```bash
cd backend-java
mvn clean spring-boot:run
```
> Java API runs on port 8080 and orchestrates requests via the Python Analytics Adapter.

---

### 5. Run with Docker Compose

```bash
docker-compose up --build
```

---

## 🧪 Automated Testing

Run the automated test suite covering CSV validation, linear regression forecasting, configurable risk rules, and PDF/CSV streaming:

```bash
# Run backend pytest suite
python -m pytest tests/test_backend_api.py -v
```

**Output:**
```
tests/test_backend_api.py::test_health_check PASSED                      [ 12%]
tests/test_backend_api.py::test_risk_classification_rules PASSED         [ 25%]
tests/test_backend_api.py::test_custom_configurable_thresholds PASSED    [ 37%]
tests/test_backend_api.py::test_api_threshold_config_endpoints PASSED    [ 50%]
tests/test_backend_api.py::test_sample_dataset_seeding_and_inspection PASSED [ 62%]
tests/test_backend_api.py::test_prediction_run_endpoint PASSED           [ 75%]
tests/test_backend_api.py::test_dashboard_summary_endpoint PASSED        [ 87%]
tests/test_backend_api.py::test_report_generation_endpoints PASSED       [100%]
======================= 8 passed in 3.09s =======================
```

---

## 📡 REST API Contract (`/api/v1`)

### 1. Datasets
- `POST /api/v1/datasets/upload` — Multipart CSV upload; performs column detection, validates row bounds, stores raw data.
- `GET /api/v1/datasets` — List all uploaded and seeded datasets.
- `GET /api/v1/datasets/{id}` — Get full dataset detail, validation issues, and cleaned records.
- `POST /api/v1/datasets/sample?type={default|high_risk|moderate_risk|low_risk}` — Load pre-seeded demonstration surveys.
- `POST /api/v1/datasets/{id}/preprocess` — Clean dataset with custom column mappings.

### 2. Predictions & Modeling
- `POST /api/v1/predictions/run` — Run Linear Regression trend analysis & multi-year forecasting.
  ```json
  {
    "segment": "Visakhapatnam RK Beach",
    "horizon": 5,
    "time_col": "Year",
    "target_col": "ShorelinePosition_m",
    "location_col": "Segment"
  }
  ```
- `GET /api/v1/predictions` — List all historical prediction runs.
- `GET /api/v1/predictions/{id}` — Get full prediction run detail, slope, R², equation, and chart URLs.

### 3. Risk Assessment & Threshold Configuration
- `POST /api/v1/risk/assess` — Classify risk level based on annual retreat rate and optional cumulative loss.
- `GET /api/v1/config/thresholds` — Retrieve current active risk thresholds.
- `PUT /api/v1/config/thresholds` — Update threshold boundaries:
  ```json
  {
    "low_max": 1.0,
    "moderate_max": 2.0,
    "high_max": 3.0
  }
  ```

### 4. Dashboard & Reports
- `GET /api/v1/dashboard/summary` — Returns KPI metrics, risk distributions, and coastal reach coordinates.
- `GET /api/v1/segments` — Returns all monitored transects with coordinates and risk indicators.
- `GET /api/v1/reports/{runId}/pdf` — Streams formal publication-ready PDF assessment report.
- `GET /api/v1/reports/{runId}/csv` — Streams time-series survey + projection CSV.

---

## 🛡️ Configurable Risk Decision Matrix

| Risk Level | Demonstration Threshold | UI Color Indicator | Action Priority | Recommended Intervention Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **LOW** | `< 1.0 m/year` | **Calm Sea-Teal** (`#0d9488`) | Routine Annual Monitoring | Maintain vegetative dune buffers, seasonal satellite surveys, standard setback enforcement. |
| **MODERATE** | `1.0 to < 2.0 m/year` | **Amber** (`#d97706`) | Active Monitoring & Dune Restoration | Bi-annual shoreline profiling, sand fence trapping, native dune grass stabilization (Spinifex), 100m development buffer. |
| **HIGH** | `2.0 to < 3.0 m/year` | **Warning Orange** (`#ea580c`) | Targeted Mitigation & Nourishment | Programmed beach nourishment, hybrid living shorelines, geotextile revetments, municipal hazard zoning. |
| **VERY HIGH** | `≥ 3.0 m/year` | **Crimson Red** (`#dc2626`) | Immediate Structural Intervention | Emergency submerged breakwaters, rock revetments, coastal disaster zone declaration, managed retreat planning. |

---

## 📊 Sample Datasets Included

Located in `backend/` and `frontend/`:
1. `sample_custom_coastal_dataset.csv` — Multi-segment national survey (Visakhapatnam, Marina Beach, Malpe Coastline from 2012 to 2025).
2. `sample_high_risk_dataset.csv` — Rapid retreat chronic erosion reach (Visakhapatnam RK Beach, ~2.74 m/yr).
3. `sample_moderate_risk_dataset.csv` — Moderate retreat transect (Marina Beach Sector B, ~1.27 m/yr).
4. `sample_low_risk_dataset.csv` — Stable protected shoreline reach (Malpe Coastline North, ~0.14 m/yr).

---

## 💻 Tech Stack Summary

- **Frontend:** React 18, TypeScript (Strict Mode), Vite 6, Tailwind CSS, Lucide Icons, Recharts, Leaflet / React-Leaflet
- **Backend API:** Python FastAPI, Uvicorn, Pydantic, ReportLab (PDF Engine), SQLite3
- **Java OOP Service:** Java 17+, Spring Boot 3.3, Spring Web, Spring Validation, Commons-CSV
- **Analytics & Modeling:** Scikit-Learn (Linear Regression), Pandas, NumPy, Matplotlib
