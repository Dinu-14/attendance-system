package com.attendance.backend.controller;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.List;
import java.util.Optional;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.attendance.backend.model.Student;
import com.attendance.backend.repository.StudentRepository;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private StudentRepository studentRepository;

    @PostMapping("/upload-excel")
    public ResponseEntity<String> uploadExcel(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }
        try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            for (int i = 1; i <= sheet.getLastRowNum(); i++) { // skip header row
                Row row = sheet.getRow(i);
                if (row == null) {
                    continue;
                }
                Student student = new Student();
                student.setIndexNumber(row.getCell(0).getStringCellValue());
                student.setName(row.getCell(1).getStringCellValue());
                student.setPhoneNo(row.getCell(2).getStringCellValue());
                student.setBatch(row.getCell(3).getStringCellValue());
                student.setChemistryTaken(row.getCell(4).getNumericCellValue() == 1);
                student.setPhysicsTaken(row.getCell(5).getNumericCellValue() == 1);
                studentRepository.save(student);
            }
            return ResponseEntity.ok("Students uploaded successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/upload-csv")
    public ResponseEntity<String> uploadCsv(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }
        try (InputStream is = file.getInputStream(); InputStreamReader reader = new InputStreamReader(is); com.opencsv.CSVReader csvReader = new com.opencsv.CSVReader(reader)) {
            String[] nextLine;
            boolean isHeader = true;
            while ((nextLine = csvReader.readNext()) != null) {
                if (isHeader) {
                    isHeader = false;
                    continue;
                } // skip header
                if (nextLine.length < 6) {
                    continue; // skip incomplete rows
                }
                String indexNumber = nextLine[0];
                String batch = nextLine[3];
                // Check if student exists by indexNumber and batch
                Optional<Student> existingStudentOpt = studentRepository.findByIndexNumberAndBatch(indexNumber, batch);
                Student student;
                if (existingStudentOpt.isPresent()) {
                    student = existingStudentOpt.get();
                } else {
                    student = new Student();
                    student.setIndexNumber(indexNumber);
                    student.setBatch(batch);
                }
                student.setName(nextLine[1]);
                student.setPhoneNo(nextLine[2]);
                student.setChemistryTaken("1".equals(nextLine[4]));
                student.setPhysicsTaken("1".equals(nextLine[5]));
                studentRepository.save(student);
            }
            return ResponseEntity.ok("Students uploaded successfully from CSV");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    // Get all students
    @GetMapping
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    // Get absentees for a batch, subject, and date
    @GetMapping("/absentees")
    public List<Student> getAbsentees(@RequestParam String batch, @RequestParam String subject, @RequestParam String date) {
        // Find all students in the batch who have taken the subject
        List<Student> students = studentRepository.findByBatch(batch);
        // Find all students who have marked attendance for the subject and date
        List<String> presentIndexNumbers = studentRepository.findPresentIndexNumbers(batch, subject, date);
        // Filter out present students
        return students.stream()
                .filter(s -> {
                    boolean subjectTaken = false;
                    if ("chemistry".equalsIgnoreCase(subject)) {
                        subjectTaken = Boolean.TRUE.equals(s.getChemistryTaken());
                    } else if ("physics".equalsIgnoreCase(subject)) {
                        subjectTaken = Boolean.TRUE.equals(s.getPhysicsTaken());
                    }
                    return subjectTaken && !presentIndexNumbers.contains(s.getIndexNumber());
                })
                .toList();
    }
}
