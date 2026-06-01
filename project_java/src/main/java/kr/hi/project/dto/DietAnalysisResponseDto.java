package kr.hi.project.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DietAnalysisResponseDto {
    
    // 1. 등급 및 메시지
    private String grade;
    private String gradeMessage;
    
    // 2. 칼로리 데이터 (현재 섭취량 / 동적 목표량)
    private int currentKcal;
    private int targetKcal; 
    
    // 3. 획득 경험치
    private int earnedXp;
    
    // 4. 현재 섭취한 탄단지 + 나트륨 데이터
    private int currentCarbs;
    private int currentProtein;
    private int currentFat;
    private int currentSodium;
    
    // 5. 유저 맞춤형 목표 탄단지 + 나트륨 데이터 
    private int targetCarbs;
    private int targetProtein;
    private int targetFat;
    private int targetSodium;
    
    // 6. 파이썬 AI 로로의 3줄 요약 피드백
    private String aiFeedback;
}