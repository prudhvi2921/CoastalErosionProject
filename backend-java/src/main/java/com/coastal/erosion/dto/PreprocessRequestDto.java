package com.coastal.erosion.dto;

public class PreprocessRequestDto {
    private String timeCol;
    private String targetCol;
    private String locationCol;
    private String locationVal;

    public PreprocessRequestDto() {}

    public String getTimeCol() { return timeCol; }
    public void setTimeCol(String timeCol) { this.timeCol = timeCol; }

    public String getTargetCol() { return targetCol; }
    public void setTargetCol(String targetCol) { this.targetCol = targetCol; }

    public String getLocationCol() { return locationCol; }
    public void setLocationCol(String locationCol) { this.locationCol = locationCol; }

    public String getLocationVal() { return locationVal; }
    public void setLocationVal(String locationVal) { this.locationVal = locationVal; }
}
