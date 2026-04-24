package com.safesnap;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class SafeSnapApplication {

    public static void main(String[] args) {
        SpringApplication.run(SafeSnapApplication.class, args);
    }
}
