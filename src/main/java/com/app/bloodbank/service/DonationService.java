package com.app.bloodbank.service;

import com.app.bloodbank.entity.Donation;
import com.app.bloodbank.entity.Donor;
import com.app.bloodbank.exception.DonorNotEligibleException;
import com.app.bloodbank.exception.ResourceNotFoundException;
import com.app.bloodbank.repository.DonationRepository;
import com.app.bloodbank.repository.DonorRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class DonationService {

    private static final long MIN_DONATION_GAP_DAYS = 90;

    private final DonationRepository donationRepository;
    private final DonorRepository donorRepository;

    public DonationService(
            DonationRepository donationRepository,
            DonorRepository donorRepository) {

        this.donationRepository = donationRepository;
        this.donorRepository = donorRepository;
    }

    public Donation createDonation(Long donorId, Donation donation) {

        Donor donor = donorRepository.findById(donorId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Donor not found with ID: " + donorId
                        )
                );

        LocalDate today = LocalDate.now();

        if (donor.getLastDonationDate() != null) {

            long daysSinceLastDonation =
                    ChronoUnit.DAYS.between(
                            donor.getLastDonationDate(),
                            today
                    );

            if (daysSinceLastDonation < MIN_DONATION_GAP_DAYS) {

                throw new DonorNotEligibleException(
                        "Donor is not eligible to donate yet. " +
                                "Minimum donation gap is " +
                                MIN_DONATION_GAP_DAYS +
                                " days. Days since last donation: " +
                                daysSinceLastDonation
                );
            }
        }

        donation.setDonor(donor);
        donation.setDonationDate(today);
        donation.setCollectionDate(today);

        Donation savedDonation =
                donationRepository.save(donation);

        donor.setLastDonationDate(today);
        donorRepository.save(donor);

        return savedDonation;
    }

    public List<Donation> getAllDonations() {
        return donationRepository.findAll();
    }

    public Donation getDonationById(Long id) {

        return donationRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Donation not found with ID: " + id
                        )
                );
    }
}