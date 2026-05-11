package kr.hi.project.dto;

import lombok.Data;

@Data
public class MealWeekDTO {
	private int mwNum;      // PK
    private int mwYear;     // 연도
    private int mwMonth;    // 월
    private int mwWeek;     // 몇번째주간 (1~5주)
    private int mmNum;      // FK (부모 Month)
    private String mwScore;   // 총점수
	private int mwKcal;       // 이번주평균칼로리

}
