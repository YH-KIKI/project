package kr.hi.project.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class MealLogDTO {
	private String mkImage;   // 음식사진 경로
    private String mkMealType; // 식사종류 (아침, 점심, 저녁)
    private String mkUserMemo; // 추가음식메모
    private int userNum;      // 사용자고유번호
    private int mkNum;        // 식단기록고유번호 (PK)
    private LocalDate mkDietDate;
}
