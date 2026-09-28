package com.app.bloodbank.controller;

import com.app.bloodbank.entity.BloodGroup;
import com.app.bloodbank.entity.BloodUnit;
import com.app.bloodbank.service.BloodUnitService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/blood-units")
public class BloodUnitController {

    private final BloodUnitService bloodUnitService;

    public BloodUnitController(BloodUnitService bloodUnitService) {
        this.bloodUnitService = bloodUnitService;
    }

    @PostMapping
    public ResponseEntity<BloodUnit> createBloodUnit(
            @RequestBody BloodUnit bloodUnit) {

        return ResponseEntity.ok(
                bloodUnitService.createBloodUnit(bloodUnit)
        );
    }

    @GetMapping
    public ResponseEntity<List<BloodUnit>> getAllBloodUnits() {

        return ResponseEntity.ok(
                bloodUnitService.getAllBloodUnits()
        );
    }

    @GetMapping("/available/{bloodGroup}")
    public ResponseEntity<List<BloodUnit>> getAvailableUnits(
            @PathVariable BloodGroup bloodGroup) {

        return ResponseEntity.ok(
                bloodUnitService.getAvailableUnits(bloodGroup)
        );
    }
}