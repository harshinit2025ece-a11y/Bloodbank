package com.app.bloodbank.repository;
import com.app.bloodbank.entity.BloodGroup;
import com.app.bloodbank.entity.BloodUnit;
import com.app.bloodbank.entity.BloodUnitStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BloodUnitRepository extends JpaRepository<BloodUnit, Long> {

    List<BloodUnit> findByBloodGroupAndStatus(
            BloodGroup bloodGroup,
            BloodUnitStatus status
    );
}