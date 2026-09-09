package com.bluegen.deepsyncapp;

import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DeepsyncAppApplication {

    public static void main(String[] args) {
        // Ocean model outputs and in-situ observations are timestamped in UTC, so the
        // JVM runs in UTC too. This also keeps the JDBC connection's TimeZone parameter
        // valid: on an Indian host the JVM default resolves to the legacy "Asia/Calcutta"
        // ID, which the postgres:16 image's tzdata no longer recognises.
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
        SpringApplication.run(DeepsyncAppApplication.class, args);
    }

}
