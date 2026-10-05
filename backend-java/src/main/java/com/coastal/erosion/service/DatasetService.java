package com.coastal.erosion.service;

import com.coastal.erosion.dto.DatasetResponseDto;
import com.coastal.erosion.dto.PreprocessRequestDto;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Service managing dataset ingestion, CSV row validation, and metadata discovery.
 */
@Service
public class DatasetService {

    private final Map<String, DatasetResponseDto> datasetStore = new HashMap<>();
    private final PythonAnalyticsAdapter analyticsAdapter;

    public DatasetService(PythonAnalyticsAdapter analyticsAdapter) {
        this.analyticsAdapter = analyticsAdapter;
        seedDefaultDatasets();
    }

    private void seedDefaultDatasets() {
        DatasetResponseDto demo = new DatasetResponseDto();
        demo.setId("demo-default-1");
        demo.setName("National Coastal Survey 2012-2025");
        demo.setFilename("sample_custom_coastal_dataset.csv");
        demo.setUploadTime(LocalDateTime.now().toString());
        demo.setRowCount(42);
        demo.setValidRowCount(42);
        demo.setRejectedRowCount(0);
        demo.setSegments(Arrays.asList("Visakhapatnam RK Beach", "Marina Beach Sector B", "Malpe Coastline North"));
        demo.setStatus("PREPROCESSED");

        Map<String, String> mapping = new HashMap<>();
        mapping.put("timeColumn", "Year");
        mapping.put("locationColumn", "Segment");
        mapping.put("targetColumn", "ShorelinePosition_m");
        demo.setColumnMapping(mapping);

        datasetStore.put(demo.getId(), demo);
    }

    public List<DatasetResponseDto> getAllDatasets() {
        return new ArrayList<>(datasetStore.values());
    }

    public Optional<DatasetResponseDto> getDatasetById(String id) {
        return Optional.ofNullable(datasetStore.get(id));
    }

    public DatasetResponseDto uploadDataset(MultipartFile file, String customName) {
        String id = UUID.randomUUID().toString().substring(0, 8);
        String name = customName != null && !customName.isBlank() ? customName : file.getOriginalFilename();

        List<Map<String, Object>> rows = new ArrayList<>();
        List<Map<String, Object>> valErrors = new ArrayList<>();
        Set<String> segments = new LinkedHashSet<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String headerLine = reader.readLine();
            if (headerLine == null) {
                throw new IllegalArgumentException("Uploaded CSV is empty.");
            }
            String[] headers = headerLine.split(",");
            for (int i = 0; i < headers.length; i++) {
                headers[i] = headers[i].trim();
            }

            String line;
            int rowNum = 1;
            while ((line = reader.readLine()) != null) {
                rowNum++;
                String[] tokens = line.split(",");
                Map<String, Object> rowMap = new HashMap<>();
                for (int i = 0; i < headers.length; i++) {
                    String val = i < tokens.length ? tokens[i].trim() : "";
                    rowMap.put(headers[i], val);

                    if (headers[i].equalsIgnoreCase("Segment") || headers[i].equalsIgnoreCase("Location")) {
                        if (!val.isBlank()) segments.add(val);
                    }
                }
                rows.add(rowMap);

                // Row-level validation rules
                for (int i = 0; i < headers.length; i++) {
                    String header = headers[i];
                    String val = (String) rowMap.get(header);
                    if (val == null || val.isBlank()) {
                        Map<String, Object> err = new HashMap<>();
                        err.put("row", rowNum);
                        err.put("column", header);
                        err.put("value", "NULL/Empty");
                        err.put("message", "Missing value in column: " + header);
                        valErrors.add(err);
                    }
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("CSV Parsing error: " + e.getMessage(), e);
        }

        DatasetResponseDto dto = new DatasetResponseDto();
        dto.setId(id);
        dto.setName(name);
        dto.setFilename(file.getOriginalFilename());
        dto.setUploadTime(LocalDateTime.now().toString());
        dto.setRowCount(rows.size());
        dto.setValidRowCount(rows.size() - valErrors.size());
        dto.setRejectedRowCount(valErrors.size());
        dto.setRawData(rows);
        dto.setValidationErrors(valErrors);
        dto.setSegments(new ArrayList<>(segments));
        dto.setStatus("UPLOADED");

        datasetStore.put(id, dto);
        return dto;
    }

    public DatasetResponseDto preprocess(String id, PreprocessRequestDto req) {
        return analyticsAdapter.preprocessDataset(id, req);
    }
}
