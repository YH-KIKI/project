package kr.hi.project.dto;

import lombok.Data;

@Data
public class MealMonthDTO {
	private int Mm_num;      // PK
    private int MealMonthyear;     // 연도 (예: 2026)
    private int MealMonthmonth;    // 월 (예: 5)
    private int User_num;    // FK (사용자)
    private String MealMonthscore;   // 총점수
	private int MealMonthkcal;       // 이번달평균칼로리
}
