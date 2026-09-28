package com.app.bloodbank.service;

import com.app.bloodbank.entity.Donor;
import com.app.bloodbank.exception.ResourceNotFoundException;
import com.app.bloodbank.repository.DonorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DonorService {

    private final DonorRepository donorRepository;

    public DonorService(DonorRepository donorRepository) {
        this.donorRepository = donorRepository;
    }

    public Donor createDonor(Donor donor) {
        return donorRepository.save(donor);
    }

    public List<Donor> getAllDonors() {
        return donorRepository.findAll();
    }

    public Donor getDonorById(Long id) {

        return donorRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Donor not found with ID: " + id
                        )
                );
    }

    public Donor updateDonor(
            Long id,
            Donor donorDetails) {

        Donor donor = getDonorById(id);

        donor.setName(donorDetails.getName());
        donor.setPhone(donorDetails.getPhone());
        donor.setEmail(donorDetails.getEmail());
        donor.setBloodGroup(donorDetails.getBloodGroup());
        donor.setDateOfBirth(donorDetails.getDateOfBirth());

        return donorRepository.save(donor);
    }

    public void deleteDonor(Long id) {

        Donor donor = getDonorById(id);

        donorRepository.delete(donor);
    }
}