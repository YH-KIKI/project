package kr.hi.project.dto;

import lombok.Data;

@Data
public class NutritionDTO {

    private int targetKcal;
    private int currentKcal;

    private int targetCarbs;
    private int currentCarbs;

    private int targetProtein;
    private int currentProtein;

    private int targetFat;
    private int currentFat;

    private int targetNatrium;
    private int currentNatrium;
}