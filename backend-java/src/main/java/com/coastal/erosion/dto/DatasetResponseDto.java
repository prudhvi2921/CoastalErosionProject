package com.coastal.erosion.dto;

import java.util.List;
import java.util.Map;

/**
 * DTO for dataset metadata and validation errors.
 */
public class DatasetResponseDto {
    private String id;
    private String name;
    private String filename;
    private String uploadTime;
    private int rowCount;
    private int validRowCount;
    private int rejectedRowCount;
    private Map<String, String> columnMapping;
    private List<Map<String, Object>> rawData;
    private List<Map<String, Object>> cleanedData;
    private List<Map<String, Object>> validationErrors;
    private List<String> segments;
    private String status;

    public DatasetResponseDto() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }

    public String getUploadTime() { return uploadTime; }
    public void setUploadTime(String uploadTime) { this.uploadTime = uploadTime; }

    public int getRowCount() { return rowCount; }
    public void setRowCount(int rowCount) { this.rowCount = rowCount; }

    public int getValidRowCount() { return validRowCount; }
    public void setValidRowCount(int validRowCount) { this.validRowCount = validRowCount; }

    public int getRejectedRowCount() { return rejectedRowCount; }
    public void setRejectedRowCount(int rejectedRowCount) { this.rejectedRowCount = rejectedRowCount; }

    public Map<String, String> getColumnMapping() { return columnMapping; }
    public void setColumnMapping(Map<String, String> columnMapping) { this.columnMapping = columnMapping; }

    public List<Map<String, Object>> getRawData() { return rawData; }
    public void setRawData(List<Map<String, Object>> rawData) { this.rawData = rawData; }

    public List<Map<String, Object>> getCleanedData() { return cleanedData; }
    public void setCleanedData(List<Map<String, Object>> cleanedData) { this.cleanedData = cleanedData; }

    public List<Map<String, Object>> getValidationErrors() { return validationErrors; }
    public void setValidationErrors(List<Map<String, Object>> validationErrors) { this.validationErrors = validationErrors; }

    public List<String> getSegments() { return segments; }
    public void setSegments(List<String> segments) { this.segments = segments; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
