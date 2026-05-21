package kr.hi.project.dto;

import java.util.List;

import lombok.Data;

@Data
public class FridgeRecipeDTO {

    private int rcpNum;
    private String rcpName;
    private String rcpWay;
    private String rcpType;
    private String rcpWeight;
    private float rcpKcal;
    private float rcpCarbs;
    private float rcpProtein;
    private float rcpFat;
    private float rcpNatrium;
    private String rcpImage;
    private String rcpParts;

    // 조리 순서
    private List<FridgeRecipeStepDTO> steps;
    
    // 추천 뱃지 여부
    private boolean recommended;
    
}