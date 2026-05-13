package kr.hi.project.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.hi.project.dto.MealRecordRequestDTO;
import kr.hi.project.dto.MealDetailDTO;
import kr.hi.project.service.MealRecordService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/meal")
public class MealRecordController {
    
    private final MealRecordService mealRecordService;
    
    @PostMapping("/record")
    public ResponseEntity<?> saveMealRecord(
            @RequestBody MealRecordRequestDTO request) {

        mealRecordService.saveMealRecord(request);

        return ResponseEntity.ok("식단 기록 저장 완료");
    }

    @GetMapping("/today")
    public ResponseEntity<List<MealDetailDTO>> getTodayMealRecord(
            @RequestParam("userNum") int userNum,
            @RequestParam("date") String date) {

        List<MealDetailDTO> result = mealRecordService.getTodayMealRecord(userNum, date);

        return ResponseEntity.ok(result);
    }
}