package com.iips.deams.controller;

import com.iips.deams.dto.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    @GetMapping("/info")
    public ApiResponse<Map<String, Object>> getSystemInfo() {
        return ApiResponse.ok("System status", Map.of(
            "name", "IIPS Digital Examination & Assessment Management System",
            "shortName", "IIPS-DEAMS",
            "institute", "International Institute of Professional Studies, DAVV",
            "version", "1.0.0",
            "status", "ONLINE"
        ));
    }
}
