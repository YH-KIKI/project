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
	    
	    // 리액트가 그토록 원하던 [{foNum, foName}] 형태의 음식 객체 리스트를 똑같은 키값으로
	    responseMap.put("favoriteFoods", favoriteList);
	    responseMap.put("dislikeFoods", dislikeList);
	    
	    return ResponseEntity.ok(responseMap);
	}
	
	@PostMapping("/api/information_updata")
	public Map<String, String> signup(@RequestBody UserPrivacyDTO userPrivacyDTO){
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
	    
	    return userService.getMealNutrition(userNum, mealType); 
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
