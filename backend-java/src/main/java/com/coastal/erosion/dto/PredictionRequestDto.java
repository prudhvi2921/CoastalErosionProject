package com.coastal.erosion.dto;

import java.util.List;
import java.util.Map;

public class PredictionRequestDto {
    private String datasetId;
    private String csvData;
    private String segment;
    private String timeCol = "Year";
    private String targetCol = "ShorelinePosition_m";
    private String locationCol = "Segment";
    private int horizon = 5;
    private String targetType = "shoreline_position";

    public PredictionRequestDto() {}

    public String getDatasetId() { return datasetId; }
    public void setDatasetId(String datasetId) { this.datasetId = datasetId; }

    public String getCsvData() { return csvData; }
    public void setCsvData(String csvData) { this.csvData = csvData; }

    public String getSegment() { return segment; }
    public void setSegment(String segment) { this.segment = segment; }

    public String getTimeCol() { return timeCol; }
    public void setTimeCol(String timeCol) { this.timeCol = timeCol; }

    public String getTargetCol() { return targetCol; }
    public void setTargetCol(String targetCol) { this.targetCol = targetCol; }

    public String getLocationCol() { return locationCol; }
    public void setLocationCol(String locationCol) { this.locationCol = locationCol; }

    public int getHorizon() { return horizon; }
    public void setHorizon(int horizon) { this.horizon = horizon; }

    public String getTargetType() { return targetType; }
    public void setTargetType(String targetType) { this.targetType = targetType; }
}
