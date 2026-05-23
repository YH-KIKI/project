package kr.hi.project.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class DietAnalysisResponseDto {
    private String grade;           // A, B, C, D, F
    private String gradeMessage;    // 등급 메시지
    private int currentKcal;        // 오늘 섭취 칼로리
    private int targetKcal;         // 목표 칼로리 (user_privacy.up_daily_kcal)
    private int earnedXp;           // 획득한 경험치
    
    // 탄단지 영양소 데이터
    private int currentCarbs;
    private int currentProtein;
    private int currentFat;
    private int currentSodium;
    
    private String aiFeedback;      // AI 3줄 요약 (추후 연동)
}