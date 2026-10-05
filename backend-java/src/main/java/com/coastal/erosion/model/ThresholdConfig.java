package com.coastal.erosion.model;

/**
 * Domain entity representing configurable risk thresholds.
 */
public class ThresholdConfig {
    private double lowMax = 1.0;
    private double moderateMax = 2.0;
    private double highMax = 3.0;

    public ThresholdConfig() {}

    public ThresholdConfig(double lowMax, double moderateMax, double highMax) {
        this.lowMax = lowMax;
        this.moderateMax = moderateMax;
        this.highMax = highMax;
    }

    public double getLowMax() { return lowMax; }
    public void setLowMax(double lowMax) { this.lowMax = lowMax; }

    public double getModerateMax() { return moderateMax; }
    public void setModerateMax(double moderateMax) { this.moderateMax = moderateMax; }

    public double getHighMax() { return highMax; }
    public void setHighMax(double highMax) { this.highMax = highMax; }
}
