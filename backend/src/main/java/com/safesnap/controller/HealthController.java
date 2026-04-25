package com.safesnap.controller;

import com.safesnap.constants.ApiRoutes;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HealthController {

    @GetMapping(ApiRoutes.HEALTH)
    public Map<String, String> health() {
        return Map.of("status", "UP");
    }
}
