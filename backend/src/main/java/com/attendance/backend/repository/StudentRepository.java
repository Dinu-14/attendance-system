package com.attendance.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.attendance.backend.model.Student;

@Repository
public interface StudentRepository extends JpaRepository<Student, Integer> {

    Optional<Student> findByIndexNumberAndBatch(String indexNumber, String batch);

    List<Student> findByBatch(String batch);

    // Find index numbers of students who have marked attendance for a batch, subject, and date
    @Query("SELECT a.indexNumber FROM Attendance a WHERE a.batch = :batch AND a.subject = :subject AND FUNCTION('DATE', a.recordedAt) = :date")
    List<String> findPresentIndexNumbers(@Param("batch") String batch, @Param("subject") String subject, @Param("date") String date);
}
