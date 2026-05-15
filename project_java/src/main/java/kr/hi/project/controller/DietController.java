package kr.hi.project.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import kr.hi.project.service.DietService;
import kr.hi.project.service.DietAnalysisService; // 🌟 추가됨
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/diet") 
@RequiredArgsConstructor
public class DietController {

    private final DietService dietService;
    private final DietAnalysisService dietAnalysisService; // 🌟 이 변수가 선언되어야 @RequiredArgsConstructor가 주입해줍니다.

    // 1. AI 식단 추천
    @GetMapping("/recommend")
    public ResponseEntity<List<Map<String, Object>>> recommendDiet(
            @RequestParam(name = "type", defaultValue = "맞춤 식단") String type,
            @RequestParam(name = "userNum", defaultValue = "1") Long userNum 
    ) {
        List<Map<String, Object>> resultList = dietService.getDietRecommendations(userNum, type);
        return ResponseEntity.ok(resultList);
    }

    // 2. 사진 분석 테스트 (파이썬 전송)
    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> analyzeImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("message") String message) {
        String pythonResult = dietService.analyzeDietImage(file, message);
        return ResponseEntity.ok(pythonResult);
    }
    
    
     // 3. 통계(주간/월간) 차트 및 영양소 데이터 반환 API
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(
            @RequestParam(name = "userNum") Long userNum, 
            @RequestParam(name = "date") String date,
            @RequestParam(name = "type") String type) {
        
        Map<String, Object> response = dietAnalysisService.getStatsData(userNum, date, type);
        return ResponseEntity.ok(response);
    }
}