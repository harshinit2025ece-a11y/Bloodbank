package com.app.bloodbank.controller;

import com.app.bloodbank.entity.BloodGroup;
import com.app.bloodbank.entity.IssueRecord;
import com.app.bloodbank.service.IssueRecordService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
public class IssueRecordController {

    private final IssueRecordService issueRecordService;

    public IssueRecordController(
            IssueRecordService issueRecordService) {

        this.issueRecordService = issueRecordService;
    }

    @PostMapping
    public ResponseEntity<IssueRecord> issueBlood(
            @RequestParam BloodGroup bloodGroup,
            @RequestParam String hospitalName,
            @RequestParam String patientName) {

        return ResponseEntity.ok(
                issueRecordService.issueBlood(
                        bloodGroup,
                        hospitalName,
                        patientName
                )
        );
    }

    @GetMapping
    public ResponseEntity<List<IssueRecord>> getAllIssues() {

        return ResponseEntity.ok(
                issueRecordService.getAllIssueRecords()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<IssueRecord> getIssueById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                issueRecordService.getIssueRecordById(id)
        );
    }
}