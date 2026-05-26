package kr.hi.project.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import kr.hi.project.dao.FridgeDao;
import kr.hi.project.dto.FridgeAIResponseDTO;
import kr.hi.project.dto.FridgeRecipeDTO;
import kr.hi.project.dto.FridgeRecipeStepDTO;
import kr.hi.project.dto.FridgeRecommendRequestDTO;
import kr.hi.project.dto.FridgeRecommendResponseDTO;
import kr.hi.project.dto.FridgeSummaryDTO;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FridgeService {
	
	@Value("${ai.meal.url}")
	private String aiServerUrl;

    private final FridgeDao fridgeDao;

    private final RestTemplate restTemplate;

    // ==========================================
    // 영양성분
    // ==========================================

    public FridgeSummaryDTO getSummary(int userNum) {

        FridgeSummaryDTO dto =
                fridgeDao.getFridgeSummary(userNum);

        dto.setKcalPercent(
            calculatePercent(
                dto.getCurrentKcal(),
                dto.getTargetKcal()
            )
        );

        dto.setCarbsPercent(
            calculatePercent(
                dto.getCurrentCarbs(),
                dto.getTargetCarbs()
            )
        );

        dto.setProteinPercent(
            calculatePercent(
                dto.getCurrentProtein(),
                dto.getTargetProtein()
            )
        );

        dto.setFatPercent(
            calculatePercent(
                dto.getCurrentFat(),
                dto.getTargetFat()
            )
        );

        dto.setNatriumPercent(
            calculatePercent(
                dto.getCurrentNatrium(),
                dto.getTargetNatrium()
            )
        );

        return dto;
    }

    // ==========================================
    // 퍼센트 계산
    // ==========================================

    private int calculatePercent(
            float current,
            float target
    ) {

        if (target <= 0) return 0;

        return Math.min(
            (int)((current / target) * 100),
            100
        );
    }

    // ==========================================
    // 냉장고 추천
    // ==========================================

    public FridgeRecommendResponseDTO recommendRecipes(
            FridgeRecommendRequestDTO request
    ) {

        List<FridgeRecipeDTO> recipes =
            fridgeDao.findRecipesByIngredients(
                request.getIngredients()
            );
        
        request.setRecipes(recipes);
        try {

            String pythonUrl =
                aiServerUrl + "/api/ai/fridge-recommend";

            HttpHeaders headers =
                new HttpHeaders();

            headers.setContentType(
                MediaType.APPLICATION_JSON
            );

            HttpEntity<FridgeRecommendRequestDTO>
                requestEntity =
                new HttpEntity<>(
                    request,
                    headers
                );

            ResponseEntity<FridgeAIResponseDTO>
                response =
                restTemplate.postForEntity(
                    pythonUrl,
                    requestEntity,
                    FridgeAIResponseDTO.class
                );

            FridgeAIResponseDTO aiResponse =
                response.getBody();

            if (aiResponse != null &&
                aiResponse.getResults() != null) {

                for (FridgeRecipeDTO recipe : recipes) {

                    aiResponse.getResults()
                        .stream()
                        .filter(ai ->
                            ai.getRcpNum()
                            == recipe.getRcpNum()
                        )
                        .findFirst()
                        .ifPresent(ai -> {

                            recipe.setAiReason(
                                ai.getAiReason()
                            );

                            recipe.setHashtags(
                                ai.getHashtags()
                            );
                        });
                }
            }

        } catch (Exception e) {

            e.printStackTrace();

            System.out.println(
                "AI 추천 실패 - DB 추천만 진행"
            );
        }
        FridgeRecommendResponseDTO result =
            new FridgeRecommendResponseDTO();

        result.setRecipes(recipes);

        return result;
    }
    
    public List<FridgeRecipeStepDTO> getRecipeSteps(int rcpNum) {

        return fridgeDao.getRecipeSteps(rcpNum);

    }
}