package kr.hi.project.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.hi.project.dao.UserDao;
import kr.hi.project.dto.FoodDTO;
import kr.hi.project.dto.UserPrivacyDTO;
import kr.hi.project.service.JwtService;
import kr.hi.project.service.UserService;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class UserInformation {
	@Autowired
	private JwtService jwtService;
	@Autowired
	private UserService userService;
	@Autowired
	private UserDao userDAO;
	@Autowired
	private kr.hi.project.service.CharacterService characterService;

//	@GetMapping("/api/information_select")
//	public UserPrivacyDTO getUserInfo(@RequestHeader("Authorization") String authHeader) {
//
//	    String token = authHeader.replace("Bearer ", "");
//	    String userid = jwtService.getUsernameFromToken(token);
//
//	    int usernum = userService.findUsernumByUserid(userid);
//
//	    UserPrivacyDTO dto = userService.getUserInfo(usernum);
//	    dto.setUserAllergies(userService.findUserAllergies(usernum));
//	    return dto;
//	}
	@GetMapping("/api/information_select")
	public ResponseEntity<?> getUserInfo(@RequestHeader("Authorization") String authHeader) {

	    String token = authHeader.replace("Bearer ", "");
	    String userid = jwtService.getUsernameFromToken(token);

	    int usernum = userService.findUsernumByUserid(userid);

	    // 순수한 기본 DTO 정보 가져오기
	    UserPrivacyDTO dto = userService.getUserInfo(usernum);
	    dto.setUserAllergies(userService.findUserAllergies(usernum));
	    
	    // DB에서 이 유저의 선호 음식 객체(foNum, foName 포함) 리스트를 직접 쿼리로 꺼내옵니다.
	    List<FoodDTO> favoriteList = userDAO.findFavoriteFoodsBySub(usernum);
	    List<FoodDTO> dislikeList = userDAO.findDislikeFoodsBySub(usernum);
	    
	    // 자바 문법 충돌을 방지하기 위해 유연한 Map 상자에 한꺼번에 포장합니다.
	    Map<String, Object> responseMap = new HashMap<>();
	    
	    // 닉네임, 키, 몸무게 등 기본 정보
	    responseMap.put("userNum", dto.getUserNum());
	    responseMap.put("userId", dto.getUserId());
	    responseMap.put("userName", dto.getUserName());
	    responseMap.put("userEmail", dto.getUserEmail());
	    responseMap.put("userGender", dto.getUserGender());
	    responseMap.put("userHeight", dto.getUserHeight());
	    responseMap.put("userWeight", dto.getUserWeight());
	    responseMap.put("userTargetweight", dto.getUserTargetweight());
	    responseMap.put("userAge", dto.getUserAge());
	    responseMap.put("userAct", dto.getUserAct());
	    responseMap.put("userModel", dto.getUserModel());
	    responseMap.put("userAllergies", dto.getUserAllergies());
	    responseMap.put("userDailyKcal", dto.getUserDailyKcal());
	    responseMap.put("userDailyCarbs", dto.getUserDailyCarbs());
	    responseMap.put("userDailyProtein", dto.getUserDailyProtein());
	    responseMap.put("userDailyFat", dto.getUserDailyFat());
	    
	    // 리액트가 그토록 원하던 [{foNum, foName}] 형태의 음식 객체 리스트를 똑같은 키값으로
	    responseMap.put("favoriteFoods", favoriteList);
	    responseMap.put("dislikeFoods", dislikeList);
	    return ResponseEntity.ok(responseMap);
	}
	
	@PostMapping("/api/information_updata")
	public Map<String, String> signup(@RequestBody UserPrivacyDTO userPrivacyDTO){
		System.out.println(userPrivacyDTO);
	    userService.informationUpdata(userPrivacyDTO);
	    
	    Map<String, String> response = new HashMap<>();
	    
	    response.put("message", "정보수정이 완료되었습니다!");
		return response;
		
	}
	
	/* 오늘 목표보기 */
	@GetMapping("/api/meal/today-nutrition")
	public Map<String, Object> getTodayNutrition(@RequestParam("userNum") int userNum) {
	    // 마이페이지 대시보드용 오늘 섭취량 합계 반환
	    return userService.getTodayNutrition(userNum);
	}
	
	// 한끼의 영양성분
	@GetMapping("/api/meal/current-nutrition")
	public Map<String, Object> getCurrentNutrition(
	    @RequestParam("userNum") int userNum, 
	    @RequestParam("mealType") String mealType) {
	    
		Map<String, Object> nutritionResult = userService.getMealNutrition(userNum, mealType);
	    
		// 실시간 오차율 계산 후 경험치 지급 처리하기냥!
//	    try {
//	        // 내 하루 권장 칼로리 목표 조회
//	        kr.hi.project.dto.UserPrivacyDTO goal = userService.getUserInfo(userNum);
//	        
//	        if (nutritionResult != null && goal != null && nutritionResult.get("kcal") != null) {
//	            // 끼니 비율 반영 (점심은 40%, 아침/저녁은 30%)
//	            double ratio = "점심".equals(mealType) ? 0.4 : 0.3;
//	            double targetKcal = goal.getUserDailyKcal() * ratio; // 한 끼 목표 칼로리
//	            
//	            // 유저가 진짜 먹은 실시간 칼로리
//	            double ateKcal = Double.parseDouble(nutritionResult.get("kcal").toString());
//	            
//	            // 오차율 절대값 계산 공식
//	            double errorRate = Math.abs((ateKcal - targetKcal) / targetKcal);
//	            
//	            int edNum = 5;       // 기본 F등급 (0xp)
//	            int expAmount = 0;
//	            String grade = "F";
//	            
//	            // 오차율에 따른 단가표 분기 처리
//	            if (errorRate <= 0.10) {      edNum = 1; expAmount = 50; grade = "A"; }
//	            else if (errorRate <= 0.20) { edNum = 2; expAmount = 30; grade = "B"; }
//	            else if (errorRate <= 0.30) { edNum = 3; expAmount = 15; grade = "C"; }
//	            else if (errorRate <= 0.40) { edNum = 4; expAmount = 5;  grade = "D"; }
//	            
//	            // 경험치 적립 함수
//	            characterService.addExperience(userNum, edNum, expAmount, "식단평가" + grade);
//	            System.out.println("🤖 식단 평가 실시간 연산 완료! 등급: " + grade + " (" + expAmount + " XP 지급냥!)");
//	        }
//	    } catch (Exception e) {
//	        System.out.println("⚠️ 식단 평가 경험치 연산 중 오류 발생 (리포트 조회는 무사 진행): " + e.getMessage());
//	        e.printStackTrace();
//	    }
	    return nutritionResult;
	}
	
	// 음식검색
	@GetMapping("/api/user/food/search")
	public ResponseEntity<?> searchFood(@RequestParam("keyword") String keyword) {
	    try {
	        List<FoodDTO> list = userService.searchFoodByKeyword(keyword);
	        return ResponseEntity.ok(list);
	    } catch (Exception e) {
	        return ResponseEntity.status(500).body("음식 검색 실패: " + e.getMessage());
	    }
	}

}
