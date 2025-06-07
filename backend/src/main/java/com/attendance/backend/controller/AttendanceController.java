package com.attendance.backend.controller;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.attendance.backend.model.Attendance;
import com.attendance.backend.model.Student;
import com.attendance.backend.repository.AttendanceRepository;
import com.attendance.backend.repository.StudentRepository;
import com.attendance.backend.service.SMSservice;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private SMSservice smsService;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @PostMapping
    public ResponseEntity<String> markAttendance(@RequestBody AttendanceRequest request) {
        Optional<Student> studentOpt = studentRepository.findByIndexNumberAndBatch(request.getIndexNumber(), request.getBatch());
        if (studentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Student not found");
        }
        Student student = studentOpt.get();

        // Validate subject taken
        boolean subjectTaken = false;
        if ("chemistry".equalsIgnoreCase(request.getSubject())) {
            subjectTaken = Boolean.TRUE.equals(student.getChemistryTaken());
        } else if ("physics".equalsIgnoreCase(request.getSubject())) {
            subjectTaken = Boolean.TRUE.equals(student.getPhysicsTaken());
        }
        if (!subjectTaken) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Student has not taken this subject");
        }

        // Insert attendance into your attendance table here
        Attendance attendance = new Attendance();
        attendance.setBatch(request.getBatch());
        attendance.setIndexNumber(request.getIndexNumber());
        attendance.setSubject(request.getSubject());
        attendance.setRecordedAt(java.time.LocalDateTime.now());
        attendanceRepository.save(attendance);

        // Send SMS (do not fail attendance if SMS fails)
        String time = LocalTime.now().format(DateTimeFormatter.ofPattern("hh:mm a"));
        String message = "Your daughter " + student.getName() + " is in the tuition at " + time + ".";
        try {
            smsService.sendSms(student.getPhoneNo(), message);
        } catch (Exception e) {
            // Log the error but do not fail the attendance
            System.err.println("Failed to send SMS: " + e.getMessage());
        }

        return ResponseEntity.ok("Attendance marked (SMS sent if possible)");
    }

    @GetMapping("/records")
    public List<Attendance> getAttendanceRecords(
            @RequestParam String batch,
            @RequestParam String subject,
            @RequestParam String date // format: yyyy-MM-dd
    ) {
        LocalDate localDate = LocalDate.parse(date);
        return attendanceRepository.findByBatchAndSubjectAndDate(batch, subject, localDate);
    }

    // DTO for request
    public static class AttendanceRequest {

        private String batch;
        private String subject;
        private String indexNumber;

        // getters and setters
        public String getBatch() {
            return batch;
        }

        public void setBatch(String batch) {
            this.batch = batch;
        }

        public String getSubject() {
            return subject;
        }

        public void setSubject(String subject) {
            this.subject = subject;
        }

        public String getIndexNumber() {
            return indexNumber;
        }

        public void setIndexNumber(String indexNumber) {
            this.indexNumber = indexNumber;
        }
    }
}
