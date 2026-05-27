package kr.hi.project.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import kr.hi.project.dto.MealDetailDTO;
import kr.hi.project.dto.MealRecordRequestDTO;
import kr.hi.project.dto.RecipeMealRecordRequestDTO;
import kr.hi.project.service.MealRecordService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/meal")
public class MealRecordController {
    
    private final MealRecordService mealRecordService;
    
    @PostMapping(
        value = "/record",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> saveMealRecord(
            @RequestPart("mealData") MealRecordRequestDTO request,
            @RequestPart(value = "mealImageFile", required = false) MultipartFile mealImageFile) {

        mealRecordService.saveMealRecord(request, mealImageFile);

        return ResponseEntity.ok(request);
    }

    @GetMapping("/today")
    public ResponseEntity<List<MealDetailDTO>> getTodayMealRecord(
            @RequestParam("userNum") int userNum,
            @RequestParam("date") String date) {

        List<MealDetailDTO> result = mealRecordService.getTodayMealRecord(userNum, date);

        return ResponseEntity.ok(result);
    }
    
    
    // 날짜 불러오기
    @GetMapping("/recorded-dates")
    public List<String> getRecordedDates(@RequestParam("userNum") int userNum) {
        return mealRecordService.getRecordedDates(userNum);
    }
    
    @PostMapping("/recipe-record")
    public ResponseEntity<?> saveRecipeMealRecord(
            @RequestBody RecipeMealRecordRequestDTO request) {

        mealRecordService.saveRecipeMealRecord(request);

        return ResponseEntity.ok(request);
    }
    
    // 삭제 구현 
    @DeleteMapping("/record")
    public ResponseEntity<?> deleteMealRecord(
            @RequestParam("mkNum") int mkNum){
        mealRecordService.deleteMealRecord(mkNum);
        return ResponseEntity.ok("삭제 완료");
    }
}