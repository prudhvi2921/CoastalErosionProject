"""
PDF Report Generator for Coastal Erosion Prediction & Risk Assessment System
-----------------------------------------------------------------------------
Generates formal, publication-ready environmental engineering PDF assessment reports
using ReportLab with embedded charts, executive metrics, and action plans.
"""

import os
from datetime import datetime
from typing import Any, Dict, Optional

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image,
    HRFlowable,
    KeepTogether,
)


def generate_pdf_report(
    run_data: Dict[str, Any],
    dataset_info: Optional[Dict[str, Any]],
    output_pdf_path: str,
    trend_chart_path: Optional[str] = None,
    rate_chart_path: Optional[str] = None,
) -> str:
    """Generate a high-quality PDF report summarizing prediction and risk assessment."""
    os.makedirs(os.path.dirname(os.path.abspath(output_pdf_path)), exist_ok=True)

    doc = SimpleDocTemplate(
        output_pdf_path,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Heading1"],
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=4,
    )
    subtitle_style = ParagraphStyle(
        "ReportSubtitle",
        parent=styles["Normal"],
        fontSize=10,
        leading=13,
        textColor=colors.HexColor("#475569"),
        spaceAfter=12,
    )
    section_heading = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontSize=12,
        leading=15,
        textColor=colors.HexColor("#0369a1"),
        spaceBefore=10,
        spaceAfter=6,
    )
    body_style = ParagraphStyle(
        "ReportBody",
        parent=styles["Normal"],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#1e293b"),
    )
    bold_body_style = ParagraphStyle(
        "BoldReportBody",
        parent=body_style,
        fontName="Helvetica-Bold",
    )
    recom_style = ParagraphStyle(
        "RecomBody",
        parent=styles["Normal"],
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#0f172a"),
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=4,
    )

    elements = []

    # Header Banner
    elements.append(Paragraph("COASTAL EROSION PREDICTION & RISK ASSESSMENT REPORT", title_style))
    created_at = run_data.get("created_at", datetime.utcnow().isoformat())
    elements.append(
        Paragraph(
            f"<b>Platform:</b> Coastal Intelligence Decision Support System &nbsp;|&nbsp; "
            f"<b>Run ID:</b> {run_data.get('id', 'N/A')} &nbsp;|&nbsp; "
            f"<b>Date:</b> {created_at[:19].replace('T', ' ')} UTC",
            subtitle_style,
        )
    )
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0284c7"), spaceAfter=10))

    # Executive Summary Key Metrics Grid
    elements.append(Paragraph("1. Executive Summary & Site Identification", section_heading))
    
    seg_name = run_data.get("segment_name", "Monitored Segment")
    target_yr = run_data.get("target_year", "N/A")
    rate = run_data.get("erosion_rate_m_per_yr", 0.0)
    risk_lvl = run_data.get("risk_level", "MODERATE")
    risk_col_hex = run_data.get("risk_color", "#d97706")
    pred_pos = run_data.get("predicted_position_m", 0.0)
    r2 = run_data.get("r_squared", 0.0)

    summary_data = [
        [
            Paragraph("<b>Target Coastal Segment</b>", body_style),
            Paragraph(str(seg_name), bold_body_style),
            Paragraph("<b>Risk Classification</b>", body_style),
            Paragraph(f"<font color='{risk_col_hex}'><b>{risk_lvl}</b></font>", bold_body_style),
        ],
        [
            Paragraph("<b>Forecast Target Horizon</b>", body_style),
            Paragraph(f"Year {target_yr} ({run_data.get('horizon_years', 5)} yrs forward)", body_style),
            Paragraph("<b>Action Priority</b>", body_style),
            Paragraph(run_data.get("risk_action_priority", "Active Monitoring"), body_style),
        ],
        [
            Paragraph("<b>Annual Erosion Rate</b>", body_style),
            Paragraph(f"<b>{rate:.2f} m/year</b>", bold_body_style),
            Paragraph("<b>Projected Position</b>", body_style),
            Paragraph(f"<b>{pred_pos:.2f} m</b>", bold_body_style),
        ],
        [
            Paragraph("<b>Regression Fit (R²)</b>", body_style),
            Paragraph(f"{r2:.4f}", body_style),
            Paragraph("<b>Trend Equation</b>", body_style),
            Paragraph(f"<font size=7.5>{run_data.get('equation', 'N/A')}</font>", body_style),
        ],
    ]

    t_summary = Table(summary_data, colWidths=[130, 140, 130, 140])
    t_summary.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ]
        )
    )
    elements.append(t_summary)
    elements.append(Spacer(1, 8))

    # Risk Explanation & Engineering Recommendations
    elements.append(Paragraph("2. Risk Assessment & Decision Support", section_heading))
    elements.append(
        Paragraph(
            f"<b>Assessment Finding:</b> {run_data.get('risk_description', '')}",
            body_style,
        )
    )
    elements.append(Spacer(1, 4))
    elements.append(Paragraph("<b>Recommended Engineering & Ecological Actions:</b>", bold_body_style))

    recoms = run_data.get("risk_recommendations", [])
    if isinstance(recoms, str):
        import json
        try:
            recoms = json.loads(recoms)
        except Exception:
            recoms = [recoms]

    for rec in recoms:
        elements.append(Paragraph(f"• {rec}", recom_style))

    elements.append(Spacer(1, 8))

    # Module 2 Projection Table
    elements.append(Paragraph("3. Multi-Year Forecast Trajectory", section_heading))
    future_rows = run_data.get("future_data", [])
    if isinstance(future_rows, str):
        import json
        try:
            future_rows = json.loads(future_rows)
        except Exception:
            future_rows = []

    if future_rows:
        forecast_table_data = [
            [
                Paragraph("<b>Forecast Year</b>", bold_body_style),
                Paragraph("<b>Predicted Position (m)</b>", bold_body_style),
                Paragraph("<b>Cumulative Retreat from Baseline (m)</b>", bold_body_style),
            ]
        ]
        
        hist_rows = run_data.get("history_data", [])
        if isinstance(hist_rows, str):
            import json
            try:
                hist_rows = json.loads(hist_rows)
            except Exception:
                hist_rows = []
        
        baseline_pos = 0.0
        if hist_rows:
            last_hist = hist_rows[-1]
            baseline_pos = float(last_hist.get("ShorelinePosition_m", last_hist.get("StandardTarget", 0.0)))

        for r in future_rows[:10]:
            f_yr = r.get("Year", r.get("StandardTime", "N/A"))
            f_pos = float(r.get("PredictedPosition_m", r.get("StandardTarget", 0.0)))
            diff = round(baseline_pos - f_pos, 2) if baseline_pos else 0.0
            diff_str = f"-{abs(diff):.2f} m" if diff > 0 else f"+{abs(diff):.2f} m"
            forecast_table_data.append([
                Paragraph(str(f_yr), body_style),
                Paragraph(f"{f_pos:.2f} m", body_style),
                Paragraph(diff_str, body_style),
            ])

        t_forecast = Table(forecast_table_data, colWidths=[140, 180, 220])
        t_forecast.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e2e8f0")),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                    ("TOPPADDING", (0, 0), (-1, -1), 3),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                ]
            )
        )
        elements.append(t_forecast)

    elements.append(Spacer(1, 8))

    # Embed Visual Charts if paths are provided
    chart_elements = []
    if trend_chart_path and os.path.exists(trend_chart_path):
        chart_elements.append(Paragraph("4. Historical Trend & Prediction Chart", section_heading))
        chart_elements.append(Image(trend_chart_path, width=520, height=220))
        chart_elements.append(Spacer(1, 6))

    if rate_chart_path and os.path.exists(rate_chart_path):
        chart_elements.append(Paragraph("5. Annual Shoreline Rate of Change", section_heading))
        chart_elements.append(Image(rate_chart_path, width=520, height=200))
        chart_elements.append(Spacer(1, 6))

    if chart_elements:
        elements.append(KeepTogether(chart_elements))

    # Footer Notice
    elements.append(Spacer(1, 10))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#94a3b8"), spaceAfter=6))
    elements.append(
        Paragraph(
            "<font size=7 color='#64748b'>Report generated automatically by the Coastal Erosion Prediction & Risk Assessment System. "
            "Data and mathematical models are based on linear regression analysis of empirical survey records. "
            "Decision makers should verify local bathymetry and hydrodynamic conditions before engineering commissioning.</font>",
            body_style,
        )
    )

    doc.build(elements)
    return output_pdf_path
