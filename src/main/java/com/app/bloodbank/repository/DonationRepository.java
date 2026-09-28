package com.app.bloodbank.repository;

import com.app.bloodbank.entity.Donation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DonationRepository extends JpaRepository<Donation, Long> {

    Optional<Donation> findTopByDonorIdOrderByDonationDateDesc(Long donorId);
}