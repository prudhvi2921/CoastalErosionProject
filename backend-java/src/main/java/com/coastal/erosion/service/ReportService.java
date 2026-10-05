package com.coastal.erosion.service;

import com.coastal.erosion.dto.ReportDto;
import com.coastal.erosion.model.Report;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Service managing exportable assessment reports and PDF/CSV metadata.
 */
@Service
public class ReportService {

    private final Map<String, ReportDto> reportStore = new LinkedHashMap<>();

    public ReportService() {
        // Seed default report item
        ReportDto initReport = new ReportDto();
        initReport.setId("rep-init-01");
        initReport.setRunId("run-init-01");
        initReport.setSegmentName("Visakhapatnam RK Beach");
        initReport.setTitle("Visakhapatnam RK Beach Hazard Study Report");
        initReport.setSummaryNotes("High chronic erosion detected at 2.45 m/yr.");
        initReport.setCreatedAt(LocalDateTime.now().toString());
        reportStore.put(initReport.getId(), initReport);
    }

    public List<ReportDto> getAllReports() {
        return new ArrayList<>(reportStore.values());
    }

    public ReportDto saveReport(ReportDto reportDto) {
        if (reportDto.getId() == null) {
            reportDto.setId(UUID.randomUUID().toString().substring(0, 8));
        }
        if (reportDto.getCreatedAt() == null) {
            reportDto.setCreatedAt(LocalDateTime.now().toString());
        }
        reportStore.put(reportDto.getId(), reportDto);
        return reportDto;
    }
}
