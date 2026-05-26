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

import kr.hi.project.dao.UserPrivacyDao;
import kr.hi.project.dto.DietUserDTO;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DietService {

    private final UserPrivacyDao userPrivacyMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${AI_SERVER_URL:http://localhost:8000}")
    private String aiServerUrl;

    /**
     * AI 식단 추천 로직
     * 1. DB에서 유저 정보를 가져옴
     * 2. 탭(type)에 따라 탄단지 비율 및 목표 칼로리 재설정
     * 3. 파이썬 서버로 데이터 전송 및 결과 반환
     */
    public List<Map<String, Object>> getDietRecommendations(Long userNum, String type) {
        try {
            DietUserDTO userInfo = userPrivacyMapper.findUserByNum(userNum);
            Map<String, Object> aiRequestData = new HashMap<>();
            
            // 유저 정보가 있을 경우에만 정밀 계산 수행
            if (userInfo != null) {
                double targetCalorie = userInfo.getTargetCalorie() != null ? userInfo.getTargetCalorie() : 2000.0;
                double carbRatio = 0.5, proteinRatio = 0.3, fatRatio = 0.2; // 기본값

                // 탭별 로직 (요청하신 5가지 탭 기준)
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
                        carbRatio = 0.1; proteinRatio = 0.2; fatRatio = 0.7;
                        break;
                    case "건강유지":
                        carbRatio = 0.5; proteinRatio = 0.3; fatRatio = 0.2;
                        break;
                    case "맞춤 식단":
                    default:
                        if (userInfo.getCarbs() != null && userInfo.getCarbs() > 0) {
                            carbRatio = (userInfo.getCarbs() * 4.0) / targetCalorie;
                            proteinRatio = (userInfo.getProtein() * 4.0) / targetCalorie;
                            fatRatio = (userInfo.getFat() * 9.0) / targetCalorie;
                        }
                        break;
                }
                
                int targetCarbs = (int) Math.round((targetCalorie * carbRatio) / 4.0);
                int targetProtein = (int) Math.round((targetCalorie * proteinRatio) / 4.0);
                int targetFat = (int) Math.round((targetCalorie * fatRatio) / 9.0);

                aiRequestData.put("userNum", userNum);
                aiRequestData.put("height", userInfo.getHeight() != null ? userInfo.getHeight() : 170.0);
                aiRequestData.put("weight", userInfo.getWeight() != null ? userInfo.getWeight() : 65.0);
                aiRequestData.put("targetCalorie", (int) (targetCalorie / 3)); // 1끼 기준
                aiRequestData.put("carbs", (int) (targetCarbs / 3));
                aiRequestData.put("protein", (int) (targetProtein / 3));
                aiRequestData.put("fat", (int) (targetFat / 3));
                aiRequestData.put("sodium", userInfo.getSodium() != null ? userInfo.getSodium() : 2000); 
                aiRequestData.put("type", type);
                
                System.out.println("✅ AI 서버 전송 데이터: " + aiRequestData.toString());
            }

            String pythonAiUrl = aiServerUrl + "/api/ai/recommend";
            ResponseEntity<List> response = restTemplate.postForEntity(pythonAiUrl, aiRequestData, List.class);
            
            return response.getBody() != null ? response.getBody() : Collections.emptyList();

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