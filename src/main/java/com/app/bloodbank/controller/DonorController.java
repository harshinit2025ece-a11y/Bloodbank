package com.app.bloodbank.controller;

import com.app.bloodbank.entity.Donor;
import com.app.bloodbank.service.DonorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/donors")
public class DonorController {

    private final DonorService donorService;

    public DonorController(DonorService donorService) {
        this.donorService = donorService;
    }

    @PostMapping
    public ResponseEntity<Donor> createDonor(
            @RequestBody Donor donor) {

        return ResponseEntity.ok(
                donorService.createDonor(donor)
        );
    }

    @GetMapping
    public ResponseEntity<List<Donor>> getAllDonors() {

        return ResponseEntity.ok(
                donorService.getAllDonors()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Donor> getDonorById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                donorService.getDonorById(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Donor> updateDonor(
            @PathVariable Long id,
            @RequestBody Donor donor) {

        return ResponseEntity.ok(
                donorService.updateDonor(id, donor)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteDonor(
            @PathVariable Long id) {

        donorService.deleteDonor(id);

        return ResponseEntity.ok(
                "Donor deleted successfully"
        );
    }
}