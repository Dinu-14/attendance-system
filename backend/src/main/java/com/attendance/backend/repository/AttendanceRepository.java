package com.attendance.backend.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.attendance.backend.model.Attendance;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Integer> {

    // You can add custom queries here if needed
    @Query("SELECT a FROM Attendance a WHERE a.batch = :batch AND a.subject = :subject AND FUNCTION('DATE', a.recordedAt) = :date")
    List<Attendance> findByBatchAndSubjectAndDate(@Param("batch") String batch, @Param("subject") String subject, @Param("date") LocalDate date);
}
