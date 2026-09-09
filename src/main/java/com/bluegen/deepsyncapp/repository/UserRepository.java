package com.bluegen.deepsyncapp.repository;

import com.bluegen.deepsyncapp.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {

    // Spelled out as a @Query because derived-name parsing reads "EmpIdOrEmail" as
    // "empId OR email" - two properties that don't exist - rather than the single
    // empIdOrEmail login identifier.
    @Query("select u from UserEntity u where u.empIdOrEmail = :empIdOrEmail")
    Optional<UserEntity> findByEmpIdOrEmail(@Param("empIdOrEmail") String empIdOrEmail);
}
