package com.safesnap.service;

import com.safesnap.dto.response.ChildResponse;
import com.safesnap.repository.ChildRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChildService {

    private final ChildRepository childRepository;

    @Transactional(readOnly = true)
    public List<ChildResponse> getChildrenForParent(UUID parentId) {
        List<ChildResponse> children = childRepository.findByParentId(parentId)
            .stream()
            .map(ChildResponse::from)
            .toList();
        log.debug("Fetched {} children for parentId={}", children.size(), parentId);
        return children;
    }
}
