package kr.hi.project.dto;

import lombok.Data;

@Data
public class MealMonthDTO {
	private int mmNum;      // PK
    private int mmYear;     // 연도 (예: 2026)
    private int mmMonth;    // 월 (예: 5)
    private int userNum;    // FK (사용자)
    private String mmScore;   // 총점수
	private int mmKcal;       // 이번달평균칼로리
}
