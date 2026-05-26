package kr.hi.project.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.hi.project.dto.DietAnalysisResponseDto;
import kr.hi.project.service.DietAnalysisService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/diet")
@RequiredArgsConstructor
public class DietAnalysisController {

    private final DietAnalysisService dietAnalysisService;

    // 🌟 1. 일일 분석 및 AI 페르소나 피드백
    @GetMapping("/analyze/daily")
    public ResponseEntity<DietAnalysisResponseDto> getDailyAnalysis(
            @RequestParam("userNum") Long userNum,
            @RequestParam("date") String date,
            @RequestParam(value = "persona", defaultValue = "다정") String persona
    ) {
        DietAnalysisResponseDto response = dietAnalysisService.getDailyAnalysis(userNum, date, persona);
        return ResponseEntity.ok(response);
    }

    // 🌟 2. 달력 표시용 기록된 날짜 목록 (404 에러 해결용!)
    @GetMapping("/recorded-dates")
    public ResponseEntity<List<String>> getRecordedDates(@RequestParam("userNum") Long userNum) {
        return ResponseEntity.ok(dietAnalysisService.getRecordedDates(userNum));
    }

    // ❌ /stats 주소는 DietController에 이미 존재하므로 여기서 삭제하여 충돌을 방지합니다!
}