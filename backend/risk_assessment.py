"""
Module 3 - Risk Assessment
----------------------------
Compares the predicted erosion rate against safety thresholds and assigns
a Low / Moderate / High / Very High risk level to the coastal segment,
along with actionable engineering and ecological mitigation strategies.
"""

from dataclasses import dataclass, asdict
from typing import List


LOW_MAX = 0.5
MODERATE_MAX = 1.5
HIGH_MAX = 2.5


@dataclass
class RiskInfo:
    level: str
    description: str
    color: str
    action_priority: str
    recommendations: List[str]

    def to_dict(self):
        return asdict(self)


def classify_risk(annual_erosion_rate_m_per_yr: float) -> RiskInfo:
    rate = abs(annual_erosion_rate_m_per_yr)

    if rate < LOW_MAX:
        return RiskInfo(
            level="LOW",
            description="Shoreline is broadly stable; retreat is within normal seasonal variation.",
            color="#10b981",  # Emerald Green
            action_priority="Routine Annual Monitoring",
            recommendations=[
                "Maintain existing vegetative buffer zones and coastal sand dunes.",
                "Conduct annual drone/satellite shoreline boundary surveys.",
                "Enforce standard coastal zone management setback rules."
            ]
        )
    elif rate < MODERATE_MAX:
        return RiskInfo(
            level="MODERATE",
            description="Noticeable retreat trend; monitor annually and prepare conservation buffers.",
            color="#f59e0b",  # Amber
            action_priority="Active Monitoring & Dune Restoration",
            recommendations=[
                "Establish bi-annual shoreline profiling and sediment budget tracking.",
                "Implement dune stabilization programs and sand fencing.",
                "Restrict heavy construction and vegetation clearing in 100m buffer zones."
            ]
        )
    elif rate < HIGH_MAX:
        return RiskInfo(
            level="HIGH",
            description="Significant erosion; nearshore infrastructure and ecosystems are at meaningful risk.",
            color="#f97316",  # Vibrant Orange
            action_priority="Targeted Mitigation & Nourishment",
            recommendations=[
                "Deploy regular beach nourishment (sand replenishment) along retreating stretches.",
                "Install hybrid living shorelines, mangrove/wetland buffers, and geotextile revetments.",
                "Review building setback lines and establish hazard zoning with municipal planners."
            ]
        )
    else:
        return RiskInfo(
            level="VERY_HIGH",
            description="Severe, fast-moving erosion; prioritize immediate structural defense and managed zoning.",
            color="#ef4444",  # Crimson Red
            action_priority="Immediate Structural Intervention & Emergency Planning",
            recommendations=[
                "Urgent structural defense: submerged offshore breakwaters, seawalls, or groynes.",
                "Declare coastal erosion hazard zone and implement emergency evacuation/relocation plans.",
                "Evaluate managed retreat options for threatened critical infrastructure."
            ]
        )


if __name__ == "__main__":
    import sys

    rate = float(sys.argv[1]) if len(sys.argv) > 1 else 1.9391
    risk = classify_risk(rate)
    print(f"Erosion rate: {rate} m/yr -> Risk: {risk.level}")
    print(f"Priority: {risk.action_priority}")
    print(f"Description: {risk.description}")
    print("Recommendations:")
    for r in risk.recommendations:
        print(f"  - {r}")
