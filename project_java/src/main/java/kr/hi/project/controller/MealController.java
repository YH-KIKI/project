package kr.hi.project.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;

import kr.hi.project.dto.FailedPredictDTO;
import kr.hi.project.dto.MealRecordRequestDTO;
import kr.hi.project.service.FileService;
import kr.hi.project.service.MealService;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class MealController {
	@Autowired
	private FileService fileService;
	@Autowired
	private MealService mealService;
	
	@PostMapping("/api/record")
	public ResponseEntity<?> recordMeal(
	        @RequestParam("file") MultipartFile file,
	        @RequestParam("data") String jsonData) { // JSON 문자열로 받음
	    try {
//	    	System.out.println("데이터 도착: " + jsonData);
	        //JSON 문자열을 객체로 변환 (ObjectMapper 사용)
	        ObjectMapper mapper = new ObjectMapper();
	        MealRecordRequestDTO request = mapper.readValue(jsonData, MealRecordRequestDTO.class);
//	        System.out.println("DTO 변환 결과: " + request);
	        //사진 파일 저장
	        String imageUrl = fileService.saveFile(file); 

	        //DB 저장 로직 실행
	        mealService.saveMealRecord(request, imageUrl);

	        return ResponseEntity.ok("식단이 성공적으로 기록되었습니다!");
	    } catch (Exception e) {
	    	e.printStackTrace();
	        return ResponseEntity.status(500).body("저장 실패: " + e.getMessage());
	    }   
	}
	
	@PostMapping("/api/report-fail")
	public ResponseEntity<?> reportFailure(
	        @RequestParam("file") MultipartFile file,
	        @RequestParam("data") String jsonData) {
	    try {
	        ObjectMapper mapper = new ObjectMapper();
	        FailedPredictDTO dto = mapper.readValue(jsonData, FailedPredictDTO.class);

	        // 파일 시스템 저장 (폴더 분류)
	        // saveToTrainingFolder에서 저장된 상대 경로를 반환하도록 수정하면 좋습니다.
	        String savedPath = fileService.saveToTrainingFolder(file, dto.getUserInputName());
	        
	        // DTO에 이미지 경로 담기
	        dto.setFpImage(savedPath);

	        // DB 저장 (이게 바로 XML을 실행하는 부분!)
	        mealService.insertFailedRecord(dto);

	        return ResponseEntity.ok("제보가 접수되었습니다!");
	    } catch (Exception e) {
	        return ResponseEntity.status(500).body("오류: " + e.getMessage());
	    }
	}
	
	// 사진인식하고 식단 상세 파일사진과 로그를 지우기
	@PostMapping("/api/meal/cancel")
	public ResponseEntity<?> cancelMeal(@RequestParam("mkNum") int mkNum,
										@RequestParam("mdayNum") int mdayNum) {
	    try {
	        mealService.cancelMealRecord(mkNum, mdayNum);
	        return ResponseEntity.ok("식단 기록이 성공적으로 취소(삭제)되었습니다.");
	    } catch (Exception e) {
	        return ResponseEntity.status(500).body("취소 실패: " + e.getMessage());
	    }
	}

}
