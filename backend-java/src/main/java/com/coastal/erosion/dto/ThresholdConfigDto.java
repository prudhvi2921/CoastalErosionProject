package com.coastal.erosion.dto;

public class ThresholdConfigDto {
    private double low_max = 1.0;
    private double moderate_max = 2.0;
    private double high_max = 3.0;

    public ThresholdConfigDto() {}

    public ThresholdConfigDto(double low_max, double moderate_max, double high_max) {
        this.low_max = low_max;
        this.moderate_max = moderate_max;
        this.high_max = high_max;
    }

    public double getLow_max() { return low_max; }
    public void setLow_max(double low_max) { this.low_max = low_max; }

    public double getModerate_max() { return moderate_max; }
    public void setModerate_max(double moderate_max) { this.moderate_max = moderate_max; }

    public double getHigh_max() { return high_max; }
    public void setHigh_max(double high_max) { this.high_max = high_max; }
}
