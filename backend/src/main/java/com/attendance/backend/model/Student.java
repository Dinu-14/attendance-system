package com.attendance.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "student")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "name", length = 100)
    private String name;

    @Column(name = "index_number", length = 20, unique = true)
    private String indexNumber;

    @Column(name = "phone_no", length = 20)
    private String phoneNo;

    @Column(name = "batch", length = 10)
    private String batch;

    @Column(name = "chemistry_taken")
    private Boolean chemistryTaken;

    @Column(name = "physics_taken")
    private Boolean physicsTaken;

    // Getters and setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIndexNumber() {
        return indexNumber;
    }

    public void setIndexNumber(String indexNumber) {
        this.indexNumber = indexNumber;
    }

    public String getPhoneNo() {
        return phoneNo;
    }

    public void setPhoneNo(String phoneNo) {
        this.phoneNo = phoneNo;
    }

    public String getBatch() {
        return batch;
    }

    public void setBatch(String batch) {
        this.batch = batch;
    }

    public Boolean getChemistryTaken() {
        return chemistryTaken;
    }

    public void setChemistryTaken(Boolean chemistryTaken) {
        this.chemistryTaken = chemistryTaken;
    }

    public Boolean getPhysicsTaken() {
        return physicsTaken;
    }

    public void setPhysicsTaken(Boolean physicsTaken) {
        this.physicsTaken = physicsTaken;
    }
}
