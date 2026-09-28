package com.app.bloodbank.service;

import com.app.bloodbank.entity.BloodGroup;
import com.app.bloodbank.entity.BloodUnit;
import com.app.bloodbank.entity.BloodUnitStatus;
import com.app.bloodbank.entity.IssueRecord;
import com.app.bloodbank.exception.BloodNotAvailableException;
import com.app.bloodbank.exception.ResourceNotFoundException;
import com.app.bloodbank.repository.BloodUnitRepository;
import com.app.bloodbank.repository.IssueRecordRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class IssueRecordService {

    private final IssueRecordRepository issueRecordRepository;
    private final BloodUnitRepository bloodUnitRepository;

    public IssueRecordService(
            IssueRecordRepository issueRecordRepository,
            BloodUnitRepository bloodUnitRepository) {

        this.issueRecordRepository = issueRecordRepository;
        this.bloodUnitRepository = bloodUnitRepository;
    }

    public IssueRecord issueBlood(
            BloodGroup bloodGroup,
            String hospitalName,
            String patientName) {

        List<BloodUnit> availableUnits =
                bloodUnitRepository
                        .findByBloodGroupAndStatus(
                                bloodGroup,
                                BloodUnitStatus.AVAILABLE
                        );

        LocalDate today = LocalDate.now();

        BloodUnit validUnit = null;

        for (BloodUnit unit : availableUnits) {

            if (unit.getExpiryDate() != null
                    && unit.getExpiryDate()
                    .isAfter(today.plusDays(7))) {

                validUnit = unit;
                break;
            }
        }

        if (validUnit == null) {

            throw new BloodNotAvailableException(
                    "No valid blood unit available for "
                            + bloodGroup
                            + ". Expired or soon-to-expire units cannot be issued."
            );
        }

        validUnit.setStatus(
                BloodUnitStatus.ISSUED
        );

        bloodUnitRepository.save(validUnit);

        IssueRecord issueRecord =
                new IssueRecord();

        issueRecord.setBloodGroup(bloodGroup);
        issueRecord.setIssueDate(today);
        issueRecord.setHospitalName(hospitalName);
        issueRecord.setPatientName(patientName);
        issueRecord.setQuantity(1);
        issueRecord.setBloodUnit(validUnit);

        return issueRecordRepository.save(
                issueRecord
        );
    }

    public List<IssueRecord> getAllIssueRecords() {
        return issueRecordRepository.findAll();
    }

    public IssueRecord getIssueRecordById(Long id) {

        return issueRecordRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Issue record not found with ID: "
                                        + id
                        )
                );
    }
}