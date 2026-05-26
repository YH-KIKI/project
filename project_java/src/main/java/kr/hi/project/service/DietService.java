package kr.hi.project.service;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import kr.hi.project.dao.ChatbotDao;
import kr.hi.project.dao.DietDao;
import kr.hi.project.dao.UserPrivacyDao;
import kr.hi.project.dto.UserPrivacyDTO;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DietService {

    // 🌟 분리된 3개의 DAO 주입
    private final UserPrivacyDao userPrivacyDao;
    private final ChatbotDao chatbotDao;
    private final DietDao dietDao;
    
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${AI_MEAL_URL:http://localhost:8000}")
    private String aiServerUrl;

    /**
     * AI 식단 추천 로직
     */
    public List<Map<String, Object>> getDietRecommendations(Long userNum, String type) {
        try {
            String todayStr = java.time.LocalDate.now().toString();
            
            // 1. [DietDao] 오늘 추천 API 호출 여부 락(Lock) 확인
			/*
			 * int recommendCount = dietDao.checkTodayRecommendCount(userNum, todayStr);
			 * 
			 * if (recommendCount > 0) { Map<String, Object> limitBlockResult = new
			 * HashMap<>(); limitBlockResult.put("id", 0); limitBlockResult.put("menu",
			 * "오늘의 식단 추천 완료! 🌟"); limitBlockResult.put("ai_comment",
			 * "식단 추천은 회원님의 올바른 습관 형성을 위해 하루에 단 한 번만 가능합니다. 내일 새로운 메뉴로 찾아올게요!");
			 * limitBlockResult.put("kcal", 0); limitBlockResult.put("carbs", 0);
			 * limitBlockResult.put("protein", 0); limitBlockResult.put("fat", 0);
			 * limitBlockResult.put("sodium", 0); limitBlockResult.put("tags",
			 * Collections.singletonList("안내")); limitBlockResult.put("meal_time", "알림");
			 * 
			 * System.out.println("🛡️ [Spring] 식단 추천 제한 횟수 초과 방어 완료"); return
			 * Collections.singletonList(limitBlockResult); }
			 */
            // 2. [ChatbotDao] 챗봇 페르소나 설정 확인
            String persona = chatbotDao.getUserChatbotMode(userNum);
            if (persona == null || persona.isEmpty()) {
                persona = "비즈니스";
            }

            // 3. [UserPrivacyDao] 대빵 메서드로 유저 정보 조회 🌟
            UserPrivacyDTO userInfo = userPrivacyDao.findNutritionTargetByUserNum(userNum.intValue());
            Map<String, Object> aiRequestData = new HashMap<>();
            
            if (userInfo != null) {
                // 🌟 DTO 이름에 완벽하게 맞춤! (빨간 줄 소멸)
                double targetCalorie = userInfo.getUserDailyKcal() > 0 ? userInfo.getUserDailyKcal() : 2000.0;
                double carbRatio = 0.5, proteinRatio = 0.3, fatRatio = 0.2; 

                switch (type) {
                    case "다이어트":
                        carbRatio = 0.4; proteinRatio = 0.4; fatRatio = 0.2;
                        targetCalorie *= 0.8;
                        break;
                    case "근육증가":
                        carbRatio = 0.5; proteinRatio = 0.3; fatRatio = 0.2;
                        targetCalorie *= 1.2;
                        break;
                    case "저탄고지":
                        carbRatio = 0.1; proteinRatio = 0.2;  fatRatio = 0.7;
                        break;
                    case "건강유지":
                    default:
                        carbRatio = 0.5; proteinRatio = 0.3; fatRatio = 0.2;
                        break;
                }
                
                int targetCarbs = (int) Math.round((targetCalorie * carbRatio) / 4.0);
                int targetProtein = (int) Math.round((targetCalorie * proteinRatio) / 4.0);
                int targetFat = (int) Math.round((targetCalorie * fatRatio) / 9.0);

                aiRequestData.put("userNum", userNum);
                aiRequestData.put("height", userInfo.getUserHeight() > 0 ? userInfo.getUserHeight() : 170.0);
                aiRequestData.put("weight", userInfo.getUserWeight() > 0 ? userInfo.getUserWeight() : 65.0);
                aiRequestData.put("targetCalorie", (int) (targetCalorie / 3)); 
                aiRequestData.put("carbs", (int) (targetCarbs / 3));
                aiRequestData.put("protein", (int) (targetProtein / 3));
                aiRequestData.put("fat", (int) (targetFat / 3));
                aiRequestData.put("sodium", userInfo.getUserDailyNatrium() > 0 ? userInfo.getUserDailyNatrium() : 2000.0); 
                aiRequestData.put("type", type);
                aiRequestData.put("personaMode", persona); // 파이썬에 챗봇 말투 전달
            }

            // 4. 파이썬 서버 통신
            String pythonAiUrl = aiServerUrl + "/api/ai/recommend";
            ResponseEntity<List> response = restTemplate.postForEntity(pythonAiUrl, aiRequestData, List.class);
            
            List<Map<String, Object>> result = response.getBody() != null ? response.getBody() : Collections.emptyList();
            
            // 5. [DietDao] 통신 성공 시 무조건 로그 기록 (다음 호출 차단)
            if (!result.isEmpty() && !result.get(0).containsKey("error")) {
                dietDao.insertRecommendLog(userNum, todayStr);
            }
            
            return result;

        } catch (Exception e) {
            System.err.println("❌ 식단 추천 에러: " + e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * 사진 분석 기능
     */
    public String analyzeDietImage(MultipartFile file, String message) {
        String pythonUrl = aiServerUrl + "/detect";
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            
            ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
                @Override public String getFilename() { return file.getOriginalFilename(); }
            };
            body.add("file", fileResource);
            body.add("message", message);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(pythonUrl, requestEntity, String.class);
            return response.getBody();
            
        } catch (Exception e) {
            System.err.println("❌ 사진 분석 에러: " + e.getMessage());
            return "{\"status\":\"error\", \"message\":\"파이썬 통신 실패\"}";
        }
    }
    
   
}