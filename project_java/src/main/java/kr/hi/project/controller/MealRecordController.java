package kr.hi.project.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.hi.project.dto.MealRecordRequestDTO;
import kr.hi.project.service.MealRecordService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/meal")
public class MealRecordController {
	
	private final  MealRecordService mealRecordService;
	
	
	@PostMapping("/record")
	 public ResponseEntity<?> saveMealRecord(
			 @RequestBody MealRecordRequestDTO request) {

        mealRecordService.saveMealRecord(request);

        return ResponseEntity.ok("식단 기록 저장 완료");
    }
	

}
