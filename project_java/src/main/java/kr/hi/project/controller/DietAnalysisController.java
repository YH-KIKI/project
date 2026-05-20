package kr.hi.project.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;
import kr.hi.project.service.DietAnalysisService;
import kr.hi.project.dto.DietAnalysisResponseDto;

@RestController
@RequestMapping("/api/diet")
@RequiredArgsConstructor
public class DietAnalysisController {

    private final DietAnalysisService dietAnalysisService;

    
     // 1. 특정 날짜의 식단 분석 데이터 반환 API
     // 호출 예시: GET http://localhost:8080/api/v1/diet/analyze/daily?userNum=1&date=2026-05-13
     
    @GetMapping("/analyze/daily")
    public ResponseEntity<DietAnalysisResponseDto> getDailyAnalysis(
            @RequestParam(name = "userNum") Long userNum, 
            @RequestParam(name = "date") String date) {
        
        DietAnalysisResponseDto response = dietAnalysisService.getDailyAnalysis(userNum, date);
        return ResponseEntity.ok(response);
    }

    
     // 2. 달력 도장 찍기용 기록 날짜 목록 반환 API
     // 호출 예시: GET http://localhost:8080/api/v1/diet/recorded-dates?userNum=1
     
    @GetMapping("/recorded-dates")
    public ResponseEntity<List<String>> getRecordedDates(
            @RequestParam(name = "userNum") Long userNum) {
        
        List<String> recordedDates = dietAnalysisService.getRecordedDates(userNum);
        return ResponseEntity.ok(recordedDates);
    }
}