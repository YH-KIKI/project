package kr.hi.project.controller;

import kr.hi.project.service.DietService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/diet") 
@RequiredArgsConstructor
public class DietController {

    private final DietService dietService;

    // 🌟 1. AI 식단 추천 요청을 받는 곳 (이 부분이 지워져서 404가 떴을 확률이 높습니다!)
    @GetMapping("/recommend")
    public ResponseEntity<List<Map<String, Object>>> recommendDiet(
            @RequestParam(name = "type", defaultValue = "맞춤 식단") String type,
            @RequestParam(name = "userNum", defaultValue = "1") Long userNum 
    ) {
        System.out.println("🔥 [Spring Boot] React에서 식단 추천 요청 도착! (타입: " + type + ")");

        List<Map<String, Object>> resultList = dietService.getDietRecommendations(userNum, type);

        return ResponseEntity.ok(resultList);
    }

    // 🌟 2. 파이썬 사진 전송 테스트를 받는 곳
    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> analyzeImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("message") String message) {

        System.out.println("🔥 [Spring Boot] React에서 사진 전송 테스트 요청 도착!");
        String pythonResult = dietService.analyzeDietImage(file, message);

        return ResponseEntity.ok(pythonResult);
    }
}