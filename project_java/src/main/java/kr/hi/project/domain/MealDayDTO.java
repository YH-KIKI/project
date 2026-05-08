package kr.hi.project.domain;

import lombok.Data;

@Data
public class MealDayDTO {
	private int Mday_num;        // 식단하루고유번호 pk
	private int Mealdayday;      // 일
	private int Mw_num;        		// 식단주간고유번호 fk
    private String Mealdayscore;    // 총점수
    private String Mealdayreview;   // 총평가
	private int Mealdaykcal;       // 하루칼로리

}
