package kr.hi.project.dto;

import java.util.List;

import lombok.Data;

@Data
public class FridgeRecommendRequestDTO {

    // 사용자가 선택한 재료
    private List<String> ingredients;
    
    private List<FridgeRecipeDTO> recipes;
    
    private NutritionDTO nutrition;

}