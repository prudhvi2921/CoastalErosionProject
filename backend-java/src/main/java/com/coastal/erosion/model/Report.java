package com.coastal.erosion.model;

import java.time.LocalDateTime;

/**
 * Domain entity representing an exportable project report.
 */
public class Report {
    private String id;
    private String runId;
    private String datasetId;
    private String segmentName;
    private String title;
    private String summaryNotes;
    private String pdfPath;
    private LocalDateTime createdAt;

    public Report() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRunId() { return runId; }
    public void setRunId(String runId) { this.runId = runId; }

    public String getDatasetId() { return datasetId; }
    public void setDatasetId(String datasetId) { this.datasetId = datasetId; }

    public String getSegmentName() { return segmentName; }
    public void setSegmentName(String segmentName) { this.segmentName = segmentName; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSummaryNotes() { return summaryNotes; }
    public void setSummaryNotes(String summaryNotes) { this.summaryNotes = summaryNotes; }

    public String getPdfPath() { return pdfPath; }
    public void setPdfPath(String pdfPath) { this.pdfPath = pdfPath; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
