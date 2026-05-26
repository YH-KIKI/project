package kr.hi.project.dto;

import lombok.Data;

@Data
public class SingleFoodFavoriteDTO {

    // singlefood_favorites
    private int sfNum;
    private int sfPortion;
    private int foNum;
    private int userNum;

    // food 조인용
    private String foName;
    private int foBaseGram;
    private float foKcal;
    private float foCarbs;
    private float foProtein;
    private float foFat;
    private float foNatrium;
    private String foType;
    private String foImage;
}