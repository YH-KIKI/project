package kr.hi.project.service;

import kr.hi.project.dao.UserPrivacyDao;
import kr.hi.project.dto.DietUserDTO;
import lombok.RequiredArgsConstructor;
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

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DietService {

    private final UserPrivacyDao userPrivacyMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    public List<Map<String, Object>> getDietRecommendations(Long userNum, String type) {
        try {
            DietUserDTO userInfo = userPrivacyMapper.findUserByNum(userNum);
            Map<String, Object> aiRequestData = new HashMap<>();
            
            if (userInfo != null) {
                // 1. 기본 칼로리 세팅
                double targetCalorie = userInfo.getTargetCalorie() != null ? userInfo.getTargetCalorie() : 2000.0;
                double carbRatio = 0.5, proteinRatio = 0.3, fatRatio = 0.2; // 기본 5:3:2

                // 2. 🌟 탭(type)에 따른 탄단지 황금 비율 및 칼로리 재조정
                switch (type) {
                    case "다이어트":
                        carbRatio = 0.4; proteinRatio = 0.4; fatRatio = 0.2;
                        targetCalorie *= 0.8; // 칼로리 20% 줄임
                        break;
                    case "근육증가":
                        carbRatio = 0.5; proteinRatio = 0.3; fatRatio = 0.2;
                        targetCalorie *= 1.2; // 칼로리 20% 늘림
                        break;
                    case "저탄고지":
                        carbRatio = 0.2; proteinRatio = 0.3; fatRatio = 0.5;
                        break;
                    case "건강유지":
                        carbRatio = 0.5; proteinRatio = 0.3; fatRatio = 0.2;
                        break;
                    case "맞춤 식단":
                    default:
                        // DB에 저장된 유저 본인의 맞춤 비율 사용
                        if (userInfo.getCarbs() != null && userInfo.getCarbs() > 0) {
                            carbRatio = (userInfo.getCarbs() * 4.0) / targetCalorie;
                            proteinRatio = (userInfo.getProtein() * 4.0) / targetCalorie;
                            fatRatio = (userInfo.getFat() * 9.0) / targetCalorie;
                        }
                        break;
                }
                
                // 3. 비율을 실제 그램(g)으로 계산 (탄/단은 1g당 4kcal, 지방은 9kcal)
                int targetCarbs = (int) Math.round((targetCalorie * carbRatio) / 4.0);
                int targetProtein = (int) Math.round((targetCalorie * proteinRatio) / 4.0);
                int targetFat = (int) Math.round((targetCalorie * fatRatio) / 9.0);

                // 파이썬으로 보낼 객체 포장
                aiRequestData.put("userNum", userNum);
                aiRequestData.put("height", userInfo.getHeight() != null ? userInfo.getHeight() : 170.0);
                aiRequestData.put("weight", userInfo.getWeight() != null ? userInfo.getWeight() : 65.0);
                aiRequestData.put("targetCalorie", (int) (targetCalorie / 3));
                aiRequestData.put("carbs", (int) (targetCarbs / 3));
                aiRequestData.put("protein", (int) (targetProtein / 3));
                aiRequestData.put("fat", (int) (targetFat / 3));
                // 나트륨은 목표 비율이 따로 없으므로 DB값 유지
                aiRequestData.put("sodium", userInfo.getSodium() != null ? userInfo.getSodium() : 2000); 
                aiRequestData.put("type", type);
                
                System.out.println("✅ 파이썬으로 보낼 데이터: " + aiRequestData.toString());
            }

            // 4. 파이썬 서버에 계산된 목표치 쏘기!
            String pythonAiUrl = "http://localhost:8000/api/ai/recommend";
            ResponseEntity<List> response = restTemplate.postForEntity(pythonAiUrl, aiRequestData, List.class);
            return response.getBody();

        } catch (Exception e) {
            e.printStackTrace();
            return List.of(new HashMap<>());
        }
    }

    public String analyzeDietImage(MultipartFile file, String message) {
        String pythonUrl = "http://localhost:8000/detect";
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
            return restTemplate.postForEntity(pythonUrl, requestEntity, String.class).getBody();
        } catch (Exception e) {
            e.printStackTrace();
            return "{\"status\":\"error\", \"message\":\"파이썬 통신 실패\"}";
        }
    }
}