package com.attendance.backend.util;

import java.io.FileReader;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;

import com.attendance.backend.model.Student;
import com.attendance.backend.repository.StudentRepository;
import com.opencsv.CSVReader;

//@Component
public class StudentCsvImporter implements CommandLineRunner {

    @Autowired
    private StudentRepository studentRepository;

    @Override
    public void run(String... args) throws Exception {
        String csvFile = "src/main/resources/students.csv"; // Place your CSV here
        try (CSVReader reader = new CSVReader(new FileReader(csvFile))) {
            String[] line;
            boolean first = true;
            while ((line = reader.readNext()) != null) {
                if (first) {
                    first = false;
                    continue;
                } // skip header
                Student student = new Student();
                student.setIndexNumber(line[0]);
                student.setName(line[1]);
                student.setPhoneNo(line[2]);
                student.setBatch(line[3]);
                student.setChemistryTaken("1".equals(line[4]));
                student.setPhysicsTaken("1".equals(line[5]));
                studentRepository.save(student);
            }
        }
        System.out.println("Student CSV import completed.");
    }
}
// Disabled CSV import at startup. Use /upload-csv endpoint for importing students via UI.
