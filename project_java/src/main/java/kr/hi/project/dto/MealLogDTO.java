package kr.hi.project.dto;

import lombok.Data;

@Data
public class MealLogDTO {
	private String Foodimage;   // 음식사진 경로
    private String Mealtype; // 식사종류 (아침, 점심, 저녁)
    private String Usermemo; // 추가음식메모
    private int Usernum;      // 사용자고유번호
    private int mk_num;        // 식단기록고유번호 (PK)
}
