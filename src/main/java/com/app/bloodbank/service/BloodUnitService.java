package com.app.bloodbank.service;

import com.app.bloodbank.entity.BloodGroup;
import com.app.bloodbank.entity.BloodUnit;
import com.app.bloodbank.entity.BloodUnitStatus;
import com.app.bloodbank.exception.ResourceNotFoundException;
import com.app.bloodbank.repository.BloodUnitRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class BloodUnitService {

    private final BloodUnitRepository bloodUnitRepository;

    public BloodUnitService(
            BloodUnitRepository bloodUnitRepository) {

        this.bloodUnitRepository = bloodUnitRepository;
    }

    public BloodUnit createBloodUnit(
            BloodUnit bloodUnit) {

        updateStatus(bloodUnit);

        return bloodUnitRepository.save(bloodUnit);
    }

    public List<BloodUnit> getAllBloodUnits() {

        List<BloodUnit> units =
                bloodUnitRepository.findAll();

        for (BloodUnit unit : units) {
            updateStatus(unit);
        }

        bloodUnitRepository.saveAll(units);

        return units;
    }

    public BloodUnit getBloodUnitById(Long id) {

        return bloodUnitRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Blood unit not found with ID: " + id
                        )
                );
    }
    public List<BloodUnit> getAvailableUnits(
            BloodGroup bloodGroup) {

        List<BloodUnit> units =
                bloodUnitRepository
                        .findByBloodGroupAndStatus(
                                bloodGroup,
                                BloodUnitStatus.AVAILABLE
                        );

        for (BloodUnit unit : units) {
            updateStatus(unit);
        }

        bloodUnitRepository.saveAll(units);

        List<BloodUnit> availableUnits = new java.util.ArrayList<>();

        for (BloodUnit unit : units) {

            if (unit.getStatus()
                    == BloodUnitStatus.AVAILABLE) {

                availableUnits.add(unit);
            }
        }

        return availableUnits;
    }

    private void updateStatus(BloodUnit unit) {

        LocalDate today = LocalDate.now();

        if (unit.getExpiryDate() == null) {
            unit.setStatus(BloodUnitStatus.AVAILABLE);
            return;
        }

        long daysUntilExpiry =
                ChronoUnit.DAYS.between(
                        today,
                        unit.getExpiryDate()
                );

        if (daysUntilExpiry < 0) {

            unit.setStatus(
                    BloodUnitStatus.EXPIRED
            );

        } else if (daysUntilExpiry <= 7) {

            unit.setStatus(
                    BloodUnitStatus.EXPIRING_SOON
            );

        } else if (
                unit.getStatus()
                        != BloodUnitStatus.ISSUED) {

            unit.setStatus(
                    BloodUnitStatus.AVAILABLE
            );
        }
    }
}