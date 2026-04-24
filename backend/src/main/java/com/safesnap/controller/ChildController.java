package com.safesnap.controller;

import com.safesnap.constants.ApiRoutes;
import com.safesnap.dto.response.ChildResponse;
import com.safesnap.service.ChildService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping(ApiRoutes.CHILDREN_BASE)
@RequiredArgsConstructor
public class ChildController {

    private final ChildService childService;

    @GetMapping
    public ResponseEntity<List<ChildResponse>> getChildren(
        @AuthenticationPrincipal UUID parentId
    ) {
        return ResponseEntity.ok(childService.getChildrenForParent(parentId));
    }
}
