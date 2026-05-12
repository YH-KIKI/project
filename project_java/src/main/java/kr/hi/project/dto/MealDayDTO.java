package kr.hi.project.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class MealDayDTO {
	private int mdayNum;        // 식단하루고유번호 pk
	private int mdDay;      // 일
	private Integer mwNum;        		// 식단주간고유번호 fk
    private String mdayScore;    // 총점수
    private String mdayReview;   // 총평가
	private int mdayKcal;       // 하루칼로리
	private LocalDate mdayCreatedAt; //기록시간

}
