package com.app.bloodbank.controller;

import com.app.bloodbank.entity.Donation;
import com.app.bloodbank.service.DonationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/donations")
public class DonationController {

    private final DonationService donationService;

    public DonationController(DonationService donationService) {
        this.donationService = donationService;
    }

    @PostMapping("/donor/{donorId}")
    public ResponseEntity<Donation> createDonation(
            @PathVariable Long donorId,
            @RequestBody Donation donation) {

        return ResponseEntity.ok(
                donationService.createDonation(
                        donorId,
                        donation
                )
        );
    }

    @GetMapping
    public ResponseEntity<List<Donation>> getAllDonations() {

        return ResponseEntity.ok(
                donationService.getAllDonations()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Donation> getDonationById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                donationService.getDonationById(id)
        );
    }
}