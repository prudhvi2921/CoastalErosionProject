package com.coastal.erosion.controller;

import com.coastal.erosion.dto.DatasetResponseDto;
import com.coastal.erosion.dto.PreprocessRequestDto;
import com.coastal.erosion.service.DatasetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/datasets")
@CrossOrigin(origins = "*")
public class DatasetController {

    private final DatasetService datasetService;

    public DatasetController(DatasetService datasetService) {
        this.datasetService = datasetService;
    }

    @GetMapping
    public ResponseEntity<List<DatasetResponseDto>> getAllDatasets() {
        return ResponseEntity.ok(datasetService.getAllDatasets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DatasetResponseDto> getDatasetById(@PathVariable String id) {
        return datasetService.getDatasetById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/upload")
    public ResponseEntity<DatasetResponseDto> uploadDataset(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "name", required = false) String name) {
        return ResponseEntity.ok(datasetService.uploadDataset(file, name));
    }

    @PostMapping("/{id}/preprocess")
    public ResponseEntity<DatasetResponseDto> preprocessDataset(
            @PathVariable String id,
            @RequestBody PreprocessRequestDto req) {
        return ResponseEntity.ok(datasetService.preprocess(id, req));
    }
}
