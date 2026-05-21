package kr.hi.project.dto;

import java.util.List;

import lombok.Data;

@Data
public class FridgeRecommendResponseDTO {

    private FridgeSummaryDTO summary;
    private List<FridgeRecipeDTO> recipes;
}