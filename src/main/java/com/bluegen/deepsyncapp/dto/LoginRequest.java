package com.bluegen.deepsyncapp.dto;

public class LoginRequest {
    private String email;
    private String empIdOrEmail;
    private String password;

    public String getEmail() {
        return email != null && !email.isBlank() ? email : empIdOrEmail;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getEmpIdOrEmail() {
        return empIdOrEmail != null && !empIdOrEmail.isBlank() ? empIdOrEmail : email;
    }

    public void setEmpIdOrEmail(String empIdOrEmail) {
        this.empIdOrEmail = empIdOrEmail;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
