"""
Module 3 - Risk Assessment (Configurable & Decision-Focused)
------------------------------------------------------------
Compares the predicted erosion rate and projected shoreline retreat against
configurable safety thresholds to assign Low / Moderate / High / Very High
risk classifications, accompanied by technical explanations and actionable
engineering and ecological mitigation strategies.

Default Demonstration Thresholds:
  - Low:       < 1.0 m/year
  - Moderate:  1.0 to < 2.0 m/year
  - High:      2.0 to < 3.0 m/year
  - Very High: >= 3.0 m/year
"""

from dataclasses import dataclass, asdict
from typing import Dict, List, Optional


DEFAULT_LOW_MAX: float = 1.0
DEFAULT_MODERATE_MAX: float = 2.0
DEFAULT_HIGH_MAX: float = 3.0

# Legacy constants for backward compatibility
LOW_MAX = 1.0
MODERATE_MAX = 2.0
HIGH_MAX = 3.0


@dataclass
class RiskThresholds:
    low_max: float = DEFAULT_LOW_MAX
    moderate_max: float = DEFAULT_MODERATE_MAX
    high_max: float = DEFAULT_HIGH_MAX

    def to_dict(self) -> Dict[str, float]:
        return {
            "low_max": self.low_max,
            "moderate_max": self.moderate_max,
            "high_max": self.high_max,
        }


@dataclass
class RiskInfo:
    level: str
    description: str
    color: str
    action_priority: str
    recommendations: List[str]
    rate_used: float
    retreat_m: Optional[float] = None
    threshold_version: str = "v1.0-configurable"
    thresholds: Optional[Dict[str, float]] = None

    def to_dict(self) -> Dict:
        data = asdict(self)
        if data.get("thresholds") is None:
            data["thresholds"] = {
                "low_max": DEFAULT_LOW_MAX,
                "moderate_max": DEFAULT_MODERATE_MAX,
                "high_max": DEFAULT_HIGH_MAX,
            }
        return data


def classify_risk(
    annual_erosion_rate_m_per_yr: float,
    low_max: float = DEFAULT_LOW_MAX,
    moderate_max: float = DEFAULT_MODERATE_MAX,
    high_max: float = DEFAULT_HIGH_MAX,
    projected_retreat_m: Optional[float] = None,
) -> RiskInfo:
    """
    Classify coastal segment risk based on predicted erosion rate (m/year)
    and optional multi-year cumulative shoreline retreat.
    """
    rate = abs(float(annual_erosion_rate_m_per_yr))
    applied_thresholds = {
        "low_max": low_max,
        "moderate_max": moderate_max,
        "high_max": high_max,
    }

    retreat_context = ""
    if projected_retreat_m is not None:
        retreat_context = f" Projected cumulative retreat is approximately {abs(projected_retreat_m):.2f} m over the forecast period."

    if rate < low_max:
        return RiskInfo(
            level="LOW",
            description=f"Shoreline is broadly stable with an annual erosion rate of {rate:.2f} m/yr (< {low_max:.1f} m/yr threshold). Retreat is within normal seasonal sediment dynamics.{retreat_context}",
            color="#0d9488",  # Calm Sea-Teal
            action_priority="Routine Annual Monitoring",
            recommendations=[
                "Maintain existing vegetative buffer zones, dune vegetation, and natural sediment traps.",
                "Conduct annual drone/satellite multispectral shoreline boundary surveys.",
                "Enforce standard coastal zone management (CZM) setback regulations.",
            ],
            rate_used=round(rate, 4),
            retreat_m=round(projected_retreat_m, 2) if projected_retreat_m is not None else None,
            thresholds=applied_thresholds,
        )
    elif rate < moderate_max:
        return RiskInfo(
            level="MODERATE",
            description=f"Noticeable coastal retreat trend observed at {rate:.2f} m/yr ({low_max:.1f} to {moderate_max:.1f} m/yr threshold). Requires active monitoring and proactive conservation buffers.{retreat_context}",
            color="#d97706",  # Amber
            action_priority="Active Monitoring & Dune Restoration",
            recommendations=[
                "Establish bi-annual high-precision shoreline profiling and sediment budget tracking.",
                "Implement sand fence trapping and native dune grass stabilization (e.g. Spinifex, Ipomoea).",
                "Restrict heavy infrastructure construction and vegetation removal within a 100m coastal buffer.",
            ],
            rate_used=round(rate, 4),
            retreat_m=round(projected_retreat_m, 2) if projected_retreat_m is not None else None,
            thresholds=applied_thresholds,
        )
    elif rate < high_max:
        return RiskInfo(
            level="HIGH",
            description=f"Significant chronic erosion at {rate:.2f} m/yr ({moderate_max:.1f} to {high_max:.1f} m/yr threshold). Nearshore structures, coastal roads, and ecosystems face imminent vulnerability.{retreat_context}",
            color="#ea580c",  # Vibrant Warning Orange
            action_priority="Targeted Mitigation & Beach Nourishment",
            recommendations=[
                "Execute programmed beach nourishment (sand replenishment) using compatible marine borrow pits.",
                "Deploy hybrid living shorelines, geotextile revetment bags, and artificial reef breakwaters.",
                "Review building setback lines with municipal urban planning authorities and declare hazard zones.",
            ],
            rate_used=round(rate, 4),
            retreat_m=round(projected_retreat_m, 2) if projected_retreat_m is not None else None,
            thresholds=applied_thresholds,
        )
    else:
        return RiskInfo(
            level="VERY_HIGH",
            description=f"Critical, aggressive erosion occurring at {rate:.2f} m/yr (>= {high_max:.1f} m/yr threshold). Immediate structural intervention and emergency zoning are necessary to protect life and assets.{retreat_context}",
            color="#dc2626",  # Crimson Alert Red
            action_priority="Immediate Structural Intervention & Emergency Planning",
            recommendations=[
                "Emergency structural defense: install offshore submerged breakwaters, rock revetments, or groynes.",
                "Declare coastal erosion disaster hazard zone with mandatory setback and building freeze.",
                "Formulate managed retreat and relocation plans for critical public infrastructure and communities.",
            ],
            rate_used=round(rate, 4),
            retreat_m=round(projected_retreat_m, 2) if projected_retreat_m is not None else None,
            thresholds=applied_thresholds,
        )


if __name__ == "__main__":
    import sys

    test_rate = float(sys.argv[1]) if len(sys.argv) > 1 else 1.95
    info = classify_risk(test_rate)
    print(f"Erosion rate: {test_rate} m/yr -> Risk Level: {info.level}")
    print(f"Priority: {info.action_priority}")
    print(f"Description: {info.description}")
    print("Recommendations:")
    for r in info.recommendations:
        print(f"  - {r}")
