package kr.hi.project.dto;

import lombok.Data;

@Data
public class FridgeSummaryDTO {

    // 목표
    private float targetKcal;
    private float targetCarbs;
    private float targetProtein;
    private float targetFat;
    private float targetNatrium;

    // 오늘 섭취
    private float currentKcal;
    private float currentCarbs;
    private float currentProtein;
    private float currentFat;
    private float currentNatrium;

    // 퍼센트
    private int kcalPercent;
    private int carbsPercent;
    private int proteinPercent;
    private int fatPercent;
    private int natriumPercent;
}