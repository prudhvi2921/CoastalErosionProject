"""
Module 4 - Visualization (Dynamic & Publication Quality)
--------------------------------------------------------
Generates high-resolution Matplotlib charts for any selected Time and Target
columns:
1. Dynamic Trend & Forecast Projection chart with shaded forecast horizon.
2. Dynamic Annual Rate of Change bar chart with color-coded positive/negative changes.
"""

import matplotlib
matplotlib.use("Agg")  # headless rendering - no GUI needed
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


def plot_dynamic_trend(
    history: pd.DataFrame,
    future: pd.DataFrame,
    segment: str,
    out_path: str,
    time_label: str = "Year",
    target_label: str = "Shoreline Position (m)"
) -> str:
    """Plot historical observations and linear regression future forecast."""
    setup_plot_style()
    fig, ax = plt.subplots(figsize=(9, 4.8), dpi=200)

    t_col = "StandardTime" if "StandardTime" in history.columns else ("Year" if "Year" in history.columns else history.columns[0])
    y_col = "StandardTarget" if "StandardTarget" in history.columns else ("ShorelinePosition_m" if "ShorelinePosition_m" in history.columns else history.columns[1])

    fut_t_col = "StandardTime" if "StandardTime" in future.columns else ("Year" if "Year" in future.columns else future.columns[0])
    fut_y_col = "StandardTarget" if "StandardTarget" in future.columns else ("PredictedPosition_m" if "PredictedPosition_m" in future.columns else future.columns[1])

    # Plot actual history
    ax.plot(
        history[t_col],
        history[y_col],
        marker="o",
        markersize=6,
        color="#0369a1",
        linewidth=2.4,
        label=f"Observed {target_label}",
        zorder=4
    )

    # Bridge line connecting last historical point to first forecast point
    bridge_t = [history[t_col].iloc[-1], future[fut_t_col].iloc[0]]
    bridge_y = [history[y_col].iloc[-1], future[fut_y_col].iloc[0]]
    ax.plot(
        bridge_t,
        bridge_y,
        linestyle="--",
        color="#f43f5e",
        linewidth=2.2,
        alpha=0.7,
        zorder=3
    )

    # Plot future projection
    ax.plot(
        future[fut_t_col],
        future[fut_y_col],
        marker="s",
        markersize=6,
        linestyle="--",
        color="#f43f5e",
        linewidth=2.4,
        label="Forecast Projection (Linear Regression)",
        zorder=4
    )

    # Shaded forecast area
    min_t = history[t_col].min()
    split_t = history[t_col].max()
    max_t = future[fut_t_col].max()
    ax.axvspan(split_t, max_t + 0.3, color="#fef2f2", alpha=0.8, label="Forecast Horizon", zorder=1)

    # Annotate the final predicted point
    last_fut_t = future[fut_t_col].iloc[-1]
    last_fut_val = float(future[fut_y_col].iloc[-1])
    t_disp = int(last_fut_t) if float(last_fut_t).is_integer() else f"{last_fut_t:.1f}"

    ax.annotate(
        f"{time_label} {t_disp}: {last_fut_val:.2f}",
        xy=(last_fut_t, last_fut_val),
        xytext=(0, -26),
        textcoords="offset points",
        ha="center",
        fontsize=9,
        fontweight="bold",
        color="#9f1239",
        bbox=dict(boxstyle="round,pad=0.3", fc="#ffe4e6", ec="#f43f5e", lw=1),
        arrowprops=dict(arrowstyle="->", connectionstyle="arc3,rad=0", color="#f43f5e", lw=1.2)
    )

    ax.set_title(f"{target_label} Multi-Year Projection — {segment}", fontsize=13, fontweight="bold", pad=14, color="#0f172a")
    ax.set_xlabel(f"{time_label}", fontsize=11, fontweight="600", labelpad=8, color="#334155")
    ax.set_ylabel(f"{target_label}", fontsize=11, fontweight="600", labelpad=8, color="#334155")

    # Set ticks
    all_times = sorted(list(set(history[t_col].tolist() + future[fut_t_col].tolist())))
    if len(all_times) > 12:
        ax.xaxis.set_major_locator(ticker.MaxNLocator(integer=True, nbins=10))
    else:
        ax.set_xticks(all_times)

    ax.grid(True, alpha=0.6, zorder=2)
    ax.legend(frameon=True, facecolor="#ffffff", edgecolor="#e2e8f0", loc="upper right", fontsize=9.5)

    y_min = min(history[y_col].min(), future[fut_y_col].min())
    y_max = max(history[y_col].max(), future[fut_y_col].max())
    y_span = max(1.0, y_max - y_min)
    ax.set_ylim(y_min - y_span * 0.1, y_max + y_span * 0.1)
    ax.set_xlim(min_t - 0.5, max_t + 0.5)

    fig.tight_layout()
    fig.savefig(out_path, dpi=200)
    plt.close(fig)
    return out_path


def plot_dynamic_rate(
    history: pd.DataFrame,
    segment: str,
    out_path: str,
    time_label: str = "Year",
    target_label: str = "Shoreline Position"
) -> str:
    """Plot annual rate of change bar chart."""
    setup_plot_style()
    fig, ax = plt.subplots(figsize=(9, 4.2), dpi=200)

    t_col = "StandardTime" if "StandardTime" in history.columns else ("Year" if "Year" in history.columns else history.columns[0])
    rate_col = "RateOfChange" if "RateOfChange" in history.columns else ("ErosionRate_m_per_yr" if "ErosionRate_m_per_yr" in history.columns else history.columns[1])

    plot_df = history.iloc[1:] if len(history) > 1 else history

    times = plot_df[t_col].values
    rates = plot_df[rate_col].values

    colors = ["#f97316" if r < 0 else "#10b981" if r > 0 else "#94a3b8" for r in rates]

    bars = ax.bar(times, rates, color=colors, width=0.55, edgecolor="#ffffff", linewidth=1, zorder=3)
    ax.axhline(0, color="#64748b", linewidth=1.2, linestyle="-", zorder=4)

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

    ax.set_title(f"Annual Rate of Change — {target_label} ({segment})", fontsize=13, fontweight="bold", pad=14, color="#0f172a")
    ax.set_xlabel(f"{time_label}", fontsize=11, fontweight="600", labelpad=8, color="#334155")
    ax.set_ylabel(f"Annual Change Rate (/yr)", fontsize=11, fontweight="600", labelpad=8, color="#334155")

    all_times = sorted(list(set(plot_df[t_col].tolist())))
    if len(all_times) > 12:
        ax.xaxis.set_major_locator(ticker.MaxNLocator(integer=True, nbins=10))
    else:
        ax.set_xticks(all_times)

    ax.grid(True, alpha=0.6, zorder=2)
    fig.tight_layout()
    fig.savefig(out_path, dpi=200)
    plt.close(fig)
    return out_path


def plot_trend(history: pd.DataFrame, future: pd.DataFrame, segment: str, out_path: str) -> str:
    return plot_dynamic_trend(
        history=history,
        future=future,
        segment=segment,
        out_path=out_path,
        time_label="Year",
        target_label="Shoreline Position (m)"
    )


def plot_erosion_rate(history: pd.DataFrame, segment: str, out_path: str) -> str:
    return plot_dynamic_rate(
        history=history,
        segment=segment,
        out_path=out_path,
        time_label="Year",
        target_label="Shoreline Position"
    )
