package com.coastal.erosion.model;

/**
 * Domain entity representing a historical or surveyed shoreline position record.
 */
public class ShorelineMeasurement {
    private int year;
    private double shorelinePositionM;
    private double deltaChangeM;
    private double rateOfChangeMPerYr;
    private String dataSource;

    public ShorelineMeasurement() {}

    public ShorelineMeasurement(int year, double shorelinePositionM) {
        this.year = year;
        this.shorelinePositionM = shorelinePositionM;
    }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public double getShorelinePositionM() { return shorelinePositionM; }
    public void setShorelinePositionM(double shorelinePositionM) { this.shorelinePositionM = shorelinePositionM; }

    public double getDeltaChangeM() { return deltaChangeM; }
    public void setDeltaChangeM(double deltaChangeM) { this.deltaChangeM = deltaChangeM; }

    public double getRateOfChangeMPerYr() { return rateOfChangeMPerYr; }
    public void setRateOfChangeMPerYr(double rateOfChangeMPerYr) { this.rateOfChangeMPerYr = rateOfChangeMPerYr; }

    public String getDataSource() { return dataSource; }
    public void setDataSource(String dataSource) { this.dataSource = dataSource; }
}
