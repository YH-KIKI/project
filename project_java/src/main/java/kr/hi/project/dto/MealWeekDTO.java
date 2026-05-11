package kr.hi.project.dto;

import lombok.Data;

@Data
public class MealWeekDTO {
	private int Mw_num;      // PK
    private int MealWeekyear;     // 연도
    private int MealWeekmonth;    // 월
    private int MealWeekweek;     // 몇번째주간 (1~5주)
    private int Mm_num;      // FK (부모 Month)
    private String MealWeekscore;   // 총점수
	private int MealWeekkcal;       // 이번주평균칼로리

}
