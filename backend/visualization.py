"""
Module 4 - Visualization
--------------------------
Generates publication-quality charts:
1. Historical vs Predicted Shoreline Position trend chart with forecast projection zone.
2. Annual Shoreline Erosion Rate bar chart highlighting erosion vs accretion.
"""

import matplotlib
matplotlib.use("Agg")  # headless rendering - no display needed
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker
import numpy as np
import pandas as pd


def setup_plot_style():
    plt.rcParams.update({
        "font.family": "sans-serif",
        "font.sans-serif": ["Inter", "DejaVu Sans", "Arial", "Helvetica"],
        "axes.edgecolor": "#cbd5e1",
        "axes.linewidth": 1.2,
        "grid.color": "#e2e8f0",
        "grid.linestyle": "--",
        "grid.linewidth": 0.8,
    })


def plot_trend(history: pd.DataFrame, future: pd.DataFrame, segment: str, out_path: str) -> str:
    setup_plot_style()
    fig, ax = plt.subplots(figsize=(9, 4.8), dpi=200)

    # Plot actual history
    ax.plot(
        history["Year"],
        history["ShorelinePosition_m"],
        marker="o",
        markersize=6,
        color="#0369a1",
        linewidth=2.4,
        label="Observed Shoreline Position (m)",
        zorder=4
    )

    # Connect the last historical point to the first projected point for smooth continuity
    bridge_years = [history["Year"].iloc[-1], future["Year"].iloc[0]]
    bridge_positions = [history["ShorelinePosition_m"].iloc[-1], future["PredictedPosition_m"].iloc[0]]
    ax.plot(
        bridge_years,
        bridge_positions,
        linestyle="--",
        color="#f43f5e",
        linewidth=2.2,
        alpha=0.7,
        zorder=3
    )

    # Plot future projection
    ax.plot(
        future["Year"],
        future["PredictedPosition_m"],
        marker="s",
        markersize=6,
        linestyle="--",
        color="#f43f5e",
        linewidth=2.4,
        label="Forecast Projection (Linear Regression)",
        zorder=4
    )

    # Shaded forecast area
    min_year = history["Year"].min()
    split_year = history["Year"].max()
    max_year = future["Year"].max()
    ax.axvspan(split_year, max_year + 0.3, color="#fef2f2", alpha=0.8, label="Forecast Horizon", zorder=1)

    # Annotate the final predicted point
    last_fut_year = int(future["Year"].iloc[-1])
    last_fut_pos = float(future["PredictedPosition_m"].iloc[-1])
    ax.annotate(
        f"{last_fut_year}: {last_fut_pos:.1f}m",
        xy=(last_fut_year, last_fut_pos),
        xytext=(0, -26),
        textcoords="offset points",
        ha="center",
        fontsize=9,
        fontweight="bold",
        color="#9f1239",
        bbox=dict(boxstyle="round,pad=0.3", fc="#ffe4e6", ec="#f43f5e", lw=1),
        arrowprops=dict(arrowstyle="->", connectionstyle="arc3,rad=0", color="#f43f5e", lw=1.2)
    )

    ax.set_title(f"Shoreline Position & Multi-Year Projection — {segment}", fontsize=13, fontweight="bold", pad=14, color="#0f172a")
    ax.set_xlabel("Year", fontsize=11, fontweight="600", labelpad=8, color="#334155")
    ax.set_ylabel("Shoreline Position (meters)", fontsize=11, fontweight="600", labelpad=8, color="#334155")

    # Set integer year ticks
    all_years = sorted(list(set(history["Year"].tolist() + future["Year"].tolist())))
    if len(all_years) > 12:
        ax.xaxis.set_major_locator(ticker.MaxNLocator(integer=True, nbins=10))
    else:
        ax.set_xticks(all_years)

    ax.grid(True, alpha=0.6, zorder=2)
    ax.legend(frameon=True, facecolor="#ffffff", edgecolor="#e2e8f0", loc="upper right", fontsize=9.5)
    
    # Visual padding
    y_min = min(history["ShorelinePosition_m"].min(), future["PredictedPosition_m"].min()) - 3
    y_max = max(history["ShorelinePosition_m"].max(), future["PredictedPosition_m"].max()) + 3
    ax.set_ylim(y_min, y_max)
    ax.set_xlim(min_year - 0.5, max_year + 0.5)

    fig.tight_layout()
    fig.savefig(out_path, dpi=200)
    plt.close(fig)
    return out_path


def plot_erosion_rate(history: pd.DataFrame, segment: str, out_path: str) -> str:
    setup_plot_style()
    fig, ax = plt.subplots(figsize=(9, 4.2), dpi=200)

    # Exclude the baseline first year (where rate is 0.0 by convention) or include all years
    plot_df = history.iloc[1:] if len(history) > 1 else history

    years = plot_df["Year"].values
    rates = plot_df["ErosionRate_m_per_yr"].values

    # Color bars: warm amber/orange for erosion (>0), emerald green for accretion (<0)
    colors = ["#f97316" if r > 0 else "#10b981" if r < 0 else "#94a3b8" for r in rates]

    bars = ax.bar(years, rates, color=colors, width=0.55, edgecolor="#ffffff", linewidth=1, zorder=3)

    # Add zero line
    ax.axhline(0, color="#64748b", linewidth=1.2, linestyle="-", zorder=4)

    # Annotate bar values
    for bar, rate in zip(bars, rates):
        height = bar.get_height()
        va = "bottom" if height >= 0 else "top"
        y_pos = height + (0.05 if height >= 0 else -0.08)
        ax.annotate(
            f"{rate:+.2f}",
            xy=(bar.get_x() + bar.get_width() / 2, y_pos),
            xytext=(0, 0),
            textcoords="offset points",
            ha="center",
            va=va,
            fontsize=8.5,
            fontweight="600",
            color="#334155"
        )

    ax.set_title(f"Annual Shoreline Change Rate (m/year) — {segment}", fontsize=13, fontweight="bold", pad=14, color="#0f172a")
    ax.set_xlabel("Year", fontsize=11, fontweight="600", labelpad=8, color="#334155")
    ax.set_ylabel("Erosion Rate (m/yr, + = retreat)", fontsize=11, fontweight="600", labelpad=8, color="#334155")

    all_years = sorted(list(set(plot_df["Year"].tolist())))
    if len(all_years) > 12:
        ax.xaxis.set_major_locator(ticker.MaxNLocator(integer=True, nbins=10))
    else:
        ax.set_xticks(all_years)

    ax.grid(True, alpha=0.6, axis="y", zorder=1)

    fig.tight_layout()
    fig.savefig(out_path, dpi=200)
    plt.close(fig)
    return out_path


if __name__ == "__main__":
    import sys
    sys.path.insert(0, ".")
    from data_processing import process
    from prediction import analyse

    path = sys.argv[1] if len(sys.argv) > 1 else "coastal_data.csv"
    out_dir = sys.argv[2] if len(sys.argv) > 2 else "outputs"
    import os
    os.makedirs(out_dir, exist_ok=True)

    cleaned = process(path)
    trend, future = analyse(cleaned, 5)

    trend_path = plot_trend(cleaned, future, "Coastal Area A", f"{out_dir}/trend_chart.png")
    rate_path = plot_erosion_rate(cleaned, "Coastal Area A", f"{out_dir}/erosion_rate_chart.png")
    print(f"Saved: {trend_path}")
    print(f"Saved: {rate_path}")
